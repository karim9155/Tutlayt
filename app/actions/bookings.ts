"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createBooking(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // --- Document signing guard ---
  // Only apply for company/client accounts (not admins or interpreters)
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userProfile || userProfile.role === 'company') {
    const { data: company } = await supabase
      .from('companies')
      .select('documents, balance')
      .eq('id', user.id)
      .single()

    // Fetch required templates from storage
    const { data: templateFiles } = await supabase
      .storage
      .from('client-documents')
      .list('', { limit: 100, sortBy: { column: 'name', order: 'asc' } })

    const templates = (templateFiles || []).filter((f: any) => f.name.toLowerCase().endsWith('.pdf'))
    const signedDocs: Record<string, any> = company?.documents || {}
    const allSigned = templates.length > 0 && templates.every((t: any) => !!signedDocs[t.name])

    if (!allSigned) {
      return { error: "You must sign all required documents before booking. Please visit your dashboard to complete document signing." }
    }

    // Check client has sufficient balance to cover the interpreter's daily rate
    const dailyRate = parseFloat(formData.get("dailyRate") as string)
    const clientBalance = parseFloat(company?.balance ?? 0)
    if (!isNaN(dailyRate) && dailyRate > 0 && clientBalance < dailyRate) {
      return { error: `Insufficient balance. Current balance: ${clientBalance} TND. Required: ${dailyRate} TND.` }
    }
  }
  // --- End document signing guard ---

  const interpreterId = formData.get("interpreterId") as string
  const title = formData.get("title") as string
  const platform = formData.get("platform") as string
  const startDate = formData.get("startDate") as string
  const startTime = formData.get("startTime") as string
  // endDate handled below
  const endTime = formData.get("endTime") as string
  const timezone = formData.get("timezone") as string
  const languages = formData.get("languages") as string
  const subjectMatter = formData.get("subjectMatter") as string
  const price = parseFloat(formData.get("price") as string)
  const description = formData.get("description") as string
  const meetingLink = formData.get("meetingLink") as string
  const preparationMaterialsUrl = formData.get("preparationMaterialsUrl") as string

  // Combine date and time
  // Assuming endDate is same as startDate if not provided separately
  const endDate = formData.get("endDate") as string || startDate
  
  const startDateTime = new Date(`${startDate}T${startTime}`)
  const endDateTime = new Date(`${endDate}T${endTime}`)

  const { data: newBooking, error } = await supabase
    .from("bookings")
    .insert({
      client_id: user.id,
      interpreter_id: interpreterId,
      title,
      platform,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      timezone,
      languages,
      subject_matter: subjectMatter,
      price,
      currency: 'TND',
      description,
      meeting_link: meetingLink,
      preparation_materials_url: preparationMaterialsUrl,
      status: 'pending'
    })
    .select("id")
    .single()

  if (error) {
    console.error("Error creating booking:", error)
    return { error: error.message }
  }

  // Deduct balance from client at booking creation time
  if (newBooking && !isNaN(price) && price > 0) {
    const { deductBalanceForBooking } = await import("@/app/actions/payments")
    const deductResult = await deductBalanceForBooking(newBooking.id, user.id, price, 'TND')
    if (deductResult.error) {
      // Rollback: delete the booking if deduction fails
      await supabase.from("bookings").delete().eq("id", newBooking.id)
      return { error: deductResult.error }
    }
  }

  revalidatePath("/dashboard/interpreter")
  return { success: true }
}

export async function updateBookingStatus(bookingId: string, status: 'accepted' | 'declined' | 'completed') {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Fetch booking details before updating (select * avoids errors if interpreter_request_id column doesn't exist yet)
  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single()

  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)
    .eq("interpreter_id", user.id) 

  if (error) {
    console.error("Error updating booking status:", error)
    return { error: error.message }
  }

  // If this booking is linked to an interpreter request, update the request status.
  // Try booking.interpreter_request_id first; fall back to looking up by booking_id.
  let linkedRequestId = booking?.interpreter_request_id ?? null
  if (!linkedRequestId) {
    const { data: linked } = await supabase
      .from("interpreter_requests")
      .select("id")
      .eq("booking_id", bookingId)
      .maybeSingle()
    linkedRequestId = linked?.id ?? null
  }

  if (linkedRequestId) {
    if (status === 'accepted') {
      await supabase
        .from("interpreter_requests")
        .update({ status: 'fulfilled', updated_at: new Date().toISOString() })
        .eq("id", linkedRequestId)
    } else if (status === 'declined') {
      await supabase
        .from("interpreter_requests")
        .update({
          status: 'declined',
          updated_at: new Date().toISOString(),
        })
        .eq("id", linkedRequestId)
    }
  }

  revalidatePath("/dashboard/interpreter/missions")
  revalidatePath("/dashboard/client/bookings")
  revalidatePath("/dashboard/client/requests")
  revalidatePath("/admin/requests")
  return { success: true }
}
