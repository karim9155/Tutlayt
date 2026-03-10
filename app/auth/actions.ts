"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
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

export async function loginWithAccessCode(formData: FormData) {
  const code = (formData.get("code") as string)?.trim().toUpperCase()
  const fullName = (formData.get("fullName") as string)?.trim()
  const email = (formData.get("email") as string)?.trim().toLowerCase()

  if (!code || !fullName || !email) {
    return redirect(`/login?tab=access-code&message=${encodeURIComponent("Please fill in all fields.")}`)
  }

  const adminClient = createAdminClient()

  // 1. Validate the code — must exist and not yet used
  const { data: codeRow, error: codeError } = await adminClient
    .from("one_time_access_codes")
    .select("*")
    .eq("code", code)
    .eq("used", false)
    .single()

  if (codeError || !codeRow) {
    return redirect(`/login?tab=access-code&message=${encodeURIComponent("Invalid or already used access code.")}`)
  }

  // 2. Generate a random password that is never shared with the client
  const randomPassword = crypto.randomUUID()

  // 3. Create the auth user; email_confirm: true skips email verification
  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password: randomPassword,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      company_name: fullName,
      role: "company",
      phone: "",
    },
  })

  if (createError) {
    console.error("Error creating one-time user:", createError)
    return redirect(
      `/login?tab=access-code&message=${encodeURIComponent(createError.message)}`
    )
  }

  const userId = newUser.user.id

  // 4. The DB trigger creates the profiles + companies rows automatically.
  //    Mark as one-time client. Verification status stays 'unverified' so the
  //    client must sign required documents before accessing the platform.
  await adminClient
    .from("companies")
    .update({ client_type: "one_time" })
    .eq("id", userId)

  // 5. Mark the code as used
  await adminClient
    .from("one_time_access_codes")
    .update({
      used: true,
      used_by_email: email,
      used_by_name: fullName,
      used_by_user_id: userId,
      used_at: new Date().toISOString(),
    })
    .eq("id", codeRow.id)

  // 6. Sign in as the new user so the session cookie is set
  const serverClient = await createClient()
  const { error: signInError } = await serverClient.auth.signInWithPassword({
    email,
    password: randomPassword,
  })

  if (signInError) {
    console.error("Error signing in one-time user:", signInError)
    return redirect(`/login?message=${encodeURIComponent("Account created but sign-in failed. Please try again.")}`)
  }

  return redirect("/dashboard")
}
