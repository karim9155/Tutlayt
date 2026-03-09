"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransactionType = "credit_purchase" | "booking_deduction" | "refund"
export type TransactionStatus = "pending" | "completed" | "failed" | "refunded"

export interface Transaction {
  id: string
  client_id: string
  type: TransactionType
  amount: number
  currency: string
  tva_amount: number | null
  total_amount: number
  status: TransactionStatus
  payment_reference: string | null
  booking_id: string | null
  description: string | null
  created_at: string
  updated_at: string
  invoices?: Invoice[]
}

export interface Invoice {
  id: string
  transaction_id: string
  client_id: string
  invoice_number: string
  amount: number
  tva_amount: number | null
  total_amount: number
  currency: string
  client_name: string
  client_company: string
  client_fiscal_id: string | null
  issued_at: string
  pdf_url: string | null
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const purchaseSchema = z.object({
  amount: z.number().min(5, "Minimum amount is 5").max(50000, "Maximum amount is 50,000"),
})

// ─── Constants ────────────────────────────────────────────────────────────────

const TVA_RATE = 0.19 // 19% Tunisian TVA for local clients

function getCurrencyForClientType(clientType: string | null): string {
  if (clientType === "international") return "USD"
  return "TND"
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Initiates a credit purchase.
 * Creates a pending transaction + invoice row, then returns the redirect URL
 * to the payment gateway (Click2Pay). Until Click2Pay API is integrated,
 * returns a mock success URL for testing.
 */
export async function initiateCreditPurchase(formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Parse & validate amount
  const rawAmount = parseFloat(formData.get("amount") as string)
  const parsed = purchaseSchema.safeParse({ amount: rawAmount })
  if (!parsed.success) return { error: parsed.error.errors[0].message }
  const amount = parsed.data.amount

  // Fetch company details
  const { data: company, error: companyErr } = await supabase
    .from("companies")
    .select("company_name, client_type, fiscal_id")
    .eq("id", user.id)
    .single()

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name, email")
    .eq("id", user.id)
    .single()

  if (companyErr || !company) return { error: "Company profile not found" }

  const currency = getCurrencyForClientType(company.client_type)
  const isLocal = company.client_type !== "international"
  const tvaAmount = isLocal ? parseFloat((amount * TVA_RATE).toFixed(2)) : null
  const totalAmount = isLocal ? parseFloat((amount + (tvaAmount ?? 0)).toFixed(2)) : amount

  // Create pending transaction
  const { data: transaction, error: txErr } = await admin
    .from("transactions")
    .insert({
      client_id: user.id,
      type: "credit_purchase",
      amount,
      currency,
      tva_amount: tvaAmount,
      total_amount: totalAmount,
      status: "pending",
      description: `Credit purchase of ${amount} ${currency}`,
    })
    .select()
    .single()

  if (txErr || !transaction) {
    console.error("Transaction insert error:", txErr)
    return { error: "Failed to create transaction" }
  }

  // Create invoice record
  const { error: invErr } = await admin
    .from("invoices")
    .insert({
      transaction_id: transaction.id,
      client_id: user.id,
      amount,
      tva_amount: tvaAmount,
      total_amount: totalAmount,
      currency,
      client_name: profile?.company_name ?? "",
      client_company: company.company_name ?? "",
      client_fiscal_id: company.fiscal_id ?? null,
    })

  if (invErr) {
    console.error("Invoice insert error:", invErr)
    // Don't block the flow — transaction exists, invoice can be created later
  }

  // ─── Click2Pay Integration Point ─────────────────────────────────────────
  // When Click2Pay API is available, replace the block below with:
  //
  //   const click2payResponse = await fetch("https://api.click2pay.tn/initiate", {
  //     method: "POST",
  //     headers: { "Authorization": `Bearer ${process.env.CLICK2PAY_API_KEY}`, "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       amount: totalAmount,
  //       currency,
  //       orderId: transaction.id,
  //       returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/callback?tx=${transaction.id}`,
  //       cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/client/payments?cancelled=1`,
  //       customerEmail: profile?.email,
  //     }),
  //   })
  //   const { paymentUrl } = await click2payResponse.json()
  //   return { redirectUrl: paymentUrl, transactionId: transaction.id }
  //
  // ─────────────────────────────────────────────────────────────────────────

  // Temporary: simulate successful payment for testing
  const testResult = await completeCreditPurchase(transaction.id, `TEST-${Date.now()}`)
  if (testResult.error) return { error: testResult.error }

  return {
    success: true,
    transactionId: transaction.id,
    message: `Successfully added ${amount} ${currency} to your balance.`,
  }
}

/**
 * Marks a transaction as completed and credits the client's balance.
 * Called by Click2Pay webhook callback or manually (for testing).
 */
export async function completeCreditPurchase(transactionId: string, paymentReference: string) {
  const admin = createAdminClient()

  // Fetch transaction
  const { data: tx, error: txFetchErr } = await admin
    .from("transactions")
    .select("*")
    .eq("id", transactionId)
    .eq("status", "pending")
    .single()

  if (txFetchErr || !tx) return { error: "Transaction not found or already processed" }

  // Update transaction status
  const { error: txUpdateErr } = await admin
    .from("transactions")
    .update({ status: "completed", payment_reference: paymentReference, updated_at: new Date().toISOString() })
    .eq("id", transactionId)

  if (txUpdateErr) return { error: "Failed to update transaction status" }

  // Credit client's balance
  const { error: balanceErr } = await admin.rpc("increment_client_balance", {
    p_client_id: tx.client_id,
    p_amount: tx.amount,
  })

  // Fallback if RPC not available: manual update
  if (balanceErr) {
    const { data: company } = await admin
      .from("companies")
      .select("balance")
      .eq("id", tx.client_id)
      .single()

    const newBalance = parseFloat(((company?.balance ?? 0) + tx.amount).toFixed(2))
    await admin
      .from("companies")
      .update({ balance: newBalance })
      .eq("id", tx.client_id)
  }

  // Mark invoice as issued (pdf_url will be set when first downloaded)
  await admin
    .from("invoices")
    .update({ issued_at: new Date().toISOString() })
    .eq("transaction_id", transactionId)

  revalidatePath("/dashboard/client/payments")
  revalidatePath("/dashboard/client")

  return { success: true }
}

/**
 * Fetches the client's transaction history with associated invoice data.
 */
export async function getPaymentHistory(): Promise<{ data: Transaction[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: "Not authenticated" }

  const { data, error } = await supabase
    .from("transactions")
    .select("*, invoices(*)")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return { data: null, error: error.message }
  return { data: data as Transaction[], error: null }
}

/**
 * Generates (or retrieves cached) a signed download URL for an invoice PDF.
 * PDF generation happens server-side using jspdf.
 */
export async function getInvoiceDownloadUrl(invoiceId: string): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { url: null, error: "Not authenticated" }

  // Fetch invoice (only if it belongs to this client)
  const { data: invoice, error: invErr } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("client_id", user.id)
    .single()

  if (invErr || !invoice) return { url: null, error: "Invoice not found" }

  // If PDF already generated, return signed URL
  if (invoice.pdf_url) {
    const { data: signedData } = await admin.storage
      .from("invoices")
      .createSignedUrl(invoice.pdf_url, 60 * 5) // 5-minute signed URL
    if (signedData?.signedUrl) return { url: signedData.signedUrl, error: null }
  }

  // Generate PDF
  const { generateInvoicePdf } = await import("@/lib/invoices")
  const pdfBuffer = await generateInvoicePdf(invoice)

  // Upload to Supabase Storage
  const storagePath = `${invoice.client_id}/${invoice.invoice_number}.pdf`
  const { error: uploadErr } = await admin.storage
    .from("invoices")
    .upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true })

  if (uploadErr) {
    console.error("PDF upload error:", uploadErr)
    return { url: null, error: "Failed to upload invoice PDF" }
  }

  // Save the storage path
  await admin
    .from("invoices")
    .update({ pdf_url: storagePath })
    .eq("id", invoiceId)

  // Return signed URL
  const { data: signedData } = await admin.storage
    .from("invoices")
    .createSignedUrl(storagePath, 60 * 5)

  return { url: signedData?.signedUrl ?? null, error: null }
}

