import { getInterpreterRequests, getVerifiedInterpreters } from "@/app/admin/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Calendar, Globe, DollarSign, Tag, User, Clock, UserSearch } from "lucide-react"
import { RequestAssignmentModal } from "@/components/admin/request-assignment-modal"
import Link from "next/link"

export default async function AdminRequestsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { data: requests, error } = await getInterpreterRequests()
  const { data: interpreters } = await getVerifiedInterpreters()

  const { status: statusParam } = await searchParams
  const activeFilter = statusParam || null

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    assigned: "bg-blue-100 text-blue-800",
    fulfilled: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-600",
    declined: "bg-red-100 text-red-800",
  }

  const statusLabels: Record<string, string> = {
    pending: "Pending",
    assigned: "Waiting for Interpreter",
    fulfilled: "Accepted",
    cancelled: "Cancelled",
    declined: "Declined by Interpreter",
  }

  const filteredRequests = activeFilter
    ? (requests || []).filter((r: any) => r.status === activeFilter)
    : (requests || [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interpreter Requests</h1>
        <p className="text-gray-500 mt-1">Manage client requests for interpreter assignments.</p>
      </div>

      {/* Stats / Filter buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['pending', 'assigned', 'fulfilled', 'declined'] as const).map(status => {
          const count = requests?.filter((r: any) => r.status === status).length || 0
          const isActive = activeFilter === status
          return (
            <Link
              key={status}
              href={isActive ? '/admin/requests' : `/admin/requests?status=${status}`}
              className="block"
            >
              <Card className={`border-2 transition-all hover:shadow-md cursor-pointer ${isActive ? 'border-gray-400 shadow-md bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <CardContent className="pt-4 pb-4 px-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{statusLabels[status]}</span>
                    <Badge className={`${statusColors[status]} border-none`}>{count}</Badge>
                  </div>
                  {isActive && (
                    <p className="text-xs text-gray-400 mt-1">Click to clear filter</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {error === "TABLE_NOT_FOUND" && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md">
          <p className="font-medium">Database migration required</p>
          <p className="text-sm mt-1">The <code>interpreter_requests</code> table has not been created yet. Run <code>scripts/021_interpreter_requests.sql</code> in your Supabase SQL Editor.</p>
        </div>
      )}
      {error && error !== "TABLE_NOT_FOUND" && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          Error loading requests: {error}
        </div>
      )}

      {requests && requests.length > 0 ? (
        filteredRequests.length > 0 ? (
        <div className="grid gap-4">
          {filteredRequests.map((request: any) => {
            const clientProfile = request.client as any
            return (
              <Card key={request.id} className="border-gray-200 hover:shadow-md transition-shadow">
                <div className={`h-1.5 w-full ${
                  request.status === 'fulfilled' ? 'bg-green-500' :
                  request.status === 'assigned' ? 'bg-blue-500' :
                  request.status === 'pending' ? 'bg-amber-500' :
                  request.status === 'declined' ? 'bg-red-500' :
                  'bg-gray-300'
                }`} />
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium text-gray-700">{clientProfile?.company_name || 'Unknown Client'}</span>
                        {clientProfile?.email && <span className="ml-2 text-gray-400">({clientProfile.email})</span>}
                        <span className="mx-2">&middot;</span>
                        {format(new Date(request.created_at), "dd MMM yyyy, HH:mm")}
                      </p>
                    </div>
                    <Badge className={`${statusColors[request.status] || 'bg-gray-100 text-gray-600'} border-none`}>
                      {statusLabels[request.status] || request.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{format(new Date(request.start_time), "dd MMM yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {format(new Date(request.start_time), "HH:mm")} - {format(new Date(request.end_time), "HH:mm")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{request.languages || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 font-medium">Budget: {request.budget} {request.currency}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {request.subject_matter && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{request.subject_matter}</span>
                      </div>
                    )}
                    {request.platform && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{request.platform}</span>
                      </div>
                    )}
                  </div>

                  {/* Interpreter info */}
                  <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100">
                    {request.suggested_interpreter && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <User className="w-4 h-4" />
                        <span>Suggested: <span className="font-medium text-gray-700">{(request.suggested_interpreter as any)?.full_name}</span></span>
                        {(request.suggested_interpreter as any)?.hourly_rate && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {(request.suggested_interpreter as any).hourly_rate} TND/hr
                          </span>
                        )}
                      </div>
                    )}
                    {request.assigned_interpreter && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <User className="w-4 h-4" />
                        <span>Assigned: <span className="font-medium">{(request.assigned_interpreter as any)?.full_name}</span></span>
                        {(request.assigned_interpreter as any)?.hourly_rate && (
                          <span className="text-xs bg-blue-50 px-2 py-0.5 rounded">
                            {(request.assigned_interpreter as any).hourly_rate} TND/hr
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {request.description && (
                    <p className="text-gray-500 text-xs bg-gray-50 p-2 rounded border border-gray-100">{request.description}</p>
                  )}

                  {request.admin_notes && (
                    <p className="text-blue-600 text-xs bg-blue-50 p-2 rounded border border-blue-100">
                      <span className="font-medium">Admin notes:</span> {request.admin_notes}
                    </p>
                  )}

                  {/* Action buttons */}
                  {(request.status === 'pending' || request.status === 'declined') && (
                    <div className="flex justify-end pt-2">
                      <RequestAssignmentModal
                        request={request}
                        interpreters={interpreters || []}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
            <UserSearch className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900">No &quot;{statusLabels[activeFilter!]}&quot; requests</h3>
            <p className="text-gray-500 mt-1 text-sm">
              <Link href="/admin/requests" className="text-blue-500 underline">Clear filter</Link> to see all requests.
            </p>
          </div>
        )
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <UserSearch className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No requests yet</h3>
          <p className="text-gray-500 mt-1">Interpreter requests from clients will appear here.</p>
        </div>
      )}
    </div>
  )
}
