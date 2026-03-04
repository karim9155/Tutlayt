"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sendEmail } from "@/lib/email"

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
  const sanitizedBase = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const fileName = `${Date.now()}-${sanitizedBase}`
  
  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file)

  if (error) {
    console.error(`Error uploading to ${bucket}:`, error)
    return { error: error.message }
  }

  // When a client-documents template is uploaded or replaced,
  // reset the signing status for that document across ALL companies.
  if (bucket === 'client-documents') {
    const { data: companies } = await supabase
      .from('companies')
      .select('id, documents')
      .not('documents', 'is', null)

    for (const company of (companies || [])) {
      const docs = (company.documents || {}) as Record<string, any>
      // Remove any key whose base name (stripped timestamp) matches the uploaded file's base name
      const updated = Object.fromEntries(
        Object.entries(docs).filter(([key]) => key.replace(/^\d+-/, '') !== sanitizedBase)
      )
      if (Object.keys(updated).length !== Object.keys(docs).length) {
        await supabase.from('companies').update({ documents: updated }).eq('id', company.id)
      }
    }
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
     // Fetch user for email (before deletion)
    const { data: userData } = await supabase.auth.admin.getUserById(id)
    
    // Send email if possible
    if (userData?.user?.email) {
       await sendEmail(
          userData.user.email,
          "Account Application Rejected - Tutlayt",
          `Your application has been reviewed and rejected.\n\nReason: ${reason}\n\nYour account has been removed. You may re-apply if you address the issues stated.`,
          `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #d32f2f;">Application Rejected</h2>
            <p>Hello,</p>
            <p>We regret to inform you that your application to join Tutlayt has been declined.</p>
             <blockquote style="background: #fff5f5; border-left: 4px solid #d32f2f; padding: 15px; margin: 20px 0;">
              <strong>Reason:</strong> ${reason}
            </blockquote>
            <p>Your account has been deleted from our system.</p>
          </div>
          `
       )
    }

    // Delete user (Cascades to profiles, interpreters/companies)
    const { error } = await supabase.auth.admin.deleteUser(id)

    if (error) throw error

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

    // When a client-documents template is deleted,
    // remove its signed entry from ALL companies so it no longer counts as signed.
    if (bucket === 'client-documents') {
      const { data: companies } = await supabase
        .from('companies')
        .select('id, documents')
        .not('documents', 'is', null)

      for (const company of (companies || [])) {
        const docs = (company.documents || {}) as Record<string, any>
        if (fileName in docs) {
          const { [fileName]: _removed, ...updated } = docs
          await supabase.from('companies').update({ documents: updated }).eq('id', company.id)
        }
      }
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

export async function requestMoreInfo(type: "client" | "interpreter", id: string, message: string) {
  try {
     await ensureAdmin()
  } catch (e) {
      return { error: "Unauthorized" }
  }
  const supabase = createAdminClient()

  if (!message) return { error: "Message is required" }

  const tableName = type === "client" ? "companies" : "interpreters"

  const { error } = await supabase
    .from(tableName as any)
    .update({ 
      info_request_details: message,
      rejection_reason: null
    })
    .eq("id", id)

  if (error) {
    console.error(`Error requesting info for ${type} ${id}:`, error)
    return { error: error.message }
  }

  // Fetch the user's email to send the request
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(id)
  
  if (userData?.user?.email) {
      await sendEmail(
          userData.user.email,
          "Action Required: Additional Information for Tutlayt Verification",
          message,
          `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #008080;">Action Required</h2>
            <p>Hello,</p>
            <p>Admin has reviewed your profile and requires additional information to proceed with your verification.</p>
            <blockquote style="background: #f0f9ff; border-left: 4px solid #008080; padding: 15px; margin: 20px 0;">
              ${message}
            </blockquote>
            <p>Please log in to your dashboard to update your profile or upload the requested documents.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" style="background-color: #008080; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
          </div>
          `
      )
  }

  revalidatePath("/admin")
  return { success: true }
}

export async function updateEquipmentRequestStatus(id: string, status: string) {
  try {
    await ensureAdmin()
  } catch (e) {
    return { error: "Unauthorized" }
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("equipment_requests")
    .update({ status })
    .eq("id", id)

  if (error) {
    console.error("Error updating equipment request status:", error)
    return { error: "Failed to update status. Please try again." }
  }

  revalidatePath("/admin/equipment")
  return { success: true }
}
