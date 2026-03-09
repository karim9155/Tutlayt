import { createClient } from "@/lib/supabase/server"
import { MissionList } from "@/components/mission-list"
import { PaginationControls } from "@/components/pagination-controls"

const ITEMS_PER_PAGE = 2

export default async function ClientBookingsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10))

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      *,
      interpreter:interpreter_id (
        profiles (
          *
        )
      )
    `)
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching client bookings:", error)
  }

  // Map the nested structure to match what MissionCard expects (mission.profiles)
  const allBookings = bookings?.map((booking: any) => {
    const profile = booking.interpreter?.profiles
    return {
      ...booking,
      profiles: profile
        ? {
            ...profile,
            // Normalise name: handle pre/post migration 024 (full_name → company_name)
            company_name: profile.company_name || profile.full_name,
          }
        : undefined,
    }
  }) || []

  const totalPages = Math.ceil(allBookings.length / ITEMS_PER_PAGE)
  const paginatedBookings = allBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--deep-navy)]">My Bookings</h1>
      <p className="text-gray-500">View and manage your interpretation bookings.</p>
      
      <MissionList missions={paginatedBookings} viewMode="client" />

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/dashboard/client/bookings"
      />
    </div>
  )
}
