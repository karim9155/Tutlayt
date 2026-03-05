import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getPaymentHistory } from "@/app/actions/payments"
import { PaymentBalanceCard } from "@/components/payment-balance-card"
import { PaymentHistoryTable } from "@/components/payment-history-table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle } from "lucide-react"

interface PaymentsPageProps {
  searchParams: Promise<{ cancelled?: string; success?: string }>
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Verify client role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "company") redirect("/dashboard")

  // Fetch company data (balance + client_type + fiscal_id)
  const { data: company } = await supabase
    .from("companies")
    .select("balance, client_type, fiscal_id, company_name")
    .eq("id", user.id)
    .single()

  // Fetch transaction history
  const { data: transactions, error } = await getPaymentHistory()

  const balance = parseFloat(company?.balance ?? 0)
  const currency = company?.client_type === "international" ? "USD" : "TND"

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--deep-navy)]">Payments</h1>
        <p className="text-gray-500 mt-1">
          Manage your balance, add credits, and view your transaction history.
        </p>
      </div>

      {/* Callback result banners */}
      {params.cancelled === "1" && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            Payment was cancelled. No funds have been charged.
          </AlertDescription>
        </Alert>
      )}
      {params.success === "1" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Payment successful! Your balance has been updated.
          </AlertDescription>
        </Alert>
      )}

      {/* Balance Card */}
      <PaymentBalanceCard
        balance={balance}
        currency={currency}
        clientType={company?.client_type ?? null}
        fiscalId={company?.fiscal_id ?? null}
      />

      {/* Transaction History */}
      <PaymentHistoryTable transactions={transactions ?? []} />

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            Failed to load transaction history: {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
