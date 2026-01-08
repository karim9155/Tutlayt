import { createClient } from "@/lib/supabase/server"

export async function getInterpreterTemplates() {
  const supabase = await createClient()
  
  // List files in the root of the bucket
  const { data, error } = await supabase
    .storage
    .from('interpreter-documents')
    .list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    })

  if (error) {
    console.error("Error fetching templates:", error)
    return []
  }

  // Filter out folders (if any) and files that look like user uploads (if they slipped into root)
  // Our user uploads are in folders, so we just want root files.
  // Supabase list('') returns files and folders in root.
  // We can filter by checking if it's a file (metadata might help, or just assumption).
  // Assuming templates are the PDF files at root.
  
  return data
    .filter(file => file.name.toLowerCase().endsWith('.pdf')) // Assumption: Templates are PDFs
    .map(file => {
       const { data: { publicUrl } } = supabase.storage.from('interpreter-documents').getPublicUrl(file.name)
       return {
         name: file.name,
         url: publicUrl,
         // Create a readable label from filename
         // Remove timestamp prefix 176...- and extension
         label: file.name.replace(/^\d+-/, '').replace(/_/g, ' ').replace('.pdf', '')
       }
    })
}

export async function getSwornTranslatorTemplates() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .storage
    .from('sworn-translator-documents')
    .list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    })

  if (error) {
    console.error("Error fetching sworn templates:", error)
    return []
  }

  return data
    .filter(file => file.name.toLowerCase().endsWith('.pdf'))
    .map(file => {
       const { data: { publicUrl } } = supabase.storage.from('sworn-translator-documents').getPublicUrl(file.name)
       return {
         name: file.name,
         url: publicUrl,
         label: file.name.replace(/^\d+-/, '').replace(/_/g, ' ').replace('.pdf', '')
       }
    })
}

export async function getClientTemplates() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .storage
    .from('client-documents')
    .list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    })

  if (error) {
    console.error("Error fetching client templates:", error)
    return []
  }

  return data
    .filter(file => file.name.toLowerCase().endsWith('.pdf'))
    .map(file => {
       const { data: { publicUrl } } = supabase.storage.from('client-documents').getPublicUrl(file.name)
       return {
         name: file.name,
         url: publicUrl,
         label: file.name.replace(/^\d+-/, '').replace(/_/g, ' ').replace('.pdf', '')
       }
    })
}