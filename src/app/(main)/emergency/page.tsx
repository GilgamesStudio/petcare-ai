"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import {
  AlertTriangle, Phone, ChevronDown, ChevronUp,
  Droplets, Skull, Zap, ThermometerSun, Bone, Bug, Scissors, Heart
} from "lucide-react"

interface EmergencyGuide {
  id: string
  title: string
  icon: typeof AlertTriangle
  color: string
  severity: "HIGH" | "MEDIUM"
  symptoms: string[]
  doList: string[]
  dontList: string[]
  whenToVisitVet: string
}

const GUIDES: EmergencyGuide[] = [
  {
    id: "vomiting",
    title: "구토",
    icon: Droplets,
    color: "bg-orange-100 text-orange-600",
    severity: "MEDIUM",
    symptoms: ["반복적인 구토 (2시간 내 3회 이상)", "구토물에 혈액이 섞임", "무기력함과 동반", "복부 팽만"],
    doList: [
      "12~24시간 금식 (물은 소량 허용)",
      "구토 횟수, 시간, 구토물 색상 기록",
      "구토물 사진 촬영 (수의사 참고용)",
      "소량의 물을 자주 제공 (탈수 방지)",
    ],
    dontList: [
      "억지로 먹이지 않기",
      "인간용 소화제 투여하지 않기",
      "구토 직후 물을 많이 주지 않기",
    ],
    whenToVisitVet: "24시간 이상 구토가 지속되거나, 혈액이 섞인 구토, 심한 무기력함이 동반되면 즉시 병원 방문",
  },
  {
    id: "poisoning",
    title: "중독/오독",
    icon: Skull,
    color: "bg-red-100 text-red-600",
    severity: "HIGH",
    symptoms: ["과도한 침 흘림", "구토/설사", "경련/떨림", "호흡 곤란", "의식 저하"],
    doList: [
      "섭취한 물질, 양, 시간을 정확히 기록",
      "남은 물질이나 포장지를 보관",
      "즉시 동물 응급 병원에 연락",
      "입 안에 남은 물질을 조심스럽게 제거",
    ],
    dontList: [
      "구토를 유도하지 않기 (부식성 물질일 수 있음)",
      "우유나 물을 억지로 먹이지 않기",
      "인터넷 민간요법 시도하지 않기",
    ],
    whenToVisitVet: "🚨 즉시 동물병원 방문. 중독은 시간이 생명입니다.",
  },
  {
    id: "seizure",
    title: "경련/발작",
    icon: Zap,
    color: "bg-purple-100 text-purple-600",
    severity: "HIGH",
    symptoms: ["전신 떨림", "의식 소실", "사지 경직", "침 과다 분비", "대소변 실금"],
    doList: [
      "주변의 위험한 물건 치우기",
      "발작 시간 측정 (5분 이상이면 응급)",
      "조용하고 어두운 환경 만들기",
      "발작 영상 촬영 (수의사 참고용)",
    ],
    dontList: [
      "발작 중 입에 손이나 물건 넣지 않기",
      "억지로 안거나 움직이지 않기",
      "큰 소리를 내지 않기",
    ],
    whenToVisitVet: "🚨 첫 발작이거나 5분 이상 지속, 연속 발작 시 즉시 병원 방문",
  },
  {
    id: "heatstroke",
    title: "열사병",
    icon: ThermometerSun,
    color: "bg-red-100 text-red-600",
    severity: "HIGH",
    symptoms: ["과도한 헐떡임", "침 과다 분비", "잇몸이 붉거나 창백", "구토/설사", "비틀거림"],
    doList: [
      "즉시 시원한 곳으로 이동",
      "미지근한 물로 몸을 적시기 (찬물 X)",
      "선풍기 바람 쐬어주기",
      "소량의 시원한 물 제공",
      "겨드랑이, 사타구니에 젖은 수건",
    ],
    dontList: [
      "얼음물이나 아주 찬 물 사용하지 않기",
      "급격한 체온 저하 시키지 않기",
      "물에 강제로 담그지 않기",
    ],
    whenToVisitVet: "🚨 체온이 40°C 이상이거나 의식이 저하되면 즉시 병원 방문",
  },
  {
    id: "fracture",
    title: "골절/외상",
    icon: Bone,
    color: "bg-amber-100 text-amber-600",
    severity: "HIGH",
    symptoms: ["다리를 절뚝거림", "부종", "만지면 통증 반응", "비정상적인 각도의 사지"],
    doList: [
      "움직임을 최소화하고 안정시키기",
      "개방 상처가 있으면 깨끗한 천으로 가볍게 덮기",
      "출혈 시 깨끗한 천으로 압박",
      "담요나 보드 위에 조심스럽게 올려 운반",
    ],
    dontList: [
      "부목을 직접 대지 않기",
      "골절 부위를 만지거나 맞추려 하지 않기",
      "진통제 투여하지 않기",
    ],
    whenToVisitVet: "🚨 골절이 의심되면 즉시 병원 방문. 움직임을 최소화하고 이동",
  },
  {
    id: "tick",
    title: "진드기/벌레 물림",
    icon: Bug,
    color: "bg-green-100 text-green-600",
    severity: "MEDIUM",
    symptoms: ["피부에 작은 혹/돌출", "과도한 긁기", "발적/부종", "무기력함 (알레르기 반응 시)"],
    doList: [
      "진드기 제거 핀셋으로 머리 부분을 잡고 천천히 당기기",
      "제거 후 소독약으로 부위 소독",
      "제거한 진드기 보관 (감염 확인용)",
      "2~3주간 발열, 식욕저하 등 관찰",
    ],
    dontList: [
      "진드기를 손으로 짜거나 비틀어 뽑지 않기",
      "매니큐어, 바셀린 등 바르지 않기",
      "불로 지지지 않기",
    ],
    whenToVisitVet: "물린 부위가 심하게 붓거나, 발열/무기력함이 나타나면 병원 방문",
  },
  {
    id: "wound",
    title: "상처/출혈",
    icon: Scissors,
    color: "bg-pink-100 text-pink-600",
    severity: "MEDIUM",
    symptoms: ["눈에 보이는 상처", "출혈", "통증 반응", "해당 부위 핥기"],
    doList: [
      "깨끗한 물로 상처 세척",
      "깨끗한 거즈로 10분간 압박하여 지혈",
      "상처 부위를 핥지 못하도록 넥카라 착용",
      "소독약(포비돈 요오드 희석액) 도포",
    ],
    dontList: [
      "과산화수소(H₂O₂)로 세척하지 않기",
      "인간용 연고 바르지 않기",
      "반창고로 꽉 감지 않기 (순환 장애)",
    ],
    whenToVisitVet: "상처가 깊거나, 10분 압박 후에도 출혈이 멈추지 않으면 병원 방문",
  },
  {
    id: "choking",
    title: "질식/이물질",
    icon: Heart,
    color: "bg-red-100 text-red-600",
    severity: "HIGH",
    symptoms: ["기침/구역질", "호흡 곤란", "입을 벌리고 헐떡임", "잇몸이 파래짐", "발로 입 주변 긁기"],
    doList: [
      "입 안을 확인하고 보이는 이물질은 조심스럽게 제거",
      "소형견: 뒤집어 등을 두드리기",
      "대형견: 하임리히법 (갈비뼈 아래 위로 밀어올리기)",
      "호흡이 멈추면 심폐소생술",
    ],
    dontList: [
      "손가락을 깊이 넣어 이물질을 밀어넣지 않기",
      "당황하여 물을 먹이지 않기",
    ],
    whenToVisitVet: "🚨 이물질이 제거되지 않거나 호흡 곤란이 지속되면 즉시 병원 방문",
  },
]

