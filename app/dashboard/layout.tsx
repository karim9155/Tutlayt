import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardNavbar } from "@/components/dashboard-navbar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  const role = profile?.role as "company" | "interpreter" | null

  return (
    <div className="min-h-screen flex flex-col bg-[var(--azureish-white)]">
      <DashboardNavbar role={role} email={user.email} />
      <main className="flex-1 p-4 md:p-8 pt-6">
        {children}
      </main>
    </div>
  )
}
