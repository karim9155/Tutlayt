"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createInterpreterRequest } from "@/app/actions/interpreter-requests"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Upload, CheckCircle2, AlertCircle, UserSearch } from "lucide-react"
import Link from "next/link"

interface InterpreterRequestDialogProps {
  documentsVerified?: boolean
  children?: React.ReactNode
}

export function InterpreterRequestDialog({ documentsVerified = false, children }: InterpreterRequestDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  function handleRequestClick() {
    if (!documentsVerified) {
      setShowErrorAlert(true)
    } else {
      setOpen(true)
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)

    try {
      const supabase = createClient()

      if (file) {
        setUploading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("User not authenticated")
        const fileExt = file.name.split('.').pop()
        const filePath = `${user.id}/${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('client-documents')
          .upload(filePath, file)
        if (uploadError) throw new Error("Error uploading file")
        const { data: { publicUrl } } = supabase.storage
          .from('client-documents')
          .getPublicUrl(filePath)
        formData.append("preparationMaterialsUrl", publicUrl)
        setUploading(false)
      }

      const result = await createInterpreterRequest(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        setOpen(false)
        setShowSuccessAlert(true)
      }
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
      setUploading(false)
    }
  }

  return (
    <>
      {/* Error: documents not signed */}
      <AlertDialog open={showErrorAlert} onOpenChange={setShowErrorAlert}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mx-auto mb-2">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center">
              Documents Required
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              You must sign your required documents before you can request an interpreter.
              Please go to your dashboard and complete the document signing process.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <Link href="/dashboard/client" className="w-full">
              <AlertDialogAction className="w-full bg-[var(--teal)] hover:bg-[var(--teal)]/90 text-white">
                Go to Dashboard &amp; Sign Documents
              </AlertDialogAction>
            </Link>
            <Button variant="outline" className="w-full" onClick={() => setShowErrorAlert(false)}>
              Cancel
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success: request submitted */}
      <AlertDialog open={showSuccessAlert} onOpenChange={setShowSuccessAlert}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mx-auto mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <AlertDialogTitle className="text-center">
              Request Submitted!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Your interpreter request has been submitted successfully. Our team will find the best interpreter for your needs and notify you once one is assigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <Link href="/dashboard/client/requests" className="w-full">
              <AlertDialogAction className="w-full bg-[var(--deep-navy)] hover:bg-[var(--deep-navy)]/90 text-white">
                View My Requests
              </AlertDialogAction>
            </Link>
            <Button variant="outline" className="w-full" onClick={() => setShowSuccessAlert(false)}>
              Continue
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Trigger */}
      <div onClick={handleRequestClick}>
        {children || (
          <Button
            variant="secondary"
            className="w-full justify-start bg-white/10 text-white hover:bg-white/20 border-0 h-12"
          >
            <UserSearch className="mr-2 h-4 w-4" /> Request an Interpreter
          </Button>
        )}
      </div>

      {/* Request form dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserSearch className="h-5 w-5 text-[var(--teal)]" />
              Request an Interpreter
            </DialogTitle>
            <DialogDescription>
              Tell us what you need and our team will find the best interpreter for you.
              <span className="block mt-1 text-amber-600 font-medium">
                Note: a 20% platform fee is applied on every booking.
              </span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="req-platform">Platform</Label>
                <Select name="platform" defaultValue="Zoom">
                  <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Zoom">Zoom</SelectItem>
                    <SelectItem value="Teams">Microsoft Teams</SelectItem>
                    <SelectItem value="Google Meet">Google Meet</SelectItem>
                    <SelectItem value="Webex">Webex</SelectItem>
                    <SelectItem value="On-site">On-site</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="req-subjectMatter">Subject Matter</Label>
                <Select name="subjectMatter" defaultValue="General">
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Business / Trade">Business / Trade</SelectItem>
                    <SelectItem value="Medical">Medical</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="req-title">Event Title</Label>
              <Input id="req-title" name="title" placeholder="e.g. Global Town Hall" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="req-startDate">Date</Label>
                <Input id="req-startDate" name="startDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="req-timezone">Timezone</Label>
                <Select name="timezone" defaultValue="UTC">
                  <SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="EST">Eastern Time (US &amp; Canada)</SelectItem>
                    <SelectItem value="CET">Central European Time</SelectItem>
                    <SelectItem value="PST">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="req-startTime">Start Time</Label>
                <Input id="req-startTime" name="startTime" type="time" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="req-endTime">End Time</Label>
                <Input id="req-endTime" name="endTime" type="time" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="req-languages">Languages (Direction)</Label>
              <Input id="req-languages" name="languages" placeholder="e.g. English -> Arabic" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="req-budget">Maximum Budget (TND)</Label>
              <div className="relative">
                <Input
                  id="req-budget"
                  name="budget"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 500.00"
                  required
                  className="pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">TND</span>
              </div>
              <p className="text-xs text-gray-500">We&apos;ll find an interpreter within your budget.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="req-meetingLink">Meeting Link</Label>
              <Input id="req-meetingLink" name="meetingLink" placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="req-description">Project Description</Label>
              <Textarea id="req-description" name="description" placeholder="Describe the event and requirements..." />
            </div>

            <div className="space-y-2">
              <Label>Preparation Materials</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <Upload className="w-8 h-8" />
                  <span className="text-sm font-medium">
                    {file ? file.name : "Click to upload PDF or Doc"}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full bg-[var(--teal)] hover:bg-[var(--teal)]/90 text-white">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploading ? "Uploading..." : "Submitting Request..."}
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
