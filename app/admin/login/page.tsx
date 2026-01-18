
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { adminLogin } from "@/app/admin/actions"
import { Logo } from "@/components/logo"

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-gray-100">
      <div className="mb-8">
        <Logo centered size="lg" />
      </div>
      <Card className="w-full max-w-md shadow-xl border-0 bg-white">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Admin Login</CardTitle>
          <CardDescription className="text-gray-500">Enter your admin credentials</CardDescription>
        </CardHeader>
        <form action={adminLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700">Username</Label>
              <Input id="username" name="username" type="text" placeholder="Username" required className="bg-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <Input id="password" name="password" type="password" required className="bg-white" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-gray-900 text-white hover:bg-gray-800" type="submit">
              Log in
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
