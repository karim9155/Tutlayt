"use server"

import { createClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email"

export async function submitEquipmentRequest(formData: FormData) {
  const supabase = await createClient()
  
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
    .from("equipment_requests") // Make sure to migrate using scripts/020_equipment_requests.sql
    .insert({
      client_name: clientName,
      company_name: companyName || null,
      client_email: clientEmail,
      event_date: eventDate,
      equipment_needed: equipmentNeeded,
      additional_notes: additionalNotes || null,
    })

  if (error) {
    console.error("Error inserting equipment request:", error)
    // Fallback to email if DB fails or table doesn't exist
    // Sending email to admin
    const emailResult = await sendEmail(
      "admin@tutlayt.com", // Replace with real admin email if known
      `New Equipment Request from ${clientName}`,
      `Client: ${clientName} (${clientEmail})\nCompany: ${companyName}\nDate: ${eventDate}\nEquipment: ${equipmentNeeded.join(", ")}\nNotes: ${additionalNotes}`
    )
    
    if (emailResult.error) {
      return { error: "Could not submit request. Please try again later." }  
    }
  } else {
    // Send confirmation email to client
    await sendEmail(
      clientEmail,
      "Equipment Request Received - Tutlayt",
      `Dear ${clientName},\n\nWe have received your request for equipment rental on ${eventDate}.\nEquipment: ${equipmentNeeded.join(", ")}\n\nOur team will contact you shortly with a quote.\n\nBest regards,\nTutlayt Team`
    )
  }

  return { success: true }
}
