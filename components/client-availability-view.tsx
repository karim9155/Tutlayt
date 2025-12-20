"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getPublicAvailability } from "@/app/dashboard/interpreter/availability/actions"
import { format, addDays, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay } from "date-fns"

interface ClientAvailabilityViewProps {
  interpreterId: string
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8) // 8:00 to 21:00

export function ClientAvailabilityView({ interpreterId }: ClientAvailabilityViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [availableSlots, setAvailableSlots] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  
  // Fetch availability for the current week
  const fetchAvailability = useCallback(async () => {
    setIsLoading(true)
    const startStr = format(currentWeekStart, 'yyyy-MM-dd')
    const endStr = format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    
    const result = await getPublicAvailability(interpreterId, startStr, endStr)
    if (result.data) {
      const newSlots = new Set<string>()
      result.data.forEach((record: any) => {
        // record.start_time is "09:00:00"
        const hour = parseInt(record.start_time.split(':')[0], 10)
        // Only show if not booked (or show as booked if we want)
        // For now, let's just show available slots
        if (!record.is_booked) {
            newSlots.add(`${record.date}:${hour}`)
        }
      })
      setAvailableSlots(newSlots)
    }
    setIsLoading(false)
  }, [currentWeekStart, interpreterId])

  useEffect(() => {
    fetchAvailability()
  }, [fetchAvailability])

  const handlePrevWeek = () => setCurrentWeekStart(prev => subWeeks(prev, 1))
  const handleNextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1))

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevWeek} disabled={isLoading}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-[var(--deep-navy)] min-w-[200px] text-center">
            {format(currentWeekStart, "MMM d")} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), "MMM d, yyyy")}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextWeek} disabled={isLoading}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[var(--teal)] rounded-sm"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
            <span>Unavailable</span>
          </div>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        {/* Header Row */}
        <div className="grid grid-cols-8 border-b bg-gray-50/50">
          <div className="p-3 text-xs font-medium text-gray-500 text-center border-r">Time</div>
          {weekDays.map((day) => (
            <div key={day.toString()} className={cn(
              "p-3 text-center border-r last:border-r-0",
              isSameDay(day, new Date()) && "bg-[var(--azureish-white)]"
            )}>
              <div className="text-xs font-medium text-gray-500">{format(day, "EEE")}</div>
              <div className={cn(
                "text-sm font-bold mt-1 w-7 h-7 flex items-center justify-center rounded-full mx-auto",
                isSameDay(day, new Date()) ? "bg-[var(--teal)] text-white" : "text-[var(--deep-navy)]"
              )}>
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--teal)]" />
            </div>
          )}
          
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b last:border-b-0">
              <div className="p-2 text-xs text-gray-400 text-center border-r flex items-center justify-center bg-gray-50/30">
                {hour}:00
              </div>
              {weekDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const slotKey = `${dateStr}:${hour}`
                const isAvailable = availableSlots.has(slotKey)

                return (
                  <div 
                    key={slotKey} 
                    className={cn(
                      "h-10 border-r last:border-r-0 transition-all duration-200",
                      isAvailable ? "bg-[var(--teal)]/10" : "bg-white"
                    )}
                  >
                    {isAvailable && (
                        <div className="w-full h-full bg-[var(--teal)] rounded-sm opacity-80 hover:opacity-100 transition-opacity cursor-help" title="Available"></div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
