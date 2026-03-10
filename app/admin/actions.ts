"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sendEmail } from "@/lib/email"

async function ensureAdmin() {
    const cookieStore = await cookies()
    if (cookieStore.get("admin_session")?.value !== "true") {
        throw new Error("Unauthorized")
    }
    // Verify the live Supabase session still belongs to an admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
    if (profile?.role !== "admin") throw new Error("Unauthorized")
}

export async function adminLogin(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    redirect("/admin/login?error=Invalid%20credentials")
  }

  // Verify the signed-in user has the admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single()

  if (profile?.role !== "admin") {
    await supabase.auth.signOut()
    redirect("/admin/login?error=Access%20denied")
  }

  const cookieStore = await cookies()
  cookieStore.set("admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
  })
  redirect("/admin")
}

export async function adminLogout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
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

// ===========================================
// Interpreter Request Management
// ===========================================

export async function getInterpreterRequests() {
  try {
    await ensureAdmin()
  } catch (e) {
    return { error: "Unauthorized", data: null }
  }
  const supabase = createAdminClient()

  // Fetch requests without joins (joins are unreliable with new tables due to schema cache)
  const { data: requests, error } = await supabase
    .from("interpreter_requests")
    .select("*")
    .order("created_at", { ascending: false })

  const tableNotFound = error && (
    (error as any).code === "42P01" ||
    (error as any).code === "PGRST200" ||
    (error as any).message?.includes("does not exist") ||
    (error as any).message?.includes("schema cache")
  )

  if (error && !tableNotFound) {
    console.error("Error fetching interpreter requests:", error)
    return { error: error.message, data: null }
  }

  if (tableNotFound) {
    return { error: "TABLE_NOT_FOUND", data: null }
  }

  if (!requests || requests.length === 0) {
    return { data: requests || [] }
  }

  // Collect unique IDs for batch lookups
  const clientIds = [...new Set(requests.map((r: any) => r.client_id).filter(Boolean))]
  const interpreterIds = [...new Set([
    ...requests.map((r: any) => r.suggested_interpreter_id),
    ...requests.map((r: any) => r.assigned_interpreter_id),
  ].filter(Boolean))]

  // Batch fetch profiles and company names
  const [profilesResult, interpretersResult, companiesResult] = await Promise.all([
    clientIds.length > 0
      ? supabase.from("profiles").select("id, email").in("id", clientIds)
      : { data: [] },
    interpreterIds.length > 0
      ? supabase.from("interpreters").select("id, full_name, hourly_rate").in("id", interpreterIds)
      : { data: [] },
    clientIds.length > 0
      ? supabase.from("companies").select("id, company_name").in("id", clientIds)
      : { data: [] },
  ])

  const profilesMap = new Map((profilesResult.data || []).map((p: any) => [p.id, p]))
  const interpretersMap = new Map((interpretersResult.data || []).map((i: any) => [i.id, i]))
  const companiesMap = new Map((companiesResult.data || []).map((c: any) => [c.id, c]))

  // Attach related data to each request
  const enrichedRequests = requests.map((r: any) => {
    const profile = profilesMap.get(r.client_id)
    const company = companiesMap.get(r.client_id)
    return {
      ...r,
      client: profile ? { ...profile, company_name: company?.company_name || profile?.email || 'Unknown Client' } : null,
      suggested_interpreter: interpretersMap.get(r.suggested_interpreter_id) || null,
      assigned_interpreter: interpretersMap.get(r.assigned_interpreter_id) || null,
    }
  })

  return { data: enrichedRequests }
}

export async function getVerifiedInterpreters() {
  try {
    await ensureAdmin()
  } catch (e) {
    return { error: "Unauthorized", data: null }
  }
  const supabase = createAdminClient()

  // Fetch verified interpreters
  const { data: interpreterRows, error } = await supabase
    .from("interpreters")
    .select("*")
    .eq("verified", true)

  if (error) {
    // Don't crash if table doesn't exist yet
    const tableNotFound =
      (error as any).code === "42P01" ||
      (error as any).code === "PGRST200" ||
      (error as any).message?.includes("does not exist") ||
      (error as any).message?.includes("schema cache")
    if (!tableNotFound) {
      console.error("Error fetching interpreters:", error)
    }
    return { error: tableNotFound ? "TABLE_NOT_FOUND" : error.message, data: null }
  }

  if (!interpreterRows || interpreterRows.length === 0) {
    return { data: [] }
  }

  // Fetch profiles to get name, avatar_url — select * so it works regardless of schema migration state
  const ids = interpreterRows.map((i: any) => i.id)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", ids)

  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))

  const data = interpreterRows.map((i: any) => {
    const profile = profileMap.get(i.id)
    // company_name is the renamed column (migration 024); fall back to full_name if not yet migrated
    const name = profile?.company_name || profile?.full_name || i.full_name || "Unknown"
    return {
      ...i,
      full_name: name,
      avatar_url: profile?.avatar_url,
      email: profile?.email,
    }
  }).sort((a: any, b: any) => (a.full_name || '').localeCompare(b.full_name || ''))

  return { data }
}

