import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { logout } from "@/app/auth/actions"
import { Logo } from "@/components/logo"

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let role = null
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    role = profile?.role
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--teal)]/10 bg-[var(--azureish-white)]/80 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--azureish-white)]/60">
      <div className="container mx-auto flex h-24 items-center justify-between px-4">
        <Logo />

        <nav className="hidden md:flex items-center gap-8">
          {role === 'company' ? (
            <>
              <Link href="/dashboard/search" className="text-sm font-medium text-[var(--deep-navy)] hover:text-[var(--teal)] transition-colors">
                Find Interpreters
              </Link>
              <Link href="/dashboard/company" className="text-sm font-medium text-[var(--deep-navy)] hover:text-[var(--teal)] transition-colors">
                Dashboard
              </Link>
            </>
          ) : role === 'interpreter' ? (
            <>
              <Link href="/dashboard/interpreter" className="text-sm font-medium text-[var(--deep-navy)] hover:text-[var(--teal)] transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard/interpreter/profile" className="text-sm font-medium text-[var(--deep-navy)] hover:text-[var(--teal)] transition-colors">
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link href="/search" className="text-sm font-medium text-[var(--deep-navy)] hover:text-[var(--teal)] transition-colors">
                Find a Pro
              </Link>
              <Link href="/signup?role=company" className="text-sm font-medium text-[var(--deep-navy)] hover:text-[var(--teal)] transition-colors">
                For Companies
              </Link>
              <Link href="/signup?role=interpreter" className="text-sm font-medium text-[var(--deep-navy)] hover:text-[var(--teal)] transition-colors">
                For Interpreters
              </Link>
              <Link href="/#how-it-works" className="text-sm font-medium text-[var(--deep-navy)] hover:text-[var(--teal)] transition-colors">
                How it Works
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium hidden md:block text-[var(--deep-navy)]">
                {user.email}
              </span>
              <form action={logout}>
                <Button variant="ghost" size="sm" className="text-[var(--deep-navy)] hover:text-[var(--destructive)]">Log out</Button>
              </form>
            </div>
          ) : (
            <>
              <Link href="/login" className="hidden md:block text-sm font-medium text-[var(--deep-navy)] hover:text-[var(--teal)]">
                Log in
              </Link>
              <Link href="/signup">
                <Button className="bg-[var(--teal)] text-white hover:bg-[var(--teal-blue)] rounded-full px-6 shadow-lg shadow-teal-900/10 transition-all hover:shadow-teal-900/20 font-semibold">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden text-[var(--deep-navy)]">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  )
}
