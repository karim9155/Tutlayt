"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function submitClientRequest(formData: FormData) {
  const supabase = await createClient()
  
  const companyName = formData.get("companyName") as string
  const email = formData.get("email") as string
  const website = formData.get("website") as string
  const message = formData.get("message") as string

  if (!companyName || !email || !message) {
    return { error: "Please fill in all required fields." }
  }

  const { error } = await supabase
    .from("client_account_requests")
    .insert({
      company_name: companyName,
      email,
      website: website || null,
      message,
    })

  if (error) {
    console.error("Error submitting client request:", error)
    return { error: "Something went wrong. Please try again." }
  }

  return { success: true }
}
