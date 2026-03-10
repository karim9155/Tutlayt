import { SupabaseClient } from "@supabase/supabase-js"

export async function getInterpreters(supabase: SupabaseClient, filters: { city?: string, language?: string, specialization?: string, name?: string }) {
  let query = supabase
    .from('interpreters')
    .select(`
      *,
      profiles (
        *,
        reviews:reviews!reviews_reviewee_id_fkey (
          rating
        )
      )
    `)

  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`)
  }

  if (filters.language) {
    query = query.or(`languages_a.cs.{${filters.language}},languages_b.cs.{${filters.language}},languages_c.cs.{${filters.language}}`)
  }

  if (filters.specialization) {
    query = query.contains('specializations', [filters.specialization])
  }

  // Only show verified interpreters who have completed their documentation
  query = query.eq('verified', true)

  const result = await query

  // Filter by name client-side (profiles.full_name is in a joined table)
  if (filters.name && result.data) {
    const search = filters.name.toLowerCase()
    result.data = result.data.filter((i: any) => {
      const name = (i.profiles?.full_name || i.profiles?.company_name || '').toLowerCase()
      return name.includes(search)
    })
  }

  return result
}
