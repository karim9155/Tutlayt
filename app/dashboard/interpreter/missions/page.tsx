import { createClient } from "@/lib/supabase/server"
import { MissionList } from "@/components/mission-list"

export default async function InterpreterMissionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: missionsRaw, error } = await supabase
    .from("bookings")
    .select(`
      *,
      profiles:client_id (
        *
      )
    `)
    .eq("interpreter_id", user.id)
    .order("created_at", { ascending: false })

  // Normalise name: handle pre/post migration 024 (full_name → company_name)
  const missions = (missionsRaw || []).map((m: any) => ({
    ...m,
    profiles: m.profiles
      ? { ...m.profiles, company_name: m.profiles.company_name || m.profiles.full_name }
      : m.profiles,
  }))

  if (error) {
    console.error("Error fetching interpreter missions:", error)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--deep-navy)]">My Missions</h1>
      <p className="text-gray-500">View your upcoming and past interpretation missions.</p>
      
      <MissionList missions={missions || []} />
    </div>
  )
}
