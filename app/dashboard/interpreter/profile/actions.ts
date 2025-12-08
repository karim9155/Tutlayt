"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const languages = formData.get("languages")?.toString().split(",").map(s => s.trim()).filter(Boolean) || []
  const specializations = formData.get("specializations")?.toString().split(",").map(s => s.trim()).filter(Boolean) || []
  const bio = formData.get("bio") as string
  const city = formData.get("city") as string
  const hourlyRate = parseInt(formData.get("hourlyRate") as string) || 0
  const yearsExperience = parseInt(formData.get("yearsExperience") as string) || 0

  const { error } = await supabase
    .from("interpreters")
    .update({
      languages,
      specializations,
      bio,
      city,
      hourly_rate: hourlyRate,
      years_experience: yearsExperience,
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error updating profile:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/interpreter")
  redirect("/dashboard/interpreter")
}
