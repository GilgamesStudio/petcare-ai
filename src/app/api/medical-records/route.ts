import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 200 })

  const petId = req.nextUrl.searchParams.get("petId")

  let query = supabase
    .from("medical_records")
    .select("*, vet_clinics(name)")
    .order("visit_date", { ascending: false })
    .limit(50)

  if (petId) query = query.eq("pet_id", petId)

  const { data } = await query
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { pet_id, clinic_id, visit_date, reason, diagnosis, treatment, prescription, cost, next_visit, notes } = body

  if (!pet_id || !visit_date || !reason) {
    return NextResponse.json({ error: "pet_id, visit_date, reason required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("medical_records")
    .insert({
      pet_id, clinic_id: clinic_id || null, visit_date, reason,
      diagnosis: diagnosis || null, treatment: treatment || null,
      prescription: prescription || null, cost: cost || null,
      next_visit: next_visit || null, notes: notes || null,
    })
    .select("*, vet_clinics(name)")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
