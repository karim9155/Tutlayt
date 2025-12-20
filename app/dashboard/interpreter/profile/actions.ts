"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Basic Info
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const birthday = formData.get("birthday") as string || null
  const motherTongues = formData.get("motherTongues")?.toString().split(",").map(s => s.trim()).filter(Boolean) || []

  // Professional
  const languagesA = formData.get("languagesA")?.toString().split(",").map(s => s.trim()).filter(Boolean) || []
  const languagesB = formData.get("languagesB")?.toString().split(",").map(s => s.trim()).filter(Boolean) || []
  const languagesC = formData.get("languagesC")?.toString().split(",").map(s => s.trim()).filter(Boolean) || []
  const signInterpreter = formData.get("signInterpreter") === "on"
  const bio = formData.get("bio") as string
  const interpreterSince = parseInt(formData.get("interpreterSince") as string) || null
  const hourlyRate = parseInt(formData.get("hourlyRate") as string) || 0
  const primaryExpertise = formData.get("primaryExpertise")?.toString().split(",").map(s => s.trim()).filter(Boolean) || []
  const secondaryExpertise = formData.get("secondaryExpertise")?.toString().split(",").map(s => s.trim()).filter(Boolean) || []
  const aiicMember = formData.get("aiicMember") === "on"
  const otherAccreditation = formData.get("otherAccreditation") as string

  // Education
  const highestEducation = formData.get("highestEducation") as string
  const school = formData.get("school") as string
  const graduationDate = formData.get("graduationDate") as string || null
  const interpretationDegree = formData.get("interpretationDegree") === "on"

  // Contact
  const address = formData.get("address") as string
  const city = formData.get("city") as string
  const country = formData.get("country") as string
  const timezone = formData.get("timezone") as string
  const phone = formData.get("phone") as string
  const linkedinProfile = formData.get("linkedinProfile") as string
  const website = formData.get("website") as string
  const visibility = formData.get("visibility") as string

  // Update Profiles Table (Name)
  if (firstName || lastName) {
    const fullName = [firstName, lastName].filter(Boolean).join(" ")
    await supabase.from("profiles").update({ 
      first_name: firstName,
      last_name: lastName,
      full_name: fullName 
    }).eq("id", user.id)
  }

  // Update Interpreters Table
  const { error } = await supabase
    .from("interpreters")
    .update({
      birthday,
      mother_tongues: motherTongues,
      languages_a: languagesA,
      languages_b: languagesB,
      languages_c: languagesC,
      sign_interpreter: signInterpreter,
      bio,
      interpreter_since: interpreterSince,
      hourly_rate: hourlyRate,
      primary_expertise: primaryExpertise,
      secondary_expertise: secondaryExpertise,
      aiic_member: aiicMember,
      other_accreditation: otherAccreditation,
      highest_education: highestEducation,
      school,
      graduation_date: graduationDate,
      interpretation_degree: interpretationDegree,
      address,
      city,
      country,
      timezone,
      phone,
      linkedin_profile: linkedinProfile,
      website,
      visibility,
      // Legacy fields mapping for backward compatibility
      languages: [...new Set([...languagesA, ...languagesB, ...languagesC])],
      specializations: [...new Set([...primaryExpertise, ...secondaryExpertise])],
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error updating profile:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/interpreter")
  // No redirect, stay on page to show success
  return { success: true }
}
