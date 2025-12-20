"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitClientRequest } from "@/app/actions/client-requests"
import { CheckCircle2 } from "lucide-react"

export function ClientSignupForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    
    const result = await submitClientRequest(formData)
    
    setIsLoading(false)
    
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setIsSubmitted(true)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-[var(--deep-navy)]">Request Submitted!</h3>
        <p className="text-[var(--medium-blue)] max-w-xs mx-auto">
          Thank you for your interest. We will review your application and get back to you via email as soon as possible.
        </p>
      </div>
    )
  }

  return (
    <form action={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-[var(--deep-navy)]">Client / Organization Name</Label>
          <Input 
            id="companyName" 
            name="companyName" 
            placeholder="Acme Inc." 
            required 
            className="bg-white border-gray-200 focus:border-[var(--deep-navy)] focus:ring-[var(--deep-navy)]" 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email-company" className="text-[var(--deep-navy)]">Email</Label>
          <Input 
            id="email-company" 
            name="email" 
            type="email" 
            placeholder="contact@company.com" 
            required 
            className="bg-white border-gray-200 focus:border-[var(--deep-navy)] focus:ring-[var(--deep-navy)]" 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-[var(--deep-navy)]">Website (Optional)</Label>
          <Input 
            id="website" 
            name="website" 
            type="url" 
            placeholder="https://company.com" 
            className="bg-white border-gray-200 focus:border-[var(--deep-navy)] focus:ring-[var(--deep-navy)]" 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="text-[var(--deep-navy)]">Tell us about your needs</Label>
          <Textarea 
            id="message" 
            name="message" 
            placeholder="We are looking for interpreters for..." 
            required 
            className="bg-white border-gray-200 focus:border-[var(--deep-navy)] focus:ring-[var(--deep-navy)] min-h-[100px]" 
          />
        </div>

        {error && (
          <div className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <Button 
          className="w-full mt-4 bg-[var(--deep-navy)] hover:bg-[var(--dark-blue)] text-white font-bold" 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </form>
  )
}
