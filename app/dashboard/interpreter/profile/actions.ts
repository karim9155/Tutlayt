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
  
  // New Rate Fields
  const dailyRate = parseFloat(formData.get("dailyRate") as string) || 0
  const dailyRateInternational = parseFloat(formData.get("dailyRateInternational") as string) || 0
  const currencyInternational = formData.get("currencyInternational") as string || 'USD'
  
  const primaryExpertise = formData.get("primaryExpertise")?.toString().split(",").map(s => s.trim()).filter(Boolean) || []
  const secondaryExpertise = formData.get("secondaryExpertise")?.toString().split(",").map(s => s.trim()).filter(Boolean) || []
  const equipment = formData.get("equipment")?.toString().split(",").map(s => s.trim()).filter(Boolean) || []
  
  const aiicMember = formData.get("aiicMember") === "on"
  const isSworn = formData.get("isSworn") === "on"
  const otherAccreditation = formData.get("otherAccreditation") as string

  // Handle File Uploads (Sworn Document, CV, Signature)
  const swornDocument = formData.get("swornDocument") as File
  const cvDocument = formData.get("cvDocument") as File
  const signatureDocument = formData.get("signatureDocument") as File
  
  let swornProofUrl: string | null = null
  let cvUrl: string | null = null
  let signatureUrl: string | null = null

  async function uploadFile(file: File, prefix: string) {
    if (file && file.size > 0) {
      const fileName = `${user.id}/${prefix}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file)

      if (uploadError) {
        console.error(`Error uploading ${prefix}:`, uploadError)
        return null
      }
      
      const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(fileName)
      return publicUrl
    }
    return null
  }

  // Upload files concurrently
  const [swornUrl, cvUploadedUrl, sigUploadedUrl] = await Promise.all([
    swornDocument ? uploadFile(swornDocument, 'sworn_proof') : null,
    cvDocument ? uploadFile(cvDocument, 'cv') : null,
    signatureDocument ? uploadFile(signatureDocument, 'signature') : null
  ])

  // Get current documents to merge
  const { data: currentInterpreter } = await supabase
    .from("interpreters")
    .select("documents")
    .eq("id", user.id)
    .single()

  const currentDocuments = currentInterpreter?.documents || {}
  
  if (swornUrl) currentDocuments.sworn_proof = swornUrl
  if (cvUploadedUrl) currentDocuments.cv = cvUploadedUrl
  if (sigUploadedUrl) currentDocuments.signature = sigUploadedUrl

  // Education
  const highestEducation = formData.get("highestEducation") as string
  const school = formData.get("school") as string
  const graduationDate = formData.get("graduationDate") as string || null
  const interpretationDegree = formData.get("interpretationDegree") === "on"
  
  const educationHistoryStr = formData.get("educationHistory") as string
  let educationHistory = []
  try {
      if (educationHistoryStr) educationHistory = JSON.parse(educationHistoryStr)
  } catch (e) {
      console.warn("Failed to parse education history", e)
  }

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
      
      daily_rate: dailyRate,
      daily_rate_international: dailyRateInternational,
      currency_international: currencyInternational,
      equipment: equipment,
      education_history: educationHistory,
      
      primary_expertise: primaryExpertise,
      secondary_expertise: secondaryExpertise,
      aiic_member: aiicMember,
      is_sworn: isSworn,
      documents: currentDocuments,
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
