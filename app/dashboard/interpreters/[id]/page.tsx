import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { InterpreterProfileView } from "@/components/interpreter-profile-view"
import { getInterpreterReviews, calculateReviewStats } from "@/lib/reviews"
import { getClientTemplates } from "@/lib/documents"

export default async function DashboardInterpreterProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch current user to determine client type
  const { data: { user } } = await supabase.auth.getUser()
  let clientType: string | null = null
  let documentsVerified = false

  if (user) {
    const { data: company } = await supabase
      .from('companies')
      .select('client_type, verification_status, documents')
      .eq('id', user.id)
      .single()
    
    if (company) {
      clientType = company.client_type

      // Check if the client has signed ALL required documents
      const templates = await getClientTemplates()
      const signedDocs: Record<string, any> = company.documents || {}
      const allSigned = templates.length > 0 && templates.every((t: any) => !!signedDocs[t.name])
      documentsVerified = allSigned
    }
  }

  const { data: interpreter, error } = await supabase
    .from('interpreters')
    .select(`
      *,
      profiles (
        full_name,
        avatar_url
      )
    `)
    .eq('id', id)
    .single()

  if (error || !interpreter) {
    notFound()
  }

  const reviews = await getInterpreterReviews(id)
  const stats = calculateReviewStats(reviews)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--deep-navy)]">Interpreter Profile</h1>
      <InterpreterProfileView interpreter={interpreter} reviews={reviews} stats={stats} clientType={clientType} documentsVerified={documentsVerified} />
    </div>
  )
}
