import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { updateProfile } from "./actions"

export default async function InterpreterProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: interpreter } = await supabase
    .from("interpreters")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[var(--deep-navy)]">Edit Professional Profile</CardTitle>
          <CardDescription className="text-gray-500">
            Complete your profile to increase your visibility and get more missions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="languages" className="text-[var(--deep-navy)]">Languages (comma separated)</Label>
              <Input 
                id="languages" 
                name="languages" 
                placeholder="English, French, Arabic" 
                defaultValue={interpreter?.languages?.join(", ")}
                required 
                className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]"
              />
              <p className="text-xs text-gray-500">E.g. English, French, Arabic</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specializations" className="text-[var(--deep-navy)]">Specializations (comma separated)</Label>
              <Input 
                id="specializations" 
                name="specializations" 
                placeholder="Legal, Medical, Technical" 
                defaultValue={interpreter?.specializations?.join(", ")}
                className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]"
              />
              <p className="text-xs text-gray-500">E.g. Legal, Medical, Technical</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-[var(--deep-navy)]">City</Label>
                <Input 
                  id="city" 
                  name="city" 
                  placeholder="Tunis" 
                  defaultValue={interpreter?.city}
                  required 
                  className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsExperience" className="text-[var(--deep-navy)]">Years of Experience</Label>
                <Input 
                  id="yearsExperience" 
                  name="yearsExperience" 
                  type="number" 
                  min="0"
                  defaultValue={interpreter?.years_experience}
                  required 
                  className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate" className="text-[var(--deep-navy)]">Hourly Rate (TND)</Label>
              <Input 
                id="hourlyRate" 
                name="hourlyRate" 
                type="number" 
                min="0"
                defaultValue={interpreter?.hourly_rate}
                required 
                className="border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-[var(--deep-navy)]">Professional Bio</Label>
              <Textarea 
                id="bio" 
                name="bio" 
                placeholder="Describe your experience and expertise..." 
                className="min-h-[100px] border-gray-200 focus:border-[var(--teal)] focus:ring-[var(--teal)]"
                defaultValue={interpreter?.bio}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" asChild className="border-[var(--deep-navy)] text-[var(--deep-navy)] hover:bg-[var(--azureish-white)]">
                <a href="/dashboard/interpreter">Cancel</a>
              </Button>
              <Button type="submit" className="bg-[var(--deep-navy)] hover:bg-[var(--deep-navy)]/90 text-white">Save Profile</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
