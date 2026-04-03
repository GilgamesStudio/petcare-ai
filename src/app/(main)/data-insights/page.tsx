"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import {
  Database, TrendingUp, BarChart3, Activity, Users, Building2,
  FlaskConical, ShieldCheck, ChevronRight, Check, X, Loader2,
  Stethoscope, Pill, Sun, PawPrint
} from "lucide-react"

const STATS = [
  { label: "총 분석 데이터", value: "50,000+건", icon: Database, color: "from-violet-500 to-purple-600" },
  { label: "등록 반려동물 수", value: "12,000+", icon: PawPrint, color: "from-blue-500 to-indigo-600" },
  { label: "참여 병원", value: "150+", icon: Stethoscope, color: "from-emerald-500 to-teal-600" },
  { label: "월간 활성 사용자", value: "8,500+", icon: Users, color: "from-amber-500 to-orange-600" },
]

const INSIGHT_CARDS = [
  {
    title: "품종별 질환 발생률",
    description: "200+ 품종의 주요 질환 패턴과 발생 빈도를 분석하여 품종 맞춤형 건강 솔루션 개발을 지원합니다.",
    icon: Activity,
    gradient: "from-rose-500/10 to-pink-500/10",
    border: "border-rose-200",
    iconColor: "text-rose-500",
    sample: ["말티즈 — 슬개골 탈구 32%", "골든리트리버 — 피부 알러지 28%", "페르시안 — 신장 질환 24%"],
  },
  {
    title: "연령대별 건강 점수 분포",
    description: "반려동물의 연령별 건강 점수 추이를 분석하여 생애주기별 건강관리 전략 수립에 활용할 수 있습니다.",
    icon: BarChart3,
    gradient: "from-blue-500/10 to-indigo-500/10",
    border: "border-blue-200",
    iconColor: "text-blue-500",
    sample: ["0~2세 평균 92점", "3~7세 평균 78점", "8세 이상 평균 61점"],
  },
  {
    title: "계절별 주요 증상 트렌드",
    description: "계절에 따른 증상 변화 패턴을 추적하여 시기별 맞춤 제품 마케팅 및 재고 관리에 활용됩니다.",
    icon: Sun,
    gradient: "from-amber-500/10 to-yellow-500/10",
    border: "border-amber-200",
    iconColor: "text-amber-500",
    sample: ["봄 — 알러지/피부염 45% 증가", "여름 — 소화기 질환 38% 증가", "겨울 — 관절 질환 29% 증가"],
  },
  {
    title: "영양 보조제 효과 분석",
    description: "보조제 복용 전후 건강 지표 변화를 비교 분석하여 제품 효능 검증 및 R&D에 활용할 수 있습니다.",
    icon: Pill,
    gradient: "from-emerald-500/10 to-green-500/10",
    border: "border-emerald-200",
    iconColor: "text-emerald-500",
    sample: ["오메가3 — 피부 건강 +23%", "글루코사민 — 관절 점수 +18%", "프로바이오틱스 — 소화 개선 +31%"],
  },
]

const PLANS = [
  {
    id: "research",
    name: "리서치",
    price: "₩500,000",
    period: "/월",
    description: "수의학 연구기관 및 학술 목적",
    color: "border-slate-300 bg-gradient-to-b from-slate-50 to-white",
    badge: null,
    features: [
      "월간 트렌드 리포트",
      "품종별 질환 통계 (상위 50종)",
      "분기별 원시 데이터 제공",
      "기본 API 액세스 (1,000건/월)",
      "이메일 지원",
    ],
  },
  {
    id: "business",
    name: "비즈니스",
    price: "₩1,500,000",
    period: "/월",
    description: "사료/영양제 회사, 펫보험사",
    color: "border-violet-300 bg-gradient-to-b from-violet-50 to-white",
    badge: "인기",
    features: [
      "실시간 대시보드 액세스",
      "전 품종 질환/건강 데이터",
      "영양 보조제 효과 분석 리포트",
      "API 액세스 (무제한)",
      "맞춤 데이터 필터링",
      "전담 매니저 배정",
      "월간 컨설팅 1회",
    ],
  },
  {
    id: "enterprise",
    name: "엔터프라이즈",
    price: "별도 협의",
    period: "",
    description: "대규모 맞춤 데이터 파트너십",
    color: "border-slate-400 bg-gradient-to-b from-slate-800 to-slate-900",
    badge: "맞춤형",
    dark: true,
    features: [
      "비즈니스 플랜 전체 포함",
      "전용 데이터 파이프라인 구축",
      "맞춤형 분석 모델 개발",
      "원시 데이터 전량 제공",
      "공동 연구 프로젝트 참여",
      "24/7 전담 기술 지원",
      "SLA 보장",
    ],
  },
]

const TARGET_CUSTOMERS = [
  { icon: FlaskConical, name: "사료/영양제 회사", desc: "제품 개발 및 효능 검증" },
  { icon: ShieldCheck, name: "펫보험사", desc: "리스크 분석 및 보험 설계" },
  { icon: Building2, name: "수의학 연구기관", desc: "학술 연구 및 임상 데이터" },
]

