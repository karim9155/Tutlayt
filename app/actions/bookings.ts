"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createBooking(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

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

  // If completing, ensure it's the interpreter (or maybe client too? Let's stick to interpreter for now as per request flow usually)
  // Actually, usually the client confirms completion or interpreter marks it done. 
  // Let's allow interpreter to mark as completed for now.

  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)
    .eq("interpreter_id", user.id) 

  if (error) {
    console.error("Error updating booking status:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/interpreter/missions")
  revalidatePath("/dashboard/client/bookings")
  return { success: true }
}
