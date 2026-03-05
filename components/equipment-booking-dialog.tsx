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
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { submitEquipmentRequest } from "@/app/actions/equipment"
import { Loader2, Calendar, Mail, FileText, Building, AlertCircle } from "lucide-react"
import Link from "next/link"

const equipmentOptions = [
  { id: "booths", label: "Interpretation Booths (ISO 4043)" },
  { id: "consoles", label: "Interpreter Consoles" },
  { id: "headsets", label: "Delegate Microphones / Headsets" },
  { id: "receivers", label: "Infrared Receivers (Audience)" },
  { id: "sound", label: "Sound System (Speakers/Mixers)" },
  { id: "video", label: "Video Projection & Screens" },
  { id: "tech_support", label: "On-site Technical Support" },
]

interface EquipmentBookingDialogProps {
  isCompanyUser?: boolean
  documentsVerified?: boolean
}

export function EquipmentBookingDialog({ isCompanyUser = false, documentsVerified = false }: EquipmentBookingDialogProps) {
  const [open, setOpen] = useState(false)
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])

  // Block only logged-in company users who haven't signed all documents.
  // Anonymous visitors or other roles can use the form freely.
  const isBlocked = isCompanyUser && !documentsVerified

  function handleRequestClick() {
    if (isBlocked) {
      setShowErrorAlert(true)
    } else {
      setOpen(true)
    }
  }

  const handleEquipmentChange = (id: string, checked: boolean) => {
    setSelectedEquipment((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    )
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    
    // Append selected equipment manually since checkboxes might not work perfectly with native FormData if named same
    // But let's use the formData directly if input names are correct.
    // Instead, let's append our state to handle multi-select properly if needed.
    // formData.delete("equipmentNeeded") // Clear potential duplicates if needed, but here we can just append
    // Actually, checkboxes with same name submit multiple values. That's fine.
    
    // Ensure we send the label or ID
    // If we use state, we can append them
    // Let's rely on form data with name="equipmentNeeded" on inputs

    const result = await submitEquipmentRequest(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Request Sent", {
        description: "We've received your equipment request and will contact you shortly.",
      })
      setOpen(false)
      // Reset form
      setSelectedEquipment([])
    }

    setIsLoading(false)
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
              You must sign your required documents before you can rent equipment.
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

      <Button
        size="lg"
        onClick={handleRequestClick}
        className="bg-[var(--teal)] hover:bg-[var(--teal-blue)] text-white font-semibold px-8 py-6 text-lg rounded-full shadow-lg shadow-[var(--teal)]/20 transition-all hover:shadow-[var(--teal)]/40 hover:-translate-y-1"
      >
        Request a Quote
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[var(--deep-navy)]">Renting Equipment</DialogTitle>
          <DialogDescription>
            Tell us about your event and equipment needs. We'll provide a custom quote within 24 hours.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Full Name</Label>
              <div className="relative">
                <Input id="clientName" name="clientName" placeholder="John Doe" required className="pl-9" />
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company (Optional)</Label>
              <div className="relative">
                <Input id="companyName" name="companyName" placeholder="Acme Inc." className="pl-9" />
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email Address</Label>
             <div className="relative">
              <Input id="clientEmail" name="clientEmail" type="email" placeholder="john@example.com" required className="pl-9" />
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventDate">Event Date</Label>
            <div className="relative">
              <Input id="eventDate" name="eventDate" type="date" required className="pl-9" />
               <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Equipment Needed</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded-lg p-4 bg-slate-50">
              {equipmentOptions.map((option) => (
                <div key={option.id} className="flex items-start space-x-3">
                  <Checkbox 
                    id={option.id} 
                    name="equipmentNeeded" 
                    value={option.label}
                    checked={selectedEquipment.includes(option.id)}
                    onCheckedChange={(checked) => handleEquipmentChange(option.id, checked as boolean)}
                  />
                  <Label htmlFor={option.id} className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer pt-0.5">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {selectedEquipment.length === 0 && (
               <p className="text-xs text-muted-foreground italic">* Please select at least one item.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Requirements / Event Details</Label>
            <Textarea 
              id="additionalNotes" 
              name="additionalNotes" 
              placeholder="Please provide details about venue size, number of participants, or specific technical requirements..." 
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading || selectedEquipment.length === 0} className="w-full bg-[var(--teal)] hover:bg-[var(--teal-blue)] text-white">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
