import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MissionCard } from "@/components/mission-card"
import { PaginationControls } from "@/components/pagination-controls"
import { CalendarCheck } from "lucide-react"
import Link from "next/link"

const PAGE_SIZE = 2

const FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Declined", value: "declined" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
]

export default async function InterpreterBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { status: statusFilter = "", page: pageParam = "1" } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect("/login")

  const { data: bookingsRaw, error } = await supabase
    .from("bookings")
    .select(`*, profiles:client_id (*)`)
    .eq("interpreter_id", user.id)
    .is("interpreter_request_id", null)
    .order("created_at", { ascending: false })

  if (error) console.error("Error fetching interpreter bookings:", error)

  const allBookings = (bookingsRaw || []).map((b: any) => ({
    ...b,
    profiles: b.profiles
      ? { ...b.profiles, company_name: b.profiles.company_name || b.profiles.full_name }
      : b.profiles,
  }))

  const filtered = statusFilter
    ? allBookings.filter((b: any) => b.status === statusFilter)
    : allBookings

  const currentPage = Math.max(1, parseInt(pageParam, 10))
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--deep-navy)]">My Bookings</h1>
        <p className="text-gray-500 mt-1">Review and respond to booking requests from clients.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const isActive = statusFilter === f.value
          const href = f.value
            ? `/dashboard/interpreter/bookings?status=${f.value}`
            : `/dashboard/interpreter/bookings`
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

      {paginated.length > 0 ? (
        <div className="space-y-4">
          {paginated.map((booking: any) => (
            <MissionCard key={booking.id} mission={booking} viewMode="interpreter" />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
          <CalendarCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-[var(--deep-navy)]">
            {statusFilter ? `No ${statusFilter} bookings` : "No bookings yet"}
          </h3>
          <p className="text-gray-500 mt-1">
            {statusFilter ? "Try a different filter." : "When clients book you, their requests will appear here."}
          </p>
        </div>
      )}

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/dashboard/interpreter/bookings"
        params={{ status: statusFilter || undefined }}
      />
    </div>
  )
}
