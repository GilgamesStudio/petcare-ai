"use client"

import Link from "next/link"
import { PawPrint, Camera, Heart, Shield } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Hero */}
      <div className="max-w-lg mx-auto px-6 pt-16 pb-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-3xl mb-6">
            <PawPrint className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            PetCare AI
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            AI로 반려동물의 건강을<br />스마트하게 관리하세요
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/signup"
              className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-semibold text-center hover:bg-emerald-700 transition-colors"
            >
              무료로 시작하기
            </Link>
            <Link
              href="/login"
              className="w-full py-3.5 bg-white text-emerald-600 border border-emerald-200 rounded-xl font-semibold text-center hover:bg-emerald-50 transition-colors"
            >
              로그인
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">주요 기능</h2>

          {[
            {
              icon: Camera,
              color: "bg-blue-100 text-blue-600",
              title: "AI 건강 체크",
              desc: "카메라로 촬영하면 AI가 눈, 피부, 치아 등의 건강 상태를 분석합니다",
            },
            {
              icon: Heart,
              color: "bg-rose-100 text-rose-600",
              title: "맞춤 케어 플랜",
              desc: "반려동물의 상태에 맞는 월간 건강 관리 계획을 제공합니다",
            },
            {
              icon: Shield,
              color: "bg-amber-100 text-amber-600",
              title: "건강 기록 관리",
              desc: "검사 결과를 기록하고 건강 변화를 한눈에 추적합니다",
            },
          ].map((feature) => (
            <div key={feature.title} className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm">
              <div className={`p-3 rounded-xl ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-12 pb-8">
          &copy; 2026 PetCare AI. All rights reserved.
        </p>
      </div>
    </div>
  )
}
