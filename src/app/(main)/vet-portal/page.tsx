"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import {
  Building2, Calendar, Users, FileText, TrendingUp,
  Activity, Check, ChevronRight, Loader2, Stethoscope,
  ClipboardList, BarChart3, Heart, Zap, Phone, Mail,
  Star, Clock, Shield
} from "lucide-react"

// 오늘의 예약 목 데이터
const MOCK_APPOINTMENTS = [
  { id: 1, time: "09:00", petName: "초코", species: "강아지", breed: "푸들", owner: "김민수", type: "정기 검진", status: "confirmed" },
  { id: 2, time: "10:30", petName: "나비", species: "고양이", breed: "러시안블루", owner: "이수진", type: "예방접종", status: "confirmed" },
  { id: 3, time: "11:00", petName: "뭉치", species: "강아지", breed: "시바견", owner: "박지영", type: "피부 진료", status: "waiting" },
  { id: 4, time: "14:00", petName: "루이", species: "고양이", breed: "페르시안", owner: "최동현", type: "치과 스케일링", status: "confirmed" },
  { id: 5, time: "15:30", petName: "보리", species: "강아지", breed: "골든리트리버", owner: "정은혜", type: "수술 후 경과", status: "waiting" },
]

// 환자 현황 목 데이터
const MOCK_STATS = [
  { label: "오늘 예약", value: "12건", icon: Calendar, color: "text-blue-600 bg-blue-100" },
  { label: "입원 환자", value: "3마리", icon: Heart, color: "text-red-600 bg-red-100" },
  { label: "이번 달 신규", value: "28건", icon: Users, color: "text-emerald-600 bg-emerald-100" },
  { label: "월 매출", value: "₩8.2M", icon: TrendingUp, color: "text-purple-600 bg-purple-100" },
]

// SaaS 플랜
const PLANS = [
  {
    id: "starter",
    name: "스타터",
    price: "₩99,000",
    period: "/월",
    description: "소규모 동물병원에 최적화",
    color: "border-gray-200 bg-white",
    badge: null,
    features: [
      "환자 관리 (월 100건)",
      "예약 시스템",
      "기본 진료기록 관리",
      "이메일 지원",
    ],
    notIncluded: [
      "진료기록 API 연동",
      "건강체크 AI 연동",
      "매출 분석 리포트",
    ],
  },
  {
    id: "pro",
    name: "프로",
    price: "₩199,000",
    period: "/월",
    description: "성장하는 동물병원을 위한 올인원",
    color: "border-indigo-300 bg-indigo-50",
    badge: "추천",
    features: [
      "환자 관리 (무제한)",
      "고급 예약 시스템 (자동 리마인더)",
      "진료기록 API 연동",
      "건강체크 AI 연동",
      "매출 분석 리포트",
      "우선 기술 지원",
    ],
    notIncluded: [],
  },
  {
    id: "enterprise",
    name: "엔터프라이즈",
    price: "별도 문의",
    period: "",
    description: "다점포 / 대형 동물병원 맞춤형",
    color: "border-gray-300 bg-gray-50",
    badge: null,
    features: [
      "프로 플랜 모든 기능",
      "다점포 통합 관리",
      "커스텀 API 개발",
      "전담 매니저 배정",
      "SLA 보장 (99.9%)",
      "온프레미스 설치 옵션",
    ],
    notIncluded: [],
  },
]

// 주요 기능 목록
const FEATURES = [
  { icon: ClipboardList, title: "환자 관리", desc: "반려동물 환자의 전체 이력을 한눈에 관리합니다" },
  { icon: Calendar, title: "예약 시스템", desc: "온라인 예약 및 자동 리마인더로 노쇼를 줄입니다" },
  { icon: FileText, title: "진료기록 API 연동", desc: "PetCare AI의 건강 데이터와 실시간 연동됩니다" },
  { icon: Activity, title: "건강체크 연동", desc: "AI 기반 건강체크 결과를 진료에 활용합니다" },
  { icon: BarChart3, title: "매출 분석", desc: "매출 트렌드, 진료 통계를 대시보드로 확인합니다" },
  { icon: Shield, title: "보안 관리", desc: "HIPAA 수준의 데이터 보안과 암호화를 제공합니다" },
]

