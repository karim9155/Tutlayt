"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateCompanyProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const companyName = formData.get("companyName") as string
  const industry = formData.get("industry") as string
  const website = formData.get("website") as string
  const fiscalId = formData.get("fiscalId") as string

  const { error } = await supabase
    .from("companies")
    .update({
      company_name: companyName,
      industry,
      website,
      fiscal_id: fiscalId,
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error updating company profile:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/client")
  return { success: true }
}
