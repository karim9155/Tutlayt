import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { updateCompanyProfile } from "./actions"

export default async function CompanyProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[var(--deep-navy)]">Edit Company Profile</CardTitle>
          <CardDescription className="text-gray-500">
            Update your company details and billing information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateCompanyProfile} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-[var(--deep-navy)]">Company Name</Label>
              <Input 
                id="companyName" 
                name="companyName" 
                defaultValue={company?.company_name}
                required 
                className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fiscalId" className="text-[var(--deep-navy)]">Fiscal ID (Matricule Fiscal)</Label>
              <Input 
                id="fiscalId" 
                name="fiscalId" 
                placeholder="1234567/A/B/000"
                defaultValue={company?.fiscal_id}
                required 
                className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]"
              />
              <p className="text-xs text-gray-500">Required for invoicing.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" className="text-[var(--deep-navy)]">Industry</Label>
              <Input 
                id="industry" 
                name="industry" 
                placeholder="Technology, Healthcare, etc."
                defaultValue={company?.industry}
                className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-[var(--deep-navy)]">Website</Label>
              <Input 
                id="website" 
                name="website" 
                type="url"
                placeholder="https://example.com"
                defaultValue={company?.website}
                className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" asChild className="border-[var(--deep-navy)] text-[var(--deep-navy)] hover:bg-[var(--azureish-white)]">
                <a href="/dashboard/company">Cancel</a>
              </Button>
              <Button type="submit" className="bg-[var(--deep-navy)] hover:bg-[var(--deep-navy)]/90 text-white">Save Profile</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
