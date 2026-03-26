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
import { Switch } from "@/components/ui/switch"
import { createBooking } from "@/app/actions/bookings"
import { createInterpreterRequest } from "@/app/actions/interpreter-requests"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Upload, CheckCircle2, AlertCircle, UserSearch } from "lucide-react"
import Link from "next/link"

interface BookingDialogProps {
  interpreterId: string
  interpreterName: string
  hourlyRate: number
  currency?: string
  clientType?: string
  documentsVerified?: boolean
}

export function BookingDialog({ interpreterId, interpreterName, hourlyRate, documentsVerified = false }: BookingDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [letAdminChoose, setLetAdminChoose] = useState(false)

  function handleBookNowClick() {
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

      // Handle file upload (shared between both flows)
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

      if (letAdminChoose) {
        // Flow 2: Submit as interpreter request with suggested interpreter
        formData.append("suggestedInterpreterId", interpreterId)
        const result = await createInterpreterRequest(formData)
        if (result?.error) {
          toast.error(result.error)
        } else {
          setOpen(false)
          setShowSuccessAlert(true)
        }
      } else {
        // Flow 1: Direct booking (existing behavior)
        formData.append("interpreterId", interpreterId)
        
        const startDate = formData.get("startDate") as string
        const startTime = formData.get("startTime") as string
        const endTime = formData.get("endTime") as string
        
        formData.append("dailyRate", (hourlyRate || 0).toString())
        if (startDate && startTime && endTime) {
          const start = new Date(`${startDate}T${startTime}`)
          const end = new Date(`${startDate}T${endTime}`)
          const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          if (durationHours > 0) {
            formData.append("price", (durationHours * (hourlyRate || 0)).toFixed(2))
          } else {
            formData.append("price", (hourlyRate || 0).toString())
          }
        } else {
          formData.append("price", (hourlyRate || 0).toString())
        }

        const result = await createBooking(formData)
        if (result?.error) {
          toast.error(result.error)
        } else {
          setOpen(false)
          setShowSuccessAlert(true)
        }
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
              You must sign your required documents before you can book an interpreter.
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

      {/* Success: booking sent or request submitted */}
      <AlertDialog open={showSuccessAlert} onOpenChange={setShowSuccessAlert}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mx-auto mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <AlertDialogTitle className="text-center">
              {letAdminChoose ? "Request Submitted!" : "Booking Request Sent!"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {letAdminChoose ? (
                <>
                  Your interpreter request has been submitted successfully. Our team will find the best interpreter for your needs and notify you once one is assigned.
                </>
              ) : (
                <>
                  Your booking request for{" "}
                  <span className="font-semibold text-[var(--deep-navy)]">{interpreterName}</span>{" "}
                  has been sent successfully. You will be notified once the interpreter responds.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <Link href={letAdminChoose ? "/dashboard/client/requests" : "/dashboard/client/bookings"} className="w-full">
              <AlertDialogAction className="w-full bg-[var(--deep-navy)] hover:bg-[var(--deep-navy)]/90 text-white">
                {letAdminChoose ? "View My Requests" : "View My Bookings"}
              </AlertDialogAction>
            </Link>
            <Button variant="outline" className="w-full" onClick={() => setShowSuccessAlert(false)}>
              Continue Browsing
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Book Now button */}
      <Button
        onClick={handleBookNowClick}
        className="w-full bg-[var(--teal)] hover:bg-[var(--teal)]/90 text-white font-semibold py-6 text-lg shadow-lg shadow-[var(--teal)]/20 transition-all hover:scale-[1.02]"
      >
        Book Now
      </Button>

      {/* Booking form dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {letAdminChoose ? "Request an Interpreter" : `Book ${interpreterName}`}
            </DialogTitle>
            <DialogDescription>
              {letAdminChoose
                ? "Tell us what you need and our team will find the best interpreter for you."
                : "Fill in the details for your interpretation assignment."
              }
              <span className="block mt-1 text-amber-600 font-medium">
                Note: a 20% platform fee is applied on every booking.
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Toggle: let admin choose */}
          <div className="flex items-center justify-between rounded-lg border border-[var(--teal)]/20 bg-[var(--teal)]/5 p-4">
            <div className="flex items-center gap-3">
              <UserSearch className="h-5 w-5 text-[var(--teal)]" />
              <div>
                <p className="text-sm font-medium text-[var(--deep-navy)]">Let our team choose for you</p>
                <p className="text-xs text-gray-500">We&apos;ll find the best interpreter based on your requirements</p>
              </div>
            </div>
            <Switch
              checked={letAdminChoose}
              onCheckedChange={setLetAdminChoose}
            />
          </div>

          {letAdminChoose && (
            <div className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-md p-3">
              <span className="font-medium text-blue-700">Note:</span> {interpreterName} will be suggested as a starting point, but our team may assign a different interpreter based on availability and best fit.
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
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
                <Label htmlFor="subjectMatter">Subject Matter</Label>
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
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" name="title" placeholder="e.g. Global Town Hall" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date</Label>
                <Input id="startDate" name="startDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
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
                <Label htmlFor="startTime">Start Time</Label>
                <Input id="startTime" name="startTime" type="time" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" name="endTime" type="time" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="languages">Languages (Direction)</Label>
              <Input id="languages" name="languages" placeholder="e.g. English -> Arabic" required />
            </div>

            {letAdminChoose && (
              <div className="space-y-2">
                <Label htmlFor="budget">Maximum Budget (TND)</Label>
                <div className="relative">
                  <Input
                    id="budget"
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
            )}

            <div className="space-y-2">
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input id="meetingLink" name="meetingLink" placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <Textarea id="description" name="description" placeholder="Describe the event and requirements..." />
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
              <Button type="submit" disabled={isLoading} className={`w-full text-white ${letAdminChoose ? 'bg-[var(--teal)] hover:bg-[var(--teal)]/90' : 'bg-[var(--deep-navy)]'}`}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploading ? "Uploading..." : "Sending Request..."}
                  </>
                ) : (
                  letAdminChoose ? "Submit Request" : "Send Booking Request"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}



