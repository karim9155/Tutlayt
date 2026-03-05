"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cancelInterpreterRequest } from "@/app/actions/interpreter-requests"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function CancelRequestButton({ requestId }: { requestId: string }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this request?")) return
    setIsLoading(true)
    try {
      const result = await cancelInterpreterRequest(requestId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Request cancelled")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      onClick={handleCancel}
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel Request"}
    </Button>
  )
}
