import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { signup } from "@/app/auth/actions"
import { Logo } from "@/components/logo"
import { ClientSignupForm } from "@/components/client-signup-form"

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ message: string, role: string }> }) {
  const { message, role } = await searchParams
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-[var(--azureish-white)]">
      <div className="mb-8">
        <Logo centered size="lg" />
      </div>
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-[var(--deep-navy)]">Create an account</CardTitle>
          <CardDescription className="text-gray-500">Choose your account type to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={role === 'company' || role === 'client' ? 'company' : 'interpreter'} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-[var(--azureish-white)]">
              <TabsTrigger value="interpreter" className="data-[state=active]:bg-[var(--teal)] data-[state=active]:text-white">Interpreter</TabsTrigger>
              <TabsTrigger value="company" className="data-[state=active]:bg-[var(--deep-navy)] data-[state=active]:text-white">Client</TabsTrigger>
            </TabsList>

            <TabsContent value="interpreter">
              <form action={signup}>
                <input type="hidden" name="role" value="interpreter" />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-[var(--deep-navy)]">Full Name</Label>
                    <Input id="fullName" name="fullName" placeholder="John Doe" required className="bg-white border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-interpreter" className="text-[var(--deep-navy)]">Email</Label>
                    <Input id="email-interpreter" name="email" type="email" placeholder="m@example.com" required className="bg-white border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-interpreter" className="text-[var(--deep-navy)]">Password</Label>
                    <Input id="password-interpreter" name="password" type="password" required className="bg-white border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]" />
                  </div>
                  <Button className="w-full mt-4 bg-[var(--teal)] hover:bg-[var(--teal-blue)] text-white font-bold" type="submit">
                    Sign Up as Interpreter
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="company">
              <ClientSignupForm />
            </TabsContent>
          </Tabs>
          {message && (
            <div className="mt-4 text-sm text-red-500 font-medium bg-red-50 p-2 rounded">{message}</div>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-center text-sm w-full text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--teal)] hover:underline font-medium">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
