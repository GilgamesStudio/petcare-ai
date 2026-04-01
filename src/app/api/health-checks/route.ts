import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"

export async function GET(req: NextRequest) {
  try {
    const petId = req.nextUrl.searchParams.get("petId")
    const supabase = createServerClient()

    let query = supabase.from("health_checks").select("*, pets(name, species)")
    if (petId) query = query.eq("pet_id", petId)

    const { data, error } = await query.order("created_at", { ascending: false }).limit(50)
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "조회 실패" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("health_checks")
      .insert(body)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: "저장 실패" }, { status: 500 })
  }
}
