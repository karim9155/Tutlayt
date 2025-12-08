import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role === "interpreter") {
    return redirect("/dashboard/interpreter")
  } else if (profile?.role === "company") {
    return redirect("/dashboard/company")
  } else {
    // Fallback or admin
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Welcome, {user.email}</p>
      </div>
    )
  }
}
