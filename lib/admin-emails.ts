import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Fixed admin email addresses that always receive notifications.
 * Add or remove emails here as needed.
 */
export const ADMIN_EMAILS = [
  "klilakarim35@gmail.com",       // Resend account owner (required)
  "yassmine.cherif2000@gmail.com", // Admin
  "mustapha@tutlayt.com",          // Admin
]

/**
 * Returns the full deduplicated list of admin emails:
 * fixed ones above + any profiles with role="admin" from the database.
 */
export async function getAdminEmails(): Promise<string[]> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from("profiles")
      .select("email")
      .eq("role", "admin")

    const dbEmails = (data || []).map((p: any) => p.email).filter(Boolean)
    return [...new Set([...ADMIN_EMAILS, ...dbEmails])]
  } catch {
    return ADMIN_EMAILS
  }
}
