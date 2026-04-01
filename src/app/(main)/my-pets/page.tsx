"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import Link from "next/link"
import { Plus, ChevronRight, Heart, X } from "lucide-react"

interface Pet {
  id: string
  name: string
  species: string
  breed: string | null
  birth_date: string | null
  weight: number | null
  gender: string
  photo_url: string | null
  health_checks: { score: number; status: string }[]
}

export default function MyPetsPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: "", species: "DOG", breed: "", birth_date: "", weight: "", gender: "MALE",
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPets()
  }, [])

  function loadPets() {
    fetch("/api/pets")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPets(data) })
      .finally(() => setLoading(false))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const body = {
        name: form.name,
        species: form.species,
        breed: form.breed || null,
        birth_date: form.birth_date || null,
        weight: form.weight ? parseFloat(form.weight) : null,
        gender: form.gender,
      }
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setShowForm(false)
        setForm({ name: "", species: "DOG", breed: "", birth_date: "", weight: "", gender: "MALE" })
        loadPets()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Header
        title="내 반려동물"
        rightAction={
          <button onClick={() => setShowForm(true)} className="p-2 rounded-full hover:bg-gray-100">
            <Plus className="w-5 h-5 text-emerald-600" />
          </button>
        }
      />
      <main className="max-w-lg mx-auto px-4 py-5">
        {loading ? (
          <div className="text-center py-16 text-gray-400">불러오는 중...</div>
        ) : pets.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🐾</div>
            <p className="text-gray-500 mb-4">등록된 반려동물이 없어요</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              반려동물 등록하기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {pets.map((pet) => {
              const latestScore = pet.health_checks?.[0]?.score
              return (
                <Link
                  key={pet.id}
                  href={`/my-pets/${pet.id}`}
                  className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                    {pet.species === "DOG" ? "🐶" : "🐱"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{pet.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {pet.species === "DOG" ? "강아지" : "고양이"}
                      {pet.breed && ` · ${pet.breed}`}
                      {pet.weight && ` · ${pet.weight}kg`}
                    </p>
                    {pet.gender && (
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 mt-1">
                        {pet.gender === "MALE" ? "♂ 수컷" : "♀ 암컷"}
                      </span>
                    )}
                  </div>
                  {latestScore !== undefined && (
                    <div className="flex items-center gap-1">
                      <Heart className={`w-4 h-4 ${latestScore >= 80 ? "text-emerald-500" : latestScore >= 60 ? "text-amber-500" : "text-red-500"}`} />
                      <span className="text-sm font-bold">{latestScore}</span>
                    </div>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </Link>
              )
            })}
          </div>
        )}

        {/* Add Pet Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
            <div className="w-full max-w-lg mx-auto bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold">반려동물 등록</h2>
                <button onClick={() => setShowForm(false)} className="p-1">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="반려동물 이름"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">종류 *</label>
                    <select
                      value={form.species}
                      onChange={(e) => setForm({ ...form, species: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="DOG">강아지</option>
                      <option value="CAT">고양이</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">성별 *</label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="MALE">수컷</option>
                      <option value="FEMALE">암컷</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">품종</label>
                  <input
                    value={form.breed}
                    onChange={(e) => setForm({ ...form, breed: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="예: 말티즈, 페르시안"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
                    <input
                      type="date"
                      value={form.birth_date}
                      onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">몸무게 (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {saving ? "등록 중..." : "등록하기"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
