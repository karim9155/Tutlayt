import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"

import { UserVerificationTable } from "@/components/admin/user-verification-table"

async function getDocumentUrls(supabase: any, bucket: string, docs: any) {
  const urls: Record<string, string> = {}
  if (!docs) return urls

  for (const [key, val] of Object.entries(docs)) {
    let path = val as string
    // Handle client object structure { path: '...', signed_at: '...' }
    if (typeof val === 'object' && val !== null && (val as any).path) {
        path = (val as any).path
    }
    
    if (typeof path === 'string') {
        if (path.startsWith('http')) {
            urls[key] = path
        } else {
            const { data } = supabase.storage.from(bucket).getPublicUrl(path)
            urls[key] = data.publicUrl
        }
    }
  }
  return urls
}


export default async function AdminPage() {
  const supabase = createAdminClient()

  // Authenticated via layout.tsx check for admin_session cookie
  
  // 1. Fetch Companies (Clients)
  const { data: companies } = await supabase
    .from('companies')
    .select(`
        *,
        profiles ( full_name, email, avatar_url )
    `)
    .order('created_at', { ascending: false })

  // 2. Fetch Interpreters
  const { data: interpretersRaw } = await supabase
    .from('interpreters')
    .select(`
        *,
        profiles ( full_name, email, avatar_url )
    `)
    .order('created_at', { ascending: false })
  
  // Use all interpreters, regardless of document status
  const interpreters = interpretersRaw || []

  // 3. Process URLs for display
  const clientsWithUrls = await Promise.all((companies || []).map(async (c) => ({
      ...c,
      documentUrls: await getDocumentUrls(supabase, 'client-documents', c.documents)
  })))

  const interpretersWithUrls = await Promise.all(interpreters.map(async (i) => {
      const docs = i.documents || {}
      // Add legacy if missing from docs
      if (i.signed_policy_url && !docs['Legacy Signed Policy']) {
          // If it's a full URL, good. If path, resolved.
          docs['Legacy Signed Policy'] = i.signed_policy_url
      }
      return {
          ...i,
          documentUrls: await getDocumentUrls(supabase, 'interpreter-documents', docs)
      }
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--deep-navy)]">Verification Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage user verification requests.</p>
      </div>
      
      {/* Verification Section */}
      <UserVerificationTable clients={clientsWithUrls} interpreters={interpretersWithUrls} />
    </div>
  )
}
