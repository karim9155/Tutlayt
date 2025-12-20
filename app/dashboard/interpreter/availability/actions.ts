"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getAvailability(startDate: string, endDate: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data, error } = await supabase
    .from("availability")
    .select("date, start_time")
    .eq("interpreter_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)

  if (error) {
    console.error("Error fetching availability:", error)
    return { error: error.message }
  }
  
  return { data }
}

export async function getPublicAvailability(interpreterId: string, startDate: string, endDate: string) {
  const supabase = await createClient()
  // No auth check needed for viewing availability, or maybe just check if user is logged in
  // For now, let's assume public or at least authenticated
  
  const { data, error } = await supabase
    .from("availability")
    .select("date, start_time, is_booked")
    .eq("interpreter_id", interpreterId)
    .gte("date", startDate)
    .lte("date", endDate)

  if (error) {
    console.error("Error fetching public availability:", error)
    return { error: error.message }
  }
  
  return { data }
}

export async function setSlotAvailability(date: string, hour: number, isAvailable: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const startTime = `${hour.toString().padStart(2, '0')}:00:00`
  const endTime = `${(hour + 1).toString().padStart(2, '0')}:00:00`

  try {
    if (isAvailable) {
      // Check if exists to avoid duplicates (since we might not have a unique constraint yet)
      const { data: existing } = await supabase
        .from("availability")
        .select("id")
        .eq("interpreter_id", user.id)
        .eq("date", date)
        .eq("start_time", startTime)
        .single()

      if (!existing) {
        const { error } = await supabase.from("availability").insert({
          interpreter_id: user.id,
          date,
          start_time: startTime,
          end_time: endTime,
          is_booked: false
        })
        if (error) throw error
      }
    } else {
      const { error } = await supabase
        .from("availability")
        .delete()
        .eq("interpreter_id", user.id)
        .eq("date", date)
        .eq("start_time", startTime)
      if (error) throw error
    }

    revalidatePath("/dashboard/interpreter/availability")
    return { success: true }
  } catch (error: any) {
    console.error("Error setting availability:", error)
    return { error: error.message }
  }
}