export default function EmergencyPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <>
      <Header title="응급 가이드" showBack />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Emergency Call */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <Phone className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-800">응급 상황 시</p>
              <p className="text-xs text-red-600">가까운 24시간 동물병원에 연락하세요</p>
            </div>
          </div>
          <a href="tel:119" className="block w-full py-2.5 bg-red-600 text-white text-center rounded-xl text-sm font-semibold mt-2">
            119 긴급 전화
          </a>
        </div>

        <p className="text-xs text-gray-500 px-1">
          아래 가이드는 응급 상황에서의 기본 대처법입니다. 정확한 진단과 치료는 반드시 수의사에게 받으세요.
        </p>

        {/* Guide Cards */}
        {GUIDES.map(guide => {
          const isOpen = expandedId === guide.id
          return (
            <div key={guide.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedId(isOpen ? null : guide.id)}
                className="w-full flex items-center gap-3 p-4"
              >
                <div className={`p-2 rounded-lg ${guide.color}`}>
                  <guide.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{guide.title}</span>
                    {guide.severity === "HIGH" && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full font-bold">긴급</span>
                    )}
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-50 pt-3">
                  {/* Symptoms */}
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1.5">주요 증상</p>
                    <div className="flex flex-wrap gap-1.5">
                      {guide.symptoms.map((s, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Do */}
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 mb-1.5">✅ 이렇게 하세요</p>
                    <ul className="space-y-1">
                      {guide.doList.map((d, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <span className="text-emerald-500 mt-0.5 shrink-0">•</span>{d}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Don't */}
                  <div>
                    <p className="text-xs font-semibold text-red-700 mb-1.5">❌ 하지 마세요</p>
                    <ul className="space-y-1">
                      {guide.dontList.map((d, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <span className="text-red-500 mt-0.5 shrink-0">•</span>{d}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* When to visit */}
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-amber-800 mb-1">🏥 병원 방문 기준</p>
                    <p className="text-xs text-amber-700">{guide.whenToVisitVet}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </main>
    </>
  )
}
