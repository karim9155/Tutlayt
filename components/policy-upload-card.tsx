"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Upload, CheckCircle, Download, AlertCircle, Loader2 } from "lucide-react"
import { uploadSignedPolicy } from "@/app/dashboard/interpreter/actions"
import { toast } from "sonner"

interface PolicyUploadCardProps {
  interpreter: any
}

export function PolicyUploadCard({ interpreter }: PolicyUploadCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const hasUploaded = !!interpreter?.signed_policy_url
  const isVerified = interpreter?.verified

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append("policyFile", file)

    try {
      const result = await uploadSignedPolicy(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Document uploaded successfully")
        setFile(null)
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerified) {
    return (
      <Card className="border-green-200 shadow-sm bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-green-800 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Account Verified
          </CardTitle>
          <CardDescription className="text-green-700">
            Your policy agreement has been verified. You are now eligible for missions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-green-700 bg-white/50 p-3 rounded-lg border border-green-100">
            <FileText className="h-4 w-4" />
            <span>Signed policy document is on file.</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-100 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-[var(--deep-navy)] flex items-center gap-2">
          <FileText className="h-5 w-5 text-[var(--teal)]" />
          Verification & Policy
        </CardTitle>
        <CardDescription>
          Download our policy, sign it, and upload it to get verified.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: Download */}
        <div className="flex items-start gap-4 p-4 bg-[var(--azureish-white)]/30 rounded-xl border border-gray-100">
          <div className="bg-white p-2 rounded-lg shadow-sm text-[var(--deep-navy)]">
            <span className="font-bold text-lg">1</span>
          </div>
          <div className="space-y-2 flex-1">
            <h4 className="font-semibold text-[var(--deep-navy)]">Download Policy Document</h4>
            <p className="text-sm text-gray-500">Read and sign the interpreter agreement policy.</p>
            <a href="/documents/policy.pdf" download="Interpreter_Policy_Agreement.pdf" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="mt-2 border-[var(--teal)] text-[var(--teal)] hover:bg-[var(--teal)]/5">
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            </a>
          </div>
        </div>

        {/* Step 2: Upload */}
        <div className="flex items-start gap-4 p-4 bg-[var(--azureish-white)]/30 rounded-xl border border-gray-100">
          <div className="bg-white p-2 rounded-lg shadow-sm text-[var(--deep-navy)]">
            <span className="font-bold text-lg">2</span>
          </div>
          <div className="space-y-4 flex-1">
            <h4 className="font-semibold text-[var(--deep-navy)]">Upload Signed Document</h4>
            
            {hasUploaded ? (
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex flex-col gap-2 text-green-800">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Document Uploaded Successfully
                </div>
                <p className="text-sm text-green-700 pl-7">
                  Thank you for uploading the signed document. Our team will review it as soon as possible.
                </p>
                <p className="text-xs text-green-600 pl-7 mt-1">
                  Status: <span className="font-medium">Pending Verification</span>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="policyFile" className="text-xs text-gray-500">PDF or Image (Max 5MB)</Label>
                  <Input 
                    id="policyFile" 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="cursor-pointer bg-white"
                  />
                </div>
                
                {file && (
                  <Button type="submit" disabled={isLoading} className="w-full bg-[var(--deep-navy)] text-white hover:bg-[var(--dark-blue)]">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" /> Submit for Verification
                      </>
                    )}
                  </Button>
                )}
              </form>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