export async function getInterpreterAvailability(date: string, interpreterIds: string[]) {
  try {
    await ensureAdmin()
  } catch (e) {
    return { error: "Unauthorized", data: null }
  }
  if (interpreterIds.length === 0) return { data: [] }
  
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("availability")
    .select("interpreter_id, date, start_time, end_time, is_booked")
    .eq("date", date)
    .eq("is_booked", false)
    .in("interpreter_id", interpreterIds)

  if (error) {
    console.error("Error fetching availability:", error)
    return { error: error.message, data: null }
  }

  return { data }
}

export async function assignInterpreterToRequest(requestId: string, interpreterId: string) {
  try {
    await ensureAdmin()
  } catch (e) {
    return { error: "Unauthorized" }
  }
  const supabase = createAdminClient()

  try {
    // Fetch the request details (no profile join to avoid schema issues)
    const { data: request, error: reqError } = await supabase
      .from("interpreter_requests")
      .select("*")
      .eq("id", requestId)
      .single()

    if (reqError || !request) {
      console.error("Error fetching request:", reqError)
      return { error: "Request not found" }
    }

    // Fetch client email & company name separately
    const [profileRes, companyRes] = await Promise.all([
      supabase.from("profiles").select("id, email").eq("id", request.client_id).single(),
      supabase.from("companies").select("id, company_name").eq("id", request.client_id).single(),
    ])
    const clientProfile = {
      id: request.client_id,
      email: profileRes.data?.email,
      company_name: companyRes.data?.company_name,
    }

    if (request.status !== 'pending' && request.status !== 'declined') {
      return { error: "Request is not in a state that can be assigned" }
    }

    // Fetch interpreter details
    const { data: interpreter, error: intError } = await supabase
      .from("interpreters")
      .select("id, hourly_rate")
      .eq("id", interpreterId)
      .single()

    if (intError || !interpreter) {
      console.error("Error fetching interpreter:", intError)
      return { error: "Interpreter not found" }
    }

    // Fetch interpreter name from profiles
    const { data: interpreterProfile } = await supabase
      .from("profiles")
      .select("company_name, full_name")
      .eq("id", interpreterId)
      .single()
    const interpreterName = interpreterProfile?.company_name || interpreterProfile?.full_name || "Interpreter"

    // Fetch interpreter's email from auth
    const { data: interpreterAuth } = await supabase.auth.admin.getUserById(interpreterId)

    // Calculate price from interpreter rate x duration
    const startTime = new Date(request.start_time)
    const endTime = new Date(request.end_time)
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
    const calculatedPrice = durationHours * (interpreter.hourly_rate || 0)

    // Create a booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        client_id: request.client_id,
        interpreter_id: interpreterId,
        title: request.title,
        platform: request.platform,
        start_time: request.start_time,
        end_time: request.end_time,
        timezone: request.timezone,
        languages: request.languages,
        subject_matter: request.subject_matter,
        price: calculatedPrice,
        currency: request.currency || 'TND',
        description: request.description,
        meeting_link: request.meeting_link,
        preparation_materials_url: request.preparation_materials_url,
        status: 'pending',
        interpreter_request_id: requestId,
      })
      .select("id")
      .single()

    if (bookingError || !booking) {
      console.error("Error creating booking from request:", bookingError)
      return { error: bookingError?.message || "Failed to create booking" }
    }

    // Update the request with assignment info
    const { error: updateError } = await supabase
      .from("interpreter_requests")
      .update({
        assigned_interpreter_id: interpreterId,
        booking_id: booking.id,
        status: 'assigned',
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (updateError) {
      console.error("Error updating request:", updateError)
      return { error: updateError.message }
    }

    // Send email to interpreter about the new mission
    if (interpreterAuth?.user?.email) {
      await sendEmail(
        interpreterAuth.user.email,
        "New Mission Assignment - Tutlayt",
        `You have been assigned a new interpretation mission: "${request.title}". Please log in to review and accept or decline.`,
        `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #008080;">New Mission Assignment</h2>
          <p>Hello ${interpreterName},</p>
          <p>You have been assigned a new interpretation mission by the Tutlayt team.</p>
          <div style="background: #f0f9ff; border-left: 4px solid #008080; padding: 15px; margin: 20px 0;">
            <strong>Mission:</strong> ${request.title}<br/>
            <strong>Languages:</strong> ${request.languages || 'N/A'}<br/>
            <strong>Date:</strong> ${new Date(request.start_time).toLocaleDateString()}<br/>
            <strong>Platform:</strong> ${request.platform || 'N/A'}<br/>
            <strong>Price:</strong> ${calculatedPrice.toFixed(2)} ${request.currency || 'TND'}
          </div>
          <p>Please log in to your dashboard to review and accept or decline this mission.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/interpreter/missions" style="background-color: #008080; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Mission</a>
        </div>
        `
      )
    }

    // Send email to client about assignment
    if (clientProfile?.email) {
      await sendEmail(
        clientProfile.email,
        "Interpreter Assigned to Your Request - Tutlayt",
        `An interpreter has been assigned to your request "${request.title}". The interpreter will review and confirm shortly.`,
        `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #008080;">Interpreter Assigned</h2>
          <p>Hello ${clientProfile.company_name},</p>
          <p>Great news! An interpreter has been assigned to your request.</p>
          <div style="background: #f0f9ff; border-left: 4px solid #008080; padding: 15px; margin: 20px 0;">
            <strong>Request:</strong> ${request.title}<br/>
            <strong>Interpreter:</strong> ${interpreterName}<br/>
            <strong>Price:</strong> ${calculatedPrice.toFixed(2)} ${request.currency || 'TND'}<br/>
            <strong>Your Budget:</strong> ${request.budget} ${request.currency || 'TND'}
          </div>
          <p>The interpreter will review the mission and confirm shortly. You'll be notified once they respond.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/client/requests" style="background-color: #008080; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Your Requests</a>
        </div>
        `
      )
    }

    revalidatePath("/admin/requests")
    revalidatePath("/dashboard/client/requests")
    revalidatePath("/dashboard/interpreter/missions")
    return { success: true }
  } catch (error: any) {
    console.error("Error assigning interpreter:", error)
    return { error: error.message }
  }
}

