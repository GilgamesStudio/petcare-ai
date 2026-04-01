import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"

export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get("category")
    const supabase = createServerClient()

    let query = supabase.from("articles").select("*")
    if (category) query = query.eq("category", category)

    const { data, error } = await query.order("created_at", { ascending: false })
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "조회 실패" }, { status: 500 })
  }
}
