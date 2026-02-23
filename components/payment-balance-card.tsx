"use client"

import { CreditCard, Plus, TrendingUp, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BuyCreditsDialog } from "@/components/buy-credits-dialog"

interface PaymentBalanceCardProps {
  balance: number
  currency: string
  clientType: string | null
  fiscalId: string | null
}

export function PaymentBalanceCard({ balance, currency, clientType, fiscalId }: PaymentBalanceCardProps) {
  const currencySymbol = currency === "TND" ? "TND" : currency === "USD" ? "$" : "€"
  const isLocal = clientType !== "international"

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Main Balance Card */}
      <Card className="md:col-span-2 bg-[var(--deep-navy)] text-white border-0 shadow-xl shadow-blue-900/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--teal)]/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <CardContent className="pt-8 pb-8 px-8 relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[var(--azureish-white)]/70 text-sm font-medium uppercase tracking-widest mb-1">
                Available Balance
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">
                  {balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xl text-[var(--teal)] font-semibold">{currency}</span>
              </div>
            </div>
            <div className="bg-[var(--teal)]/20 p-3 rounded-xl">
              <CreditCard className="h-8 w-8 text-[var(--teal)]" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <BuyCreditsDialog currency={currency} isLocal={isLocal}>
              <Button
                size="lg"
                className="bg-[var(--teal)] hover:bg-[var(--teal-blue)] text-white font-semibold shadow-lg shadow-teal-500/20 gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Credits
              </Button>
            </BuyCreditsDialog>
            <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs px-3 py-1">
              {isLocal ? "TND + 19% TVA" : "International — No TVA"}
            </Badge>
          </div>

          <p className="text-[var(--azureish-white)]/50 text-xs mt-4 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Credits are deducted when an interpreter accepts your booking
          </p>
        </CardContent>
      </Card>

      {/* Side Info Cards */}
      <div className="flex flex-col gap-4">
        <Card className="border-gray-100 shadow-sm bg-white flex-1">
          <CardContent className="pt-6 px-6 pb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[var(--teal)]/10 p-2 rounded-lg">
                <CreditCard className="h-5 w-5 text-[var(--teal)]" />
              </div>
              <span className="font-semibold text-[var(--deep-navy)] text-sm">How it works</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="bg-[var(--teal)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>Add credits to your account balance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-[var(--teal)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>Book an interpreter session</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-[var(--teal)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span>Credits deducted on acceptance</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {!fiscalId && (
          <Card className="border-amber-200 bg-amber-50 shadow-sm">
            <CardContent className="pt-5 px-5 pb-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-amber-800 text-sm">Fiscal ID missing</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Add your Fiscal ID in your profile to enable invoice generation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
