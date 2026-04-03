import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { pet_id, plan_name, name, phone } = await req.json()

  if (!plan_name || !name || !phone) {
    return NextResponse.json({ error: "plan_name, name, phone required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("insurance_inquiries")
    .insert({
      user_id: session.user.id,
      pet_id: pet_id || null,
      plan_name,
      name,
      phone,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
