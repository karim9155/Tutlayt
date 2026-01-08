"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function uploadDocument(bucket: string, formData: FormData) {
  const supabase = await createClient()

  const file = formData.get("file") as File
  if (!file) return { error: "No file provided" }

  // Simple sanitization
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
  
  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file)

  if (error) {
    console.error(`Error uploading to ${bucket}:`, error)
    return { error: error.message }
  }

  revalidatePath("/admin")
  return { success: true }
}

export async function approveUser(type: "client" | "interpreter", id: string) {
  const supabase = await createClient()

  try {
    if (type === "client") {
      const { error } = await supabase
        .from("companies")
        .update({ 
          verification_status: "verified",
          rejection_reason: null  // Clear any previous rejection
        })
        .eq("id", id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from("interpreters")
        .update({ 
          verified: true,
          rejection_reason: null 
        })
        .eq("id", id)

      if (error) throw error
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error: any) {
    console.error("Error approving user:", error)
    return { error: error.message }
  }
}

export async function denyUser(type: "client" | "interpreter", id: string, reason: string) {
  const supabase = await createClient()

  try {
    if (type === "client") {
      // Fetch current documents to clear the specific one?
      // Or just clear all signatures? Let's assume we want to force re-sign of everything or just setting status is enough?
      // User asked to "effectively reset". Clearing documents JSONB is the surest way.
      // But we might want to keep some? Let's assume emptying documents is safe for "Verification" documents.
      
      const { error } = await supabase
        .from("companies")
        .update({ 
          verification_status: "rejected", 
          rejection_reason: reason,
          documents: {} // Reset documents
        })
        .eq("id", id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from("interpreters")
        .update({ 
          verified: false, 
          rejection_reason: reason,
          signed_policy_url: null, // Legacy
          documents: {} // Reset documents
        })
        .eq("id", id)

      if (error) throw error
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error: any) {
    console.error("Error denying user:", error)
    return { error: error.message }
  }
}

export async function deleteDocument(bucket: string, fileName: string) {
    const supabase = await createClient()

    const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName])

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/admin")
    return { success: true }
}
