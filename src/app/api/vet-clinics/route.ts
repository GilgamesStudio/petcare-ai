import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 200 })

  const { data } = await supabase
    .from("vet_clinics")
    .select("*")
    .eq("user_id", session.user.id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false })

  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, address, phone, notes, is_primary } = await req.json()
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 })

  // 기본 병원 설정 시 기존 기본 병원 해제
  if (is_primary) {
    await supabase
      .from("vet_clinics")
      .update({ is_primary: false })
      .eq("user_id", session.user.id)
  }

  const { data, error } = await supabase
    .from("vet_clinics")
    .insert({ user_id: session.user.id, name, address, phone, notes, is_primary: is_primary || false })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
