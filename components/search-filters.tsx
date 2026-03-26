"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useState } from "react"
import { FIELDS_OF_WORK } from "@/lib/fields-of-work"
import { SERVICES } from "@/lib/services"

export function SearchFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [city, setCity] = useState(searchParams.get("city") || "")
  const [language, setLanguage] = useState(searchParams.get("language") || "")
  const [specialization, setSpecialization] = useState(searchParams.get("specialization") || "")
  const [name, setName] = useState(searchParams.get("name") || "")
  const [minRate, setMinRate] = useState(searchParams.get("min_rate") || "")
  const [maxRate, setMaxRate] = useState(searchParams.get("max_rate") || "")
  const [service, setService] = useState(searchParams.get("service") || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    
    if (city) params.set("city", city)
    else params.delete("city")
    
    if (language) params.set("language", language)
    else params.delete("language")
    
    if (specialization) params.set("specialization", specialization)
    else params.delete("specialization")

    if (name) params.set("name", name)
    else params.delete("name")

    if (minRate) params.set("min_rate", minRate)
    else params.delete("min_rate")

    if (maxRate) params.set("max_rate", maxRate)
    else params.delete("max_rate")

    if (service) params.set("service", service)
    else params.delete("service")

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleClear = () => {
    setCity("")
    setLanguage("")
    setSpecialization("")
    setName("")
    setMinRate("")
    setMaxRate("")
    setService("")
    router.push(pathname)
  }

  const hasFilters = city || language || specialization || name || minRate || maxRate || service

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="font-semibold mb-4 text-[var(--deep-navy)]">Filters</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[var(--deep-navy)]">Name</Label>
          <Input
            id="name"
            placeholder="Search by name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-[var(--deep-navy)]">City</Label>
          <Input 
            id="city" 
            placeholder="Tunis, Sousse..." 
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="language" className="text-[var(--deep-navy)]">Language</Label>
          <Input 
            id="language" 
            placeholder="English, French..." 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[var(--deep-navy)]">Field of Work</Label>
          <Select value={specialization || "__all__"} onValueChange={(v) => setSpecialization(v === "__all__" ? "" : v)}>
            <SelectTrigger className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]">
              <SelectValue placeholder="All fields" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All fields</SelectItem>
              {FIELDS_OF_WORK.map((field) => (
                <SelectItem key={field} value={field}>{field}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[var(--deep-navy)]">Service</Label>
          <Select value={service || "__all__"} onValueChange={(v) => setService(v === "__all__" ? "" : v)}>
            <SelectTrigger className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]">
              <SelectValue placeholder="All services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All services</SelectItem>
              {SERVICES.map((svc) => (
                <SelectItem key={svc.value} value={svc.value}>{svc.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[var(--deep-navy)]">Daily Rate (TND)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minRate}
              onChange={(e) => setMinRate(e.target.value)}
              min={0}
              className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]"
            />
            <Input
              type="number"
              placeholder="Max"
              value={maxRate}
              onChange={(e) => setMaxRate(e.target.value)}
              min={0}
              className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]"
            />
          </div>
        </div>

        <Button type="submit" className="w-full bg-[var(--deep-navy)] hover:bg-[var(--deep-navy)]/90 text-white">Apply Filters</Button>
        
        {hasFilters && (
          <Button type="button" variant="outline" className="w-full mt-2 border-[var(--deep-navy)] text-[var(--deep-navy)] hover:bg-[var(--azureish-white)]" onClick={handleClear}>
            Clear Filters
          </Button>
        )}
      </form>
    </div>
  )
}
