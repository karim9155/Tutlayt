import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { login, loginWithAccessCode } from "@/app/auth/actions"
import { Logo } from "@/components/logo"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message: string, signup: string, tab: string }> }) {
  const { message, signup, tab } = await searchParams
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-[var(--azureish-white)]">
      <div className="mb-8">
        <Logo centered size="lg" />
      </div>
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-[var(--deep-navy)]">Welcome back</CardTitle>
          <CardDescription className="text-gray-500">Sign in to your account or use a one-time access code</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={tab === "access-code" ? "access-code" : "email"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-[var(--azureish-white)]">
              <TabsTrigger value="email" className="data-[state=active]:bg-[var(--deep-navy)] data-[state=active]:text-white">
                Email &amp; Password
              </TabsTrigger>
              <TabsTrigger value="access-code" className="data-[state=active]:bg-[var(--teal)] data-[state=active]:text-white">
                Access Code
              </TabsTrigger>
            </TabsList>

            {/* ── Standard login ── */}
            <TabsContent value="email">
              <form action={login}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[var(--deep-navy)]">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="m@example.com" required className="bg-white border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-[var(--deep-navy)]">Password</Label>
                      <Link href="#" className="text-xs text-[var(--teal)] hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input id="password" name="password" type="password" required className="bg-white border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]" />
                  </div>
                  {signup === "success" && (
                    <div className="text-sm text-green-700 font-medium bg-green-50 border border-green-200 p-3 rounded flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span>Account created successfully! You can now log in.</span>
                    </div>
                  )}
                  {tab !== "access-code" && message && (
                    <div className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded">{message}</div>
                  )}
                  <Button className="w-full mt-2 bg-[var(--deep-navy)] hover:bg-[var(--dark-blue)] text-white font-bold" type="submit">
                    Log in
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* ── One-time access code ── */}
            <TabsContent value="access-code">
              <form action={loginWithAccessCode}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName-code" className="text-[var(--deep-navy)]">Full Name</Label>
                    <Input
                      id="fullName-code"
                      name="fullName"
                      placeholder="Jane Doe"
                      required
                      className="bg-white border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-code" className="text-[var(--deep-navy)]">Email</Label>
                    <Input
                      id="email-code"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="bg-white border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-[var(--deep-navy)]">Access Code</Label>
                    <Input
                      id="code"
                      name="code"
                      placeholder="ABC-12345"
                      required
                      className="bg-white border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)] uppercase tracking-widest font-mono"
                    />
                    <p className="text-xs text-gray-500">Enter the one-time code provided by the administrator.</p>
                  </div>
                  {tab === "access-code" && message && (
                    <div className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded">{message}</div>
                  )}
                  <Button className="w-full mt-2 bg-[var(--teal)] hover:bg-[var(--teal-blue)] text-white font-bold" type="submit">
                    Access Platform
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <div className="text-center text-sm w-full text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[var(--teal)] hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
