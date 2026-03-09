import { createAdminClient } from "@/lib/supabase/admin"
import { UserVerificationTable } from "@/components/admin/user-verification-table"

async function getDocumentUrls(supabase: any, bucket: string, docs: any) {
  const urls: Record<string, string> = {}
  if (!docs) return urls

  for (const [key, val] of Object.entries(docs)) {
    let path = val as string
    // Handle client object structure { path: "...", signed_at: "..." }
    if (typeof val === "object" && val !== null && (val as any).path) {
        path = (val as any).path
    }
    
    if (typeof path === "string") {
        if (path.startsWith("http")) {
            urls[key] = path
        } else {
            const { data } = supabase.storage.from(bucket).getPublicUrl(path)
            urls[key] = data.publicUrl
        }
    }
  }
  return urls
}

type SearchParams = {
  tab?: string
  q?: string
  page?: string
}

export default async function AdminPage({ 
  searchParams 
}: { 
  searchParams: Promise<SearchParams> 
}) {
  const params = await searchParams
  const supabase = createAdminClient()
  
  // 1. Fetch Companies (Clients) - avoid joining non-existent columns by fetching profiles separately
  const { data: clientsData, count: clientsCount } = await supabase
    .from("companies")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })

  // 2. Fetch Interpreters
  const { data: interpretersData, count: interpretersCount } = await supabase
    .from("interpreters")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })

  const interpreters = interpretersData || []
  const companies = clientsData || []

  // 3. Fetch profiles for all users (safe: select * so it works regardless of schema migrations)
  const allIds = [
    ...companies.map((c: any) => c.id),
    ...interpreters.map((i: any) => i.id),
  ].filter(Boolean)

  const { data: profilesData } = allIds.length > 0
    ? await supabase.from("profiles").select("*").in("id", allIds)
    : { data: [] }

  const profilesMap = new Map((profilesData || []).map((p: any) => [p.id, p]))

  // 4. Process URLs for display (Only for fetched data)
  const clientsWithUrls = await Promise.all(companies.map(async (c: any) => ({
      ...c,
      profiles: profilesMap.get(c.id) || {},
      role: "client",
      documentUrls: await getDocumentUrls(supabase, "client-documents", c.documents)
  })))

  const interpretersWithUrls = await Promise.all(interpreters.map(async (i: any) => {
      const docs = i.documents || {}
      // Add legacy if missing from docs
      if (i.signed_policy_url && !docs["Legacy Signed Policy"]) {
          docs["Legacy Signed Policy"] = i.signed_policy_url
      }
      return {
          ...i,
          profiles: profilesMap.get(i.id) || {},
          role: "interpreter",
          documentUrls: await getDocumentUrls(supabase, "interpreter-documents", docs)
      }
  }))
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--deep-navy)]">Verification Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage user verification requests.</p>
      </div>
      
      {/* Verification Section */}
      <UserVerificationTable 
        clients={clientsWithUrls} 
        interpreters={interpretersWithUrls} 
        totalClients={clientsCount || 0}
        totalInterpreters={interpretersCount || 0}
        page={1} // Pass dummy page as client handles pagination
        totalPages={1} // Pass dummy totalPages as client handles pagination
      />
    </div>
  )
}
