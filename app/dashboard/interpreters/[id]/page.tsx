import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { InterpreterProfileView } from "@/components/interpreter-profile-view"

export default async function DashboardInterpreterProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: interpreter, error } = await supabase
    .from('interpreters')
    .select(`
      *,
      profiles (
        full_name,
        avatar_url
      )
    `)
    .eq('id', id)
    .single()

  if (error || !interpreter) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--deep-navy)]">Interpreter Profile</h1>
      <InterpreterProfileView interpreter={interpreter} />
    </div>
  )
}
