"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createInterpreterRequest(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // --- Document signing guard (same as createBooking) ---
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userProfile || userProfile.role === 'company') {
    const { data: company } = await supabase
      .from('companies')
      .select('documents')
      .eq('id', user.id)
      .single()

    const { data: templateFiles } = await supabase
      .storage
      .from('client-documents')
      .list('', { limit: 100, sortBy: { column: 'name', order: 'asc' } })

    const templates = (templateFiles || []).filter((f: any) => f.name.toLowerCase().endsWith('.pdf'))
    const signedDocs: Record<string, any> = company?.documents || {}
    const allSigned = templates.length > 0 && templates.every((t: any) => !!signedDocs[t.name])

    if (!allSigned) {
      return { error: "You must sign all required documents before submitting a request. Please visit your dashboard to complete document signing." }
    }
  }
  // --- End document signing guard ---

  const title = formData.get("title") as string
  const platform = formData.get("platform") as string
  const startDate = formData.get("startDate") as string
  const startTime = formData.get("startTime") as string
  const endTime = formData.get("endTime") as string
  const timezone = formData.get("timezone") as string
  const languages = formData.get("languages") as string
  const subjectMatter = formData.get("subjectMatter") as string
  const budget = parseFloat(formData.get("budget") as string)
  const description = formData.get("description") as string
  const meetingLink = formData.get("meetingLink") as string
  const preparationMaterialsUrl = formData.get("preparationMaterialsUrl") as string
  const suggestedInterpreterId = formData.get("suggestedInterpreterId") as string | null

  if (!title || !startDate || !startTime || !endTime || !budget) {
    return { error: "Please fill in all required fields." }
  }

  const endDate = formData.get("endDate") as string || startDate
  const startDateTime = new Date(`${startDate}T${startTime}`)
  const endDateTime = new Date(`${endDate}T${endTime}`)

  const insertData: any = {
    client_id: user.id,
    title,
    platform,
    start_time: startDateTime.toISOString(),
    end_time: endDateTime.toISOString(),
    timezone,
    languages,
    subject_matter: subjectMatter,
    budget,
    currency: 'TND',
    description,
    meeting_link: meetingLink,
    preparation_materials_url: preparationMaterialsUrl,
    status: 'pending',
  }

  if (suggestedInterpreterId) {
    insertData.suggested_interpreter_id = suggestedInterpreterId
  }

  const { error } = await supabase
    .from("interpreter_requests")
    .insert(insertData)

  if (error) {
    console.error("Error creating interpreter request:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/client/requests")
  revalidatePath("/admin/requests")
  return { success: true }
}

export async function cancelInterpreterRequest(requestId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("interpreter_requests")
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("client_id", user.id)
    .in("status", ["pending", "declined"])

  if (error) {
    console.error("Error cancelling request:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/client/requests")
  revalidatePath("/admin/requests")
  return { success: true }
}

export async function getClientRequests() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated", data: null }

  const { data, error } = await supabase
    .from("interpreter_requests")
    .select(`
      *,
      suggested_interpreter:interpreters!interpreter_requests_suggested_interpreter_id_fkey(id, full_name),
      assigned_interpreter:interpreters!interpreter_requests_assigned_interpreter_id_fkey(id, full_name)
    `)
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching client requests:", error)
    return { error: error.message, data: null }
  }

  return { data }
}