/**
 * Deducts credits from a client's balance when a booking is accepted.
 * Called internally from updateBookingStatus in bookings.ts.
 */
export async function deductBalanceForBooking(bookingId: string, clientId: string, amount: number, currency: string) {
  const admin = createAdminClient()

  // Check sufficient balance
  const { data: company } = await admin
    .from("companies")
    .select("balance")
    .eq("id", clientId)
    .single()

  const currentBalance = parseFloat(company?.balance ?? 0)
  if (currentBalance < amount) {
    return { error: `Insufficient balance. Current balance: ${currentBalance} ${currency}. Required: ${amount} ${currency}.` }
  }

  // Deduct balance
  const newBalance = parseFloat((currentBalance - amount).toFixed(2))
  const { error: deductErr } = await admin
    .from("companies")
    .update({ balance: newBalance })
    .eq("id", clientId)

  if (deductErr) return { error: "Failed to deduct balance" }

  // Record transaction
  const { error: txErr } = await admin
    .from("transactions")
    .insert({
      client_id: clientId,
      type: "booking_deduction",
      amount: -amount,
      currency,
      tva_amount: null,
      total_amount: -amount,
      status: "completed",
      booking_id: bookingId,
      description: `Booking deduction for booking #${bookingId.slice(0, 8)}`,
    })

  if (txErr) console.error("Deduction transaction insert error:", txErr)

  return { success: true, newBalance }
}
