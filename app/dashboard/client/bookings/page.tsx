import { createClient } from "@/lib/supabase/server"
import { MissionList } from "@/components/mission-list"

export default async function ClientBookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      *,
      interpreter:interpreter_id (
        profiles (
          full_name,
          email,
          avatar_url
        )
      )
    `)
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching client bookings:", error)
  }

  // Map the nested structure to match what MissionCard expects (mission.profiles)
  const mappedBookings = bookings?.map((booking: any) => ({
    ...booking,
    profiles: booking.interpreter?.profiles
  })) || []

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--deep-navy)]">My Bookings</h1>
      <p className="text-gray-500">View and manage your interpretation bookings.</p>
      
      <MissionList missions={mappedBookings} viewMode="client" />
    </div>
  )
}
