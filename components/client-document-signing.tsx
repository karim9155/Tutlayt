"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, FileText, PenTool, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import SignatureCanvas from 'react-signature-canvas'
import { submitSignedDocument } from "@/app/dashboard/client/actions"

interface ClientDocumentSigningProps {
  company: any
  templates: any[]
}

export function ClientDocumentSigning({ company, templates }: ClientDocumentSigningProps) {
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const sigCanvas = useRef<any>(null)

  const uploadedDocs = company?.documents || {}
  const status = company?.verification_status || 'unverified'
  const isVerified = status === 'verified'

  const handleOpenSign = (doc: any) => {
      setSelectedDoc(doc)
      setIsDialogOpen(true)
      // Small timeout to allow modal to render before canvas init if needed
      setTimeout(() => {
          if(sigCanvas.current) sigCanvas.current.clear()
      }, 100)
  }

  const clearSignature = () => {
    sigCanvas.current?.clear()
  }

  const handleSubmit = async () => {
      if (sigCanvas.current?.isEmpty()) {
          toast.error("Please provide a signature")
          return
      }

      setSubmitting(true)
      
      // Get signature as blob
      const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
      const blob = await (await fetch(dataURL)).blob()
      const file = new File([blob], "signature.png", { type: "image/png" })

      const formData = new FormData()
      formData.append("signature", file)
      formData.append("docName", selectedDoc.name)

      try {
          const res = await submitSignedDocument(formData)
          if (res?.error) {
              toast.error(res.error)
          } else {
              toast.success("Document signed successfully")
              setIsDialogOpen(false)
          }
      } catch (err) {
          toast.error("An error occurred")
      } finally {
          setSubmitting(false)
      }
  }

  if (isVerified) {
      return (
        <Card className="border-green-200 bg-green-50">
            <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Account Verified
                </CardTitle>
                <CardDescription className="text-green-700">
                    You have full access to booking and search features.
                </CardDescription>
            </CardHeader>
        </Card>
      )
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[var(--teal)]" />
                    Required Documents
                </CardTitle>
                <CardDescription>
                    You must sign the following documents to activate your account.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {status === 'pending_approval' && (
                    <div className="bg-amber-50 text-amber-800 p-3 rounded-md flex gap-2 items-center text-sm border border-amber-100">
                        <AlertCircle className="h-4 w-4" />
                        <span>Your account is pending approval. An admin will verify your documents soon.</span>
                    </div>
                )}

                <div className="grid gap-3">
                    {templates.map((doc) => {
                        const isSigned = !!uploadedDocs[doc.name]
                        return (
                            <div key={doc.name} className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                                <div className="mb-3 sm:mb-0">
                                    <h4 className="font-medium text-[var(--deep-navy)]">{doc.label}</h4>
                                    <p className="text-sm text-gray-500">
                                        {isSigned ? "Signed and submitted" : "Pending signature"}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                     <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="sm">View PDF</Button>
                                     </a>
                                     {!isSigned && (
                                         <Button size="sm" onClick={() => handleOpenSign(doc)} className="gap-2 bg-[var(--teal)] text-white hover:bg-[var(--teal)]/90">
                                             <PenTool className="h-3 w-3" />
                                             Sign & Accept
                                         </Button>
                                     )}
                                     {isSigned && (
                                         <Button size="sm" variant="ghost" className="text-green-600 gap-2 cursor-default hover:bg-transparent">
                                             <CheckCircle className="h-4 w-4" />
                                             Signed
                                         </Button>
                                     )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>

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
                    <div className="text-xs text-gray-400">
                        <p>Timestamp: {new Date().toLocaleString()}</p>
                        <p>User ID: {company?.id}</p>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between">
                    <Button variant="ghost" onClick={clearSignature}>Clear</Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={submitting} className="bg-[var(--teal)]">
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Signature
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}
