"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function uploadSignedPolicy(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const file = formData.get("file") as File
  const docType = formData.get("docType") as string
  
  if (!file || !docType) {
    return { error: "Missing file or document type" }
  }

  const fileName = `${docType}-${Date.now()}.pdf`
  const filePath = `${user.id}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('interpreter-documents')
    .upload(filePath, file)

  if (uploadError) {
    console.error("Error uploading file:", uploadError)
    return { error: "Failed to upload document. Please try again." }
  }
  
  // Fetch current documents
  const { data: interpreter } = await supabase
    .from("interpreters")
    .select("documents")
    .eq("id", user.id)
    .single()
    
  const currentDocs = interpreter?.documents || {}
  const updatedDocs = { ...currentDocs, [docType]: filePath }

  // Update the interpreter record
  const { error } = await supabase
    .from("interpreters")
    .update({ 
      documents: updatedDocs,
      // If all 5 are present, we could auto-verify or let admin do it. 
      // For now just update the field.
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error updating policy:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/interpreter")
  return { success: true }
}

export async function submitInterpreterSignature(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const signatureFile = formData.get("signature") as File
  const docType = formData.get("docType") as string

  if (!signatureFile || !docType) {
    return { error: "Missing signature or document type" }
  }

  // Save signature image
  const fileName = `signature_${docType}_${Date.now()}.png`
  const filePath = `${user.id}/${fileName}`

  // Assuming we use 'interpreter-documents' for both PDF templates and signature uploads
  const { error: uploadError } = await supabase.storage
    .from('interpreter-documents')
    .upload(filePath, signatureFile)

  if (uploadError) {
    console.error("Error uploading signature:", uploadError)
    return { error: "Failed to upload signature. Please try again." }
  }

  // Update interpreter documents
  const { data: interpreter } = await supabase
    .from("interpreters")
    .select("documents")
    .eq("id", user.id)
    .single()

  const currentDocs = interpreter?.documents || {}
  // We store just the path to keep it compatible with existing "string" check
  const updatedDocs = { ...currentDocs, [docType]: filePath }

  const { error } = await supabase
    .from("interpreters")
    .update({ 
      documents: updatedDocs
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error updating interpreter signature:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/interpreter")
  return { success: true }
}

export async function toggleSwornStatus(isSworn: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { error } = await supabase
        .from("interpreters")
        .update({ is_sworn: isSworn })
        .eq("id", user.id)
    
    if (error) return { error: error.message }
    revalidatePath("/dashboard/interpreter")
    return { success: true }
}
