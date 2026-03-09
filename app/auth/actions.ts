"use server"

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  return redirect("/dashboard")
}

export async function signup(formData: FormData) {
  const origin = (await headers()).get("origin")
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string
  const phone = formData.get("phone") as string
  const role = formData.get("role") as "interpreter" | "company"

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,   // read by the DB trigger to set profiles.full_name
        company_name: fullName, // read by the DB trigger to set companies.company_name
        role: role,
        phone: phone,
      },
    },
  })

  if (error) {
    console.error(error)
    return redirect(`/signup?message=${encodeURIComponent(error.message)}`)
  }

  return redirect("/login?signup=success")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect("/login")
}
