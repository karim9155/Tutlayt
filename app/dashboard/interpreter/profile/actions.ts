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
  
  // Services & additional rates
  const services = formData.getAll("services").map(s => s.toString()).filter(Boolean)
  const ratePerWord = parseFloat(formData.get("ratePerWord") as string) || null
  const equipmentDailyRate = parseFloat(formData.get("equipmentDailyRate") as string) || null
  
  const aiicMember = formData.get("aiicMember") === "on"
  const isSworn = formData.get("isSworn") === "on"
  const otherAccreditation = formData.get("otherAccreditation") as string

  // Handle File Uploads (Avatar, Sworn Document, CV, Signature)
  const avatarFile = formData.get("avatarFile") as File
  const swornDocument = formData.get("swornDocument") as File
  const cvDocument = formData.get("cvDocument") as File
  const signatureDocument = formData.get("signatureDocument") as File
  
  let swornProofUrl: string | null = null
  let cvUrl: string | null = null
  let signatureUrl: string | null = null

  async function uploadFile(file: File, prefix: string) {
    if (file && file.size > 0) {
      const fileName = `${user.id}/${prefix}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      // Try interpreter-documents bucket first (migration 011), fall back to documents (migration 006)
      let uploadError: any = null
      let publicUrl: string | null = null

      const { error: err1 } = await supabase.storage.from("interpreter-documents").upload(fileName, file)
      if (!err1) {
        publicUrl = supabase.storage.from("interpreter-documents").getPublicUrl(fileName).data.publicUrl
      } else {
        const { error: err2 } = await supabase.storage.from("documents").upload(fileName, file)
        if (!err2) {
          publicUrl = supabase.storage.from("documents").getPublicUrl(fileName).data.publicUrl
        } else {
          uploadError = err2
        }
      }

      if (uploadError) {
        console.error(`Error uploading ${prefix}:`, uploadError)
        return null
      }
      return publicUrl
    }
    return null
  }

  // Upload files concurrently
  const [avatarUrl, swornUrl, cvUploadedUrl, sigUploadedUrl] = await Promise.all([
    avatarFile ? uploadFile(avatarFile, 'avatar') : null,
    swornDocument ? uploadFile(swornDocument, 'sworn_proof') : null,
    cvDocument ? uploadFile(cvDocument, 'cv') : null,
    signatureDocument ? uploadFile(signatureDocument, 'signature') : null
  ])

  // Save avatar URL to profiles immediately if uploaded
  if (avatarUrl) {
    const { error: avatarErr } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id)
    if (avatarErr) console.error("profiles.avatar_url update failed:", avatarErr.message)
  }

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

  // Update Profiles Table — each column in its own call so one missing column can't block others
  const fullName = [firstName, lastName].filter(Boolean).join(" ")

  // full_name exists from migration 001 trigger — always safe
  if (fullName) {
    const { error: fnErr } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id)
    if (fnErr) console.error("profiles.full_name update failed:", fnErr.message)
  }

  // first_name / last_name from migration 003 — separate call, graceful
  if (firstName || lastName) {
    const nameFields: Record<string, string> = {}
    if (firstName) nameFields.first_name = firstName
    if (lastName) nameFields.last_name = lastName
    const { error: splitErr } = await supabase.from("profiles").update(nameFields).eq("id", user.id)
    if (splitErr) console.error("profiles.first_name/last_name update failed:", splitErr.message)
  }

  // phone from migration 023 — separate call, graceful
  if (phone) {
    const { error: phoneErr } = await supabase.from("profiles").update({ phone }).eq("id", user.id)
    if (phoneErr) console.error("profiles.phone update failed (migration 023 may not have run):", phoneErr.message)
  }

  // Update Interpreters Table (core fields — always exist)
  const { error } = await supabase
    .from("interpreters")
    .upsert(
      {
        id: user.id,
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
      },
      { onConflict: "id" }
    )

  if (error) {
    console.error("Error updating profile:", error)
    return { error: error.message }
  }

  // Save migration-022 fields separately so a missing column doesn't block the main save
  const { error: svcErr } = await supabase
    .from("interpreters")
    .update({ services, rate_per_word: ratePerWord, equipment_daily_rate: equipmentDailyRate })
    .eq("id", user.id)
  if (svcErr) console.error("migration-022 fields (services/rate_per_word/equipment_daily_rate) failed — run 022_add_interpreter_services.sql:", svcErr.message)

  revalidatePath("/dashboard/interpreter")
  revalidatePath("/dashboard/interpreter/profile")
  // No redirect, stay on page to show success
  return { success: true }
}
