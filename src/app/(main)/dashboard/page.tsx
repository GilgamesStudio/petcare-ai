"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Header } from "@/components/layout/header"
import Link from "next/link"
import {
  Eye, Brush, SmilePlus, Ear, Footprints, Activity,
  Plus, ChevronRight, Heart, MessageCircle, BookOpen, Users, AlertCircle,
  Hospital, UtensilsCrossed, ShieldAlert, Shield, Crown, ShoppingBag, Building2, Database
} from "lucide-react"

interface Pet {
  id: string
  name: string
  species: string
  breed: string | null
  photo_url: string | null
  health_checks: { id: string; check_type: string; score: number; status: string; created_at: string }[]
}

const checkIcons: Record<string, typeof Eye> = {
  EYES: Eye, SKIN: Brush, TEETH: SmilePlus, EARS: Ear, PAWS: Footprints, GAIT: Activity,
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/pets")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPets(data) })
      .finally(() => setLoading(false))
  }, [])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "좋은 아침이에요"
    if (hour < 18) return "좋은 오후에요"
    return "좋은 저녁이에요"
  }

  return (
    <>
      <Header title="PetCare AI" />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-6">
        {/* Greeting */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 text-white">
          <p className="text-sm opacity-90">{greeting()}</p>
          <h2 className="text-xl font-bold mt-1">
            {session?.user?.name || "보호자"}님!
          </h2>
          <p className="text-sm opacity-80 mt-2">
            {pets.length > 0
              ? `${pets.length}마리의 반려동물을 관리하고 있어요`
              : "반려동물을 등록하고 건강 체크를 시작하세요"}
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { href: "/breed-guide", icon: BookOpen, label: "품종 가이드", color: "bg-purple-50 text-purple-500" },
            { href: "/community", icon: Users, label: "커뮤니티", color: "bg-blue-50 text-blue-500" },
            { href: "/vet", icon: Hospital, label: "동물병원", color: "bg-teal-50 text-teal-500" },
            { href: "/nutrition", icon: UtensilsCrossed, label: "영양 분석", color: "bg-orange-50 text-orange-500" },
            { href: "/emergency", icon: ShieldAlert, label: "응급 가이드", color: "bg-red-50 text-red-500" },
            { href: "/chat", icon: MessageCircle, label: "AI 상담", color: "bg-emerald-50 text-emerald-500" },
            { href: "/insurance", icon: Shield, label: "펫 보험", color: "bg-indigo-50 text-indigo-500" },
            { href: "/shop", icon: ShoppingBag, label: "맞춤 상품", color: "bg-pink-50 text-pink-500" },
            { href: "/premium", icon: Crown, label: "프리미엄", color: "bg-amber-50 text-amber-500" },
            { href: "/vet-portal", icon: Building2, label: "병원 SaaS", color: "bg-cyan-50 text-cyan-500" },
            { href: "/data-insights", icon: Database, label: "데이터 인사이트", color: "bg-violet-50 text-violet-500" },
          ].map(item => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1.5 bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
              <div className={`p-2 rounded-lg ${item.color}`}><item.icon className="w-4 h-4" /></div>
              <span className="text-[10px] font-medium text-gray-700">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Quick Check Buttons */}
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-3">빠른 건강 체크</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { type: "EYES", label: "눈", icon: Eye, color: "bg-blue-50 text-blue-600" },
              { type: "SKIN", label: "피부", icon: Brush, color: "bg-pink-50 text-pink-600" },
              { type: "TEETH", label: "치아", icon: SmilePlus, color: "bg-purple-50 text-purple-600" },
              { type: "EARS", label: "귀", icon: Ear, color: "bg-amber-50 text-amber-600" },
              { type: "PAWS", label: "발", icon: Footprints, color: "bg-orange-50 text-orange-600" },
              { type: "GAIT", label: "보행", icon: Activity, color: "bg-teal-50 text-teal-600" },
            ].map((item) => (
              <Link
                key={item.type}
                href={`/health-check?type=${item.type}`}
                className="flex flex-col items-center gap-2 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`p-2.5 rounded-xl ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-gray-700">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Multi-Pet Family Health Overview (2+ pets) */}
        {!loading && pets.length >= 2 && pets.some((p) => p.health_checks.length > 0) && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-3">가족 건강 한눈에 보기</h3>
            <div className="space-y-3">
              {pets.map((pet) => {
                const checks = pet.health_checks || []
                const avgScore = checks.length > 0
                  ? Math.round(checks.reduce((s, h) => s + h.score, 0) / checks.length)
                  : null
                const hasWarning = checks.some((h) => h.status === "WARNING")
                const hasCaution = checks.some((h) => h.status === "CAUTION")
                return (
                  <Link key={pet.id} href={`/my-pets/${pet.id}`} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-lg shrink-0">
                      {pet.species === "DOG" ? "🐶" : "🐱"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{pet.name}</p>
                      {avgScore !== null ? (
                        <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              avgScore >= 80 ? "bg-emerald-500" : avgScore >= 60 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${avgScore}%` }}
                          />
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-400 mt-0.5">아직 검사 기록 없음</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {avgScore !== null && (
                        <span className="text-sm font-bold text-gray-700">{avgScore}</span>
                      )}
                      {hasWarning && <AlertCircle className="w-4 h-4 text-red-500" />}
                      {!hasWarning && hasCaution && <AlertCircle className="w-4 h-4 text-amber-500" />}
                    </div>
                  </Link>
                )
              })}
            </div>
            {pets.some((p) => p.health_checks.some((h) => h.status === "WARNING")) && (
              <div className="mt-3 px-3 py-2 bg-red-50 rounded-lg text-xs text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                주의가 필요한 반려동물이 있어요. 건강체크를 확인해주세요.
              </div>
            )}
          </div>
        )}

        {/* My Pets */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-900">내 반려동물</h3>
            <Link href="/my-pets" className="text-sm text-emerald-600 font-medium flex items-center gap-0.5">
              전체보기 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">불러오는 중...</div>
          ) : pets.length === 0 ? (
            <Link
              href="/my-pets"
              className="flex items-center justify-center gap-2 bg-white border-2 border-dashed border-gray-200 rounded-xl p-8 text-gray-400 hover:border-emerald-300 hover:text-emerald-500 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">반려동물 등록하기</span>
            </Link>
          ) : (
            <div className="space-y-3">
              {pets.slice(0, 3).map((pet) => {
                const latestCheck = pet.health_checks?.[0]
                return (
                  <Link
                    key={pet.id}
                    href={`/my-pets/${pet.id}`}
                    className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-2xl shrink-0">
                      {pet.species === "DOG" ? "🐶" : "🐱"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{pet.name}</p>
                      <p className="text-xs text-gray-500">
                        {pet.species === "DOG" ? "강아지" : "고양이"}
                        {pet.breed && ` · ${pet.breed}`}
                      </p>
                    </div>
                    {latestCheck && (
                      <div className="flex items-center gap-1">
                        <Heart className={`w-4 h-4 ${
                          latestCheck.status === "NORMAL" ? "text-emerald-500" :
                          latestCheck.status === "CAUTION" ? "text-amber-500" : "text-red-500"
                        }`} />
                        <span className="text-sm font-bold text-gray-700">{latestCheck.score}</span>
                      </div>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Tips */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-900">건강 팁</h3>
            <Link href="/feed" className="text-sm text-emerald-600 font-medium flex items-center gap-0.5">
              더보기 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-900 mb-1">오늘의 팁</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              반려동물의 눈곱 색상은 건강 상태를 알려주는 중요한 지표입니다.
              투명한 눈곱은 정상이지만, 노란색이나 초록색 눈곱은 감염의 신호일 수 있습니다.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
