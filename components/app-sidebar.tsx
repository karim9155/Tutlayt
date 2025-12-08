"use client"

import { Calendar, Home, Search, Settings, User, LogOut, Briefcase } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/auth/actions"
import { Logo } from "@/components/logo"

// Menu items for Company
const companyItems = [
  {
    title: "Dashboard",
    url: "/dashboard/company",
    icon: Home,
  },
  {
    title: "Find Interpreters",
    url: "/dashboard/search",
    icon: Search,
  },
  {
    title: "My Bookings",
    url: "/dashboard/company/bookings", // Assuming this route exists or will exist
    icon: Calendar,
  },
  {
    title: "Profile",
    url: "/dashboard/company/profile",
    icon: User,
  },
  {
    title: "Settings",
    url: "/dashboard/company/settings",
    icon: Settings,
  },
]

// Menu items for Interpreter
const interpreterItems = [
  {
    title: "Dashboard",
    url: "/dashboard/interpreter",
    icon: Home,
  },
  {
    title: "My Availability",
    url: "/dashboard/interpreter/availability", // Or just part of dashboard
    icon: Calendar,
  },
  {
    title: "My Missions",
    url: "/dashboard/interpreter/missions",
    icon: Briefcase,
  },
  {
    title: "Profile",
    url: "/dashboard/interpreter/profile",
    icon: User,
  },
  {
    title: "Settings",
    url: "/dashboard/interpreter/settings",
    icon: Settings,
  },
]

interface AppSidebarProps {
  role: "company" | "interpreter" | "admin" | null
}

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname()
  const items = role === "interpreter" ? interpreterItems : companyItems

  return (
    <Sidebar collapsible="icon" className="border-r border-[var(--teal)]/10 bg-white">
      <SidebarHeader className="p-4 border-b border-[var(--teal)]/10">
        <Logo className="justify-center" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[var(--deep-navy)]/70">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title} className="hover:bg-[var(--azureish-white)] hover:text-[var(--deep-navy)] data-[active=true]:bg-[var(--teal)]/10 data-[active=true]:text-[var(--deep-navy)]">
                    <Link href={item.url}>
                      <item.icon className="text-[var(--teal)]" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-[var(--teal)]/10">
        <SidebarMenu>
            <SidebarMenuItem>
                <form action={logout}>
                    <SidebarMenuButton type="submit" tooltip="Logout" className="hover:bg-red-50 hover:text-red-600">
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </form>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
