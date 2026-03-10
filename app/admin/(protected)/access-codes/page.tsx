import { createAdminClient } from "@/lib/supabase/admin"
import { AccessCodesView } from "@/components/admin/access-codes-view"

export default async function AccessCodesPage() {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from("one_time_access_codes")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--deep-navy)]">One-Time Access Codes</h1>
        <p className="text-muted-foreground mt-2">
          Generate and manage single-use access codes for guest clients.
        </p>
      </div>

      <AccessCodesView accessCodes={data || []} />
    </div>
  )
}
