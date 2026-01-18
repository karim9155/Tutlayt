"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const ADMIN_CREDENTIALS = {
  username: "mustpha",
  password: "mustfa912345@@"
}

async function ensureAdmin() {
    const cookieStore = await cookies()
    if (cookieStore.get("admin_session")?.value !== "true") {
        throw new Error("Unauthorized")
    }
}

export async function adminLogin(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    const cookieStore = await cookies()
    cookieStore.set("admin_session", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
    })
    redirect("/admin")
  }
  
  // Create a way to return error appropriately, maybe search params or just no-op locally for now as it refreshes page.
  // Actually, better to redirect back to login? Or simple return. 
  // Actions in forms that return values don't automatically show up unless using useFormState.
  // Given the simplicity requested, let's redirect with error query param if failure.
  redirect("/admin/login?error=Invalid%20credentials")
}

export async function adminLogout() {
    const cookieStore = await cookies()
    cookieStore.delete("admin_session")
    redirect("/admin/login")
}

export async function uploadDocument(bucket: string, formData: FormData) {
  try {
    await ensureAdmin()
  } catch (e) {
    return { error: "Unauthorized" }
  }
  const supabase = createAdminClient()

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
  try {
     await ensureAdmin()
  } catch (e) {
      return { error: "Unauthorized" }
  }
  const supabase = createAdminClient()

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
  try {
     await ensureAdmin()
  } catch (e) {
      return { error: "Unauthorized" }
  }
  const supabase = createAdminClient()

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
    try {
        await ensureAdmin()
    } catch (e) {
        return { error: "Unauthorized" }
    }
    const supabase = createAdminClient()

    const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName])

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/admin")
    return { success: true }
}

export async function verifySwornStatus(id: string, approved: boolean, reason?: string) {
  try {
     await ensureAdmin()
  } catch (e) {
      return { error: "Unauthorized" }
  }
  const supabase = createAdminClient()

  const updates: any = {
      sworn_verified: approved,
      sworn_rejection_reason: approved ? null : reason
  }
  
  // If verifying, ensure is_sworn is true just in case
  if (approved) {
      updates.is_sworn = true
  }

  const { error } = await supabase
    .from("interpreters")
    .update(updates)
    .eq("id", id)

  if (error) {
    console.error("Error verifying sworn status:", error)
    return { error: error.message }
  }

  revalidatePath("/admin")
  return { success: true }
}
