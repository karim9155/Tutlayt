import { createClient } from "@/lib/supabase/server"
import { getInterpreters } from "@/lib/queries"
import { SearchFilters } from "@/components/search-filters"
import { InterpreterList } from "@/components/interpreter-list"

export default async function DashboardSearchPage({ searchParams }: { searchParams: Promise<{ city?: string, language?: string, specialization?: string }> }) {
  const filters = await searchParams
  const supabase = await createClient()

  const { data: interpreters, error } = await getInterpreters(supabase, filters)

  if (error) {
    console.error("Error fetching interpreters:", error)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--deep-navy)]">Find Interpreters</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 space-y-6">
          <SearchFilters />
        </aside>

        {/* Results Grid */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-4 text-[var(--deep-navy)]">
            Available Interpreters ({interpreters?.length || 0})
          </h2>

          <InterpreterList interpreters={interpreters} basePath="/dashboard/interpreters" />
        </div>
      </div>
    </div>
  )
}
