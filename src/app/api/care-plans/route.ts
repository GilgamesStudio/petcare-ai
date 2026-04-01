import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"

export async function GET(req: NextRequest) {
  try {
    const petId = req.nextUrl.searchParams.get("petId")
    if (!petId) return NextResponse.json({ error: "petId required" }, { status: 400 })

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("care_plans")
      .select("*")
      .eq("pet_id", petId)
      .order("month", { ascending: false })

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
      .from("care_plans")
      .upsert(body, { onConflict: "pet_id,month" })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: "저장 실패" }, { status: 500 })
  }
}
