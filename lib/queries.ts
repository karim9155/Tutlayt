import { SupabaseClient } from "@supabase/supabase-js"

export async function getInterpreters(supabase: SupabaseClient, filters: { city?: string, language?: string, specialization?: string }) {
  let query = supabase
    .from('interpreters')
    .select(`
      *,
      profiles (
        full_name,
        avatar_url,
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

  return await query
}
