import { createClient } from "@/lib/supabase/server"
import { VerificationBanner } from "@/components/verification-banner"

export default async function InterpreterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <>{children}</>
  }

  const { data: interpreter } = await supabase
    .from("interpreters")
    .select("verified, signed_policy_url")
    .eq("id", user.id)
    .single()

  return (
    <div className="flex flex-col min-h-full">
      <VerificationBanner 
        isVerified={interpreter?.verified || false} 
        hasUploadedPolicy={!!interpreter?.signed_policy_url} 
      />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
