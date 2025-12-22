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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createBooking } from "@/app/actions/bookings"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Upload } from "lucide-react"

interface BookingDialogProps {
  interpreterId: string
  interpreterName: string
  hourlyRate: number
}

export function BookingDialog({ interpreterId, interpreterName, hourlyRate }: BookingDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    formData.append("interpreterId", interpreterId)

    try {
      const supabase = createClient()
      
      // Calculate price
      const startDate = formData.get("startDate") as string
      const startTime = formData.get("startTime") as string
      const endDate = formData.get("startDate") as string // Assuming single day for now or same date
      const endTime = formData.get("endTime") as string
      
      if (startDate && startTime && endTime) {
        const start = new Date(`${startDate}T${startTime}`)
        const end = new Date(`${startDate}T${endTime}`)
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        
        if (durationHours > 0) {
          const rate = hourlyRate || 0
          const totalPrice = durationHours * rate
          formData.append("price", totalPrice.toFixed(2))
        } else {
           formData.append("price", (hourlyRate || 0).toString())
        }
      } else {
         formData.append("price", (hourlyRate || 0).toString())
      }

      // Handle file upload if exists
      if (file) {
        setUploading(true)
        
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("User not authenticated")

        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        // Upload to user's folder to satisfy RLS policy
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError, data } = await supabase.storage
          .from('documents')
          .upload(filePath, file)

        if (uploadError) {
          console.error("Upload error:", uploadError)
          throw new Error("Error uploading file")
        }

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath)

        formData.append("preparationMaterialsUrl", publicUrl)
        setUploading(false)
      }

      const result = await createBooking(formData)
      
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Booking request sent successfully!")
        setOpen(false)
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-[var(--teal)] hover:bg-[var(--teal)]/90 text-white font-semibold py-6 text-lg shadow-lg shadow-[var(--teal)]/20 transition-all hover:scale-[1.02]">
          Book Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book {interpreterName}</DialogTitle>
          <DialogDescription>
            Fill in the details for your interpretation assignment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select name="platform" defaultValue="Zoom">
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern Time (US & Canada)</SelectItem>
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

          {/* Price input removed - calculated automatically */}

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
            <Button type="submit" disabled={isLoading} className="w-full bg-[var(--deep-navy)] text-white">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploading ? "Uploading..." : "Sending Request..."}
                </>
              ) : (
                "Send Booking Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