export default function VetPortalPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [hospitalName, setHospitalName] = useState("")
  const [contactName, setContactName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState<"dashboard" | "pricing">("dashboard")

  const handleSubmit = async () => {
    if (!hospitalName || !contactName || !phone || !selectedPlan) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/vet-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospital_name: hospitalName,
          contact_name: contactName,
          phone,
          email,
          plan_name: selectedPlan,
        }),
      })
      if (res.ok) {
        setSubmitted(true)
      }
    } catch {
      // error handling
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Header title="동물병원 포털" showBack />

      <main className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* 헤더 배너 */}
        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">PetCare 병원 포털</h1>
              <p className="text-sm opacity-80">B2B 동물병원 SaaS 솔루션</p>
            </div>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">
            AI 기반 반려동물 건강 데이터와 연동되는 차세대 동물병원 관리 시스템으로 진료 효율을 높이세요.
          </p>
        </div>

        {/* 탭 전환 */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "dashboard"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-500"
            }`}
          >
            대시보드 미리보기
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "pricing"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-500"
            }`}
          >
            요금제 & 신청
          </button>
        </div>

        {activeTab === "dashboard" && (
          <div className="space-y-5">
            {/* 환자 현황 카드 */}
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                환자 현황
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {MOCK_STATS.map((stat) => (
                  <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 오늘의 예약 */}
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                오늘의 예약
              </h2>
              <div className="space-y-2">
                {MOCK_APPOINTMENTS.map((apt) => (
                  <div key={apt.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
                    <div className="text-center min-w-[52px]">
                      <p className="text-sm font-bold text-indigo-600">{apt.time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm">{apt.petName}</p>
                        <span className="text-xs text-gray-400">{apt.breed}</span>
                      </div>
                      <p className="text-xs text-gray-500">{apt.owner} | {apt.type}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      apt.status === "confirmed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {apt.status === "confirmed" ? "확정" : "대기"}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* 진료 기록 연동 */}
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                진료 기록 연동
              </h2>
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">PetCare AI 건강체크</span>
                  <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3" /> 연동 완료
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">진료기록 API</span>
                  <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3" /> 실시간
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">예방접종 이력</span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 동기화 중
                  </span>
                </div>
                <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                  마지막 동기화: 2026-04-03 08:30 KST
                </p>
              </div>
            </section>

            {/* 주요 기능 */}
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-indigo-500" />
                주요 기능
              </h2>
              <div className="space-y-3">
                {FEATURES.map((f) => (
                  <div key={f.title} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                      <f.icon className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{f.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <div className="text-center pt-2">
              <button
                onClick={() => setActiveTab("pricing")}
                className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                요금제 확인 및 무료 체험 신청
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="space-y-5">
            {/* 요금제 */}
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500" />
                SaaS 요금제
              </h2>
              <div className="space-y-4">
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`rounded-2xl border-2 p-5 relative transition-all ${
                      selectedPlan === plan.id
                        ? "border-indigo-500 bg-indigo-50"
                        : plan.color
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-3 left-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {plan.badge}
                      </span>
                    )}
                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-indigo-600">{plan.price}</span>
                        <span className="text-sm text-gray-500">{plan.period}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{plan.description}</p>

                    <ul className="space-y-2 mb-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                      {plan.notIncluded.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-gray-400 line-through">
                          <Check className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        selectedPlan === plan.id
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                    >
                      {selectedPlan === plan.id ? "선택됨" : "이 플랜 선택"}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* 무료 체험 신청 폼 */}
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-500" />
                무료 체험 신청
              </h2>

              {submitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">신청이 완료되었습니다!</h3>
                  <p className="text-sm text-gray-500">
                    담당자가 1영업일 이내에 연락드리겠습니다.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                  <p className="text-sm text-gray-500">
                    14일 무료 체험을 시작하세요. 카드 등록 없이 바로 이용 가능합니다.
                  </p>

                  {selectedPlan && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 flex items-center justify-between">
                      <span className="text-sm text-indigo-600 font-medium">
                        선택 플랜: {PLANS.find((p) => p.id === selectedPlan)?.name}
                      </span>
                      <button onClick={() => setSelectedPlan(null)} className="text-xs text-indigo-500 underline">변경</button>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Building2 className="w-4 h-4 inline mr-1" /> 병원명 *
                    </label>
                    <input type="text" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)}
                      placeholder="예: 행복한 동물병원"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Users className="w-4 h-4 inline mr-1" /> 담당자명 *
                    </label>
                    <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)}
                      placeholder="홍길동"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="w-4 h-4 inline mr-1" /> 연락처 *
                    </label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      placeholder="010-1234-5678"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="w-4 h-4 inline mr-1" /> 이메일
                    </label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="hospital@example.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  <button onClick={handleSubmit}
                    disabled={submitting || !hospitalName || !contactName || !phone || !selectedPlan}
                    className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                    {submitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> 처리 중...</>
                    ) : (
                      "무료 체험 신청하기"
                    )}
                  </button>

                  {!selectedPlan && (
                    <p className="text-xs text-amber-600 text-center">위에서 플랜을 먼저 선택해 주세요.</p>
                  )}
                </div>
              )}
            </section>

            {/* 문의 안내 */}
            <div className="bg-gray-50 rounded-xl p-5 text-center">
              <p className="text-sm text-gray-500 mb-2">엔터프라이즈 플랜 또는 맞춤 문의</p>
              <div className="flex items-center justify-center gap-2 text-indigo-600 font-semibold">
                <Phone className="w-4 h-4" />
                <span className="text-sm">1588-0000</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">평일 09:00 - 18:00</p>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
