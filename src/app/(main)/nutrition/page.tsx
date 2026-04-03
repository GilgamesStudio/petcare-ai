"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Loader2, AlertTriangle, CheckCircle, Pill } from "lucide-react"

interface Pet { id: string; name: string; species: string; breed: string | null; weight: number | null; birth_date: string | null }
interface NutrientScore { score: number; comment: string }
interface NutritionResult {
  overallScore: number
  overallGrade: string
  analysis: { protein: NutrientScore; fat: NutrientScore; fiber: NutrientScore; vitamins: NutrientScore; minerals: NutrientScore }
  concerns: string[]
  recommendations: string[]
  supplementSuggestions: { name: string; reason: string }[]
  dailyCalories: string
  feedingTip: string
}

const GRADE_STYLES: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-amber-100 text-amber-700",
  D: "bg-red-100 text-red-700",
}

const NUTRIENT_LABELS: Record<string, string> = {
  protein: "단백질", fat: "지방", fiber: "식이섬유", vitamins: "비타민", minerals: "미네랄",
}

export default function NutritionPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedPetId, setSelectedPetId] = useState("")
  const [currentFood, setCurrentFood] = useState("")
  const [treats, setTreats] = useState("")
  const [supplements, setSupplements] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<NutritionResult | null>(null)

  useEffect(() => {
    fetch("/api/pets").then(r => r.json()).then(data => {
      if (Array.isArray(data)) { setPets(data); if (data.length > 0) setSelectedPetId(data[0].id) }
    })
  }, [])

  const selectedPet = pets.find(p => p.id === selectedPetId)

  async function analyze() {
    if (!currentFood.trim()) { alert("주식 사료를 입력해주세요"); return }
    setLoading(true); setResult(null)

    const age = selectedPet?.birth_date
      ? `${Math.floor((Date.now() - new Date(selectedPet.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))}살`
      : undefined

    const res = await fetch("/api/ai/nutrition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        species: selectedPet?.species || "DOG", breed: selectedPet?.breed,
        age, weight: selectedPet?.weight, currentFood, treats, supplements,
      }),
    })
    const data = await res.json()
    if (data.overallScore !== undefined) setResult(data)
    else alert("분석에 실패했습니다. 다시 시도해주세요.")
    setLoading(false)
  }

  function scoreColor(score: number) {
    if (score >= 80) return "bg-emerald-500"
    if (score >= 60) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <>
      <Header title="맞춤 영양 분석" showBack />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Input */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          {pets.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">반려동물</label>
              <div className="flex gap-2 flex-wrap">
                {pets.map(p => (
                  <button key={p.id} onClick={() => setSelectedPetId(p.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                      selectedPetId === p.id ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : "bg-gray-100 text-gray-500"
                    }`}>
                    {p.species === "DOG" ? "🐶" : "🐱"} {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">주식 사료 *</label>
            <input value={currentFood} onChange={e => setCurrentFood(e.target.value)}
              placeholder="예: 로얄캐닌 미니 어덜트, 하루 2회 80g"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">간식</label>
            <input value={treats} onChange={e => setTreats(e.target.value)}
              placeholder="예: 덴탈껌 하루 1개, 닭가슴살 간식"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">보충제/영양제</label>
            <input value={supplements} onChange={e => setSupplements(e.target.value)}
              placeholder="예: 오메가3, 유산균"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <button onClick={analyze} disabled={loading || !currentFood.trim()}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />분석 중...</> : "AI 영양 분석"}
          </button>
        </div>

        {/* Results */}
        {result && (
          <>
            {/* Overall Score */}
            <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
              <div className="inline-flex items-center gap-3 mb-3">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none"
                      stroke={result.overallScore >= 80 ? "#10b981" : result.overallScore >= 60 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="3" strokeDasharray={`${result.overallScore * 0.942} 94.2`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-900">{result.overallScore}</span>
                </div>
                <div className="text-left">
                  <span className={`text-2xl font-bold px-3 py-1 rounded-lg ${GRADE_STYLES[result.overallGrade] || GRADE_STYLES.C}`}>
                    {result.overallGrade}등급
                  </span>
                  <p className="text-xs text-gray-500 mt-1">권장 칼로리: {result.dailyCalories}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{result.feedingTip}</p>
            </div>

            {/* Nutrient Breakdown */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-4">영양소 분석</h3>
              <div className="space-y-3">
                {Object.entries(result.analysis).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{NUTRIENT_LABELS[key]}</span>
                      <span className="text-xs text-gray-500">{val.score}점</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                      <div className={`h-full rounded-full ${scoreColor(val.score)}`} style={{ width: `${val.score}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400">{val.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Concerns */}
            {result.concerns.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />주의사항
                </h3>
                <ul className="space-y-2">
                  {result.concerns.map((c, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>{c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />추천사항
              </h3>
              <ul className="space-y-2">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span>{r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Supplement Suggestions */}
            {result.supplementSuggestions.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-purple-500" />추천 보충제
                </h3>
                <div className="space-y-2">
                  {result.supplementSuggestions.map((s, i) => (
                    <div key={i} className="bg-purple-50 rounded-xl p-3">
                      <p className="text-sm font-semibold text-purple-800">{s.name}</p>
                      <p className="text-xs text-purple-600 mt-0.5">{s.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}
