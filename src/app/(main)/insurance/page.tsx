"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import {
  Shield, Check, ChevronRight, X, Loader2, Phone, Star, Heart
} from "lucide-react"

interface Pet { id: string; name: string; species: string; breed: string | null }

const INSURANCE_PLANS = [
  {
    id: "basic",
    company: "펫케어 보험",
    name: "기본형",
    monthlyFee: "₩15,000~",
    coverage: "70%",
    maxCoverage: "연 200만원",
    color: "border-blue-200 bg-blue-50",
    badge: null,
    features: [
      "질병 치료비 보장",
      "수술비 보장",
      "입원비 보장",
      "대기기간 30일",
    ],
    excludes: ["예방접종", "미용", "건강검진"],
  },
  {
    id: "standard",
    company: "펫케어 보험",
    name: "표준형",
    monthlyFee: "₩25,000~",
    coverage: "80%",
    maxCoverage: "연 500만원",
    color: "border-emerald-300 bg-emerald-50",
    badge: "추천",
    features: [
      "질병 + 상해 치료비 보장",
      "수술비 보장 (연 3회)",
      "입원비 보장 (일 10만원)",
      "통원 치료비 보장",
      "대기기간 15일",
      "MRI/CT 검사비 포함",
    ],
    excludes: ["미용", "예방접종 일부"],
  },
  {
    id: "premium",
    company: "펫케어 보험",
    name: "프리미엄",
    monthlyFee: "₩45,000~",
    coverage: "90%",
    maxCoverage: "연 1,000만원",
    color: "border-purple-300 bg-purple-50",
    badge: "최대 보장",
    features: [
      "질병 + 상해 + 배상책임 보장",
      "수술비 무제한 보장",
      "입원비 보장 (일 20만원)",
      "통원 치료비 보장",
      "예방접종비 일부 보장",
      "대기기간 없음",
      "MRI/CT/초음파 모두 포함",
      "한방/물리치료 포함",
    ],
    excludes: ["미용"],
  },
]

export default function InsurancePage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedPetId, setSelectedPetId] = useState("")
  const [showApply, setShowApply] = useState<string | null>(null)
  const [applicantName, setApplicantName] = useState("")
  const [applicantPhone, setApplicantPhone] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch("/api/pets").then(r => r.json()).then(data => {
      if (Array.isArray(data)) { setPets(data); if (data.length > 0) setSelectedPetId(data[0].id) }
    })
  }, [])

  async function submitInquiry() {
    if (!applicantName.trim() || !applicantPhone.trim()) { alert("이름과 전화번호를 입력해주세요"); return }
    setSubmitting(true)

    await fetch("/api/insurance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pet_id: selectedPetId || null,
        plan_name: showApply,
        name: applicantName,
        phone: applicantPhone,
      }),
    })

    setSubmitting(false)
    setSubmitted(true)
    setShowApply(null)
    setApplicantName("")
    setApplicantPhone("")
  }

  return (
    <>
      <Header title="반려동물 보험" showBack />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6" />
            <span className="text-lg font-bold">반려동물 보험</span>
          </div>
          <p className="text-sm opacity-90">
            예상치 못한 의료비로부터<br />소중한 가족을 지켜주세요
          </p>
          <div className="flex gap-4 mt-4 text-xs">
            <div className="bg-white/20 rounded-lg px-3 py-2 text-center">
              <p className="font-bold text-lg">70~90%</p>
              <p className="opacity-80">의료비 보장</p>
            </div>
            <div className="bg-white/20 rounded-lg px-3 py-2 text-center">
              <p className="font-bold text-lg">₩15K~</p>
              <p className="opacity-80">월 보험료</p>
            </div>
            <div className="bg-white/20 rounded-lg px-3 py-2 text-center">
              <p className="font-bold text-lg">간편</p>
              <p className="opacity-80">1분 신청</p>
            </div>
          </div>
        </div>

        {submitted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-emerald-800">상담 신청이 완료되었습니다!</p>
            <p className="text-xs text-emerald-600 mt-1">영업일 1~2일 내 연락드리겠습니다.</p>
          </div>
        )}

        {/* Pet Selector */}
        {pets.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">보험 대상 반려동물</label>
            <div className="flex gap-2 overflow-x-auto">
              {pets.map(pet => (
                <button key={pet.id} onClick={() => setSelectedPetId(pet.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap ${
                    selectedPetId === pet.id ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-gray-100 text-gray-500"
                  }`}>
                  {pet.species === "DOG" ? "🐶" : "🐱"} {pet.name}
                  {pet.breed && <span className="text-gray-400">({pet.breed})</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="space-y-4">
          {INSURANCE_PLANS.map(plan => (
            <div key={plan.id} className={`rounded-2xl p-5 border-2 ${plan.color} relative`}>
              {plan.badge && (
                <span className={`absolute -top-2.5 right-4 px-2.5 py-0.5 text-[10px] font-bold rounded-full text-white ${
                  plan.badge === "추천" ? "bg-emerald-500" : "bg-purple-500"
                }`}>{plan.badge}</span>
              )}

              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500">{plan.company}</p>
                  <p className="text-lg font-bold text-gray-900">{plan.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{plan.monthlyFee}</p>
                  <p className="text-[10px] text-gray-500">보장률 {plan.coverage} · {plan.maxCoverage}</p>
                </div>
              </div>

              <ul className="space-y-1.5 mb-4">
                {plan.features.map((f, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>

              {plan.excludes.length > 0 && (
                <p className="text-[10px] text-gray-400 mb-3">
                  미보장: {plan.excludes.join(", ")}
                </p>
              )}

              <button
                onClick={() => setShowApply(plan.name)}
                className="w-full py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
              >
                상담 신청 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Notice */}
        <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
          <p className="font-medium text-gray-700">안내사항</p>
          <p>• 보험료는 반려동물의 나이, 품종, 건강 상태에 따라 달라질 수 있습니다.</p>
          <p>• 가입 전 약관을 반드시 확인해주세요.</p>
          <p>• 기존 질환은 보장 대상에서 제외될 수 있습니다.</p>
        </div>
      </main>

      {/* Apply Modal */}
      {showApply && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">보험 상담 신청</h3>
              <button onClick={() => setShowApply(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{showApply}</span> 플랜 상담을 신청합니다.
              전문 상담사가 연락드립니다.
            </p>
            <input value={applicantName} onChange={e => setApplicantName(e.target.value)}
              placeholder="신청자 이름" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            <input value={applicantPhone} onChange={e => setApplicantPhone(e.target.value)}
              placeholder="연락처 (010-xxxx-xxxx)" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={submitInquiry} disabled={submitting || !applicantName.trim() || !applicantPhone.trim()}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "상담 신청하기"}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
