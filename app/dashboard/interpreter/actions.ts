"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function uploadSignedPolicy(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const file = formData.get("policyFile") as File
  
  if (!file) {
    return { error: "No file provided" }
  }

  const fileName = `policy-${Date.now()}.pdf`
  const filePath = `${user.id}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file)

  if (uploadError) {
    console.error("Error uploading file:", uploadError)
    return { error: "Failed to upload document. Please try again." }
  }
  
  // Update the interpreter record
  const { error } = await supabase
    .from("interpreters")
    .update({ 
      signed_policy_url: filePath,
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error updating policy:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/interpreter")
  return { success: true }
}
