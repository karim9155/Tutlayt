"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useState } from "react"

export function SearchFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [city, setCity] = useState(searchParams.get("city") || "")
  const [language, setLanguage] = useState(searchParams.get("language") || "")
  const [specialization, setSpecialization] = useState(searchParams.get("specialization") || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    
    if (city) params.set("city", city)
    else params.delete("city")
    
    if (language) params.set("language", language)
    else params.delete("language")
    
    if (specialization) params.set("specialization", specialization)
    else params.delete("specialization")

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleClear = () => {
    setCity("")
    setLanguage("")
    setSpecialization("")
    router.push(pathname)
  }

  const hasFilters = city || language || specialization

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="font-semibold mb-4 text-[var(--deep-navy)]">Filters</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <Label htmlFor="specialization" className="text-[var(--deep-navy)]">Specialization</Label>
          <Input 
            id="specialization" 
            placeholder="Legal, Medical..." 
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]"
          />
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
