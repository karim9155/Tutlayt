import { createClient } from "@/lib/supabase/server"

export async function getInterpreterReviews(interpreterId: string) {
  const supabase = await createClient()
  
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:reviewer_id (
        full_name,
        avatar_url
      )
    `)
    .eq("reviewee_id", interpreterId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reviews:", error)
    return []
  }

  return reviews
}

export function calculateReviewStats(reviews: any[]) {
  if (!reviews || reviews.length === 0) {
    return { averageRating: 0, totalReviews: 0 }
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = (totalRating / reviews.length).toFixed(1)
  
  return {
    averageRating: parseFloat(averageRating),
    totalReviews: reviews.length
  }
}
