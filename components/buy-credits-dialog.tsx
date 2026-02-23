"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Loader2, ShieldCheck, ArrowRight } from "lucide-react"
import { initiateCreditPurchase } from "@/app/actions/payments"
import { toast } from "sonner"

const schema = z.object({
  amount: z
    .string()
    .min(1, "Please enter an amount")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 5, {
      message: "Minimum amount is 5",
    })
    .refine((v) => parseFloat(v) <= 50000, {
      message: "Maximum amount is 50,000",
    }),
})

type FormValues = z.infer<typeof schema>

const TVA_RATE = 0.19

interface BuyCreditsDialogProps {
  currency: string
  isLocal: boolean
  children: React.ReactNode
}

export function BuyCreditsDialog({ currency, isLocal, children }: BuyCreditsDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [subtotal, setSubtotal] = useState(0)
  const [tva, setTva] = useState(0)
  const [total, setTotal] = useState(0)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: "" },
  })

  const amountValue = form.watch("amount")

  useEffect(() => {
    const num = parseFloat(amountValue)
    if (!isNaN(num) && num > 0) {
      const tvaAmount = isLocal ? parseFloat((num * TVA_RATE).toFixed(2)) : 0
      setSubtotal(num)
      setTva(tvaAmount)
      setTotal(parseFloat((num + tvaAmount).toFixed(2)))
    } else {
      setSubtotal(0)
      setTva(0)
      setTotal(0)
    }
  }, [amountValue, isLocal])

  async function onSubmit(values: FormValues) {
    setLoading(true)
    const formData = new FormData()
    formData.set("amount", values.amount)

    const result = await initiateCreditPurchase(formData)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    // If a redirectUrl is returned (Click2Pay), redirect the browser
    if ((result as any)?.redirectUrl) {
      window.location.href = (result as any).redirectUrl
      return
    }

    // Success (test/simulation mode)
    toast.success(result?.message ?? "Credits added successfully!")
    form.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[var(--deep-navy)]">
            <CreditCard className="h-5 w-5 text-[var(--teal)]" />
            Add Credits
          </DialogTitle>
          <DialogDescription>
            Enter the amount you want to add to your balance. You will be redirected to our
            secure payment page to complete the transaction.{" "}
            <span className="text-amber-600 font-medium">
              Note: a 10% platform fee is applied on every booking.
            </span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-2">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[var(--deep-navy)] font-semibold">
                    Amount ({currency})
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="number"
                        min="5"
                        step="0.01"
                        placeholder="Enter amount (min. 5)"
                        className="pr-16 text-lg font-semibold h-12 border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]/20"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">
                        {currency}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {total > 0 && (
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Payment Summary
                </p>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    {subtotal.toFixed(2)} {currency}
                  </span>
                </div>
                {isLocal && (
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>TVA (19%)</span>
                    <span className="font-medium">
                      {tva.toFixed(2)} {currency}
                    </span>
                  </div>
                )}
                <Separator className="my-1" />
                <div className="flex justify-between text-base font-bold text-[var(--deep-navy)]">
                  <span>Total to pay</span>
                  <span>
                    {total.toFixed(2)} {currency}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Your account will be credited with{" "}
                  <strong>
                    {subtotal.toFixed(2)} {currency}
                  </strong>{" "}
                  after payment.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
              <span>You will be redirected to our secure bank payment page (Click2Pay)</span>
            </div>

            <Button
              type="submit"
              disabled={loading || total === 0}
              className="w-full h-12 bg-[var(--deep-navy)] hover:bg-[var(--dark-blue)] text-white font-semibold text-base gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Proceed to Payment
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
