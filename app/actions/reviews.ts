"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createReview(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const bookingId = formData.get("bookingId") as string
  const revieweeId = formData.get("revieweeId") as string
  const rating = parseInt(formData.get("rating") as string)
  const comment = formData.get("comment") as string

  if (!bookingId || !revieweeId || !rating) {
    return { error: "Missing required fields" }
  }

  const { error } = await supabase
    .from("reviews")
    .insert({
      booking_id: bookingId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating,
      comment
    })

  if (error) {
    console.error("Error creating review:", error)
    if (error.code === '23505') {
      return { error: "You have already reviewed this booking" }
    }
    return { error: error.message }
  }

  revalidatePath("/dashboard/client/bookings")
  revalidatePath("/dashboard/interpreter/missions")
  return { success: true }
}

export async function getReview(bookingId: string, reviewerId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("booking_id", bookingId)
    .eq("reviewer_id", reviewerId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error("Error fetching review:", error)
  }

  return { data }
}
