"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, MapPin, FileText, Link as LinkIcon, DollarSign, Globe, Tag, AlertCircle, CheckCircle } from "lucide-react"
import { updateBookingStatus } from "@/app/actions/bookings"
import { toast } from "sonner"
import { format } from "date-fns"
import { ReviewDialog } from "@/components/review-dialog"
import { createClient } from "@/lib/supabase/client"
import { useEffect } from "react"

interface MissionCardProps {
  mission: any
  viewMode?: 'interpreter' | 'client'
}

export function MissionCard({ mission, viewMode = 'interpreter' }: MissionCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)

  useEffect(() => {
    if (mission.status === 'completed') {
      checkReviewStatus()
    }
  }, [mission.status])

  async function checkReviewStatus() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', mission.id)
      .eq('reviewer_id', user.id)
      .single()
    
    if (data) setHasReviewed(true)
  }

  async function handleStatusUpdate(status: 'accepted' | 'declined' | 'completed') {
    setIsLoading(true)
    try {
      const result = await updateBookingStatus(mission.id, status)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(`Mission ${status} successfully`)
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    declined: "bg-red-100 text-red-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-gray-100 text-gray-800",
  }

  return (
    <Card className="border-none shadow-md bg-white overflow-hidden">
      <div className={`h-2 w-full ${mission.status === 'accepted' ? 'bg-green-500' : mission.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
              <AvatarImage src={mission.profiles?.avatar_url} />
              <AvatarFallback>{mission.profiles?.full_name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl text-[var(--deep-navy)]">{mission.title}</CardTitle>
              <p className="text-sm text-[var(--medium-blue)]">
                {viewMode === 'interpreter' ? 'Client' : 'Interpreter'}: {mission.profiles?.full_name}
              </p>
            </div>
          </div>
          <Badge className={`${statusColors[mission.status as keyof typeof statusColors]} border-none`}>
            {mission.status.charAt(0).toUpperCase() + mission.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-[var(--teal)] mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--deep-navy)] block">Platform</span>
                <span className="text-gray-600">{mission.platform}</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[var(--teal)] mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--deep-navy)] block">Date / Time</span>
                <span className="text-gray-600">
                  {format(new Date(mission.start_time), "dd MMM yyyy")} <br />
                  {format(new Date(mission.start_time), "HH:mm")} - {format(new Date(mission.end_time), "HH:mm")} ({mission.timezone})
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-[var(--teal)] mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--deep-navy)] block">Languages</span>
                <span className="text-gray-600">{mission.languages}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-[var(--teal)] mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--deep-navy)] block">Subject Matter</span>
                <span className="text-gray-600">{mission.subject_matter}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-[var(--teal)] mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--deep-navy)] block">Price</span>
                <span className="text-gray-600 font-medium">{mission.price} {mission.currency}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-[var(--teal)] mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--deep-navy)] block">Preparation Materials</span>
                {mission.preparation_materials_url ? (
                  <a href={mission.preparation_materials_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    Download Material
                  </a>
                ) : (
                  <span className="text-gray-400 italic">None provided</span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <LinkIcon className="w-5 h-5 text-[var(--teal)] mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--deep-navy)] block">Meeting Link</span>
                {mission.meeting_link ? (
                  <a href={mission.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[200px] block">
                    {mission.meeting_link}
                  </a>
                ) : (
                  <span className="text-gray-400 italic">Not provided yet</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h4 className="font-semibold text-[var(--deep-navy)] mb-2">Project Description</h4>
          <p className="text-gray-600 leading-relaxed">
            {mission.description || "No description provided."}
          </p>
        </div>
      </CardContent>

      {viewMode === 'interpreter' && mission.status === 'pending' && (
        <CardFooter className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <Button 
            variant="outline" 
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => handleStatusUpdate('declined')}
            disabled={isLoading}
          >
            Decline
          </Button>
          <Button 
            className="bg-[var(--teal)] hover:bg-[var(--teal)]/90 text-white"
            onClick={() => handleStatusUpdate('accepted')}
            disabled={isLoading}
          >
            Accept Assignment
          </Button>
        </CardFooter>
      )}

      {viewMode === 'interpreter' && mission.status === 'accepted' && (
        <CardFooter className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleStatusUpdate('completed')}
            disabled={isLoading}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark as Completed
          </Button>
        </CardFooter>
      )}

      {mission.status === 'completed' && !hasReviewed && (
        <CardFooter className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <ReviewDialog 
            bookingId={mission.id}
            revieweeId={viewMode === 'interpreter' ? mission.client_id : mission.interpreter_id}
            revieweeName={mission.profiles?.full_name}
            onReviewSubmitted={() => setHasReviewed(true)}
          />
        </CardFooter>
      )}

      {mission.status === 'completed' && hasReviewed && (
        <CardFooter className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <div className="text-green-600 flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4" />
            Review Submitted
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
