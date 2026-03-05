import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Globe, Tag, DollarSign, UserSearch, ArrowLeft, User } from "lucide-react"
import { format } from "date-fns"
import { CancelRequestButton } from "./cancel-button"

export default async function ClientRequestsPage() {
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
    .select(`
      *,
      assigned_interpreter:interpreters!interpreter_requests_assigned_interpreter_id_fkey(id, full_name),
      suggested_interpreter:interpreters!interpreter_requests_suggested_interpreter_id_fkey(id, full_name)
    `)
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    assigned: "bg-blue-100 text-blue-800",
    fulfilled: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-600",
    declined: "bg-red-100 text-red-800",
  }

  const statusLabels: Record<string, string> = {
    pending: "Pending — Finding interpreter",
    assigned: "Assigned — Awaiting confirmation",
    fulfilled: "Confirmed",
    cancelled: "Cancelled",
    declined: "Declined — Reassigning",
  }

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

      {requests && requests.length > 0 ? (
        <div className="grid gap-6">
          {requests.map((request: any) => (
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
                      <span className="text-gray-600">{request.languages || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Tag className="w-4 h-4 text-[var(--teal)]" />
                      <span className="text-gray-600">{request.subject_matter || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-[var(--teal)]" />
                      <span className="text-gray-600">Budget: {request.budget} {request.currency}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {request.assigned_interpreter && (
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-[var(--teal)]" />
                        <span className="text-gray-600">
                          <span className="font-medium text-[var(--deep-navy)]">Assigned:</span> {request.assigned_interpreter.full_name}
                        </span>
                      </div>
                    )}
                    {request.suggested_interpreter && !request.assigned_interpreter && (
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">
                          Suggested: {request.suggested_interpreter.full_name}
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
          <h3 className="text-lg font-medium text-[var(--deep-navy)]">No requests yet</h3>
          <p className="text-gray-500 mt-1 mb-6">You haven&apos;t submitted any interpreter requests.</p>
          <Link href="/dashboard/client">
            <Button className="bg-[var(--teal)] text-white hover:bg-[var(--teal)]/90">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
