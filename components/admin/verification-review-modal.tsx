"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Check, X, Building2, User as UserIcon, AlertCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { approveUser, denyUser } from "@/app/admin/actions"

interface VerificationReviewModalProps {
  user: any // Typed properly in production, using any for flexibility with joined data
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function VerificationReviewModal({ user, isOpen, onClose, onComplete }: VerificationReviewModalProps) {
  const [rejecting, setRejecting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  const isClient = user?.role === 'client'
  
  // Transform documents map to array
  // user.documentUrls might be passed from parent
  const documents = user?.documentUrls ? Object.entries(user.documentUrls) : []

  const handleApprove = async () => {
    setLoading(true)
    try {
      const result = await approveUser(user.role, user.id)
      if (result.error) throw new Error(result.error)
      toast.success(`${isClient ? 'Client' : 'Interpreter'} approved successfully`)
      onComplete()
      onClose()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeny = async () => {
    if (!rejectionReason) return toast.error("Please provide a rejection reason")
    
    setLoading(true)
    try {
      const result = await denyUser(user.role, user.id, rejectionReason)
      if (result.error) throw new Error(result.error)
      toast.success(`${isClient ? 'Client' : 'Interpreter'} rejected`)
      onComplete()
      onClose()
      setRejecting(false)
      setRejectionReason("")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Verifying {isClient ? 'Client' : 'Interpreter'}
            {isClient ? <Building2 className="w-4 h-4 text-blue-500" /> : <UserIcon className="w-4 h-4 text-teal-500" />}
          </DialogTitle>
          <DialogDescription>
             Review submitted documents and profile information.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden min-h-0 py-4">
          {/* Left: Profile Info */}
          <div className="space-y-6 overflow-y-auto pr-2">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-500 overflow-hidden">
                  {user.profiles?.avatar_url ? (
                    <img src={user.profiles.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    user.profiles?.full_name?.[0] || "?"
                  )}
               </div>
               <div>
                 <h3 className="font-bold text-lg">{user.profiles?.full_name}</h3>
                 <p className="text-sm text-slate-500">{user.profiles?.email}</p>
                 <Badge variant="outline" className="mt-1 capitalize">{user.role}</Badge>
               </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium text-slate-500">Full Name</div>
                <div className="col-span-2">{user.profiles?.full_name}</div>
                
                <div className="font-medium text-slate-500">Joined</div>
                <div className="col-span-2">{new Date(user.created_at).toLocaleDateString()}</div>

                {isClient && (
                  <>
                    <div className="font-medium text-slate-500">Documents</div>
                    <div className="col-span-2">{documents.length} submitted</div>
                  </>
                )}
                
                {!isClient && (
                  <>
                    <div className="font-medium text-slate-500">Bio</div>
                    <div className="col-span-2 text-slate-600 italic">"{user.bio || 'No bio provided'}"</div>
                    
                    <div className="font-medium text-slate-500">City</div>
                    <div className="col-span-2">{user.city}</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Documents */}
          <div className="bg-slate-50 rounded-lg p-4 flex flex-col min-h-0 border">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Submitted Documents
            </h4>
            <ScrollArea className="flex-1">
              <div className="space-y-6">
                {documents.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    No documents found
                  </div>
                ) : (
                  documents.map(([key, url]: [string, any]) => (
                    <div key={key} className="bg-white p-3 rounded border shadow-sm">
                      <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">{key}</div>
                      {typeof url === 'string' && (url.toLowerCase().endsWith('.png') || url.toLowerCase().endsWith('.jpg') || url.toLowerCase().endsWith('.jpeg')) ? (
                         <img src={url} alt={key} className="w-full h-auto rounded border bg-slate-100" />
                      ) : (
                         <div className="flex items-center justify-center h-32 bg-slate-100 rounded text-slate-400 text-sm">
                           {typeof url === 'string' ? (
                             <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                               View Document (PDF/External)
                             </a>
                           ) : (
                             'Invalid Document Format'
                           )}
                         </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {rejecting ? (
            <div className="w-full space-y-3">
              <Label>Reason for Rejection</Label>
              <Textarea 
                placeholder="Please explain why the verification is being rejected. This will be shown to the user." 
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setRejecting(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDeny} disabled={loading || !rejectionReason}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Confirm Rejection
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Button variant="outline" className="mr-auto" onClick={onClose}>Cancel</Button>
              <Button variant="destructive" onClick={() => setRejecting(true)}>
                <X className="w-4 h-4 mr-1" /> Deny
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleApprove} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                Approve Verification
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FileText(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function Loader2(props: any) {
    return (
        <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