export async function reassignInterpreterToRequest(requestId: string, newInterpreterId: string) {
  try {
    await ensureAdmin()
  } catch (e) {
    return { error: "Unauthorized" }
  }
  const supabase = createAdminClient()

  try {
    // Fetch the request
    const { data: request, error: reqError } = await supabase
      .from("interpreter_requests")
      .select("booking_id, status")
      .eq("id", requestId)
      .single()

    if (reqError || !request) {
      return { error: "Request not found" }
    }

    // Cancel the old booking if it exists
    if (request.booking_id) {
      await supabase
        .from("bookings")
        .update({ status: 'cancelled' })
        .eq("id", request.booking_id)
    }

    // Reset the request to pending so assignInterpreterToRequest can process it
    await supabase
      .from("interpreter_requests")
      .update({
        status: 'pending',
        assigned_interpreter_id: null,
        booking_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    // Now assign the new interpreter
    return await assignInterpreterToRequest(requestId, newInterpreterId)
  } catch (error: any) {
    console.error("Error reassigning interpreter:", error)
    return { error: error.message }
  }
}

export async function addAdminNoteToRequest(requestId: string, note: string) {
  try {
    await ensureAdmin()
  } catch (e) {
    return { error: "Unauthorized" }
  }
  const supabase = createAdminClient()

  const { error } = await supabase
    .from("interpreter_requests")
    .update({ admin_notes: note, updated_at: new Date().toISOString() })
    .eq("id", requestId)

  if (error) {
    console.error("Error adding admin note:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/requests")
  return { success: true }
}

// ===========================================
// One-Time Access Codes
// ===========================================

export async function generateOneTimeCode(description?: string) {
  try {
    await ensureAdmin()
  } catch (e) {
    return { error: "Unauthorized" }
  }
  const supabase = createAdminClient()

  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join("")
  const digits = String(Math.floor(Math.random() * 100000)).padStart(5, "0")
  const code = `${letters}-${digits}`

  const { data, error } = await supabase
    .from("one_time_access_codes")
    .insert({ code, description: description || null })
    .select()
    .single()

  if (error) {
    console.error("Error generating one-time code:", error)
    return { error: error.message }
  }

  revalidatePath("/admin")
  return { success: true, code: data.code as string, id: data.id as string }
}

export async function revokeOneTimeAccess(userId: string) {
  try {
    await ensureAdmin()
  } catch (e) {
    return { error: "Unauthorized" }
  }
  const supabase = createAdminClient()

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: "87600h", // ~10 years — effectively permanent
  })

  if (error) {
    console.error("Error revoking one-time access:", error)
    return { error: error.message }
  }

  revalidatePath("/admin")
  return { success: true }
}

export async function deleteOneTimeCode(id: string) {
  try {
    await ensureAdmin()
  } catch (e) {
    return { error: "Unauthorized" }
  }
  const supabase = createAdminClient()

  const { error } = await supabase
    .from("one_time_access_codes")
    .delete()
    .eq("id", id)
    .eq("used", false) // Only allow deleting unused codes

  if (error) {
    console.error("Error deleting one-time code:", error)
    return { error: error.message }
  }

  revalidatePath("/admin")
  return { success: true }
}
