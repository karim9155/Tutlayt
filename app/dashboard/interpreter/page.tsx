import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AvailabilityCalendar } from "@/components/availability-calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/auth/actions"
import { Wallet, AlertCircle, Briefcase, Calendar, Star, User, Settings } from "lucide-react"

export default async function InterpreterDashboard() {
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

  if (profile?.role !== "interpreter") {
    return redirect("/dashboard")
  }

  // Fetch interpreter details and bookings
  const { data: interpreter } = await supabase
    .from("interpreters")
    .select("wallet_balance, verified, languages, specializations")
    .eq("id", user.id)
    .single()

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, companies(company_name)")
    .eq("interpreter_id", user.id)
    .order("start_time", { ascending: true })
    .limit(5)

  const isProfileComplete = interpreter?.languages?.length > 0 && interpreter?.specializations?.length > 0

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--deep-navy)]">Interpreter Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your availability and missions.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white border border-[var(--teal)]/20 px-4 py-2 rounded-xl shadow-sm flex items-center gap-3">
            <div className="bg-[var(--azureish-white)] p-2 rounded-lg">
              <Wallet className="h-5 w-5 text-[var(--teal)]" />
            </div>
            <div>
              <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">Balance</span>
              <span className="font-bold text-[var(--deep-navy)] text-xl">${interpreter?.wallet_balance || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {!isProfileComplete && (
        <div className="bg-[var(--azureish-white)] border border-[var(--teal)]/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[var(--teal)] mt-0.5" />
          <div>
            <h4 className="font-semibold text-[var(--deep-navy)]">Profile Incomplete</h4>
            <p className="text-sm text-[var(--deep-navy)]/80 mt-1">
              Your profile is incomplete. Complete it to appear in search results.
              <Link href="/dashboard/interpreter/profile" className="font-bold underline ml-2 hover:text-[var(--teal)]">
                Complete Profile
              </Link>
            </p>
          </div>
        </div>
      )}
      
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[var(--deep-navy)]">Upcoming Missions</h2>
              <Link href="/dashboard/interpreter/missions">
                <Button variant="ghost" size="sm" className="text-[var(--teal)]">View All</Button>
              </Link>
            </div>
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-0">
                {bookings && bookings.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {bookings.map((booking: any) => (
                      <div key={booking.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4 mb-3 sm:mb-0">
                          <div className="bg-[var(--azureish-white)] p-3 rounded-lg">
                            <Briefcase className="h-5 w-5 text-[var(--teal)]" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[var(--deep-navy)]">{booking.mission_title}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                              <span className="font-medium text-gray-700">{booking.companies?.company_name}</span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span>{new Date(booking.start_time).toLocaleDateString()}</span>
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="border-[var(--teal)] text-[var(--teal)] hover:bg-[var(--teal)]/5">
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <Calendar className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No upcoming missions.</p>
                    <p className="text-sm text-gray-400 mt-1">Make sure your availability is up to date.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section>
             <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[var(--deep-navy)]">Availability</h2>
            </div>
            <Card className="border-gray-100 shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <AvailabilityCalendar interpreterId={user.id} />
              </CardContent>
            </Card>
          </section>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-[var(--deep-navy)] to-[var(--teal)] text-white border-0 shadow-lg shadow-[var(--deep-navy)]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-blue-100">Rating</span>
                <span className="font-bold text-xl">4.9/5.0</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-blue-100">Completed Missions</span>
                <span className="font-bold text-xl">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Response Rate</span>
                <span className="font-bold text-xl">98%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[var(--deep-navy)]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/interpreter/profile" className="block">
                <Button variant="outline" className="w-full justify-start h-12 hover:bg-gray-50">
                  <User className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              </Link>
              <Link href="/dashboard/interpreter/settings" className="block">
                <Button variant="outline" className="w-full justify-start h-12 hover:bg-gray-50">
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
