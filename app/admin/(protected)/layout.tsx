import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { createAdminClient } from "@/lib/supabase/admin"

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value === "true"

  if (!isAdmin) {
    redirect("/admin/login")
  }

  // Fetch pending equipment requests count for badge
  let pendingEquipmentCount = 0
  try {
    const supabase = createAdminClient()
    const { count, error } = await supabase
      .from("equipment_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
    if (!error) pendingEquipmentCount = count || 0
  } catch (_) {}

  return (
    <SidebarProvider>
      <AdminSidebar pendingEquipmentCount={pendingEquipmentCount} />
      <main className="w-full">
        <div className="p-4 flex items-center border-b bg-white">
           <SidebarTrigger />
           <span className="ml-4 font-semibold text-gray-500">
             Admin Console
           </span>
        </div>
        <div className="p-6">
            {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
