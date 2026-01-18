import { Navbar } from "@/components/navbar"
import { createClient } from "@/lib/supabase/server"
import { getInterpreters } from "@/lib/queries"
import { SearchFilters } from "@/components/search-filters"
import { InterpreterList } from "@/components/interpreter-list"
import { redirect } from "next/navigation"

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ city?: string, language?: string, specialization?: string }> }) {
  const filters = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const userRole = profile?.role || 'company'

  const { data: interpreters, error } = await getInterpreters(supabase, filters)

  if (error) {
    console.error("Error fetching interpreters:", error)
  }

  return (
    <div className="min-h-screen bg-[var(--azureish-white)]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-64 space-y-6">
            <SearchFilters />
          </aside>

          {/* Results Grid */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-6 text-[var(--deep-navy)]">
              Available Interpreters ({interpreters?.length || 0})
            </h1>

            <InterpreterList interpreters={interpreters} userRole={userRole} />
          </div>
        </div>
      </main>
    </div>
  )
}

