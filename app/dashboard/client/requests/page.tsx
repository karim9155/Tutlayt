import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Globe, Tag, DollarSign, UserSearch, ArrowLeft, User } from "lucide-react"
import { format } from "date-fns"
import { CancelRequestButton } from "./cancel-button"
import { PaginationControls } from "@/components/pagination-controls"

const PAGE_SIZE = 2

const FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Waiting for Interpreter", value: "assigned" },
  { label: "Accepted", value: "fulfilled" },
  { label: "Declined", value: "declined" },
  { label: "Cancelled", value: "cancelled" },
]

export default async function ClientRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { status: statusFilter = "", page: pageParam = "1" } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam, 10))

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "company") return redirect("/dashboard")

  const { data: requests, error } = await supabase
    .from("interpreter_requests")
    .select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch interpreter names from profiles (interpreters table has no full_name column)
  const interpreterIds = Array.from(new Set([
    ...(requests || []).map((r: any) => r.assigned_interpreter_id).filter(Boolean),
    ...(requests || []).map((r: any) => r.suggested_interpreter_id).filter(Boolean),
  ]))
  const { data: interpreterProfiles } = interpreterIds.length > 0
    ? await supabase.from("profiles").select("id, company_name, full_name").in("id", interpreterIds)
    : { data: [] }
  const interpreterNameMap = new Map(
    (interpreterProfiles || []).map((p: any) => [p.id, p.company_name || p.full_name || "Interpreter"])
  )

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    assigned: "bg-blue-100 text-blue-800",
    fulfilled: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-600",
    declined: "bg-red-100 text-red-800",
  }

  const statusLabels: Record<string, string> = {
    pending: "Pending — Finding interpreter",
    assigned: "Awaiting interpreter response",
    fulfilled: "Interpreter accepted ✓",
    cancelled: "Cancelled",
    declined: "Interpreter declined — Being reassigned",
  }

  const allRequests = requests || []
  const filtered = statusFilter
    ? allRequests.filter((r: any) => r.status === statusFilter)
    : allRequests
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/dashboard/client" className="text-sm text-gray-500 hover:text-[var(--teal)] flex items-center gap-1 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[var(--deep-navy)]">My Requests</h1>
          <p className="text-gray-500 mt-1">Track your interpreter requests assigned by our team.</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const isActive = statusFilter === f.value
          const href = f.value
            ? `/dashboard/client/requests?status=${f.value}`
            : `/dashboard/client/requests`
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
        <div className="grid gap-6">
          {paginated.map((request: any) => (
            <Card key={request.id} className="border-none shadow-md bg-white overflow-hidden">
              <div className={`h-2 w-full ${
                request.status === 'fulfilled' ? 'bg-green-500' :
                request.status === 'assigned' ? 'bg-blue-500' :
                request.status === 'pending' ? 'bg-amber-500' :
                request.status === 'declined' ? 'bg-red-500' :
                'bg-gray-300'
              }`} />
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-[var(--deep-navy)]">{request.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Submitted {format(new Date(request.created_at), "dd MMM yyyy, HH:mm")}
                    </CardDescription>
                  </div>
                  <Badge className={`${statusColors[request.status] || 'bg-gray-100 text-gray-600'} border-none`}>
                    {statusLabels[request.status] || request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-[var(--teal)]" />
                      <span className="text-gray-600">
                        {format(new Date(request.start_time), "dd MMM yyyy")} &middot; {format(new Date(request.start_time), "HH:mm")} - {format(new Date(request.end_time), "HH:mm")} ({request.timezone})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-[var(--teal)]" />
                      <span className="text-gray-600">{request.languages || '—'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Tag className="w-4 h-4 text-[var(--teal)]" />
                      <span className="text-gray-600">{request.subject_matter || '—'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-[var(--teal)]" />
                      <span className="text-gray-600">Budget: {request.budget} {request.currency}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {request.assigned_interpreter_id && (
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-[var(--teal)]" />
                        <span className="text-gray-600">
                          <span className="font-medium text-[var(--deep-navy)]">Assigned:</span> {interpreterNameMap.get(request.assigned_interpreter_id)}
                        </span>
                      </div>
                    )}
                    {request.suggested_interpreter_id && !request.assigned_interpreter_id && (
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">
                          Suggested: {interpreterNameMap.get(request.suggested_interpreter_id)}
                        </span>
                      </div>
                    )}
                    {request.platform && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-[var(--teal)]" />
                        <span className="text-gray-600">Platform: {request.platform}</span>
                      </div>
                    )}
                  </div>
                </div>

                {request.description && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-gray-600 text-sm">{request.description}</p>
                  </div>
                )}

                {(request.status === 'pending' || request.status === 'declined') && (
                  <div className="flex justify-end pt-2">
                    <CancelRequestButton requestId={request.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
            <UserSearch className="h-full w-full" />
          </div>
          <h3 className="text-lg font-medium text-[var(--deep-navy)]">
            {statusFilter ? `No ${FILTERS.find(f => f.value === statusFilter)?.label.toLowerCase()} requests` : "No requests yet"}
          </h3>
          <p className="text-gray-500 mt-1 mb-6">
            {statusFilter ? "Try a different filter." : "You haven't submitted any interpreter requests."}
          </p>
          {!statusFilter && (
            <Link href="/dashboard/client">
              <Button className="bg-[var(--teal)] text-white hover:bg-[var(--teal)]/90">
                Go to Dashboard
              </Button>
            </Link>
          )}
        </div>
      )}

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/dashboard/client/requests"
        params={{ status: statusFilter || undefined }}
      />
    </div>
  )
}
