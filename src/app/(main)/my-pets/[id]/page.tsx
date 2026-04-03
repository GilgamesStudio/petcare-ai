"use client"

import { useEffect, useState, use } from "react"
import { Header } from "@/components/layout/header"
import Link from "next/link"
import { Camera, Calendar, TrendingUp, Trash2, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from "recharts"

interface HealthCheck {
  id: string
  check_type: string
  score: number
  status: string
  symptoms: string[] | null
  advice: string | null
  created_at: string
}

interface Pet {
  id: string
  name: string
  species: string
  breed: string | null
  birth_date: string | null
  weight: number | null
  gender: string
  created_at: string
  health_checks: HealthCheck[]
}

const CHECK_LABELS: Record<string, string> = {
  EYES: "눈", SKIN: "피부", TEETH: "치아", EARS: "귀", PAWS: "발", GAIT: "보행",
}
const STATUS_COLORS: Record<string, string> = {
  NORMAL: "bg-emerald-100 text-emerald-700",
  CAUTION: "bg-amber-100 text-amber-700",
  WARNING: "bg-red-100 text-red-700",
}
const STATUS_LABELS: Record<string, string> = {
  NORMAL: "정상", CAUTION: "주의", WARNING: "경고",
}

export default function PetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/pets/${id}`)
      .then((r) => r.json())
      .then(setPet)
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!confirm(`${pet?.name}을(를) 정말 삭제하시겠습니까?`)) return
    await fetch(`/api/pets/${id}`, { method: "DELETE" })
    router.push("/my-pets")
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">불러오는 중...</div>
  if (!pet) return <div className="min-h-screen flex items-center justify-center text-gray-400">반려동물을 찾을 수 없습니다</div>

  const avgScore = pet.health_checks.length > 0
    ? Math.round(pet.health_checks.reduce((s, h) => s + h.score, 0) / pet.health_checks.length)
    : null

  const age = pet.birth_date
    ? (() => {
        const diff = Date.now() - new Date(pet.birth_date).getTime()
        const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
        const months = Math.floor((diff % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000))
        return years > 0 ? `${years}살 ${months}개월` : `${months}개월`
      })()
    : null

  return (
    <>
      <Header
        title={pet.name}
        showBack
        rightAction={
          <button onClick={handleDelete} className="p-2 rounded-full hover:bg-red-50">
            <Trash2 className="w-5 h-5 text-red-400" />
          </button>
        }
      />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center text-4xl">
              {pet.species === "DOG" ? "🐶" : "🐱"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{pet.name}</h2>
              <p className="text-sm text-gray-500">
                {pet.species === "DOG" ? "강아지" : "고양이"}
                {pet.breed && ` · ${pet.breed}`}
              </p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {pet.gender === "MALE" ? "♂ 수컷" : "♀ 암컷"}
                </span>
                {age && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{age}</span>}
                {pet.weight && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{pet.weight}kg</span>}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">평균 점수</p>
              <p className="text-lg font-bold text-emerald-600">{avgScore ?? "-"}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">총 검사</p>
              <p className="text-lg font-bold text-blue-600">{pet.health_checks.length}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">등록일</p>
              <p className="text-sm font-bold text-purple-600">{new Date(pet.created_at).toLocaleDateString("ko")}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Link
            href={`/health-check?petId=${pet.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            <Camera className="w-4 h-4" /> 건강 체크
          </Link>
          <Link
            href={`/care-plan?petId=${pet.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-emerald-600 border border-emerald-200 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-colors"
          >
            <Calendar className="w-4 h-4" /> 케어 플랜
          </Link>
        </div>

        {/* Health Trend Chart */}
        {pet.health_checks.length >= 2 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              건강 점수 추이
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={[...pet.health_checks].reverse().map((h) => ({
                  date: new Date(h.created_at).toLocaleDateString("ko", { month: "short", day: "numeric" }),
                  score: h.score,
                  type: CHECK_LABELS[h.check_type],
                }))}
              >
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 13 }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any, _name: any, props: any) => [`${value}점`, props.payload.type]}
                />
                <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} fill="url(#scoreGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Body Part Scores */}
        {pet.health_checks.length > 0 && (() => {
          const latestByType: Record<string, HealthCheck> = {}
          for (const h of pet.health_checks) {
            if (!latestByType[h.check_type]) latestByType[h.check_type] = h
          }
          const entries = Object.entries(latestByType)
          if (entries.length < 2) return null
          return (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-4">부위별 건강 점수</h3>
              <div className="grid grid-cols-2 gap-3">
                {entries.map(([type, check]) => (
                  <div key={type} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="relative w-10 h-10">
                      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="15" fill="none"
                          stroke={check.score >= 80 ? "#10b981" : check.score >= 60 ? "#f59e0b" : "#ef4444"}
                          strokeWidth="3"
                          strokeDasharray={`${check.score * 0.942} 94.2`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">
                        {check.score}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{CHECK_LABELS[type]}</p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(check.created_at).toLocaleDateString("ko")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* AI Consultation */}
        <Link
          href="/chat"
          className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4"
        >
          <MessageCircle className="w-5 h-5 text-emerald-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-800">{pet.name} 건강 상담하기</p>
            <p className="text-xs text-emerald-600">AI 수의사에게 궁금한 점을 물어보세요</p>
          </div>
        </Link>

        {/* Health History */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <h3 className="text-base font-bold text-gray-900">건강 체크 기록</h3>
          </div>

          {pet.health_checks.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm">
              아직 건강 체크 기록이 없어요
            </div>
          ) : (
            <div className="space-y-2">
              {pet.health_checks.map((check) => (
                <div key={check.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[check.status]}`}>
                        {STATUS_LABELS[check.status]}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {CHECK_LABELS[check.check_type]} 검사
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-700">{check.score}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(check.created_at).toLocaleDateString("ko")}
                      </span>
                    </div>
                  </div>
                  {check.advice && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{check.advice}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
