import type { Invoice } from "@/app/actions/payments"

/**
 * Generates an invoice PDF as a Buffer using jsPDF.
 * Returns a Uint8Array which can be uploaded to Supabase Storage.
 */
export async function generateInvoicePdf(invoice: Invoice): Promise<Uint8Array> {
  // Dynamic import to avoid issues with SSR
  const { jsPDF } = await import("jspdf")

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20

  // ── Brand colors ────────────────────────────────────────────────────────────
  const deepNavy: [number, number, number] = [14, 19, 60]      // #0E133C
  const teal: [number, number, number] = [79, 162, 167]        // #4FA2A7
  const lightGray: [number, number, number] = [245, 247, 250]
  const darkGray: [number, number, number] = [80, 80, 80]

  // ── Header background ────────────────────────────────────────────────────────
  doc.setFillColor(...deepNavy)
  doc.rect(0, 0, pageWidth, 45, "F")

  // Logo text
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("TUTLAYT", margin, 22)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(200, 230, 232)
  doc.text("Professional Interpretation Services", margin, 30)

  // Invoice label (right side)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont("helvetica", "bold")
  doc.text("INVOICE", pageWidth - margin, 22, { align: "right" })
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(200, 230, 232)
  doc.text(`#${invoice.invoice_number}`, pageWidth - margin, 30, { align: "right" })

  // ── Invoice meta ─────────────────────────────────────────────────────────────
  let y = 58

  doc.setTextColor(...darkGray)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")

  // Left: Bill To
  doc.setFontSize(8)
  doc.setTextColor(...teal)
  doc.setFont("helvetica", "bold")
  doc.text("BILL TO", margin, y)

  y += 5
  doc.setFontSize(11)
  doc.setTextColor(...deepNavy)
  doc.setFont("helvetica", "bold")
  doc.text(invoice.client_company, margin, y)

  y += 5
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...darkGray)
  doc.text(invoice.client_name, margin, y)

  if (invoice.client_fiscal_id) {
    y += 5
    doc.text(`Fiscal ID: ${invoice.client_fiscal_id}`, margin, y)
  }

  // Right: Invoice details
  const rightCol = pageWidth - margin
  let ry = 58

  doc.setFontSize(8)
  doc.setTextColor(...teal)
  doc.setFont("helvetica", "bold")
  doc.text("INVOICE DETAILS", rightCol, ry, { align: "right" })

  ry += 5
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...darkGray)
  doc.text(`Date: ${new Date(invoice.issued_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`, rightCol, ry, { align: "right" })
  ry += 5
  doc.text(`Invoice No: ${invoice.invoice_number}`, rightCol, ry, { align: "right" })
  if (invoice.client_fiscal_id) {
    ry += 5
    doc.text(`Currency: ${invoice.currency}`, rightCol, ry, { align: "right" })
  }

  // ── Divider ───────────────────────────────────────────────────────────────────
  y = Math.max(y, ry) + 10
  doc.setDrawColor(...teal)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)

  // ── Items table header ────────────────────────────────────────────────────────
  y += 8
  doc.setFillColor(...lightGray)
  doc.rect(margin, y - 4, pageWidth - margin * 2, 10, "F")

  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...deepNavy)
  doc.text("DESCRIPTION", margin + 3, y + 2)
  doc.text("AMOUNT", pageWidth - margin - 3, y + 2, { align: "right" })

  // ── Items ─────────────────────────────────────────────────────────────────────
  y += 14
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(...darkGray)
  doc.text("Credit Top-up — Interpretation Services Balance", margin + 3, y)
  doc.text(
    `${invoice.amount.toFixed(2)} ${invoice.currency}`,
    pageWidth - margin - 3,
    y,
    { align: "right" }
  )

  // ── Totals ────────────────────────────────────────────────────────────────────
  y += 16
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(pageWidth / 2, y, pageWidth - margin, y)

  y += 6
  doc.setFontSize(10)
  doc.setTextColor(...darkGray)
  doc.text("Subtotal", pageWidth / 2 + 10, y)
  doc.text(`${invoice.amount.toFixed(2)} ${invoice.currency}`, pageWidth - margin - 3, y, { align: "right" })

  if (invoice.tva_amount !== null && invoice.tva_amount > 0) {
    y += 7
    doc.text("TVA (19%)", pageWidth / 2 + 10, y)
    doc.text(`${invoice.tva_amount.toFixed(2)} ${invoice.currency}`, pageWidth - margin - 3, y, { align: "right" })
  }

  y += 10
  doc.setFillColor(...deepNavy)
  doc.rect(pageWidth / 2, y - 5, pageWidth / 2 - margin, 12, "F")
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)
  doc.text("TOTAL", pageWidth / 2 + 10, y + 2)
  doc.text(`${invoice.total_amount.toFixed(2)} ${invoice.currency}`, pageWidth - margin - 3, y + 2, { align: "right" })

  // ── Footer ────────────────────────────────────────────────────────────────────
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setFillColor(...deepNavy)
  doc.rect(0, pageHeight - 20, pageWidth, 20, "F")
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(200, 230, 232)
  doc.text("Thank you for using Tutlayt Professional Interpretation Services", pageWidth / 2, pageHeight - 12, { align: "center" })
  doc.text("contact@tutlayt.com | www.tutlayt.com", pageWidth / 2, pageHeight - 6, { align: "center" })

  return doc.output("arraybuffer") as unknown as Uint8Array
}
