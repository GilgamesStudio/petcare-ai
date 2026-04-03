import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { hospital_name, contact_name, phone, email, plan_name } = await req.json()

  if (!hospital_name || !contact_name || !phone || !plan_name) {
    return NextResponse.json({ error: "hospital_name, contact_name, phone, plan_name required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("vet_portal_inquiries")
    .insert({
      user_id: session.user.id,
      hospital_name,
      contact_name,
      phone,
      email: email || null,
      plan_name,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
