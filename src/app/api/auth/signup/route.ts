import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createServerClient } from "@/lib/supabase-server"

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "모든 필드를 입력해주세요" }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single()

    if (existing) {
      return NextResponse.json({ error: "이미 사용 중인 이메일입니다" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const { data, error } = await supabase
      .from("users")
      .insert({ email, password: hashedPassword, name })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "회원가입에 실패했습니다" }, { status: 500 })
    }

    return NextResponse.json({ id: data.id, email: data.email, name: data.name }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
