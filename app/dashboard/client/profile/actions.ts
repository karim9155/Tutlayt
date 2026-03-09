"use server"

import { createClient } from "@/lib/supabase/server"

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

  // 1. Update profiles table (company_name, phone)
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ company_name: fullName, phone })
    .eq("id", user.id)

  if (profileError) {
    console.error("Error updating profile:", profileError)
    return { error: profileError.message }
  }

  // 2. Update companies table
  const { data, error } = await supabase
    .from("companies")
    .update({
      company_name: companyName,
      industry,
      client_type: clientType,
      website,
      fiscal_id: fiscalId,
    })
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
      .insert({
        id: user.id,
        company_name: companyName,
        industry,
        client_type: clientType,
        website,
        fiscal_id: fiscalId,
      })
    if (insertError) {
      console.error("Error inserting company profile:", insertError)
      return { error: insertError.message }
    }
  }

  return { success: true }
}
