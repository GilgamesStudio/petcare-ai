import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { company_name, contact_name, email, interest_area, plan_name } = await req.json()

  if (!company_name || !contact_name || !email || !plan_name) {
    return NextResponse.json({ error: "company_name, contact_name, email, plan_name required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("data_partnership_inquiries")
    .insert({
      user_id: session.user.id,
      company_name,
      contact_name,
      email,
      interest_area,
      plan_name,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
