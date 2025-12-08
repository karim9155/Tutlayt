import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { logout } from "@/app/auth/actions"
import { CreditCard, Plus, Calendar, Search, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function CompanyDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  // Verify role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "company") {
    return redirect("/dashboard")
  }

  // Fetch company details and bookings
  const { data: company } = await supabase
    .from("companies")
    .select("credits, fiscal_id")
    .eq("id", user.id)
    .single()

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, interpreters(full_name)")
    .eq("company_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--deep-navy)]">Company Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your bookings and credits.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white border border-[var(--teal)]/20 px-4 py-2 rounded-xl shadow-sm flex items-center gap-3">
            <div className="bg-[var(--teal)]/10 p-2 rounded-lg">
              <CreditCard className="h-5 w-5 text-[var(--teal)]" />
            </div>
            <div>
              <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">Credits</span>
              <span className="font-bold text-[var(--deep-navy)] text-xl">{company?.credits || 0}</span>
            </div>
          </div>
          <Button className="bg-[var(--teal)] hover:bg-[var(--teal-blue)] text-white shadow-lg shadow-teal-500/20">
            <Plus className="mr-2 h-4 w-4" /> Buy Packs
          </Button>
        </div>
      </div>

      {!company?.fiscal_id && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800">Profile Incomplete</h4>
            <p className="text-sm text-amber-700 mt-1">
              Please complete your profile by adding your <strong>Fiscal ID</strong> to enable invoicing.
              <Link href="/dashboard/company/profile" className="font-bold underline ml-2 hover:text-amber-900">
                Update Profile
              </Link>
            </p>
          </div>
        </div>
      )}
      
      <div className="grid gap-8 md:grid-cols-3">
        <Card className="md:col-span-2 border-gray-100 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-[var(--deep-navy)]">Active Bookings</CardTitle>
              <CardDescription className="text-gray-500">Your recent and upcoming missions.</CardDescription>
            </div>
            <Link href="/dashboard/company/bookings">
              <Button variant="ghost" size="sm" className="text-[var(--teal)] hover:text-[var(--teal-blue)] hover:bg-[var(--teal)]/10">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {bookings && bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking: any) => (
                  <div key={booking.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl bg-[var(--azureish-white)]/50 hover:bg-[var(--azureish-white)] transition-colors border border-gray-100">
                    <div className="flex items-start gap-4 mb-3 sm:mb-0">
                      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <Calendar className="h-5 w-5 text-[var(--teal)]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--deep-navy)]">{booking.mission_title}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <span>{new Date(booking.start_time).toLocaleDateString()}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>{booking.interpreters?.full_name}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <Badge className={`${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                        'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } border-0`}>
                        {booking.status}
                      </Badge>
                      <Button size="sm" variant="outline" className="h-8 border-[var(--deep-navy)]/20 text-[var(--deep-navy)] hover:bg-[var(--deep-navy)]/5">Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[var(--azureish-white)]/30 rounded-xl border border-dashed border-gray-200">
                <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                  <Calendar className="h-full w-full" />
                </div>
                <h3 className="text-lg font-medium text-[var(--deep-navy)]">No bookings yet</h3>
                <p className="text-gray-500 mt-1 mb-6">Get started by finding an interpreter for your needs.</p>
                <Link href="/search">
                  <Button className="bg-[var(--deep-navy)] text-white hover:bg-[var(--dark-blue)]">
                    <Search className="mr-2 h-4 w-4" /> Find Interpreters
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-[var(--deep-navy)] text-white border-0 shadow-lg shadow-blue-900/20">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/search" className="block">
                <Button variant="secondary" className="w-full justify-start bg-white/10 text-white hover:bg-white/20 border-0 h-12">
                  <Search className="mr-2 h-4 w-4" /> Find Interpreter
                </Button>
              </Link>
              <Link href="/dashboard/company/profile" className="block">
                <Button variant="secondary" className="w-full justify-start bg-white/10 text-white hover:bg-white/20 border-0 h-12">
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-[var(--deep-navy)]">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Our support team is available 24/7 to assist you with your bookings.
              </p>
              <Button variant="outline" className="w-full border-[var(--teal)] text-[var(--teal)] hover:bg-[var(--teal)]/5">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
