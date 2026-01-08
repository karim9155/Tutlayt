"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FileText, Upload, CheckCircle, Download, AlertCircle, Loader2, PenTool } from "lucide-react"
import { uploadSignedPolicy, toggleSwornStatus, submitInterpreterSignature } from "@/app/dashboard/interpreter/actions"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import SignatureCanvas from 'react-signature-canvas'

interface PolicyUploadCardProps {
  interpreter: any
  templates: any[]
  swornTemplates: any[]
}

const REQUIRED_DOCS: { id: string, label: string }[] = []

export function PolicyUploadCard({ interpreter, templates, swornTemplates = [] }: PolicyUploadCardProps) {
  const [uploading, setUploading] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const sigCanvas = useRef<any>(null)
  
  // interpreters.documents is a JSONB object: { "identity_proof": "path/to/file", ... }
  // Check both legacy field (signed_policy_url) and new JSONB field for backward compatibility
  const uploadedDocs = interpreter?.documents || {}
  
  // Backwards compatibility: if signed_policy_url exists, count 'agreement' as done if not in JSON
  if (interpreter?.signed_policy_url && !uploadedDocs.agreement) {
      uploadedDocs.agreement = interpreter.signed_policy_url
  }

  // Combine static required docs (ID, CV etc) with dynamic templates (NDA, Ethics etc)
  const dynamicDocs = templates.map(t => ({
      id: t.name, 
      label: t.label, 
      template: t.url, 
      isTemplate: true
  }))

  const dynamicSwornDocs = swornTemplates.map(t => ({
      id: t.name,
      label: `[Sworn] ${t.label}`,
      template: t.url,
      isTemplate: true,
      isSworn: true
  }))

  const isSworn = interpreter?.is_sworn || false

  const allRequired = [...REQUIRED_DOCS, ...dynamicDocs]
  const allUploaded = allRequired.every(doc => !!uploadedDocs[doc.id])
  const isVerified = interpreter?.verified

  const swornUploaded = dynamicSwornDocs.every(doc => !!uploadedDocs[doc.id])
  const isSwornVerified = interpreter?.sworn_verified

  const toggleSworn = async (checked: boolean) => {
      try {
          const res = await toggleSwornStatus(checked)
          if (res?.error) toast.error(res.error)
          else toast.success(checked ? "Sworn translator status enabled" : "Sworn translator status disabled")
      } catch (err) {
          toast.error("Failed to update status")
      }
  }

  const handleDownload = async (e: React.MouseEvent, url: string, filename: string) => {
    e.preventDefault()
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
       console.error("Download failed", error)
       window.open(url, '_blank')
    }
  }

  const handleOpenSign = (doc: any) => {
    setSelectedDoc(doc)
    setIsDialogOpen(true)
    setTimeout(() => {
        if(sigCanvas.current) sigCanvas.current.clear()
    }, 100)
  }

  const clearSignature = () => {
    sigCanvas.current?.clear()
  }

  const handleSubmitSignature = async () => {
    if (sigCanvas.current?.isEmpty()) {
        toast.error("Please provide a signature")
        return
    }

    setUploading(selectedDoc.id)
    
    const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
    const blob = await (await fetch(dataURL)).blob()
    const file = new File([blob], "signature.png", { type: "image/png" })

    const formData = new FormData()
    formData.append("signature", file)
    formData.append("docType", selectedDoc.id)

    try {
        const res = await submitInterpreterSignature(formData)
        if (res?.error) {
            toast.error(res.error)
        } else {
            toast.success(`${selectedDoc.label} signed successfully`)
            setIsDialogOpen(false)
        }
    } catch (err) {
        toast.error("An error occurred")
    } finally {
        setUploading(null)
    }
  }

  async function handleFileUpload(file: File, docType: string) {
    setUploading(docType)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("docType", docType)

    try {
      const result = await uploadSignedPolicy(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(`Document uploaded`)
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setUploading(null)
    }
  }

  const DocumentList = ({ docs }: { docs: any[] }) => (
    <div className="space-y-4">
      {docs.map((doc, index) => {
         const isUploaded = !!uploadedDocs[doc.id]
         // @ts-ignore
         const templateLink = doc.template
         
         return (
           <div key={doc.id} className="p-4 border rounded-xl bg-white shadow-sm transition-all hover:border-[var(--teal)]/30">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold
                    ${isUploaded ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                    {isUploaded ? <CheckCircle className="h-3.5 w-3.5" /> : index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--deep-navy)]">{doc.label}</h4>
                    <p className="text-sm text-gray-400 mt-1">
                        {isUploaded ? "Document signed" : "Signature required"}
                    </p>
                  </div>
                </div>

                   <div className="flex items-center gap-2">
                      <a href={templateLink} target="_blank" rel="noopener noreferrer">
                         <Button variant="outline" size="sm" className="gap-2">
                             <FileText className="h-4 w-4" />
                             View PDF
                         </Button>
                      </a>
                      {isUploaded ? (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-md border border-green-100">
                           <CheckCircle className="h-4 w-4" />
                           <span>Signed</span>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleOpenSign(doc)} 
                          className="gap-2 bg-[var(--teal)] text-white hover:bg-[var(--teal)]/90"
                          disabled={!!uploading}
                        >
                            <PenTool className="h-3 w-3" />
                            Sign & Accept
                        </Button>
                      )}
                   </div>
                </div>
             </div>
         )
      })}
    </div>
  )

  return (
    <div className="space-y-6">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle>Sign Document</DialogTitle>
                  <DialogDescription>
                      By signing, you agree to the terms in <strong>{selectedDoc?.label}</strong>.
                  </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                  <div className="border rounded-md bg-gray-50 p-4">
                      <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">Draw your signature below:</p>
                      <div className="border-2 border-dashed border-gray-300 rounded bg-white">
                          <SignatureCanvas 
                              ref={sigCanvas}
                              canvasProps={{
                                  className: "signature-canvas w-full h-40"
                              }}
                              backgroundColor="white"
                          />
                      </div>
                  </div>
              </div>

              <DialogFooter className="sm:justify-between">
                  <Button variant="ghost" onClick={clearSignature}>Clear</Button>
                  <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleSubmitSignature} disabled={!!uploading} className="bg-[var(--teal)]">
                          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Submit Signature
                      </Button>
                  </div>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      <Card className="border-gray-100 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-[var(--deep-navy)] flex items-center gap-2">
            <FileText className="h-5 w-5 text-[var(--teal)]" />
            Verification Documents
          </CardTitle>
          <CardDescription>
            You must sign the following documents to participate in missions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Sworn Translator Checkbox */}
          <div className="flex items-center space-x-2 border p-3 rounded-lg bg-gray-50">
            <Checkbox 
              id="sworn" 
              checked={isSworn}
              onCheckedChange={(c) => toggleSworn(!!c)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="sworn"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I am also a Sworn Translator
              </label>
            </div>
          </div>

          {isVerified ? (
            <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-start gap-3 border border-green-100">
                <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Interpreter Account Verified</p>
                  <p className="text-sm mt-1">You are eligible for standard interpretation missions.</p>
                </div>
            </div>
          ) : (
            <>
              <div className="bg-[var(--azureish-white)]/30 p-4 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--deep-navy)]">
                  Progress: {allRequired.filter(d => uploadedDocs[d.id]).length} / {allRequired.length} Completed
                </span>
                {allUploaded && (
                  <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                     Pending Review
                  </span>
                )}
              </div>
              <DocumentList docs={allRequired} />
            </>
          )}

        </CardContent>
      </Card>

      {isSworn && (
        <Card className="border-gray-100 shadow-sm bg-white border-t-4 border-t-amber-500/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-[var(--deep-navy)] flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600" />
              Sworn Translator Verification
            </CardTitle>
            <CardDescription>
              Additional documents required for sworn status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {isSwornVerified ? (
               <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-start gap-3 border border-green-100">
                  <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Sworn Status Verified</p>
                    <p className="text-sm mt-1">You are verified as a Sworn Translator.</p>
                  </div>
              </div>
            ) : (
              <>
                 <div className="bg-amber-50 p-4 rounded-lg flex items-center justify-between border border-amber-100">
                  <span className="text-sm font-medium text-amber-900">
                    Progress: {dynamicSwornDocs.filter(d => uploadedDocs[d.id]).length} / {dynamicSwornDocs.length} Completed
                  </span>
                  {swornUploaded && (
                    <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                       Pending Review
                    </span>
                  )}
                </div>
                <DocumentList docs={dynamicSwornDocs} />
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
