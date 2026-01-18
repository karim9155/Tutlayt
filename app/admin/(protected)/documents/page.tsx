import { createAdminClient } from "@/lib/supabase/admin"
import { AdminView } from "../view"
import { redirect } from "next/navigation"

// Helper function to get raw documents
async function getRawDocuments(supabase: any, bucket: string) {
  const { data: rootData, error } = await supabase.storage.from(bucket).list()
  
  if (error) {
     console.error(`Error fetching ${bucket}:`, error)
     return []
  }
  
  if (!rootData) return []

  const allFiles: any[] = []

  for (const item of rootData) {
       // Try to list as folder contents (one level deep)
       const { data: subData, error: subError } = await supabase.storage.from(bucket).list(item.name)
       
       if (!subError && subData && subData.length > 0) {
           // It's a folder with content
           for (const subItem of subData) {
               allFiles.push({
                   ...subItem,
                   name: `${item.name}/${subItem.name}`,
               })
           }
       } else {
           // It's a file at root (or empty folder)
           if (item.id) {
               allFiles.push(item)
           }
       }
  }

  const files = allFiles.map((file: any) => {
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
  const sortedFiles = files.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Filter unwanted system files
  return sortedFiles.filter((f: any) => {
    const name = f.name.toLowerCase()
    
    if (name.includes('signature')) return false
    if (name.includes('signed_')) return false
    if (name.includes('platform')) return false
    if (name.includes('nda')) return false
    if (name.includes('agreement')) return false
    if (name.includes('policy')) return false
    
    return true
  })
}

export default async function DocumentsPage() {
  const supabase = createAdminClient()

  // Authenticated via layout.tsx
  
  // Fetch Raw Files
  const rawInterpreterDocs = await getRawDocuments(supabase, 'interpreter-documents')
  const rawTranslatorDocs = await getRawDocuments(supabase, 'sworn-translator-documents')
  const rawClientDocs = await getRawDocuments(supabase, 'client-documents')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--deep-navy)]">Raw Document Storage</h1>
        <p className="text-muted-foreground mt-2">View and manage all files in storage buckets.</p>
      </div>
      
      <AdminView 
        interpreters={rawInterpreterDocs} 
        translators={rawTranslatorDocs} 
        clients={rawClientDocs} 
      />
    </div>
  )
}
