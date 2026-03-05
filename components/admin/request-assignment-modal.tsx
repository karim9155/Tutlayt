"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { assignInterpreterToRequest, reassignInterpreterToRequest, addAdminNoteToRequest, getInterpreterAvailability } from "@/app/admin/actions"
import { toast } from "sonner"
import {
  Loader2, Search, User, DollarSign, AlertTriangle, CheckCircle2,
  Calendar, Globe, Filter, ChevronDown, ChevronUp, ShieldCheck, X, Clock, Languages
} from "lucide-react"
import { format } from "date-fns"

const SERVICE_OPTIONS = [
  { value: "interpretation", label: "Interpretation" },
  { value: "translation", label: "Translation" },
  { value: "sworn_translation", label: "Sworn Translation" },
  { value: "proofreading", label: "Proofreading" },
  { value: "editing", label: "Editing" },
] as const

interface RequestAssignmentModalProps {
  request: any
  interpreters: any[]
}

export function RequestAssignmentModal({ request, interpreters }: RequestAssignmentModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedInterpreter, setSelectedInterpreter] = useState<any>(null)
  const [adminNotes, setAdminNotes] = useState(request.admin_notes || "")
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [swornOnly, setSwornOnly] = useState(false)
  const [maxHourlyRate, setMaxHourlyRate] = useState("")
  const [maxDailyRate, setMaxDailyRate] = useState("")
  const [maxRatePerWord, setMaxRatePerWord] = useState("")
  const [languageFilter, setLanguageFilter] = useState("")
  const [availableOnly, setAvailableOnly] = useState(false)
  const [sortBy, setSortBy] = useState<string>("name")

  // Availability data
  const [availabilityMap, setAvailabilityMap] = useState<Map<string, { start_time: string; end_time: string }[]>>(new Map())
  const [availabilityLoading, setAvailabilityLoading] = useState(false)

  // Calculate duration
  const startTime = new Date(request.start_time)
  const endTime = new Date(request.end_time)
  const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
  const requestDate = format(startTime, "yyyy-MM-dd")
  const requestStartHour = startTime.getUTCHours()
  const requestEndHour = endTime.getUTCHours() || 24

  // Fetch availability when modal opens
  const fetchAvailability = useCallback(async () => {
    if (interpreters.length === 0) return
    setAvailabilityLoading(true)
    try {
      const ids = interpreters.map((i: any) => i.id)
      const result = await getInterpreterAvailability(requestDate, ids)
      if (result.data) {
        const map = new Map<string, { start_time: string; end_time: string }[]>()
        result.data.forEach((slot: any) => {
          const existing = map.get(slot.interpreter_id) || []
          existing.push({ start_time: slot.start_time, end_time: slot.end_time })
          map.set(slot.interpreter_id, existing)
        })
        setAvailabilityMap(map)
      }
    } catch (e) {
      console.error("Failed to fetch availability", e)
    } finally {
      setAvailabilityLoading(false)
    }
  }, [interpreters, requestDate])

  useEffect(() => {
    if (open) {
      fetchAvailability()
    }
  }, [open, fetchAvailability])

  // Check if interpreter covers the request time range
  function isAvailableForRequest(interpreterId: string): boolean {
    const slots = availabilityMap.get(interpreterId)
    if (!slots || slots.length === 0) return false
    // Check if interpreter has slots covering each hour of the request
    for (let h = requestStartHour; h < requestEndHour; h++) {
      const hourStr = `${h.toString().padStart(2, '0')}:00:00`
      const hasSlot = slots.some(s => s.start_time === hourStr)
      if (!hasSlot) return false
    }
    return true
  }

  // Collect all unique languages across interpreters for reference
  const allUniqueLanguages = useMemo(() => {
    const langs = new Set<string>()
    interpreters.forEach((i: any) => {
      ;[...(i.languages_a || []), ...(i.languages_b || []), ...(i.languages_c || [])].forEach((l: string) => {
        if (l) langs.add(l)
      })
    })
    return [...langs].sort()
  }, [interpreters])

  // Calculate price for selected interpreter
  const calculatedPrice = selectedInterpreter
    ? durationHours * (selectedInterpreter.hourly_rate || 0)
    : 0

  const isOverBudget = calculatedPrice > parseFloat(request.budget)

  const hasActiveFilters = selectedServices.length > 0 || swornOnly || maxHourlyRate || maxDailyRate || maxRatePerWord || languageFilter || availableOnly

  function clearFilters() {
    setSelectedServices([])
    setSwornOnly(false)
    setMaxHourlyRate("")
    setMaxDailyRate("")
    setMaxRatePerWord("")
    setLanguageFilter("")
    setAvailableOnly(false)
    setSortBy("name")
  }

  function toggleService(service: string) {
    setSelectedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    )
  }

  // Filter and sort interpreters
  const filteredInterpreters = useMemo(() => {
    let result = interpreters

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((i: any) =>
        i.full_name?.toLowerCase().includes(q) ||
        i.city?.toLowerCase().includes(q) ||
        (Array.isArray(i.languages) && i.languages.some((l: any) =>
          typeof l === 'string' ? l.toLowerCase().includes(q) :
          (l?.language || '').toLowerCase().includes(q)
        )) ||
        (Array.isArray(i.languages_a) && i.languages_a.some((l: string) => l.toLowerCase().includes(q))) ||
        (Array.isArray(i.languages_b) && i.languages_b.some((l: string) => l.toLowerCase().includes(q))) ||
        (Array.isArray(i.languages_c) && i.languages_c.some((l: string) => l.toLowerCase().includes(q))) ||
        (Array.isArray(i.primary_expertise) && i.primary_expertise.some((e: string) => e.toLowerCase().includes(q))) ||
        (Array.isArray(i.secondary_expertise) && i.secondary_expertise.some((e: string) => e.toLowerCase().includes(q)))
      )
    }

    // Language filter
    if (languageFilter.trim()) {
      const q = languageFilter.toLowerCase()
      result = result.filter((i: any) => {
        const allLangs = [
          ...(i.languages_a || []),
          ...(i.languages_b || []),
          ...(i.languages_c || []),
        ]
        return allLangs.some((l: string) => l.toLowerCase().includes(q))
      })
    }

    // Availability filter
    if (availableOnly) {
      result = result.filter((i: any) => isAvailableForRequest(i.id))
    }

    // Service filter
    if (selectedServices.length > 0) {
      result = result.filter((i: any) => {
        const interpreterServices: string[] = Array.isArray(i.services) ? i.services : []
        return selectedServices.every(s => {
          if (s === "sworn_translation") {
            return interpreterServices.includes(s) || i.sworn_verified || i.is_sworn
          }
          return interpreterServices.includes(s)
        })
      })
    }

    // Sworn only
    if (swornOnly) {
      result = result.filter((i: any) => i.sworn_verified || i.is_sworn)
    }

    // Rate filters
    if (maxHourlyRate) {
      const max = parseFloat(maxHourlyRate)
      result = result.filter((i: any) => !i.hourly_rate || i.hourly_rate <= max)
    }
    if (maxDailyRate) {
      const max = parseFloat(maxDailyRate)
      result = result.filter((i: any) => !i.daily_rate || i.daily_rate <= max)
    }
    if (maxRatePerWord) {
      const max = parseFloat(maxRatePerWord)
      result = result.filter((i: any) => !i.rate_per_word || i.rate_per_word <= max)
    }
    // Sort
    result = [...result].sort((a: any, b: any) => {
      switch (sortBy) {
        case "rate_low":
          return (a.hourly_rate || 999999) - (b.hourly_rate || 999999)
        case "rate_high":
          return (b.hourly_rate || 0) - (a.hourly_rate || 0)
        case "daily_low":
          return (a.daily_rate || 999999) - (b.daily_rate || 999999)
        case "daily_high":
          return (b.daily_rate || 0) - (a.daily_rate || 0)
        case "experience":
          return (b.years_experience || 0) - (a.years_experience || 0)
        case "availability":
          // Available first
          const aAvail = isAvailableForRequest(a.id) ? 0 : 1
          const bAvail = isAvailableForRequest(b.id) ? 0 : 1
          return aAvail - bAvail || (a.full_name || '').localeCompare(b.full_name || '')
        default:
          return (a.full_name || '').localeCompare(b.full_name || '')
      }
    })

    return result
  }, [interpreters, searchQuery, selectedServices, swornOnly, maxHourlyRate, maxDailyRate, maxRatePerWord, languageFilter, availableOnly, sortBy, availabilityMap])

  // Check if the suggested interpreter exists
  const suggestedInterpreter = request.suggested_interpreter
    ? interpreters.find((i: any) => i.id === (request.suggested_interpreter as any)?.id)
    : null

  async function handleAssign() {
    if (!selectedInterpreter) {
      toast.error("Please select an interpreter")
      return
    }

    setIsLoading(true)
    try {
      if (adminNotes !== request.admin_notes) {
        await addAdminNoteToRequest(request.id, adminNotes)
      }

      const isReassign = request.status === 'declined' && request.assigned_interpreter_id
      const result = isReassign
        ? await reassignInterpreterToRequest(request.id, selectedInterpreter.id)
        : await assignInterpreterToRequest(request.id, selectedInterpreter.id)

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(`Interpreter ${selectedInterpreter.full_name} assigned successfully`)
        setOpen(false)
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
        <Button size="sm" className="bg-[var(--teal)] hover:bg-[var(--teal)]/90 text-white">
          {request.status === 'declined' ? 'Reassign Interpreter' : 'Assign Interpreter'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Interpreter to Request</DialogTitle>
          <DialogDescription>
            Select an interpreter for &quot;{request.title}&quot;
          </DialogDescription>
        </DialogHeader>

        {/* Request Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm border border-gray-100">
          <h4 className="font-semibold text-gray-900">Request Details</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{format(startTime, "dd MMM yyyy")} &middot; {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <span>{request.languages || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Budget: {request.budget} {request.currency}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Duration: {durationHours.toFixed(1)}h</span>
            </div>
          </div>
          {request.description && (
            <p className="text-gray-500 text-xs mt-2">{request.description}</p>
          )}
        </div>

        {/* Suggested Interpreter Shortcut */}
        {suggestedInterpreter && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Client suggested: {(request.suggested_interpreter as any)?.full_name}
                </span>
                {(request.suggested_interpreter as any)?.hourly_rate && (
                  <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                    {(request.suggested_interpreter as any).hourly_rate} TND/hr
                  </Badge>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => setSelectedInterpreter(suggestedInterpreter)}
              >
                Use This Interpreter
              </Button>
            </div>
          </div>
        )}

        {/* Search & Filter Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-semibold">Select Interpreter</Label>
            <span className="text-xs text-gray-500">
              {filteredInterpreters.length} of {interpreters.length} interpreters
              {availabilityLoading && <Loader2 className="w-3 h-3 inline ml-1 animate-spin" />}
            </span>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search name, city, language, expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`gap-1.5 ${hasActiveFilters ? 'border-[var(--teal)] text-[var(--teal)]' : ''}`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge className="bg-[var(--teal)] text-white ml-1 px-1.5 py-0 text-xs h-5">
                  {[selectedServices.length > 0, swornOnly, maxHourlyRate, maxDailyRate, maxRatePerWord, languageFilter, availableOnly].filter(Boolean).length}
                </Badge>
              )}
              {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">Filter Interpreters</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-gray-500 h-7 gap-1">
                    <X className="w-3 h-3" /> Clear all
                  </Button>
                )}
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="availability-filter"
                  checked={availableOnly}
                  onCheckedChange={(v) => setAvailableOnly(!!v)}
                />
                <Label htmlFor="availability-filter" className="text-sm text-gray-700 flex items-center gap-1.5 cursor-pointer">
                  <Clock className="w-4 h-4 text-green-600" />
                  Available on {format(startTime, "dd MMM yyyy")} ({format(startTime, "HH:mm")} - {format(endTime, "HH:mm")})
                </Label>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Language</Label>
                <div className="relative">
                  <Languages className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    placeholder="e.g. Arabic, French, English..."
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className="pl-9 h-8 text-sm"
                    list="language-suggestions"
                  />
                  <datalist id="language-suggestions">
                    {allUniqueLanguages.map(l => (
                      <option key={l} value={l} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Services */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Services</Label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_OPTIONS.map(service => (
                    <button
                      key={service.value}
                      type="button"
                      onClick={() => toggleService(service.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selectedServices.includes(service.value)
                          ? 'bg-[var(--teal)] text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {service.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sworn Toggle */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="sworn-filter"
                  checked={swornOnly}
                  onCheckedChange={(v) => setSwornOnly(!!v)}
                />
                <Label htmlFor="sworn-filter" className="text-sm text-gray-700 flex items-center gap-1.5 cursor-pointer">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Sworn translators only
                </Label>
              </div>

              {/* Rate Filters */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Maximum Rates</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Hourly (TND/hr)</Label>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxHourlyRate}
                      onChange={(e) => setMaxHourlyRate(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Daily (TND/day)</Label>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxDailyRate}
                      onChange={(e) => setMaxDailyRate(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Per Word (TND)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="Max"
                      value={maxRatePerWord}
                      onChange={(e) => setMaxRatePerWord(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="availability">Availability first</SelectItem>
                    <SelectItem value="rate_low">Hourly Rate (Low to High)</SelectItem>
                    <SelectItem value="rate_high">Hourly Rate (High to Low)</SelectItem>
                    <SelectItem value="daily_low">Daily Rate (Low to High)</SelectItem>
                    <SelectItem value="daily_high">Daily Rate (High to Low)</SelectItem>
                    <SelectItem value="experience">Experience (Most first)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Interpreter List */}
          <div className="border rounded-lg max-h-[250px] overflow-y-auto">
            {filteredInterpreters.length > 0 ? (
              filteredInterpreters.map((interpreter: any) => {
                const isSelected = selectedInterpreter?.id === interpreter.id
                const price = durationHours * (interpreter.hourly_rate || 0)
                const overBudget = price > parseFloat(request.budget)
                const allLanguages = [
                  ...(interpreter.languages_a || []),
                  ...(interpreter.languages_b || []),
                  ...(interpreter.languages_c || []),
                ].filter(Boolean)
                const services: string[] = Array.isArray(interpreter.services) ? interpreter.services : []
                const available = isAvailableForRequest(interpreter.id)

                return (
                  <div
                    key={interpreter.id}
                    onClick={() => setSelectedInterpreter(interpreter)}
                    className={`p-3 cursor-pointer transition-colors border-b last:border-b-0 ${
                      isSelected
                        ? 'bg-[var(--teal)]/10 border-[var(--teal)]/20'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isSelected ? 'bg-[var(--teal)] text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {interpreter.full_name?.[0] || '?'}
                          </div>
                          {/* Availability dot */}
                          <div className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                            availabilityLoading ? 'bg-gray-300 animate-pulse' :
                            available ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 truncate">{interpreter.full_name}</p>
                            {(interpreter.sworn_verified || interpreter.is_sworn) && (
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            )}
                            {available && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 font-medium">Available</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{interpreter.city || 'N/A'}</span>
                            {interpreter.years_experience > 0 && (
                              <>
                                <span className="text-gray-300">&middot;</span>
                                <span>{interpreter.years_experience}yr exp</span>
                              </>
                            )}
                            {allLanguages.length > 0 && (
                              <>
                                <span className="text-gray-300">&middot;</span>
                                <span className="truncate max-w-[120px]">{allLanguages.slice(0, 3).join(', ')}{allLanguages.length > 3 ? ` +${allLanguages.length - 3}` : ''}</span>
                              </>
                            )}
                          </div>
                          {/* Service & equipment badges */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {services.map(s => (
                              <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 capitalize">
                                {s.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <div className="space-y-0.5">
                          {interpreter.hourly_rate && (
                            <p className="text-sm font-medium">{interpreter.hourly_rate} TND/hr</p>
                          )}
                          {interpreter.daily_rate && (
                            <p className="text-xs text-gray-500">{interpreter.daily_rate} TND/day</p>
                          )}
                          {interpreter.rate_per_word && (
                            <p className="text-xs text-gray-500">{interpreter.rate_per_word} TND/word</p>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 ${overBudget ? 'text-red-600 font-medium' : 'text-green-600'}`}>
                          {price.toFixed(2)} TND total
                          {overBudget && ' ⚠'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-6 text-center text-sm text-gray-500">
                <Filter className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                No interpreters match your filters
              </div>
            )}
          </div>
        </div>

        {/* Selected interpreter summary */}
        {selectedInterpreter && (
          <div className={`rounded-lg p-4 border ${isOverBudget ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-start gap-3">
              {isOverBudget ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">
                  {selectedInterpreter.full_name} — {calculatedPrice.toFixed(2)} {request.currency}
                </p>
                <p className="text-xs text-gray-600">
                  {selectedInterpreter.hourly_rate || 0} TND/hr &times; {durationHours.toFixed(1)}h = {calculatedPrice.toFixed(2)} TND
                </p>
                {isOverBudget && (
                  <p className="text-xs text-amber-700 font-medium">
                    ⚠ This exceeds the client&apos;s budget of {request.budget} {request.currency} by {(calculatedPrice - parseFloat(request.budget)).toFixed(2)} {request.currency}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin Notes */}
        <div className="space-y-2">
          <Label htmlFor="admin-notes">Admin Notes (internal)</Label>
          <Textarea
            id="admin-notes"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Internal notes about this assignment..."
            className="h-20"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedInterpreter || isLoading}
            className="bg-[var(--teal)] hover:bg-[var(--teal)]/90 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              `Assign ${selectedInterpreter?.full_name || 'Interpreter'}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
