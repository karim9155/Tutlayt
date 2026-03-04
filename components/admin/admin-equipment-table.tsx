"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Calendar, Mail, Building, Mic } from "lucide-react"
import { updateEquipmentRequestStatus } from "@/app/admin/actions"
import { useRouter } from "next/navigation"

type EquipmentRequest = {
  id: string
  created_at: string
  client_name: string
  client_email: string
  company_name: string | null
  event_date: string
  equipment_needed: string[]
  additional_notes: string | null
  status: "pending" | "contacted" | "confirmed" | "cancelled"
}

const statusColors: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700 border-orange-200",
  contacted: "bg-blue-100 text-blue-700 border-blue-200",
  confirmed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
}

export function AdminEquipmentTable({ requests }: { requests: EquipmentRequest[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(requests.map((r) => [r.id, r.status]))
  )
  const router = useRouter()

  async function handleStatusChange(id: string, status: string) {
    setLoadingId(id)
    const result = await updateEquipmentRequestStatus(id, status)
    if (result.error) {
      toast.error(result.error)
    } else {
      setStatuses((prev) => ({ ...prev, [id]: status }))
      toast.success("Status updated")
      router.refresh()
    }
    setLoadingId(null)
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Mic className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
          <p className="text-lg font-medium text-muted-foreground">No equipment requests yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            When clients submit requests from the equipment page, they'll appear here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold">Client</TableHead>
            <TableHead className="font-semibold">Equipment</TableHead>
            <TableHead className="font-semibold">Event Date</TableHead>
            <TableHead className="font-semibold">Submitted</TableHead>
            <TableHead className="font-semibold">Notes</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow key={req.id} className={statuses[req.id] === "pending" ? "bg-orange-50/40" : ""}>
              <TableCell>
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">{req.client_name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {req.client_email}
                  </div>
                  {req.company_name && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building className="h-3 w-3" />
                      {req.company_name}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {req.equipment_needed.map((item) => (
                    <span
                      key={item}
                      className="inline-block rounded-full bg-(--teal)/10 text-(--teal) text-xs px-2 py-0.5 font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {new Date(req.event_date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(req.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell className="max-w-[180px]">
                <p className="text-xs text-muted-foreground truncate">
                  {req.additional_notes || "—"}
                </p>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {loadingId === req.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Select
                      value={statuses[req.id]}
                      onValueChange={(val) => handleStatusChange(req.id, val)}
                    >
                      <SelectTrigger
                        className={`h-8 w-[130px] text-xs font-medium border ${statusColors[statuses[req.id]]}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
