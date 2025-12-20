"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createReview } from "@/app/actions/reviews"
import { toast } from "sonner"
import { Star, Loader2 } from "lucide-react"

interface ReviewDialogProps {
  bookingId: string
  revieweeId: string
  revieweeName: string
  onReviewSubmitted?: () => void
}

export function ReviewDialog({ bookingId, revieweeId, revieweeName, onReviewSubmitted }: ReviewDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    setIsLoading(true)
    const formData = new FormData(event.currentTarget)
    formData.append("bookingId", bookingId)
    formData.append("revieweeId", revieweeId)
    formData.append("rating", rating.toString())

    try {
      const result = await createReview(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Review submitted successfully")
        setOpen(false)
        if (onReviewSubmitted) onReviewSubmitted()
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-[var(--teal)] text-[var(--teal)] hover:bg-[var(--teal)] hover:text-white">
          Leave a Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Review {revieweeName}</DialogTitle>
          <DialogDescription>
            How was your experience working with {revieweeName}?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              name="comment"
              placeholder="Share your feedback..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="w-full bg-[var(--deep-navy)] text-white">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
