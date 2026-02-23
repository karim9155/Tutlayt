"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Check, X, Building2, User as UserIcon, AlertCircle, FileText, Maximize2, Loader2,
  Globe, GraduationCap, Briefcase, Phone, Linkedin, ExternalLink 
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { approveUser, denyUser, verifySwornStatus, requestMoreInfo } from "@/app/admin/actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import Image from "next/image"

interface VerificationReviewModalProps {
  user: any // Typed properly in production, using any for flexibility with joined data
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function VerificationReviewModal({ user, isOpen, onClose, onComplete }: VerificationReviewModalProps) {
  const [rejecting, setRejecting] = useState(false)
  const [swornRejecting, setSwornRejecting] = useState(false)
  const [requestingInfo, setRequestingInfo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [infoRequestMessage, setInfoRequestMessage] = useState("")
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)

  const isClient = user?.role === 'client'
  
  // Transform documents map to array
  const allDocuments = user?.documentUrls ? Object.entries(user.documentUrls) : []

  // Categorize documents
  const signedAgreements = allDocuments.filter(([key, url]) => {
      const k = key.toLowerCase()
      const u = (typeof url === 'string') ? url.toLowerCase() : ''
      return k.includes('platform') || k.includes('nda') || k.includes('agreement') || k.includes('policy') || k.includes('signature') || u.includes('signed_')
  })

  // Everything else is a user upload (ID, KBis, etc)
  const uploadedDocuments = allDocuments.filter(([key, url]) => {
      const k = key.toLowerCase()
      const u = (typeof url === 'string') ? url.toLowerCase() : ''
      return !(k.includes('platform') || k.includes('nda') || k.includes('agreement') || k.includes('policy') || k.includes('signature') || u.includes('signed_'))
  })


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

  const handleRequestInfo = async () => {
    if (!infoRequestMessage) return toast.error("Please provide a message")
    
    setLoading(true)
    try {
      const result = await requestMoreInfo(user.role, user.id, infoRequestMessage)
      if (result.error) throw new Error(result.error)
      toast.success("Info request sent successfully")
      onComplete()
      onClose()
      setRequestingInfo(false)
      setInfoRequestMessage("")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSwornAction = async (approved: boolean) => {
    if (!approved && !rejectionReason) return toast.error("Please provide a rejection reason")
    
    setLoading(true)
    try {
      const result = await verifySwornStatus(user.id, approved, !approved ? rejectionReason : undefined)
      if (result.error) throw new Error(result.error)
      toast.success(approved ? "Sworn status verified" : "Sworn status rejected")
      onComplete()
      if (approved) {
           // If verifying, we might not need to close, but usually better to refresh everything
           // For now, let's just close to refresh state from parent
           onClose()
      } else {
           setSwornRejecting(false)
           setRejectionReason("") 
           onClose()
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  // Expanded Image Modal
  if (expandedDoc) {
    return (
        <Dialog open={true} onOpenChange={() => setExpandedDoc(null)}>
            <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col p-8 overflow-hidden bg-black/95 border-none">
                 <div className="relative w-full h-full flex items-center justify-center">
                     <img src={expandedDoc} className="max-w-full max-h-full object-contain" alt="Expanded" />
                     <button 
                        onClick={() => setExpandedDoc(null)} 
                        className="absolute top-0 right-0 text-white hover:text-gray-300 bg-black/50 rounded-full p-2"
                     >
                        <X className="w-6 h-6" />
                     </button>
                 </div>
            </DialogContent>
        </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            Verifying {isClient ? 'Client' : 'Interpreter'}
            {isClient ? <Building2 className="w-5 h-5 text-blue-500" /> : <UserIcon className="w-5 h-5 text-teal-500" />}
          </DialogTitle>
          <DialogDescription>
             Detailed review of profile and submitted documentation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-y-auto md:overflow-hidden min-h-0 bg-slate-50/10">
          {/* Left: Profile Info (4 cols) */}
          <div className="col-span-12 md:col-span-4 space-y-6 p-6 border-b md:border-b-0 md:border-r border-slate-100 h-auto md:h-full md:overflow-y-auto">
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 flex flex-col items-center text-center">
               <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center text-3xl font-bold text-slate-500 overflow-hidden mb-4 border-4 border-white ring-1 ring-slate-100">
                  {user.profiles?.avatar_url ? (
                    <img src={user.profiles.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    user.profiles?.full_name?.[0] || "?"
                  )}
               </div>
               
               <h3 className="font-bold text-xl text-[var(--deep-navy)]">{user.profiles?.full_name}</h3>
               <p className="text-sm text-slate-500 mb-2">{user.profiles?.email}</p>
               <Badge variant="outline" className="capitalize px-3 py-1">{user.role}</Badge>
            </div>

            <div className="space-y-4 px-1">
                <Accordion type="single" collapsible className="w-full" defaultValue="overview">
                    
                    {/* Item 1: Overview */}
                    <AccordionItem value="overview" className="border-b border-slate-100">
                        <AccordionTrigger className="text-sm font-semibold text-slate-700 hover:text-[var(--teal)] hover:no-underline py-3">
                            <div className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-slate-400" />
                                <span>Overview</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2 pb-4 px-1">
                            {/* Bio */}
                            <div>
                                <h5 className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">Bio</h5>
                                <p className="text-sm text-slate-600 leading-relaxed italic">
                                    {user.bio || "No biography provided."}
                                </p>
                            </div>

                            {/* Specializations */}
                            {!isClient && (
                                <div>
                                    <h5 className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Specializations</h5>
                                    <div className="flex flex-wrap gap-1.5">
                                        {user.specializations && user.specializations.length > 0 ? (
                                            user.specializations.map((spec: string, idx: number) => (
                                                <Badge key={idx} variant="outline" className="text-xs font-normal bg-white text-slate-600 border-slate-200">
                                                    {spec}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-slate-400">None listed</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Languages */}
                            {!isClient && (
                                <div>
                                    <h5 className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                                        <Globe className="w-3 h-3" /> Languages
                                    </h5>
                                    <div className="flex flex-wrap gap-1.5">
                                        {user.languages?.map((lang: any, idx: number) => {
                                            // Handle both string[] and object[] cases safely
                                            const langName = typeof lang === 'string' ? lang : lang?.language;
                                            return (
                                                <Badge key={idx} variant="secondary" className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200">
                                                    {langName}
                                                </Badge>
                                            );
                                        })}
                                        {(!user.languages || user.languages.length === 0) && (
                                            <span className="text-sm text-slate-400">No languages listed</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>

                    {/* Item 2: Experience & Education */}
                    {!isClient && (
                        <AccordionItem value="experience" className="border-b border-slate-100">
                            <AccordionTrigger className="text-sm font-semibold text-slate-700 hover:text-[var(--teal)] hover:no-underline py-3">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-slate-400" />
                                    <span>Experience & Education</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2 pb-4 px-1">
                                {/* Experience */}
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <Briefcase className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium uppercase">Experience</div>
                                        <div className="text-sm font-semibold text-[var(--deep-navy)]">
                                            {user.years_experience ? `${user.years_experience} Years` : (
                                                user.interpreter_since ? `Since ${user.interpreter_since}` : "Not provided"
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Education Listing */}
                                <div>
                                    <h5 className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Education History</h5>
                                    <div className="space-y-3">
                                        {Array.isArray(user.education_history) && user.education_history.length > 0 ? (
                                            user.education_history.map((edu: any, idx: number) => (
                                                <div key={idx} className="text-sm border-l-2 border-slate-200 pl-3 py-1">
                                                    <div className="font-medium text-[var(--deep-navy)]">{edu.degree || "Degree"}</div>
                                                    <div className="text-slate-500 text-xs">{edu.school || "School"} • {edu.year || "Year"}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-slate-400 italic">No education history provided</div>
                                        )}
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {/* Item 3: Contact & Rates */}
                    <AccordionItem value="contact" className="border-b-0">
                        <AccordionTrigger className="text-sm font-semibold text-slate-700 hover:text-[var(--teal)] hover:no-underline py-3">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span>Contact & Rates</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2 pb-4 px-1">
                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-center justify-between text-sm group">
                                    <span className="text-slate-500">Email</span>
                                    <span className="font-medium truncate max-w-[180px] select-all">{user.profiles?.email}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm group">
                                    <span className="text-slate-500">Phone</span>
                                    <span className="font-medium select-all">{user.phone || "N/A"}</span>
                                </div>
                                {user.linkedin_profile && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-1.5"><Linkedin className="w-3 h-3" /> LinkedIn</span>
                                        <a href={user.linkedin_profile} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                            View Profile <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                )}
                                {user.website && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-1.5"><Globe className="w-3 h-3" /> Website</span>
                                        <a href={user.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                            Visit Site <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                )}
                            </div>
                            
                            {!isClient && (
                                <div className="pt-3 border-t border-slate-100 mt-2">
                                    <h5 className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Base Rates</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-slate-50 p-2 rounded text-center border border-slate-100">
                                            <div className="text-slate-400 text-[10px] uppercase">Hourly</div>
                                            <div className="font-bold text-slate-700">{user.hourly_rate ? `€${user.hourly_rate}` : '-'}</div>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded text-center border border-slate-100">
                                            <div className="text-slate-400 text-[10px] uppercase">Daily</div>
                                            <div className="font-bold text-slate-700">{user.daily_rate ? `€${user.daily_rate}` : '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                {/* Sworn Status Block - Moved outside Accordion */}
                {!isClient && user.is_sworn && (
                    <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                        <div className="font-medium text-slate-700 mb-3 flex items-center gap-2 text-sm border-b border-blue-100 pb-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            Sworn Status Verification
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                            {user.sworn_verified ? (
                                <Badge className="bg-green-600 hover:bg-green-700">Verified Sworn</Badge>
                            ) : user.sworn_rejection_reason ? (
                                    <div className="flex flex-col">
                                    <Badge variant="destructive" className="w-fit mb-1">Rejected</Badge>
                                    <span className="text-xs text-red-600 leading-tight">{user.sworn_rejection_reason}</span>
                                    </div>
                            ) : (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending Review</Badge>
                            )}
                        </div>
                        
                        {user.documents?.sworn_proof ? (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full mb-3 h-8 text-xs bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                                onClick={() => setExpandedDoc(user.documents.sworn_proof)}
                            >
                                <Maximize2 className="w-3 h-3 mr-1.5" /> View Certificate
                            </Button>
                        ) : (
                            <div className="text-xs text-red-500 mb-3 italic flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> No certificate uploaded
                            </div>
                        )}

                        {!user.sworn_verified && !swornRejecting && (
                            <div className="flex gap-2">
                                <Button 
                                    size="sm" 
                                    className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700"
                                    onClick={() => handleSwornAction(true)}
                                    disabled={loading}
                                >
                                    <Check className="w-3 h-3 mr-1" /> Accept
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="flex-1 h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => setSwornRejecting(true)}
                                    disabled={loading}
                                >
                                    <X className="w-3 h-3 mr-1" /> Reject
                                </Button>
                            </div>
                        )}

                        {swornRejecting && (
                            <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                                <Textarea 
                                    placeholder="Reason for rejecting sworn status..."
                                    className="min-h-[60px] text-xs bg-white"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <Button 
                                        size="sm"
                                        variant="destructive"
                                        className="flex-1 h-7 text-xs"
                                        onClick={() => handleSwornAction(false)}
                                        disabled={loading}
                                    >
                                        Confirm Reject
                                    </Button>
                                    <Button 
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 text-xs"
                                        onClick={() => {
                                            setSwornRejecting(false)
                                            setRejectionReason("")
                                        }}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                 {requestingInfo ? (
                    <div className="space-y-3 bg-blue-50 p-3 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2">
                        <Label className="text-blue-800">Additional Information Required</Label>
                        <Textarea 
                            placeholder="Specify what information or documents are needed..." 
                            className="bg-white border-blue-200 resize-none min-h-[80px]"
                            value={infoRequestMessage}
                            onChange={(e) => setInfoRequestMessage(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <Button 
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" 
                                size="sm" 
                                onClick={handleRequestInfo} 
                                disabled={loading}
                            >
                                Send Request
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                    setRequestingInfo(false)
                                    setInfoRequestMessage("") 
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                 ) : !rejecting ? (
                    <>
                        <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-2" 
                            onClick={() => setRequestingInfo(true)}
                            disabled={loading}
                        >
                            <FileText className="w-4 h-4 mr-2" /> Request More Info
                        </Button>
                        <Button 
                            className="w-full bg-[var(--teal)] hover:bg-[var(--teal)]/90" 
                            onClick={handleApprove} 
                            disabled={loading}
                        >
                             <Check className="w-4 h-4 mr-2" /> Approve Request
                        </Button>
                        <Button 
                            variant="outline" 
                            className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" 
                            onClick={() => setRejecting(true)}
                            disabled={loading}
                        >
                            <X className="w-4 h-4 mr-2" /> Reject & Delete User
                        </Button>
                    </>
                 ) : (
                    <div className="space-y-3 bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-2">
                        <Label className="text-red-800">Reason for rejection *</Label>
                        <p className="text-xs text-red-600 font-medium">Warning: This will permanently delete the user account.</p>
                        <Textarea 
                            placeholder="Explain why this profile is being rejected..." 
                            className="bg-white border-red-200 resize-none min-h-[80px]"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <Button 
                                variant="destructive" 
                                className="flex-1" 
                                size="sm" 
                                onClick={handleDeny} 
                                disabled={loading}
                            >
                                Confirm Delete
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                    setRejecting(false)
                                    setRejectionReason("") // Clear reason if cancelled
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                 )}
            </div>
          </div>
          
          {/* Right: Documents (8 cols) */}
          <div className="col-span-12 md:col-span-8 p-6 bg-slate-50/30 h-auto md:h-full md:min-h-0 md:overflow-hidden">
            <div className="flex flex-col h-[500px] md:h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm z-10 shrink-0">
                    <h4 className="font-semibold flex items-center gap-2 text-[var(--deep-navy)]">
                        <FileText className="w-4 h-4 text-[var(--teal)]" /> 
                        Submitted Documentation 
                        <Badge variant="secondary" className="ml-2">{allDocuments.length} Files</Badge>
                    </h4>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-8">
                {allDocuments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <AlertCircle className="w-12 h-12 mb-2 opacity-20" />
                        <p>No documents found for this user.</p>
                    </div>
                )}
                
                {/* Uploaded Documents Section */}
                {uploadedDocuments.length > 0 && (
                    <div className="space-y-4">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2 mb-4">Official Documents</h5>
                        {uploadedDocuments.map(([key, url]: [string, any]) => (
                            <DocItem key={key} name={key} url={url} onExpand={setExpandedDoc} />
                        ))}
                    </div>
                )}
                
                {/* Separator if both exist */}
                {uploadedDocuments.length > 0 && signedAgreements.length > 0 && (
                    <div className="h-px bg-slate-100 my-6" />
                )}

                {/* Signed Agreements Section */}
                {signedAgreements.length > 0 && (
                    <div className="space-y-4">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2 mb-4">Signed Agreements</h5>
                        {signedAgreements.map(([key, url]: [string, any]) => (
                            <DocItem key={key} name={key} url={url} onExpand={setExpandedDoc} />
                        ))}
                    </div>
                )}
              </div>
            </div>
           </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DocItem({ name, url, onExpand }: { name: string, url: any, onExpand: (url: string) => void }) {
    return (
        <div className="group">
            <div className="flex items-center gap-2 mb-2 px-1">
                    <div className="h-2 w-2 rounded-full bg-[var(--teal)]"></div>
                    <h5 className="font-semibold text-sm uppercase tracking-wide text-slate-600">{name.replace(/-/g, ' ')}</h5>
            </div>
            
            <div className="bg-white p-1 rounded-xl border shadow-sm group-hover:shadow-md transition-all duration-200 overflow-hidden relative">
                {typeof url === 'string' && (url.toLowerCase().endsWith('.png') || url.toLowerCase().endsWith('.jpg') || url.toLowerCase().endsWith('.jpeg') || url.toLowerCase().startsWith('http')) ? (
                    <div className="relative aspect-[3/2] w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-100">
                        <img src={url} alt={name} className="w-full h-full object-contain" />
                        
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Button variant="secondary" size="sm" onClick={() => onExpand(url)} className="shadow-lg font-medium">
                                <Maximize2 className="w-4 h-4 mr-2" /> Inspect Details
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 bg-slate-50 rounded-lg border border-dashed border-slate-200 group-hover:border-[var(--teal)] transition-colors">
                        <FileText className="w-10 h-10 text-slate-300 mb-2" />
                        <span className="text-sm text-slate-500 font-medium truncate max-w-[200px] mb-2">{name}</span>
                        <Button variant="link" size="sm" asChild>
                            <a href={url} target="_blank" rel="noopener noreferrer">Download / View External</a>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
