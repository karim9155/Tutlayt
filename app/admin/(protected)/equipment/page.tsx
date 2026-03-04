import { createAdminClient } from "@/lib/supabase/admin"
import { AdminEquipmentTable } from "@/components/admin/admin-equipment-table"
import { AlertTriangle } from "lucide-react"

export default async function AdminEquipmentPage() {
  const supabase = createAdminClient()

  const { data: requests, error } = await supabase
    .from("equipment_requests")
    .select("*")
    .order("created_at", { ascending: false })

  // Table likely doesn't exist yet — need to run scripts/020_equipment_requests.sql
  const tableNotFound = error && (
    (error as any).code === "42P01" ||
    (error as any).code === "PGRST200" ||
    (error as any).message?.includes("does not exist") ||
    (error as any).message?.includes("schema cache") ||
    (error as any).message?.includes("equipment_requests")
  )

  if (error && !tableNotFound) {
    console.error("Error fetching equipment requests:", (error as any).message ?? JSON.stringify(error))
  }

  const pendingCount = (requests || []).filter((r) => r.status === "pending").length

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-(--deep-navy)">
            Equipment Requests
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage incoming sound equipment rental requests.
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            {pendingCount} pending
          </span>
        )}
      </div>

      {tableNotFound ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 flex gap-4 items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-2">
            <p className="font-semibold text-amber-800">Database table not set up yet</p>
            <p className="text-sm text-amber-700">
              Run <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">scripts/020_equipment_requests.sql</code> in your{" "}
              <a
                href={`https://supabase.com/dashboard/project/butzfgpxfsjvlawxfkqd/sql/new`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                Supabase SQL Editor
              </a>{" "}
              to create the equipment requests table.
            </p>
          </div>
        </div>
      ) : (
        <AdminEquipmentTable requests={requests || []} />
      )}
    </div>
  )
}
