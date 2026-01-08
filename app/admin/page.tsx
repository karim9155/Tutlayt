import { createClient } from "@/lib/supabase/server"
import { AdminView } from "./view"

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

async function getRawDocuments(supabase: any, bucket: string) {
  const { data, error } = await supabase.storage.from(bucket).list()
  
  if (error) {
     console.error(`Error fetching ${bucket}:`, error)
     return []
  }
  
  if (!data) return []

  const files = data.map((file: any) => {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(file.name)
      return { 
          name: file.name,
          id: file.id,
          created_at: file.created_at,
          metadata: file.metadata,
          bucket,
          publicUrl
      }
  })
  
  // Sort by date desc
  return files.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export default async function AdminPage() {
  const supabase = await createClient()

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

  // 4. Fetch Raw Files
  const rawInterpreterDocs = await getRawDocuments(supabase, 'interpreter-documents')
  const rawTranslatorDocs = await getRawDocuments(supabase, 'sworn-translator-documents')
  const rawClientDocs = await getRawDocuments(supabase, 'client-documents')

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--deep-navy)]">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage users, verifications, and platform settings.</p>
      </div>
      
      {/* Verification Section */}
      <UserVerificationTable clients={clientsWithUrls} interpreters={interpretersWithUrls} />

      {/* Raw Document View */}
      <div className="pt-8 border-t">
         <h2 className="text-xl font-semibold mb-4 text-[var(--deep-navy)]">Raw Document Storage</h2>
         <AdminView 
            interpreters={rawInterpreterDocs} 
            translators={rawTranslatorDocs} 
            clients={rawClientDocs} 
          />
      </div>
    </div>
  )
}
