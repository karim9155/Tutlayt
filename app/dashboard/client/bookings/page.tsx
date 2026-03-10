import { createClient } from "@/lib/supabase/server"
import { MissionList } from "@/components/mission-list"
import { PaginationControls } from "@/components/pagination-controls"
import Link from "next/link"

const ITEMS_PER_PAGE = 2

const FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Declined", value: "declined" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
]

export default async function ClientBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const { page: pageParam, status: statusFilter = "" } = await searchParams
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

  if (error) console.error("Error fetching client bookings:", error)

  const allBookings = (bookings || []).map((booking: any) => {
    const profile = booking.interpreter?.profiles
    return {
      ...booking,
      profiles: profile
        ? { ...profile, company_name: profile.company_name || profile.full_name }
        : undefined,
    }
  })

  const filtered = statusFilter
    ? allBookings.filter((b: any) => b.status === statusFilter)
    : allBookings

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--deep-navy)]">My Bookings</h1>
        <p className="text-gray-500">View and manage your interpretation bookings.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const isActive = statusFilter === f.value
          const href = f.value
            ? `/dashboard/client/bookings?status=${f.value}`
            : `/dashboard/client/bookings`
          return (
            <Link
              key={f.value}
              href={href}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                isActive
                  ? "bg-[var(--deep-navy)] text-white border-[var(--deep-navy)]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[var(--deep-navy)]"
              }`}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      <MissionList missions={paginated} viewMode="client" />

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/dashboard/client/bookings"
        params={{ status: statusFilter || undefined }}
      />
    </div>
  )
}
