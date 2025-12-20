"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAvailability, setSlotAvailability } from "@/app/dashboard/interpreter/availability/actions"
import { toast } from "sonner"
import { format, addDays, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns"

interface AvailabilitySchedulerProps {
  // No props needed as we fetch data
  initialAvailability?: string[] // Kept for compatibility but unused
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8) // 8:00 to 21:00

export function AvailabilityScheduler({ initialAvailability }: AvailabilitySchedulerProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [availableSlots, setAvailableSlots] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [mode, setMode] = useState<"add" | "remove">("add")
  
  // Fetch availability for the current week
  const fetchAvailability = useCallback(async () => {
    setIsLoading(true)
    const startStr = format(currentWeekStart, 'yyyy-MM-dd')
    const endStr = format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    
    const result = await getAvailability(startStr, endStr)
    if (result.data) {
      const newSlots = new Set<string>()
      result.data.forEach((record: any) => {
        // record.start_time is "09:00:00"
        const hour = parseInt(record.start_time.split(':')[0], 10)
        newSlots.add(`${record.date}:${hour}`)
      })
      setAvailableSlots(newSlots)
    }
    setIsLoading(false)
  }, [currentWeekStart])

  useEffect(() => {
    fetchAvailability()
  }, [fetchAvailability])

  const handlePrevWeek = () => setCurrentWeekStart(prev => subWeeks(prev, 1))
  const handleNextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1))

  const toggleSlot = async (date: Date, hour: number) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const key = `${dateStr}:${hour}`
    const isCurrentlyAvailable = availableSlots.has(key)
    
    let shouldBeAvailable = false
    if (mode === "add") shouldBeAvailable = true
    if (mode === "remove") shouldBeAvailable = false

    // Optimistic update
    const newSlots = new Set(availableSlots)
    if (shouldBeAvailable) {
      newSlots.add(key)
    } else {
      newSlots.delete(key)
    }
    setAvailableSlots(newSlots)

    // Server update
    if (isCurrentlyAvailable !== shouldBeAvailable) {
       const result = await setSlotAvailability(dateStr, hour, shouldBeAvailable)
       if (result?.error) {
         toast.error("Failed to update availability")
         fetchAvailability() // Revert on error
       }
    }
  }

  const handleMouseEnter = (date: Date, hour: number) => {
    if (isMouseDown) {
      toggleSlot(date, hour)
    }
  }

  const handleMouseDown = (date: Date, hour: number) => {
    setIsMouseDown(true)
    toggleSlot(date, hour)
  }

  const handleMouseUp = () => {
    setIsMouseDown(false)
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))

  return (
    <div className="space-y-4 select-none" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-lg font-semibold text-[var(--deep-navy)] w-48 text-center">
            {format(currentWeekStart, "MMM d")} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), "MMM d, yyyy")}
          </div>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setMode("add")}>
            <div className={`w-4 h-4 rounded-full border ${mode === "add" ? "bg-[var(--teal)] border-[var(--teal)]" : "bg-white border-gray-300"}`}>
              {mode === "add" && <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />}
            </div>
            <span className={cn("text-sm font-medium", mode === "add" ? "text-[var(--teal)]" : "text-gray-600")}>Add Time (Green)</span>
          </div>
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setMode("remove")}>
            <div className={`w-4 h-4 rounded-full border ${mode === "remove" ? "bg-red-500 border-red-500" : "bg-white border-gray-300"}`}>
              {mode === "remove" && <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />}
            </div>
            <span className={cn("text-sm font-medium", mode === "remove" ? "text-red-500" : "text-gray-600")}>Remove Time (Red)</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="grid grid-cols-8 border-b bg-gray-50">
          <div className="p-2 border-r"></div>
          {weekDays.map((date) => (
            <div key={date.toString()} className="p-2 text-center border-r last:border-r-0">
              <span className="block text-xs text-gray-500 uppercase font-bold">{format(date, "EEE")}</span>
              <span className="block text-xs text-[var(--medium-blue)] font-medium">{format(date, "dd MMM")}</span>
            </div>
          ))}
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b last:border-b-0 h-8">
              <div className="border-r text-[10px] text-gray-400 text-right pr-2 pt-1 relative bg-gray-50/50">
                {hour}:00
              </div>
              
              {weekDays.map((date) => {
                const dateStr = format(date, 'yyyy-MM-dd')
                const isAvailable = availableSlots.has(`${dateStr}:${hour}`)
                
                return (
                  <div
                    key={`${dateStr}:${hour}`}
                    onMouseDown={() => handleMouseDown(date, hour)}
                    onMouseEnter={() => handleMouseEnter(date, hour)}
                    className={cn(
                      "border-r last:border-r-0 cursor-pointer transition-colors duration-150",
                      isAvailable 
                        ? "bg-[#4FA2A7] hover:bg-[#4FA2A7]/90" 
                        : "bg-red-50 hover:bg-red-100"
                    )}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-xs text-gray-400 text-right">
        Changes are saved automatically
      </div>
    </div>
  )
}
