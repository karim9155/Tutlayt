import { createClient } from "@/lib/supabase/server"
import { getInterpreters } from "@/lib/queries"
import { SearchFilters } from "@/components/search-filters"
import { InterpreterList } from "@/components/interpreter-list"

export default async function DashboardSearchPage({ searchParams }: { searchParams: Promise<{ city?: string, language?: string, specialization?: string }> }) {
  const filters = await searchParams
  const supabase = await createClient()

  // Check client verification status
  const { data: { user } } = await supabase.auth.getUser()
  let isClientVerified = false

  if (user) {
    // Check role first
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Admins and Interpreters are not subject to client verification restrictions
    if (profile?.role === 'admin' || profile?.role === 'interpreter') {
      isClientVerified = true
    } else {
      // It is a client (or unknown), check verification status
      const { data: company } = await supabase
        .from('companies')
        .select('verification_status')
        .eq('id', user.id)
        .single()
      
      if (company) {
         isClientVerified = company.verification_status === 'verified'
      }
    }
  }

  const { data: interpreters, error } = await getInterpreters(supabase, filters)

  if (error) {
    console.error("Error fetching interpreters:", error)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--deep-navy)]">Find Interpreters</h1>
      
      {!isClientVerified && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                You must have a verified client account to see interpreter names and book services. 
                <a href="/dashboard/client" className="font-medium underline hover:text-amber-600 ml-1">
                  Complete your verification
                </a>.
              </p>
            </div>
          </div>
        </div>
      )}
      
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

          <InterpreterList interpreters={interpreters} basePath="/dashboard/interpreters" isClientVerified={isClientVerified} />
        </div>
      </div>
    </div>
  )
}

