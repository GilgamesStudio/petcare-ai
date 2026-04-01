"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import Link from "next/link"
import { CheckCircle, AlertTriangle, XCircle, ArrowRight } from "lucide-react"

const CHECK_TYPE_LABELS: Record<string, string> = {
  EYES: "눈", SKIN: "피부", TEETH: "치아", EARS: "귀", PAWS: "발", GAIT: "보행",
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">불러오는 중...</div>}>
      <ResultContent />
    </Suspense>
  )
}

function ResultContent() {
  const searchParams = useSearchParams()
  const score = parseInt(searchParams.get("score") || "0")
  const status = searchParams.get("status") || "NORMAL"
  const symptoms: string[] = JSON.parse(searchParams.get("symptoms") || "[]")
  const advice = searchParams.get("advice") || ""
  const checkType = searchParams.get("checkType") || ""

  const statusConfig = {
    NORMAL: { label: "정상", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", ring: "ring-emerald-200" },
    CAUTION: { label: "주의", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50", ring: "ring-amber-200" },
    WARNING: { label: "경고", icon: XCircle, color: "text-red-500", bg: "bg-red-50", ring: "ring-red-200" },
  }[status] || { label: "정상", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", ring: "ring-emerald-200" }

  const StatusIcon = statusConfig.icon
  const scoreColor = score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500"
  const progressColor = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500"

  return (
    <>
      <Header title="분석 결과" showBack />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-6">
        {/* Score Card */}
        <div className={`${statusConfig.bg} rounded-2xl p-6 text-center ring-1 ${statusConfig.ring}`}>
          <StatusIcon className={`w-12 h-12 mx-auto mb-3 ${statusConfig.color}`} />
          <p className="text-sm font-medium text-gray-500 mb-1">
            {CHECK_TYPE_LABELS[checkType]} 검사 결과
          </p>
          <div className={`text-5xl font-bold ${scoreColor} mb-2`}>{score}</div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.color}`}>
            {statusConfig.label}
          </span>

          {/* Score Bar */}
          <div className="mt-4 bg-white/60 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${progressColor} transition-all duration-1000`}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* Detected Symptoms */}
        {symptoms.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3">감지된 증상</h3>
            <div className="space-y-2">
              {symptoms.map((symptom, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-gray-700">{symptom}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Advice */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-3">AI 추천 조언</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{advice}</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/health-check"
            className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-semibold text-center hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
          >
            다른 부위 검사하기 <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="w-full py-3.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold text-center hover:bg-gray-50 transition-colors block"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </main>
    </>
  )
}
