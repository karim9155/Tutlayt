"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateCompanyProfile } from "@/app/dashboard/client/profile/actions"
import { toast } from "sonner"
import { Loader2, Building2, CreditCard } from "lucide-react"

interface ClientProfileFormProps {
  profile: any
  company: any
}

export function ClientProfileForm({ profile, company }: ClientProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("organization")

  const tabs = ["organization", "billing"]
  const currentIndex = tabs.indexOf(activeTab)

  const handleNext = () => {
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1])
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1])
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    
    try {
      const result = await updateCompanyProfile(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Profile updated successfully")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="mb-8">
          <TabsList className="flex w-full bg-[var(--azureish-white)] p-1 h-auto">
            <TabsTrigger 
              value="organization" 
              className="flex-1 data-[state=active]:bg-[var(--deep-navy)] data-[state=active]:text-white py-3 rounded-md transition-all"
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>1. Organization</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="billing" 
              className="flex-1 data-[state=active]:bg-[var(--deep-navy)] data-[state=active]:text-white py-3 rounded-md transition-all"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>2. Billing & Contact</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            {/* Organization Tab */}
            <div className={activeTab === "organization" ? "block space-y-6" : "hidden"}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-[var(--deep-navy)]">Client / Organization Name</Label>
                  <Input 
                    id="companyName" 
                    name="companyName" 
                    defaultValue={company?.company_name}
                    required 
                    className="border-gray-200 focus:border-[var(--deep-navy)] focus:ring-[var(--deep-navy)] rounded-lg bg-[var(--azureish-white)]/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-[var(--deep-navy)]">Industry</Label>
                  <Input 
                    id="industry" 
                    name="industry" 
                    placeholder="Technology, Healthcare, etc."
                    defaultValue={company?.industry}
                    className="border-gray-200 focus:border-[var(--deep-navy)] focus:ring-[var(--deep-navy)] rounded-lg bg-[var(--azureish-white)]/50"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <Label className="text-[var(--deep-navy)] font-semibold">Organization Location</Label>
                    <RadioGroup name="clientType" defaultValue={company?.client_type || 'local'} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <RadioGroupItem value="local" id="local" className="peer sr-only" />
                            <Label
                              htmlFor="local"
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-[var(--teal)] peer-data-[state=checked]:text-[var(--teal)] cursor-pointer"
                            >
                              <span className="text-lg font-semibold">🇹🇳 Tunisian Company</span>
                              <span className="text-sm text-center text-gray-500 mt-1">Registered in Tunisia. Pays in TND + 19% TVA.</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="international" id="international" className="peer sr-only" />
                            <Label
                              htmlFor="international"
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-[var(--teal)] peer-data-[state=checked]:text-[var(--teal)] cursor-pointer"
                            >
                              <span className="text-lg font-semibold">🌍 International Company</span>
                              <span className="text-sm text-center text-gray-500 mt-1">Registered abroad. Pays in USD/EUR. No TVA.</span>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-[var(--deep-navy)]">Website</Label>
                  <Input 
                    id="website" 
                    name="website" 
                    type="url"
                    placeholder="https://example.com"
                    defaultValue={company?.website}
                    className="border-gray-200 focus:border-[var(--deep-navy)] focus:ring-[var(--deep-navy)] rounded-lg bg-[var(--azureish-white)]/50"
                  />
                </div>
              </div>
            </div>

            {/* Billing Tab */}
            <div className={activeTab === "billing" ? "block space-y-6" : "hidden"}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fiscalId" className="text-[var(--deep-navy)]">Fiscal ID (Matricule Fiscal)</Label>
                  <Input 
                    id="fiscalId" 
                    name="fiscalId" 
                    placeholder="1234567/A/B/000"
                    defaultValue={company?.fiscal_id}
                    required 
                    className="border-gray-200 focus:border-[var(--deep-navy)] focus:ring-[var(--deep-navy)] rounded-lg bg-[var(--azureish-white)]/50"
                  />
                  <p className="text-xs text-gray-500">Required for invoicing and tax purposes.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[var(--deep-navy)]">Contact Email</Label>
                  <Input 
                    id="email" 
                    value={profile?.email} 
                    disabled
                    className="bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed rounded-lg"
                  />
                  <p className="text-xs text-gray-500">Contact support to change your email address.</p>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 mt-6 border-t border-gray-100">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Previous
              </Button>

              {currentIndex === tabs.length - 1 ? (
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-[var(--deep-navy)] hover:bg-[var(--deep-navy)]/90 text-white min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleNext}
                  className="bg-[var(--deep-navy)] hover:bg-[var(--deep-navy)]/90 text-white"
                >
                  Next Step
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </form>
  )
}
