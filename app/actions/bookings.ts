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
      .select('documents')
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

  const { error } = await supabase
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

  if (error) {
    console.error("Error creating booking:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/interpreter")
  return { success: true }
}

export async function updateBookingStatus(bookingId: string, status: 'accepted' | 'declined' | 'completed') {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Fetch booking details before updating
  const { data: booking } = await supabase
    .from("bookings")
    .select("price, currency, client_id, status, interpreter_request_id")
    .eq("id", bookingId)
    .single()

  // When accepting: deduct balance from client
  if (status === 'accepted' && booking) {
    const { deductBalanceForBooking } = await import("@/app/actions/payments")
    const deductResult = await deductBalanceForBooking(
      bookingId,
      booking.client_id,
      booking.price ?? 0,
      booking.currency ?? 'TND'
    )
    if (deductResult.error) return { error: deductResult.error }
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)
    .eq("interpreter_id", user.id) 

  if (error) {
    console.error("Error updating booking status:", error)
    return { error: error.message }
  }

  // If this booking is linked to an interpreter request, update the request status
  if (booking?.interpreter_request_id) {
    if (status === 'accepted') {
      // Mark the request as fulfilled
      await supabase
        .from("interpreter_requests")
        .update({ status: 'fulfilled', updated_at: new Date().toISOString() })
        .eq("id", booking.interpreter_request_id)
    } else if (status === 'declined') {
      // Reset the request back to pending so admin can reassign
      await supabase
        .from("interpreter_requests")
        .update({
          status: 'declined',
          assigned_interpreter_id: null,
          booking_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.interpreter_request_id)
    }
  }

  revalidatePath("/dashboard/interpreter/missions")
  revalidatePath("/dashboard/client/bookings")
  revalidatePath("/dashboard/client/requests")
  revalidatePath("/admin/requests")
  return { success: true }
}
