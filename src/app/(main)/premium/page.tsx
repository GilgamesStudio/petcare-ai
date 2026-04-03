"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import {
  Crown, Check, Zap, Star, Shield, Loader2
} from "lucide-react"

interface SubInfo {
  plan: string
  usage: Record<string, number>
  limits: Record<string, number>
}

const PLANS = [
  {
    id: "FREE",
    name: "무료",
    price: "₩0",
    period: "",
    color: "border-gray-200",
    features: [
      "AI 건강체크 월 3회",
      "AI 상담 월 5회",
      "영양 분석 월 1회",
      "커뮤니티 이용",
      "응급 가이드",
    ],
    limits: ["품종 가이드 월 2회", "진료기록 저장"],
  },
  {
    id: "BASIC",
    name: "베이직",
    price: "₩4,900",
    period: "/월",
    color: "border-emerald-500",
    popular: true,
    features: [
      "AI 건강체크 무제한",
      "AI 상담 무제한",
      "영양 분석 월 10회",
      "품종 가이드 무제한",
      "커뮤니티 이용",
      "응급 가이드",
      "진료기록 저장",
    ],
    limits: [],
  },
  {
    id: "PRO",
    name: "프로",
    price: "₩9,900",
    period: "/월",
    color: "border-purple-500",
    features: [
      "베이직 모든 기능",
      "AI 분석 전체 무제한",
      "월간 건강 리포트",
      "우선 AI 응답",
      "수의사 상담 연결",
      "광고 제거",
    ],
    limits: [],
  },
]

const FEATURE_LABELS: Record<string, string> = {
  health_check: "AI 건강체크",
  chat: "AI 상담",
  nutrition: "영양 분석",
  breed_guide: "품종 가이드",
}

export default function PremiumPage() {
  const [subInfo, setSubInfo] = useState<SubInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [changing, setChanging] = useState(false)

  useEffect(() => {
    fetch("/api/subscription").then(r => r.json()).then(data => {
      if (data.plan) setSubInfo(data)
      setLoading(false)
    })
  }, [])

  async function changePlan(planId: string) {
    if (planId === subInfo?.plan) return
    if (planId !== "FREE" && !confirm(`${PLANS.find(p => p.id === planId)?.name} 플랜으로 변경하시겠습니까?\n(데모 버전에서는 실제 결제가 발생하지 않습니다)`)) return

    setChanging(true)
    const res = await fetch("/api/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "change_plan", plan: planId }),
    })
    const data = await res.json()
    if (data.success) {
      setSubInfo(prev => prev ? { ...prev, plan: planId } : prev)
      alert(planId === "FREE" ? "무료 플랜으로 변경되었습니다." : "플랜이 변경되었습니다!")
    }
    setChanging(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">불러오는 중...</div>

  return (
    <>
      <Header title="프리미엄" showBack />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-6">
        {/* Current Plan */}
        {subInfo && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">현재 플랜</span>
            </div>
            <p className="text-2xl font-bold">{PLANS.find(p => p.id === subInfo.plan)?.name || "무료"}</p>

            {/* Usage */}
            <div className="mt-4 space-y-2">
              {Object.entries(subInfo.limits).map(([key, limit]) => {
                const used = subInfo.usage[key] || 0
                const isUnlimited = limit >= 999
                const pct = isUnlimited ? 0 : Math.min(100, (used / limit) * 100)
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-xs opacity-90 mb-0.5">
                      <span>{FEATURE_LABELS[key] || key}</span>
                      <span>{isUnlimited ? "무제한" : `${used}/${limit}`}</span>
                    </div>
                    {!isUnlimited && (
                      <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${pct >= 90 ? "bg-red-300" : "bg-white/80"}`} style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="space-y-4">
          {PLANS.map(plan => {
            const isCurrent = subInfo?.plan === plan.id
            return (
              <div key={plan.id} className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${isCurrent ? plan.color : "border-transparent"} relative`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                    인기
                  </span>
                )}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                      {plan.id === "PRO" && <Star className="w-4 h-4 text-purple-500" />}
                      {plan.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="text-xl font-bold text-gray-900">{plan.price}</span>
                      {plan.period}
                    </p>
                  </div>
                  {isCurrent ? (
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">사용중</span>
                  ) : (
                    <button
                      onClick={() => changePlan(plan.id)}
                      disabled={changing}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        plan.id === "FREE"
                          ? "bg-gray-100 text-gray-600"
                          : plan.id === "BASIC"
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-purple-600 text-white hover:bg-purple-700"
                      } disabled:opacity-40`}
                    >
                      {changing ? <Loader2 className="w-4 h-4 animate-spin" /> : plan.id === "FREE" ? "다운그레이드" : "시작하기"}
                    </button>
                  )}
                </div>

                <ul className="space-y-1.5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="bg-gray-50 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3">자주 묻는 질문</h3>
          <div className="space-y-3 text-xs text-gray-600">
            <div>
              <p className="font-medium text-gray-700">언제든 해지할 수 있나요?</p>
              <p>네, 언제든 무료 플랜으로 변경할 수 있습니다. 남은 기간은 환불됩니다.</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">무료 체험은 있나요?</p>
              <p>무료 플랜으로 기본 기능을 체험해보세요. 업그레이드는 언제든 가능합니다.</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">결제 수단은 무엇인가요?</p>
              <p>신용카드, 체크카드, 카카오페이, 네이버페이를 지원합니다.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
