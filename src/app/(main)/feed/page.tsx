"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import { BookOpen, Clock } from "lucide-react"

interface Article {
  id: string
  title: string
  content: string
  summary: string | null
  category: string
  tags: string[]
  created_at: string
}

const CATEGORY_LABELS: Record<string, string> = {
  HEALTH: "건강", NUTRITION: "영양", BEHAVIOR: "행동", TRAINING: "훈련",
}
const CATEGORY_COLORS: Record<string, string> = {
  HEALTH: "bg-emerald-100 text-emerald-700",
  NUTRITION: "bg-blue-100 text-blue-700",
  BEHAVIOR: "bg-purple-100 text-purple-700",
  TRAINING: "bg-orange-100 text-orange-700",
}

export default function FeedPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [filter, setFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const url = filter ? `/api/articles?category=${filter}` : "/api/articles"
    fetch(url)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setArticles(data) })
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <>
      <Header title="펫 피드" />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter("")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !filter ? "bg-emerald-600 text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            전체
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === key ? "bg-emerald-600 text-white" : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Articles */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">불러오는 중...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 text-gray-400">게시글이 없습니다</div>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                    <BookOpen className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[article.category]}`}>
                        {CATEGORY_LABELS[article.category]}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">{article.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {article.summary || article.content.slice(0, 100)}
                    </p>

                    {expandedId === article.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{article.content}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Clock className="w-3 h-3" />
                        {new Date(article.created_at).toLocaleDateString("ko")}
                      </span>
                      {article.tags?.map((tag) => (
                        <span key={tag} className="text-[10px] text-gray-400">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
