"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateCompanyProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const fullName = formData.get("fullName") as string
  const phone = formData.get("phone") as string
  const companyName = formData.get("companyName") as string
  const industry = formData.get("industry") as string
  const clientType = formData.get("clientType") as string
  const website = formData.get("website") as string
  const fiscalId = formData.get("fiscalId") as string

  // Handle logo upload
  let logoUrl: string | null = null
  const logoFile = formData.get("logoFile") as File
  if (logoFile && logoFile.size > 0) {
    const fileName = `${user.id}/logo_${Date.now()}_${logoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const { error: uploadError } = await supabase.storage.from("client-documents").upload(fileName, logoFile, { upsert: true })
    if (uploadError) {
      console.error("Logo upload error:", uploadError)
    } else {
      logoUrl = supabase.storage.from("client-documents").getPublicUrl(fileName).data.publicUrl
    }
  }

  // 1. Update profiles table (full_name + avatar_url if logo uploaded)
  const profileUpdate: Record<string, any> = { full_name: fullName }
  if (logoUrl) profileUpdate.avatar_url = logoUrl

  const { error: profileError } = await supabase
    .from("profiles")
    .update(profileUpdate)
    .eq("id", user.id)

  if (profileError) {
    console.error("Error updating profile:", profileError)
    return { error: profileError.message }
  }

  // 2. Update companies table
  const companyUpdate: Record<string, any> = {
    company_name: companyName,
    industry,
    client_type: clientType,
    website,
    fiscal_id: fiscalId,
    phone,
  }
  if (logoUrl) companyUpdate.logo_url = logoUrl

  const { data, error } = await supabase
    .from("companies")
    .update(companyUpdate)
    .eq("id", user.id)
    .select()

  if (error) {
    console.error("Error updating company profile:", error)
    return { error: error.message }
  }

  if (!data || data.length === 0) {
    // Row doesn't exist yet — insert it
    const { error: insertError } = await supabase
      .from("companies")
      .insert({ id: user.id, ...companyUpdate })
    if (insertError) {
      console.error("Error inserting company profile:", insertError)
      return { error: insertError.message }
    }
  }

  revalidatePath("/dashboard/client/profile")
  return { success: true }
}
