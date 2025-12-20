import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClientProfileForm } from "@/components/client-profile-form"

export default async function ClientProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--deep-navy)]">Edit Client Profile</h1>
        <p className="text-[var(--medium-blue)]">Update your organization details and billing information.</p>
      </div>
      
      <ClientProfileForm profile={profile} company={company} />
    </div>
  )
}
