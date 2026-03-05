"use server"

import { createClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email"
import { getAdminEmails, ADMIN_EMAILS } from "@/lib/admin-emails"

export async function submitEquipmentRequest(formData: FormData) {
  const supabase = await createClient()

  // --- Document signing guard ---
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "You must be logged in to submit an equipment request." }

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
      return { error: "You must sign all required documents before renting equipment. Please visit your dashboard to complete document signing." }
    }
  }
  // --- End document signing guard ---

  const clientName = formData.get("clientName") as string
  const companyName = formData.get("companyName") as string
  const clientEmail = formData.get("clientEmail") as string
  const eventDate = formData.get("eventDate") as string
  const equipmentNeeded = formData.getAll("equipmentNeeded") as string[]
  const additionalNotes = formData.get("additionalNotes") as string

  if (!clientName || !clientEmail || !eventDate || equipmentNeeded.length === 0) {
    return { error: "Please fill in all required fields." }
  }

  // Calculate generic price or estimate based on equipment (Optional)
  // For now, just store request.

  // Try to insert into database
  const { error } = await supabase
    .from("equipment_requests")
    .insert({
      client_name: clientName,
      company_name: companyName || null,
      client_email: clientEmail,
      event_date: eventDate,
      equipment_needed: equipmentNeeded,
      additional_notes: additionalNotes || null,
    })

  console.log("[equipment] DB insert error:", error ? (error as any).message : "none")

  if (error) {
    console.error("Error inserting equipment request:", (error as any).message ?? error)
    // Fallback: send to all admin emails directly
    const emailResult = await sendEmail(
      ADMIN_EMAILS[0],
      `New Equipment Request from ${clientName}`,
      `Client: ${clientName} (${clientEmail})\nCompany: ${companyName}\nDate: ${eventDate}\nEquipment: ${equipmentNeeded.join(", ")}\nNotes: ${additionalNotes}`
    )
    console.log("[equipment] Fallback email result:", emailResult.error ? (emailResult.error as any).message ?? emailResult.error : "sent ok")
    if (emailResult.error) {
      return { error: "Could not submit request. Please try again later." }
    }
  } else {
    const recipients = await getAdminEmails()
    console.log("[equipment] Recipients:", recipients)

    const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/equipment`

    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: #008080; padding: 24px 32px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0; font-size: 20px;">🔔 New Equipment Request</h2>
        </div>
        <div style="background: #f9f9f9; padding: 28px 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 20px; font-size: 15px;">A client has submitted a new sound equipment rental request.</p>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px 0; color: #6b7280; width: 36%;">Client Name</td>
              <td style="padding: 10px 0; font-weight: 600;">${clientName}</td>
            </tr>
            ${companyName ? `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px 0; color: #6b7280;">Company</td>
              <td style="padding: 10px 0;">${companyName}</td>
            </tr>` : ""}
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px 0; color: #6b7280;">Email</td>
              <td style="padding: 10px 0;"><a href="mailto:${clientEmail}" style="color: #008080;">${clientEmail}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px 0; color: #6b7280;">Event Date</td>
              <td style="padding: 10px 0; font-weight: 600;">${new Date(eventDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px 0; color: #6b7280;">Equipment</td>
              <td style="padding: 10px 0;">${equipmentNeeded.map(e => `<span style="display:inline-block;background:#e0f2f1;color:#008080;border-radius:99px;padding:2px 10px;font-size:12px;margin:2px;">${e}</span>`).join(" ")}</td>
            </tr>
            ${additionalNotes ? `
            <tr>
              <td style="padding: 10px 0; color: #6b7280; vertical-align: top;">Notes</td>
              <td style="padding: 10px 0;">${additionalNotes}</td>
            </tr>` : ""}
          </table>

          <div style="margin-top: 28px; text-align: center;">
            <a href="${adminUrl}" style="background: #008080; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">
              View in Admin Dashboard →
            </a>
          </div>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">Tutlayt Admin Notifications</p>
      </div>
    `

    const plainText = `A new equipment rental request has been submitted.\n\nClient: ${clientName}${companyName ? ` (${companyName})` : ""}\nEmail: ${clientEmail}\nEvent Date: ${eventDate}\nEquipment: ${equipmentNeeded.join(", ")}\nNotes: ${additionalNotes || "None"}\n\nManage: ${adminUrl}`

    // Send to every admin
    const emailResults = await Promise.all(
      recipients.map((adminEmail) =>
        sendEmail(
          adminEmail,
          `🔔 New Equipment Request from ${clientName}`,
          plainText,
          htmlBody
        )
      )
    )
    emailResults.forEach((r, i) => {
      console.log(`[equipment] Email to ${recipients[i]}:`, r.error ? (r.error as any).message ?? JSON.stringify(r.error) : "sent ok")
    })

    // Send confirmation email to client
    const clientResult = await sendEmail(
      clientEmail,
      "Equipment Request Received - Tutlayt",
      `Dear ${clientName},\n\nWe have received your request for equipment rental on ${eventDate}.\nEquipment: ${equipmentNeeded.join(", ")}\n\nOur team will contact you shortly with a quote.\n\nBest regards,\nTutlayt Team`
    )
    console.log("[equipment] Confirmation to client:", clientResult.error ? (clientResult.error as any).message ?? JSON.stringify(clientResult.error) : "sent ok")
  }

  return { success: true }
}
