"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateProfile } from "@/app/dashboard/interpreter/profile/actions"
import { toast } from "sonner"
import { Loader2, CheckCircle2, Plus, Trash2 } from "lucide-react"
import { TagInput } from "@/components/ui/tag-input"

interface InterpreterProfileFormProps {
  profile: any
  interpreter: any
}

export function InterpreterProfileForm({ profile, interpreter }: InterpreterProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  
  // Initialize from history array, or fallback to legacy single fields if history is empty
  const [educationHistory, setEducationHistory] = useState<any[]>(
      (interpreter?.education_history && interpreter.education_history.length > 0) 
      ? interpreter.education_history 
      : (interpreter?.highest_education ? [{
          degree: interpreter.highest_education,
          school: interpreter.school,
          year: interpreter.graduation_date,
          isInterpretation: interpreter.interpretation_degree
      }] : [])
  )

  const addEducation = () => {
      setEducationHistory([...educationHistory, { degree: "", school: "", year: "", isInterpretation: false }])
  }

  const removeEducation = (index: number) => {
      const newHistory = [...educationHistory]
      newHistory.splice(index, 1)
      setEducationHistory(newHistory)
  }

  const updateEducation = (index: number, field: string, value: any) => {
      const newHistory = [...educationHistory]
      newHistory[index] = { ...newHistory[index], [field]: value }
      setEducationHistory(newHistory)
  }

  const tabs = ["basic", "professional", "education", "documents", "contact"]
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
      const result = await updateProfile(formData)
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
              value="basic" 
              className="flex-1 data-[state=active]:bg-[var(--teal)] data-[state=active]:text-white py-3 rounded-md transition-all"
            >
              1. Basic
            </TabsTrigger>
            <TabsTrigger 
              value="professional" 
              className="flex-1 data-[state=active]:bg-[var(--teal)] data-[state=active]:text-white py-3 rounded-md transition-all"
            >
              2. Professional
            </TabsTrigger>
            <TabsTrigger 
              value="education" 
              className="flex-1 data-[state=active]:bg-[var(--teal)] data-[state=active]:text-white py-3 rounded-md transition-all"
            >
              3. Education
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="flex-1 data-[state=active]:bg-[var(--teal)] data-[state=active]:text-white py-3 rounded-md transition-all"
            >
              4. Documents
            </TabsTrigger>
            <TabsTrigger 
              value="contact" 
              className="flex-1 data-[state=active]:bg-[var(--teal)] data-[state=active]:text-white py-3 rounded-md transition-all"
            >
              5. Contact
            </TabsTrigger>
          </TabsList>
        </div>

        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            {/* Basic Info Tab */}
            <div className={activeTab === "basic" ? "block space-y-6" : "hidden"}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-[var(--deep-navy)]">First Name</Label>
                  <Input 
                    id="firstName" 
                    name="firstName" 
                    defaultValue={profile?.first_name || profile?.full_name?.split(' ')[0]} 
                    className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-[var(--deep-navy)]">Last Name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName" 
                    defaultValue={profile?.last_name || profile?.full_name?.split(' ').slice(1).join(' ')} 
                    className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthday" className="text-[var(--deep-navy)]">Birthday</Label>
                  <Input 
                    id="birthday" 
                    name="birthday" 
                    type="date"
                    defaultValue={interpreter?.birthday} 
                    className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherTongues" className="text-[var(--deep-navy)]">Mother Tongue(s)</Label>
                  <TagInput 
                    id="motherTongues" 
                    name="motherTongues" 
                    placeholder="e.g. Arabic, French (Press Enter)"
                    defaultTags={interpreter?.mother_tongues || []} 
                    className="border-gray-200 focus-within:border-[var(--teal)] focus-within:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50"
                  />
                </div>
              </div>
            </div>

            {/* Professional Tab */}
            <div className={activeTab === "professional" ? "block space-y-6" : "hidden"}>
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--deep-navy)] border-b border-gray-100 pb-2">Languages (AIIC Classification)</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="languagesA" className="text-[var(--deep-navy)]">Language A (Native/Active)</Label>
                    <TagInput 
                      id="languagesA" 
                      name="languagesA" 
                      placeholder="e.g. Arabic (Press Enter)"
                      defaultTags={interpreter?.languages_a || []} 
                      className="border-gray-200 focus-within:border-[var(--teal)] focus-within:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="languagesB" className="text-[var(--deep-navy)]">Language B (Active)</Label>
                    <TagInput 
                      id="languagesB" 
                      name="languagesB" 
                      placeholder="e.g. English, French (Press Enter)"
                      defaultTags={interpreter?.languages_b || []} 
                      className="border-gray-200 focus-within:border-[var(--teal)] focus-within:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="languagesC" className="text-[var(--deep-navy)]">Language C (Passive)</Label>
                    <TagInput 
                      id="languagesC" 
                      name="languagesC" 
                      placeholder="e.g. Spanish, German (Press Enter)"
                      defaultTags={interpreter?.languages_c || []} 
                      className="border-gray-200 focus-within:border-[var(--teal)] focus-within:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 py-2">
                  <Checkbox id="signInterpreter" name="signInterpreter" defaultChecked={interpreter?.sign_interpreter} />
                  <Label htmlFor="signInterpreter" className="text-[var(--deep-navy)]">Sign Interpreter</Label>
                </div>

                {/* Sworn Translator Section */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                       <Checkbox id="isSworn" name="isSworn" defaultChecked={interpreter?.is_sworn} />
                       <Label htmlFor="isSworn" className="text-[var(--deep-navy)] font-semibold">I am a Sworn Translator</Label>
                    </div>

                    <div className="pl-6 space-y-4">
                        <div className="text-sm text-slate-500">
                            Check this if you are officially sworn/certified by a court or government body. You will need to upload proof.
                        </div>

                        {interpreter?.sworn_verified && (
                             <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm flex items-center">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Your sworn status is verified.
                             </div>
                        )}

                        {interpreter?.sworn_rejection_reason && !interpreter?.sworn_verified && interpreter?.is_sworn && (
                             <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                                <span className="font-semibold block mb-1">Sworn Status Rejected:</span>
                                {interpreter.sworn_rejection_reason}
                             </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="swornDocument" className="text-[var(--deep-navy)]">Sworn Certificate / Proof</Label>
                            <Input 
                                id="swornDocument" 
                                name="swornDocument" 
                                type="file" 
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="cursor-pointer"
                            />
                            {interpreter?.documents?.sworn_proof && (
                                <div className="text-xs text-blue-600 mt-1">
                                    <a href={interpreter.documents.sworn_proof} target="_blank" rel="noopener noreferrer" className="underline">
                                        View current uploaded proof
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-[var(--deep-navy)]">Professional Summary</Label>
                  <Textarea 
                    id="bio" 
                    name="bio" 
                    rows={4}
                    defaultValue={interpreter?.bio} 
                    className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="interpreterSince" className="text-[var(--deep-navy)]">Interpreter Since (Year)</Label>
                    <Input 
                      id="interpreterSince" 
                      name="interpreterSince" 
                      type="number"
                      min="1950"
                      max={new Date().getFullYear()}
                      defaultValue={interpreter?.interpreter_since} 
                      className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dailyRate" className="text-[var(--deep-navy)]">Daily Rate (TND)</Label>
                    <Input 
                      id="dailyRate" 
                      name="dailyRate" 
                      type="number"
                      defaultValue={interpreter?.daily_rate} 
                      className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyRateInternational" className="text-[var(--deep-navy)]">Daily Rate (International)</Label>
                    <div className="flex gap-2">
                        <Input 
                          id="dailyRateInternational" 
                          name="dailyRateInternational" 
                          type="number"
                          defaultValue={interpreter?.daily_rate_international} 
                          className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50 flex-1"
                        />
                         <Select name="currencyInternational" defaultValue={interpreter?.currency_international || "USD"}>
                            <SelectTrigger className="w-[80px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                            </SelectContent>
                          </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryExpertise" className="text-[var(--deep-navy)]">Primary Subject Matter Expertise</Label>
                  <TagInput 
                    id="primaryExpertise" 
                    name="primaryExpertise" 
                    placeholder="e.g. Legal, Medical, Finance (Press Enter)"
                    defaultTags={interpreter?.primary_expertise || []} 
                    className="border-gray-200 focus-within:border-[var(--teal)] focus-within:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryExpertise" className="text-[var(--deep-navy)]">Secondary Subject Matter Expertise</Label>
                  <TagInput 
                    id="secondaryExpertise" 
                    name="secondaryExpertise" 
                    placeholder="e.g. Engineering, Marketing (Press Enter)"
                    defaultTags={interpreter?.secondary_expertise || []} 
                    className="border-gray-200 focus-within:border-[var(--teal)] focus-within:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipment" className="text-[var(--deep-navy)]">Equipment (e.g. Booth, Headsets)</Label>
                  <TagInput 
                    id="equipment" 
                    name="equipment" 
                    placeholder="e.g. Interpreting Console (Press Enter)"
                    defaultTags={interpreter?.equipment || []} 
                    className="border-gray-200 focus-within:border-[var(--teal)] focus-within:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50"
                  />
                </div>

                <div className="flex items-center space-x-2 py-2">
                  <Checkbox id="aiicMember" name="aiicMember" defaultChecked={interpreter?.aiic_member} />
                  <Label htmlFor="aiicMember" className="text-[var(--deep-navy)]">AIIC Member</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otherAccreditation" className="text-[var(--deep-navy)]">Other Accreditation / Affiliation</Label>
                  <Input 
                    id="otherAccreditation" 
                    name="otherAccreditation" 
                    defaultValue={interpreter?.other_accreditation} 
                    className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50"
                  />
                </div>
              </div>
            </div>

            {/* Education Tab */}
            <div className={activeTab === "education" ? "block space-y-6" : "hidden"}>
              <input type="hidden" name="educationHistory" value={JSON.stringify(educationHistory)} />
              
              <div className="space-y-6">
                 {educationHistory.map((edu, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-slate-50 relative">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeEducation(index)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[var(--deep-navy)]">Degree Level</Label>
                              <Select 
                                value={edu.degree} 
                                onValueChange={(val) => updateEducation(index, 'degree', val)}
                              >
                                <SelectTrigger className="bg-white">
                                  <SelectValue placeholder="Select degree" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                                  <SelectItem value="master">Master's Degree</SelectItem>
                                  <SelectItem value="phd">PhD / Doctorate</SelectItem>
                                  <SelectItem value="diploma">Diploma / Certificate</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-[var(--deep-navy)]">School / University</Label>
                              <Input 
                                value={edu.school || ''} 
                                onChange={(e) => updateEducation(index, 'school', e.target.value)}
                                className="bg-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-[var(--deep-navy)]">Graduation Date</Label>
                              <Input 
                                type="date"
                                value={edu.year || ''} 
                                onChange={(e) => updateEducation(index, 'year', e.target.value)}
                                className="bg-white"
                              />
                            </div>

                            <div className="flex items-center space-x-2 py-2">
                              <Checkbox 
                                id={`interpretation-${index}`} 
                                checked={edu.isInterpretation} 
                                onCheckedChange={(checked) => updateEducation(index, 'isInterpretation', checked === true)}
                              />
                              <Label htmlFor={`interpretation-${index}`} className="text-[var(--deep-navy)]">Interpretation Degree</Label>
                            </div>
                        </div>
                    </div>
                 ))}

                 <Button type="button" onClick={addEducation} variant="outline" className="w-full border-dashed border-2">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Degree
                 </Button>
              </div>
            </div>

            {/* Documents Tab */}
            <div className={activeTab === "documents" ? "block space-y-6" : "hidden"}>
              <div className="space-y-6">
                <div className="space-y-4 border-b border-gray-100 pb-4">
                    <h3 className="font-semibold text-[var(--deep-navy)]">Professional Documents</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="cvDocument" className="text-[var(--deep-navy)]">Curriculum Vitae (CV)</Label>
                            <Input 
                                id="cvDocument" 
                                name="cvDocument" 
                                type="file" 
                                accept=".pdf,.doc,.docx"
                                className="cursor-pointer"
                            />
                            {interpreter?.documents?.cv && (
                                <div className="text-sm text-green-600 flex items-center">
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    <a href={interpreter.documents.cv} target="_blank" rel="noopener noreferrer" className="underline">
                                        View uploaded CV
                                    </a>
                                </div>
                            )}
                        </div>

                         <div className="space-y-2">
                            <Label htmlFor="signatureDocument" className="text-[var(--deep-navy)]">Signature Scan</Label>
                             <div className="text-xs text-slate-500 mb-1">
                                Used for digital signing of invoices and contracts.
                             </div>
                            <Input 
                                id="signatureDocument" 
                                name="signatureDocument" 
                                type="file" 
                                accept=".png,.jpg,.jpeg"
                                className="cursor-pointer"
                            />
                            {interpreter?.documents?.signature && (
                                <div className="text-sm text-green-600 flex items-center">
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    <span>Signature on file</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600">
                    <p>Note: Your CV and specific credentials are not shown publicly to clients until a booking is confirmed.</p>
                </div>
              </div>
            </div>

            {/* Contact Tab */}
            <div className={activeTab === "contact" ? "block space-y-6" : "hidden"}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[var(--deep-navy)]">Email</Label>
                  <Input 
                    id="email" 
                    value={profile?.email} 
                    disabled 
                    className="bg-gray-100 border-gray-200 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-[var(--deep-navy)]">Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    defaultValue={interpreter?.address} 
                    className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-[var(--deep-navy)]">City</Label>
                    <Input 
                      id="city" 
                      name="city" 
                      defaultValue={interpreter?.city} 
                      className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-[var(--deep-navy)]">Country</Label>
                    <Input 
                      id="country" 
                      name="country" 
                      defaultValue={interpreter?.country} 
                      className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-[var(--deep-navy)]">Time Zone</Label>
                    <Input 
                      id="timezone" 
                      name="timezone" 
                      defaultValue={interpreter?.timezone} 
                      className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[var(--deep-navy)]">Phone</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      defaultValue={interpreter?.phone} 
                      className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedinProfile" className="text-[var(--deep-navy)]">LinkedIn Profile</Label>
                  <Input 
                    id="linkedinProfile" 
                    name="linkedinProfile" 
                    placeholder="https://linkedin.com/in/..."
                    defaultValue={interpreter?.linkedin_profile} 
                    className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-[var(--deep-navy)]">Web Presence</Label>
                  <Input 
                    id="website" 
                    name="website" 
                    placeholder="https://..."
                    defaultValue={interpreter?.website} 
                    className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)] rounded-lg bg-[var(--azureish-white)]/50"
                  />
                </div>

                <div className="space-y-3 pt-4">
                  <Label className="text-[var(--deep-navy)]">Interpreter profile visibility</Label>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="public" 
                        name="visibility" 
                        value="public" 
                        defaultChecked={!interpreter?.visibility || interpreter?.visibility === 'public'}
                        className="text-[var(--teal)] focus:ring-[var(--teal)]"
                      />
                      <Label htmlFor="public" className="font-normal">Public</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="private" 
                        name="visibility" 
                        value="private" 
                        defaultChecked={interpreter?.visibility === 'private'}
                        className="text-[var(--teal)] focus:ring-[var(--teal)]"
                      />
                      <Label htmlFor="private" className="font-normal">Private (not visible or searchable)</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Common Footer with Navigation and Save */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <Button 
                type="button" 
                variant="outline"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`border-[var(--deep-navy)] text-[var(--deep-navy)] ${currentIndex === 0 ? 'invisible' : ''}`}
              >
                Previous
              </Button>
              
              <div className="flex gap-2">
                {currentIndex < tabs.length - 1 && (
                  <Button 
                    type="button" 
                    onClick={handleNext}
                    className="bg-[var(--teal)] hover:bg-[var(--teal)]/90 text-white"
                  >
                    Next Step
                  </Button>
                )}
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-[var(--deep-navy)] hover:bg-[var(--deep-navy)]/90 text-white min-w-[120px]"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Profile"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </form>
  )
}
