"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Availability {
  id: string
  date: string
  start_time: string
  end_time: string
  is_booked: boolean
}

export function AvailabilityCalendar({ interpreterId, readOnly = false }: { interpreterId: string, readOnly?: boolean }) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [loading, setLoading] = useState(false)
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")

  const supabase = createClient()

  useEffect(() => {
    if (date) {
      fetchAvailability(date)
    }
  }, [date])

  const fetchAvailability = async (selectedDate: Date) => {
    setLoading(true)
    const formattedDate = format(selectedDate, "yyyy-MM-dd")
    
    const { data, error } = await supabase
      .from("availability")
      .select("*")
      .eq("interpreter_id", interpreterId)
      .eq("date", formattedDate)
      .order("start_time")

    if (error) {
      console.error("Error fetching availability:", error)
    } else {
      setAvailabilities(data || [])
    }
    setLoading(false)
  }

  const addAvailability = async () => {
    if (!date || readOnly) return

    const formattedDate = format(date, "yyyy-MM-dd")
    
    const { error } = await supabase
      .from("availability")
      .insert({
        interpreter_id: interpreterId,
        date: formattedDate,
        start_time: startTime,
        end_time: endTime,
      })

    if (error) {
      console.error("Error adding availability:", error)
      toast({
        title: "Error",
        description: "Could not add availability slot.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Availability slot added.",
      })
      fetchAvailability(date)
    }
  }

  const removeAvailability = async (id: string) => {
    if (readOnly) return
    const { error } = await supabase
      .from("availability")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error removing availability:", error)
      toast({
        title: "Error",
        description: "Could not remove availability slot.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Availability slot removed.",
      })
      if (date) fetchAvailability(date)
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex-1">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border shadow-sm bg-white"
        />
      </div>

      <div className="flex-1 space-y-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="font-semibold text-lg mb-4 text-[var(--deep-navy)]">
            {date ? format(date, "MMMM d, yyyy") : "Select a date"}
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--teal)]" />
            </div>
          ) : (
            <div className="space-y-3">
              {availabilities.length > 0 ? (
                availabilities.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-3 bg-[var(--azureish-white)] rounded-md border border-blue-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="font-medium text-[var(--deep-navy)]">
                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      </span>
                    </div>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeAvailability(slot.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4 italic">No availability set for this date.</p>
              )}
            </div>
          )}
        </div>

        {!readOnly && date && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }).map((_, i) => (
                        <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                          {`${i.toString().padStart(2, '0')}:00`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time</label>
                  <Select value={endTime} onValueChange={setEndTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }).map((_, i) => (
                        <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                          {`${i.toString().padStart(2, '0')}:00`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={addAvailability} className="w-full bg-[var(--teal)] hover:bg-[var(--light-teal)] text-white">
                Add Slot
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
