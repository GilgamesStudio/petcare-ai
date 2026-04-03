import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

const PLAN_LIMITS: Record<string, Record<string, number>> = {
  FREE: { health_check: 3, chat: 5, nutrition: 1, breed_guide: 2 },
  BASIC: { health_check: 999, chat: 999, nutrition: 10, breed_guide: 999 },
  PRO: { health_check: 999, chat: 999, nutrition: 999, breed_guide: 999 },
}

// GET: 구독 정보 + 이번 달 사용량
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // 구독 정보
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle()

  const plan = sub?.plan || "FREE"

  // 이번 달 사용량
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: usageLogs } = await supabase
    .from("usage_logs")
    .select("feature")
    .eq("user_id", session.user.id)
    .gte("used_at", startOfMonth.toISOString())

  const usage: Record<string, number> = {}
  for (const log of usageLogs || []) {
    usage[log.feature] = (usage[log.feature] || 0) + 1
  }

  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.FREE

  return NextResponse.json({
    plan,
    status: sub?.status || "ACTIVE",
    expiresAt: sub?.expires_at,
    usage,
    limits,
  })
}

// POST: 사용량 기록 or 구독 변경
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { action, feature, plan } = await req.json()

  if (action === "log_usage") {
    // 사용량 기록
    await supabase.from("usage_logs").insert({ user_id: session.user.id, feature })
    return NextResponse.json({ success: true })
  }

  if (action === "change_plan") {
    // 구독 변경 (실제로는 결제 연동 필요)
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", session.user.id)
      .maybeSingle()

    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 1)

    if (existing) {
      await supabase
        .from("subscriptions")
        .update({ plan, status: "ACTIVE", expires_at: expiresAt.toISOString() })
        .eq("id", existing.id)
    } else {
      await supabase
        .from("subscriptions")
        .insert({ user_id: session.user.id, plan, status: "ACTIVE", expires_at: expiresAt.toISOString() })
    }

    return NextResponse.json({ success: true, plan })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
