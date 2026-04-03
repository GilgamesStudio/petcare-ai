"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import {
  Loader2, AlertTriangle, Shield, Dumbbell,
  UtensilsCrossed, Scissors, Stethoscope, Sun, Snowflake, Leaf, CloudRain
} from "lucide-react"

interface BreedGuide {
  breedInfo: {
    origin: string
    lifespan: string
    sizeCategory: string
    temperament: string
  }
  commonDiseases: {
    name: string
    risk: "HIGH" | "MEDIUM" | "LOW"
    description: string
    prevention: string
  }[]
  careGuide: {
    exercise: string
    nutrition: string
    grooming: string
    checkups: string
  }
  seasonalTips: {
    season: string
    tip: string
  }[]
}

interface Pet {
  id: string
  name: string
  species: string
  breed: string | null
  weight: number | null
  birth_date: string | null
}

const RISK_STYLES = {
  HIGH: "bg-red-100 text-red-700 border-red-200",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
  LOW: "bg-emerald-100 text-emerald-700 border-emerald-200",
}
const RISK_LABELS = { HIGH: "높음", MEDIUM: "보통", LOW: "낮음" }

const SEASON_ICONS: Record<string, typeof Sun> = {
  "봄": Leaf, "여름": Sun, "가을": CloudRain, "겨울": Snowflake,
}

export default function BreedGuidePage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedPetId, setSelectedPetId] = useState("")
  const [guide, setGuide] = useState<BreedGuide | null>(null)
  const [loading, setLoading] = useState(false)
  const [manualBreed, setManualBreed] = useState("")
  const [manualSpecies, setManualSpecies] = useState("DOG")

  useEffect(() => {
    fetch("/api/pets")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPets(data)
          const withBreed = data.find((p: Pet) => p.breed)
          if (withBreed) setSelectedPetId(withBreed.id)
        }
      })
  }, [])

  const selectedPet = pets.find((p) => p.id === selectedPetId)

  async function generateGuide() {
    const breed = selectedPet?.breed || manualBreed.trim()
    const species = selectedPet?.species || manualSpecies
    if (!breed) return

    setLoading(true)
    setGuide(null)

    try {
      const age = selectedPet?.birth_date
        ? `${Math.floor((Date.now() - new Date(selectedPet.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))}살`
        : undefined

      const res = await fetch("/api/ai/breed-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ species, breed, age, weight: selectedPet?.weight }),
      })
      const data = await res.json()
      if (data.breedInfo) setGuide(data)
      else alert("가이드를 생성할 수 없습니다. 다시 시도해주세요.")
    } catch {
      alert("오류가 발생했습니다")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header title="품종별 건강 가이드" showBack />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Pet/Breed Selection */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          {pets.filter((p) => p.breed).length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">내 반려동물</label>
              <div className="flex gap-2 flex-wrap">
                {pets.filter((p) => p.breed).map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => { setSelectedPetId(pet.id); setManualBreed("") }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      selectedPetId === pet.id
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                        : "bg-gray-100 text-gray-600 border border-transparent"
                    }`}
                  >
                    <span>{pet.species === "DOG" ? "🐶" : "🐱"}</span>
                    {pet.name} ({pet.breed})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {pets.filter((p) => p.breed).length > 0 ? "또는 직접 입력" : "품종 입력"}
            </label>
            <div className="flex gap-2">
              <select
                value={selectedPetId ? "" : manualSpecies}
                onChange={(e) => { setManualSpecies(e.target.value); setSelectedPetId("") }}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
              >
                <option value="DOG">강아지</option>
                <option value="CAT">고양이</option>
              </select>
              <input
                type="text"
                value={selectedPetId ? "" : manualBreed}
                onChange={(e) => { setManualBreed(e.target.value); setSelectedPetId("") }}
                placeholder="예: 골든리트리버, 페르시안"
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            onClick={generateGuide}
            disabled={loading || (!selectedPet?.breed && !manualBreed.trim())}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> 가이드 생성 중...</>
            ) : (
              "AI 건강 가이드 생성"
            )}
          </button>
        </div>

        {/* Guide Results */}
        {guide && (
          <>
            {/* Breed Info */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-3">
                {selectedPet?.breed || manualBreed} 기본 정보
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400">원산지</p>
                  <p className="text-sm font-medium text-gray-900">{guide.breedInfo.origin}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400">평균 수명</p>
                  <p className="text-sm font-medium text-gray-900">{guide.breedInfo.lifespan}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400">크기</p>
                  <p className="text-sm font-medium text-gray-900">{guide.breedInfo.sizeCategory}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                  <p className="text-[10px] text-gray-400">성격</p>
                  <p className="text-sm font-medium text-gray-900">{guide.breedInfo.temperament}</p>
                </div>
              </div>
            </div>

            {/* Common Diseases */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                주의 질병
              </h3>
              <div className="space-y-3">
                {guide.commonDiseases.map((d, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${RISK_STYLES[d.risk]}`}>
                        위험도 {RISK_LABELS[d.risk]}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{d.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{d.description}</p>
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> {d.prevention}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Care Guide */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-3">맞춤 케어 가이드</h3>
              <div className="space-y-3">
                {[
                  { icon: Dumbbell, label: "운동", content: guide.careGuide.exercise, color: "text-blue-500 bg-blue-50" },
                  { icon: UtensilsCrossed, label: "영양", content: guide.careGuide.nutrition, color: "text-orange-500 bg-orange-50" },
                  { icon: Scissors, label: "그루밍", content: guide.careGuide.grooming, color: "text-pink-500 bg-pink-50" },
                  { icon: Stethoscope, label: "정기검진", content: guide.careGuide.checkups, color: "text-purple-500 bg-purple-50" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${item.color} shrink-0`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seasonal Tips */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-3">계절별 관리 팁</h3>
              <div className="grid grid-cols-2 gap-3">
                {guide.seasonalTips.map((st) => {
                  const Icon = SEASON_ICONS[st.season] || Sun
                  return (
                    <div key={st.season} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-900">{st.season}</span>
                      </div>
                      <p className="text-xs text-gray-500">{st.tip}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  )
}
