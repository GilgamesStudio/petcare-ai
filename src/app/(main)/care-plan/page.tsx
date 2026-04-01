"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Calendar, CheckCircle, Circle, Sparkles, Loader2 } from "lucide-react"

interface Pet { id: string; name: string; species: string }

interface CarePlanItem {
  title: string
  description: string
  category: string
  completed: boolean
}

function generateCarePlan(species: string): CarePlanItem[] {
  const month = new Date().getMonth()
  const isSummer = month >= 5 && month <= 8
  const isWinter = month >= 11 || month <= 1

  const basePlan: CarePlanItem[] = [
    { title: "정기 건강 체크", description: "눈, 피부, 치아 AI 건강 검사 실시", category: "건강", completed: false },
    { title: "체중 측정", description: "적정 체중 유지를 위한 월간 체중 기록", category: "건강", completed: false },
    { title: "구강 관리", description: "주 3회 이상 양치질 또는 덴탈 껌 제공", category: "관리", completed: false },
    { title: "영양 체크", description: "사료 급여량 확인 및 영양 보충제 점검", category: "영양", completed: false },
    { title: "운동 계획", description: species === "DOG" ? "매일 30분 이상 산책" : "매일 15분 이상 놀이 시간", category: "운동", completed: false },
    { title: "예방 접종 확인", description: "예방 접종 일정 확인 및 기록", category: "건강", completed: false },
  ]

  if (isSummer) {
    basePlan.push(
      { title: "열사병 예방", description: "산책 시간 조절 및 충분한 수분 공급", category: "계절", completed: false },
      { title: "기생충 예방", description: "심장사상충 및 진드기 예방약 투여", category: "계절", completed: false },
    )
  }
  if (isWinter) {
    basePlan.push(
      { title: "보온 관리", description: "실내 온도 유지 및 외출 시 방한용품 착용", category: "계절", completed: false },
      { title: "피부 보습", description: "건조한 날씨로 인한 피부 건조 예방", category: "계절", completed: false },
    )
  }

  return basePlan
}

export default function CarePlanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">불러오는 중...</div>}>
      <CarePlanContent />
    </Suspense>
  )
}

function CarePlanContent() {
  const searchParams = useSearchParams()
  const petIdParam = searchParams.get("petId")

  const [pets, setPets] = useState<Pet[]>([])
  const [selectedPetId, setSelectedPetId] = useState(petIdParam || "")
  const [items, setItems] = useState<CarePlanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const currentMonth = new Date().toISOString().slice(0, 7)

  useEffect(() => {
    fetch("/api/pets")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPets(data)
          if (!selectedPetId && data.length > 0) setSelectedPetId(data[0].id)
        }
      })
      .finally(() => setLoading(false))
  }, [selectedPetId])

  useEffect(() => {
    if (!selectedPetId) return
    fetch(`/api/care-plans?petId=${selectedPetId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const current = data.find((p: { month: string }) => p.month === currentMonth)
          if (current) setItems(current.items as CarePlanItem[])
          else setItems([])
        }
      })
  }, [selectedPetId, currentMonth])

  async function generatePlan() {
    const pet = pets.find((p) => p.id === selectedPetId)
    if (!pet) return
    setGenerating(true)
    const plan = generateCarePlan(pet.species)
    setItems(plan)

    await fetch("/api/care-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pet_id: selectedPetId, month: currentMonth, items: plan }),
    })
    setGenerating(false)
  }

  function toggleItem(index: number) {
    const updated = items.map((item, i) =>
      i === index ? { ...item, completed: !item.completed } : item
    )
    setItems(updated)
    fetch("/api/care-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pet_id: selectedPetId, month: currentMonth, items: updated }),
    })
  }

  const completedCount = items.filter((i) => i.completed).length
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0

  return (
    <>
      <Header title="케어 플랜" showBack />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Pet Select */}
        {pets.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPetId(pet.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedPetId === pet.id
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-white text-gray-600"
                }`}
              >
                {pet.species === "DOG" ? "🐶" : "🐱"} {pet.name}
              </button>
            ))}
          </div>
        )}

        {/* Month & Progress */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5" />
            <span className="font-semibold">{currentMonth.replace("-", "년 ")}월 케어 플랜</span>
          </div>
          {items.length > 0 ? (
            <>
              <div className="bg-white/20 rounded-full h-2.5 mt-3">
                <div
                  className="bg-white rounded-full h-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm mt-2 opacity-90">
                {completedCount}/{items.length} 완료 ({progress}%)
              </p>
            </>
          ) : (
            <p className="text-sm opacity-80 mt-1">케어 플랜을 생성해보세요</p>
          )}
        </div>

        {/* Generate Button */}
        {items.length === 0 && selectedPetId && (
          <button
            onClick={generatePlan}
            disabled={generating}
            className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> 생성 중...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> AI 케어 플랜 생성</>
            )}
          </button>
        )}

        {/* Plan Items */}
        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => toggleItem(i)}
                className="w-full flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm text-left hover:shadow-md transition-shadow"
              >
                {item.completed ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${item.completed ? "text-gray-400 line-through" : "text-gray-900"}`}>
                      {item.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      {item.category}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${item.completed ? "text-gray-300" : "text-gray-500"}`}>
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {loading && <div className="text-center py-16 text-gray-400">불러오는 중...</div>}
      </main>
    </>
  )
}
