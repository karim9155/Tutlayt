"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Home, Search, User, LogOut, Briefcase, CreditCard, Headphones, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/auth/actions"
import { Logo } from "@/components/logo"

const clientItems = [
  { title: "Dashboard", url: "/dashboard/client", icon: Home },
  { title: "Find Interpreters", url: "/dashboard/search", icon: Search },
  { title: "Rent Equipment", url: "/equipment", icon: Headphones },
  { title: "My Bookings", url: "/dashboard/client/bookings", icon: Calendar },
  { title: "My Requests", url: "/dashboard/client/requests", icon: Briefcase },
  { title: "Payments", url: "/dashboard/client/payments", icon: CreditCard },
  { title: "Profile", url: "/dashboard/client/profile", icon: User },
]

const interpreterItems = [
  { title: "Dashboard", url: "/dashboard/interpreter", icon: Home },
  { title: "My Availability", url: "/dashboard/interpreter/availability", icon: Calendar },
  { title: "My Missions", url: "/dashboard/interpreter/missions", icon: Briefcase },
  { title: "Profile", url: "/dashboard/interpreter/profile", icon: User },
]

interface DashboardNavbarProps {
  role: "company" | "interpreter" | "admin" | null
  email?: string | null
}

export function DashboardNavbar({ role, email }: DashboardNavbarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const items = role === "interpreter" ? interpreterItems : clientItems

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--teal)]/10 bg-[var(--azureish-white)]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--azureish-white)]/80 shadow-sm">
      <div className="mx-auto flex h-16 items-center justify-between px-4 md:px-8 max-w-screen-2xl">
        {/* Logo */}
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {items.map((item) => {
            const isActive = pathname === item.url
            return (
              <Link
                key={item.title}
                href={item.url}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--teal)] text-white"
                    : "text-[var(--deep-navy)] hover:bg-[var(--teal)]/10 hover:text-[var(--teal)]"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>

        {/* Right side: email + logout */}
        <div className="hidden md:flex items-center gap-3">
          {email && (
            <span className="text-sm text-[var(--deep-navy)]/70 font-medium">{email}</span>
          )}
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="flex items-center gap-1.5 text-[var(--deep-navy)] hover:text-red-500 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-[var(--deep-navy)] hover:bg-[var(--teal)]/10"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--teal)]/10 bg-[var(--azureish-white)] px-4 py-3 flex flex-col gap-1">
          {items.map((item) => {
            const isActive = pathname === item.url
            return (
              <Link
                key={item.title}
                href={item.url}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--teal)] text-white"
                    : "text-[var(--deep-navy)] hover:bg-[var(--teal)]/10 hover:text-[var(--teal)]"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
          <div className="border-t border-[var(--teal)]/10 mt-2 pt-2">
            {email && (
              <p className="text-xs text-[var(--deep-navy)]/60 px-3 mb-2">{email}</p>
            )}
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--deep-navy)] hover:text-red-500 hover:bg-red-50 w-full transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}
