import { SupabaseClient } from "@supabase/supabase-js"

export async function getInterpreters(supabase: SupabaseClient, filters: { city?: string, language?: string, specialization?: string }) {
  let query = supabase
    .from('interpreters')
    .select(`
      *,
      profiles (
        full_name,
        avatar_url
      )
    `)

  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`)
  }

  if (filters.language) {
    query = query.contains('languages', [filters.language])
  }

  if (filters.specialization) {
    query = query.contains('specializations', [filters.specialization])
  }
  
  return await query
}
