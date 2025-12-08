import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { login } from "@/app/auth/actions"
import { Logo } from "@/components/logo"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message: string }> }) {
  const { message } = await searchParams
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-[var(--azureish-white)]">
      <div className="mb-8">
        <Logo centered />
      </div>
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-[var(--deep-navy)]">Welcome back</CardTitle>
          <CardDescription className="text-gray-500">Enter your email and password to access your account</CardDescription>
        </CardHeader>
        <form action={login}>
          <CardContent className="space-y-4">
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
            {message && (
              <div className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded">{message}</div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full bg-[var(--deep-navy)] hover:bg-[var(--dark-blue)] text-white font-bold" type="submit">
              Log in
            </Button>
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-[var(--teal)] hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
