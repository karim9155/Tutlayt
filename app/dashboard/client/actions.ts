"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function submitSignedDocument(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const signatureFile = formData.get("signature") as File
  const docName = formData.get("docName") as string
  
  if (!signatureFile || !docName) {
    return { error: "Missing signature or document name" }
  }

  const timestamp = Date.now()
  const fileName = `signed_${docName}_${timestamp}.png`
  // Storing under a user-specific folder. 
  // Assuming RLS policies allow authenticated users to upload to their own folder.
  const filePath = `${user.id}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('client-documents')
    .upload(filePath, signatureFile)

  if (uploadError) {
    console.error("Error uploading signature:", uploadError)
    return { error: "Failed to upload signature. Please try again." }
  }

  // Update company status and documents list
  const { data: company } = await supabase
    .from("companies")
    .select("documents, verification_status, client_type")
    .eq("id", user.id)
    .single()

  const currentDocs = company?.documents || {}
  const updatedDocs = { 
     ...currentDocs, 
     [docName]: {
        path: filePath,
        signed_at: new Date().toISOString()
     }
  }

  let newStatus = company?.verification_status

  if (company?.client_type === 'one_time') {
    // One-time clients were pre-approved by the admin (who issued the code).
    // Auto-verify them as soon as all required documents are signed.
    const adminClient = createAdminClient()
    const { data: templateFiles } = await adminClient.storage
      .from('client-documents')
      .list('', { limit: 100, sortBy: { column: 'name', order: 'asc' } })
    const templates = (templateFiles || []).filter((f: any) => f.name.toLowerCase().endsWith('.pdf'))
    const allSigned = templates.every((t: any) => !!updatedDocs[t.name])
    newStatus = allSigned ? 'verified' : (newStatus === 'verified' ? 'verified' : 'unverified')
  } else {
    // Regular clients move to pending_approval on first document upload;
    // an admin then manually verifies them.
    if (newStatus === 'unverified' || !newStatus) {
      newStatus = 'pending_approval'
    }
  }

  const { error } = await supabase
    .from("companies")
    .update({ 
      documents: updatedDocs,
      verification_status: newStatus
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error updating company profile:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/client")
  return { success: true }
}
