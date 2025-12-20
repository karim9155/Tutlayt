import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { InterpreterProfileView } from "@/components/interpreter-profile-view"
import { getInterpreterReviews, calculateReviewStats } from "@/lib/reviews"

export default async function InterpreterProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login?message=Please log in to view interpreter profiles")
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

  // Fetch reviews
  const reviews = await getInterpreterReviews(id)
  const stats = calculateReviewStats(reviews)

  return (
    <div className="min-h-screen bg-[var(--azureish-white)]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <InterpreterProfileView 
          interpreter={interpreter} 
          reviews={reviews}
          stats={stats}
        />
      </main>
    </div>
  )
}

