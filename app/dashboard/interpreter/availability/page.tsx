import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AvailabilityScheduler } from "@/components/availability-scheduler"

export default async function AvailabilityPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: interpreter } = await supabase
    .from("interpreters")
    .select("weekly_availability")
    .eq("id", user.id)
    .single()

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--deep-navy)]">Weekly Availability</h1>
        <p className="text-[var(--medium-blue)] mt-2">
          Set your generic weekly schedule. You can select the days you are typically available for missions.
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <AvailabilityScheduler initialAvailability={interpreter?.weekly_availability || []} />
      </div>
    </div>
  )
}
