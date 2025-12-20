import Link from "next/link"
import { AlertTriangle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VerificationBannerProps {
  isVerified: boolean
  hasUploadedPolicy: boolean
}

export function VerificationBanner({ isVerified, hasUploadedPolicy }: VerificationBannerProps) {
  // If verified, don't show anything
  if (isVerified) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            {hasUploadedPolicy 
              ? "Your account is pending verification. We are reviewing your documents."
              : "Action Required: Please sign and upload the policy agreement to verify your account."
            }
          </p>
        </div>
        {!hasUploadedPolicy && (
          <Link href="/dashboard/interpreter">
            <Button size="sm" variant="outline" className="bg-white border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900 h-8 text-xs font-bold">
              <FileText className="mr-2 h-3 w-3" />
              Upload Document
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
