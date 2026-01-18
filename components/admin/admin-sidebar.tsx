"use client"

import { Home, FileText, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { adminLogout } from "@/app/admin/actions"
import { Logo } from "@/components/logo"

const adminItems = [
  {
    title: "Verification",
    url: "/admin",
    icon: Home,
  },
  {
    title: "Documents",
    url: "/admin/documents",
    icon: FileText,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-white/10 px-4 py-4">
        <Logo size="sm" variant="light" disableLink />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2">Admin Panel</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url} 
                    tooltip={item.title}
                    className="text-gray-300 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/20 data-[active=true]:text-white"
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-white/10 p-4">
        <form action={adminLogout}>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-white/10" 
            type="submit"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  )
}
