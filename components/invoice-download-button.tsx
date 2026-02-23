"use client"

import { useState } from "react"
import { Download, Loader2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getInvoiceDownloadUrl } from "@/app/actions/payments"
import { toast } from "sonner"

interface InvoiceDownloadButtonProps {
  invoiceId: string
  invoiceNumber: string
}

export function InvoiceDownloadButton({ invoiceId, invoiceNumber }: InvoiceDownloadButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    const result = await getInvoiceDownloadUrl(invoiceId)
    setLoading(false)

    if (result.error || !result.url) {
      toast.error(result.error ?? "Failed to generate invoice")
      return
    }

    // Trigger browser download
    const link = document.createElement("a")
    link.href = result.url
    link.download = `${invoiceNumber}.pdf`
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("Invoice downloaded")
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={loading}
      className="h-8 gap-1.5 border-[var(--teal)]/30 text-[var(--teal)] hover:bg-[var(--teal)]/5 hover:text-[var(--teal)] hover:border-[var(--teal)]"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <FileText className="h-3.5 w-3.5" />
      )}
      <span className="hidden sm:inline">{loading ? "Generating..." : "Invoice"}</span>
      {!loading && <Download className="h-3 w-3" />}
    </Button>
  )
}
