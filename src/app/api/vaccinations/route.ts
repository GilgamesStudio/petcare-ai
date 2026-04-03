import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 200 })

  const petId = req.nextUrl.searchParams.get("petId")

  let query = supabase
    .from("vaccinations")
    .select("*, vet_clinics(name)")
    .order("date_given", { ascending: false })
    .limit(50)

  if (petId) query = query.eq("pet_id", petId)

  const { data } = await query
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { pet_id, name, date_given, next_due, clinic_id, notes } = await req.json()

  if (!pet_id || !name || !date_given) {
    return NextResponse.json({ error: "pet_id, name, date_given required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("vaccinations")
    .insert({
      pet_id, name, date_given,
      next_due: next_due || null,
      clinic_id: clinic_id || null,
      notes: notes || null,
    })
    .select("*, vet_clinics(name)")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