export default function DataInsightsPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [contactName, setContactName] = useState("")
  const [email, setEmail] = useState("")
  const [interestArea, setInterestArea] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function openForm(planName: string) {
    setSelectedPlan(planName)
    setShowForm(true)
  }

  async function submitInquiry() {
    if (!companyName.trim() || !contactName.trim() || !email.trim()) {
      alert("필수 항목을 모두 입력해주세요")
      return
    }
    setSubmitting(true)

    await fetch("/api/data-partnership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name: companyName,
        contact_name: contactName,
        email,
        interest_area: interestArea,
        plan_name: selectedPlan,
      }),
    })

    setSubmitting(false)
    setSubmitted(true)
    setShowForm(false)
    setCompanyName("")
    setContactName("")
    setEmail("")
    setInterestArea("")
  }

  return (
    <>
      <Header title="데이터 인사이트" showBack />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-6">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-800 via-violet-900 to-slate-900 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-6 h-6 text-violet-300" />
            <span className="text-lg font-bold">PetCare 데이터 라이선싱</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            익명화된 반려동물 건강 데이터를 기반으로<br />
            업계 최고 수준의 인사이트를 제공합니다.
          </p>
          <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> 모든 데이터는 완전히 익명화되어 개인정보가 포함되지 않습니다
          </p>
        </div>

        {/* Aggregated Stats */}
        <div className="grid grid-cols-2 gap-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="relative overflow-hidden rounded-xl border border-slate-200 p-4">
              <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`} />
              <stat.icon className="w-5 h-5 text-slate-400 mb-2" />
              <p className="text-lg font-bold text-slate-900">{stat.value}</p>
              <p className="text-[11px] text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Success Banner */}
        {submitted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-emerald-800">파트너십 문의가 접수되었습니다!</p>
            <p className="text-xs text-emerald-600 mt-1">영업일 2~3일 내 담당자가 연락드리겠습니다.</p>
          </div>
        )}

        {/* Insight Cards */}
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-3">제공 데이터 인사이트</h2>
          <div className="space-y-3">
            {INSIGHT_CARDS.map((card) => (
              <div key={card.title} className={`rounded-xl border ${card.border} bg-gradient-to-r ${card.gradient} p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                  <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">{card.description}</p>
                <div className="bg-white/60 rounded-lg p-3 space-y-1.5">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Sample Data</p>
                  {card.sample.map((s, i) => (
                    <p key={i} className="text-xs text-slate-700">{s}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Target Customers */}
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-3">주요 대상 고객</h2>
          <div className="grid grid-cols-3 gap-2">
            {TARGET_CUSTOMERS.map((tc) => (
              <div key={tc.name} className="bg-slate-50 rounded-xl p-3 text-center">
                <tc.icon className="w-6 h-6 text-violet-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">{tc.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{tc.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Licensing Plans */}
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-3">데이터 라이선싱 플랜</h2>
          <div className="space-y-4">
            {PLANS.map((plan) => {
              const isDark = "dark" in plan && plan.dark
              return (
                <div key={plan.id} className={`rounded-2xl p-5 border-2 ${plan.color} relative`}>
                  {plan.badge && (
                    <span className={`absolute -top-2.5 right-4 px-2.5 py-0.5 text-[10px] font-bold rounded-full text-white ${
                      plan.badge === "인기" ? "bg-violet-500" : "bg-slate-600"
                    }`}>{plan.badge}</span>
                  )}

                  <div className="mb-3">
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{plan.description}</p>
                    <p className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{plan.name}</p>
                    <div className="flex items-baseline gap-0.5 mt-1">
                      <span className={`text-xl font-bold ${isDark ? "text-violet-300" : "text-violet-600"}`}>{plan.price}</span>
                      {plan.period && <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{plan.period}</span>}
                    </div>
                  </div>

                  <ul className="space-y-1.5 mb-4">
                    {plan.features.map((f, i) => (
                      <li key={i} className={`text-xs flex items-center gap-1.5 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                        <Check className={`w-3 h-3 shrink-0 ${isDark ? "text-violet-400" : "text-violet-500"}`} />{f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => openForm(plan.name)}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1 transition-colors ${
                      isDark
                        ? "bg-violet-500 text-white hover:bg-violet-400"
                        : "bg-slate-800 text-white hover:bg-slate-700"
                    }`}
                  >
                    파트너십 문의 <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Notice */}
        <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500 space-y-1">
          <p className="font-medium text-slate-700">안내사항</p>
          <p>• 모든 데이터는 K-익명성 기준을 충족하며, 개인 식별이 불가능합니다.</p>
          <p>• 데이터 활용 시 PetCare AI 출처 명시가 필요합니다.</p>
          <p>• 계약 조건 및 가격은 데이터 범위에 따라 조정될 수 있습니다.</p>
          <p>• 엔터프라이즈 플랜은 최소 12개월 계약이 필요합니다.</p>
        </div>
      </main>

      {/* Partnership Inquiry Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">데이터 파트너십 문의</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-violet-600">{selectedPlan}</span> 플랜에 대한 문의를 남겨주세요.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">회사명 *</label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="회사명을 입력하세요"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">담당자명 *</label>
                <input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="담당자 이름을 입력하세요"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">이메일 *</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="business@company.com"
                  type="email"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">관심 데이터 유형</label>
                <select
                  value={interestArea}
                  onChange={(e) => setInterestArea(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  <option value="">선택해주세요</option>
                  <option value="품종별 질환 데이터">품종별 질환 데이터</option>
                  <option value="연령별 건강 점수">연령별 건강 점수</option>
                  <option value="계절별 증상 트렌드">계절별 증상 트렌드</option>
                  <option value="영양 보조제 효과">영양 보조제 효과</option>
                  <option value="종합 데이터 패키지">종합 데이터 패키지</option>
                </select>
              </div>
            </div>

            <button
              onClick={submitInquiry}
              disabled={submitting || !companyName.trim() || !contactName.trim() || !email.trim()}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "문의하기"}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
