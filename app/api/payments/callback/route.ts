import { type NextRequest, NextResponse } from "next/server"
import { completeCreditPurchase } from "@/app/actions/payments"

/**
 * Click2Pay payment callback endpoint.
 *
 * Click2Pay will POST to this URL after payment processing.
 * Configure your Click2Pay merchant settings to point to:
 *   https://yourdomain.com/api/payments/callback
 *
 * Expected payload (update based on actual Click2Pay API docs when available):
 * {
 *   "orderId": "<transaction_id>",           // Our transaction UUID
 *   "paymentReference": "<click2pay_ref>",   // Click2Pay payment reference
 *   "status": "SUCCESS" | "FAILED",
 *   "amount": 100.00,
 *   "currency": "TND",
 *   "signature": "<hmac_signature>"          // For webhook verification
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      orderId,          // maps to our transaction.id
      paymentReference,
      status,
      // signature,     // Uncomment when Click2Pay API is available for verification
    } = body

    // ── Signature Verification (implement when Click2Pay API docs available) ──
    // const isValid = verifyClick2PaySignature(body, process.env.CLICK2PAY_WEBHOOK_SECRET!)
    // if (!isValid) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    // }

    if (!orderId || !paymentReference) {
      return NextResponse.json({ error: "Missing required fields: orderId, paymentReference" }, { status: 400 })
    }

    if (status !== "SUCCESS") {
      // Mark transaction as failed
      const { createAdminClient } = await import("@/lib/supabase/admin")
      const admin = createAdminClient()
      await admin
        .from("transactions")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", orderId)

      return NextResponse.json({ received: true, result: "failed" })
    }

    // Complete the purchase: credit balance + update transaction
    const result = await completeCreditPurchase(orderId, paymentReference)

    if (result.error) {
      console.error("[Payments Callback] completeCreditPurchase error:", result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ received: true, result: "success" })
  } catch (err) {
    console.error("[Payments Callback] Unexpected error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * GET handler: Click2Pay may redirect the user back here after payment.
 * Shows either success or cancellation then redirects to the payments page.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const txId = searchParams.get("tx")

  if (status === "SUCCESS" && txId) {
    const paymentRef = searchParams.get("ref") ?? `CLICK2PAY-${Date.now()}`
    await completeCreditPurchase(txId, paymentRef)
    return NextResponse.redirect(new URL("/dashboard/client/payments?success=1", request.url))
  }

  return NextResponse.redirect(new URL("/dashboard/client/payments?cancelled=1", request.url))
}
