"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InvoiceDownloadButton } from "@/components/invoice-download-button"
import { ChevronLeft, ChevronRight, Receipt, ArrowUpCircle, ArrowDownCircle, RefreshCcw } from "lucide-react"
import type { Transaction } from "@/app/actions/payments"
import { format } from "date-fns"

interface PaymentHistoryTableProps {
  transactions: Transaction[]
}

const PAGE_SIZE = 10

function getTypeConfig(type: string) {
  switch (type) {
    case "credit_purchase":
      return {
        label: "Credit Purchase",
        icon: ArrowUpCircle,
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        amountClass: "text-emerald-600 font-semibold",
        sign: "+",
      }
    case "booking_deduction":
      return {
        label: "Booking Deduction",
        icon: ArrowDownCircle,
        badgeClass: "bg-red-50 text-red-700 border-red-200",
        amountClass: "text-red-600 font-semibold",
        sign: "",
      }
    case "refund":
      return {
        label: "Refund",
        icon: RefreshCcw,
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
        amountClass: "text-blue-600 font-semibold",
        sign: "+",
      }
    default:
      return {
        label: type,
        icon: Receipt,
        badgeClass: "bg-gray-100 text-gray-600 border-gray-200",
        amountClass: "text-gray-700 font-semibold",
        sign: "",
      }
  }
}

function getStatusConfig(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-50 text-green-700 border-green-200"
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200"
    case "failed":
      return "bg-red-50 text-red-700 border-red-200"
    case "refunded":
      return "bg-blue-50 text-blue-700 border-blue-200"
    default:
      return "bg-gray-100 text-gray-600 border-gray-200"
  }
}

export function PaymentHistoryTable({ transactions }: PaymentHistoryTableProps) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(transactions.length / PAGE_SIZE)
  const paginated = transactions.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  return (
    <Card className="border-gray-100 shadow-sm bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[var(--deep-navy)] flex items-center gap-2">
              <Receipt className="h-5 w-5 text-[var(--teal)]" />
              Transaction History
            </CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              All credit purchases and booking deductions
            </CardDescription>
          </div>
          {transactions.length > 0 && (
            <Badge className="bg-[var(--azureish-white)] text-[var(--deep-navy)] border-0 text-xs">
              {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="mx-auto w-16 h-16 bg-[var(--azureish-white)] rounded-2xl flex items-center justify-center mb-4">
              <Receipt className="h-8 w-8 text-[var(--teal)]/60" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--deep-navy)] mb-1">No transactions yet</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Add credits to your balance to get started. Your purchase history will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[var(--azureish-white)]/40 hover:bg-[var(--azureish-white)]/40 border-b border-gray-100">
                    <TableHead className="text-[var(--deep-navy)] font-semibold text-xs uppercase tracking-wider pl-6">
                      Date
                    </TableHead>
                    <TableHead className="text-[var(--deep-navy)] font-semibold text-xs uppercase tracking-wider">
                      Description
                    </TableHead>
                    <TableHead className="text-[var(--deep-navy)] font-semibold text-xs uppercase tracking-wider">
                      Type
                    </TableHead>
                    <TableHead className="text-[var(--deep-navy)] font-semibold text-xs uppercase tracking-wider text-right">
                      Amount
                    </TableHead>
                    <TableHead className="text-[var(--deep-navy)] font-semibold text-xs uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-[var(--deep-navy)] font-semibold text-xs uppercase tracking-wider pr-6">
                      Invoice
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((tx) => {
                    const typeConfig = getTypeConfig(tx.type)
                    const TypeIcon = typeConfig.icon
                    const invoice = tx.invoices?.[0]

                    return (
                      <TableRow
                        key={tx.id}
                        className="border-b border-gray-50 hover:bg-[var(--azureish-white)]/30 transition-colors"
                      >
                        <TableCell className="pl-6 py-4">
                          <div className="text-sm font-medium text-[var(--deep-navy)]">
                            {format(new Date(tx.created_at), "dd MMM yyyy")}
                          </div>
                          <div className="text-xs text-gray-400">
                            {format(new Date(tx.created_at), "HH:mm")}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 max-w-[200px]">
                          <p className="text-sm text-gray-700 truncate" title={tx.description ?? ""}>
                            {tx.description ?? "—"}
                          </p>
                          {tx.payment_reference && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Ref: {tx.payment_reference}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            className={`${typeConfig.badgeClass} border text-xs gap-1.5 font-medium`}
                          >
                            <TypeIcon className="h-3 w-3" />
                            {typeConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <span className={`text-sm ${typeConfig.amountClass}`}>
                            {typeConfig.sign}
                            {Math.abs(tx.amount).toFixed(2)}{" "}
                            <span className="text-xs font-normal">{tx.currency}</span>
                          </span>
                          {tx.tva_amount ? (
                            <div className="text-xs text-gray-400">
                              incl. {tx.tva_amount.toFixed(2)} TVA
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            className={`${getStatusConfig(tx.status)} border text-xs font-medium capitalize`}
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 pr-6">
                          {tx.type === "credit_purchase" && tx.status === "completed" && invoice ? (
                            <InvoiceDownloadButton
                              invoiceId={invoice.id}
                              invoiceNumber={invoice.invoice_number}
                            />
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, transactions.length)} of{" "}
                  {transactions.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="h-8 w-8 p-0 border-gray-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600 min-w-[60px] text-center">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="h-8 w-8 p-0 border-gray-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
