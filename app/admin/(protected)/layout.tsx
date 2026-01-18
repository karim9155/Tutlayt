import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

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

  return (
    <SidebarProvider>
      <AdminSidebar />
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
