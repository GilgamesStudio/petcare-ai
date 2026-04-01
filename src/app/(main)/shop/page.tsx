"use client"

import { Header } from "@/components/layout/header"
import { ShoppingBag, Star, ExternalLink } from "lucide-react"

const products = [
  { id: 1, name: "관절 건강 글루코사민", desc: "관절과 연골 건강을 위한 프리미엄 보조제", price: "32,000원", rating: 4.8, category: "영양제", tag: "인기" },
  { id: 2, name: "오메가-3 피모 건강", desc: "피부와 모질 개선을 위한 오메가-3 영양제", price: "28,000원", rating: 4.7, category: "영양제", tag: "추천" },
  { id: 3, name: "프로바이오틱스 장건강", desc: "장내 유익균 증식을 위한 유산균", price: "25,000원", rating: 4.6, category: "영양제", tag: null },
  { id: 4, name: "덴탈 케어 스틱", desc: "치석 제거와 구강 건강을 위한 덴탈 스틱", price: "18,000원", rating: 4.5, category: "관리용품", tag: "인기" },
  { id: 5, name: "눈 세정 티슈", desc: "눈물 자국 제거 및 눈 주변 청결 관리", price: "15,000원", rating: 4.4, category: "관리용품", tag: null },
  { id: 6, name: "귀 세정제", desc: "귀지 제거 및 귀 건강 유지를 위한 세정제", price: "16,000원", rating: 4.3, category: "관리용품", tag: null },
  { id: 7, name: "하이포알러지 사료", desc: "알레르기 민감한 반려동물을 위한 저자극 사료", price: "45,000원", rating: 4.7, category: "사료", tag: "추천" },
  { id: 8, name: "발 보습 밤", desc: "건조한 발 패드를 촉촉하게 보호", price: "12,000원", rating: 4.5, category: "관리용품", tag: null },
]

export default function ShopPage() {
  return (
    <>
      <Header title="추천 상품" />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-5 h-5" />
            <span className="font-bold">맞춤 추천 상품</span>
          </div>
          <p className="text-sm opacity-80">AI 건강 체크 결과를 기반으로 추천합니다</p>
        </div>

        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  {product.category === "영양제" ? "💊" : product.category === "사료" ? "🥣" : "🧴"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{product.name}</h3>
                    {product.tag && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        product.tag === "인기" ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                      }`}>
                        {product.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{product.desc}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-emerald-600">{product.price}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-gray-500">{product.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 py-4">
          <ExternalLink className="w-3 h-3 inline mr-1" />
          상품 구매는 외부 쇼핑몰로 연결됩니다
        </p>
      </main>
    </>
  )
}
