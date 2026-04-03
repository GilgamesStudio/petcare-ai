"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import {
  MessageSquare, Heart, Plus, X, Send, Loader2, ChevronLeft
} from "lucide-react"

interface Post {
  id: string
  title: string
  content: string
  category: string
  author_name: string
  comments_count: number
  likes_count: number
  created_at: string
}

interface Comment {
  id: string
  content: string
  author_name: string
  created_at: string
}

const CATEGORIES = [
  { value: "ALL", label: "전체" },
  { value: "GENERAL", label: "일반" },
  { value: "HEALTH", label: "건강" },
  { value: "NUTRITION", label: "사료/영양" },
  { value: "TRAINING", label: "훈련" },
  { value: "SHOW_OFF", label: "자랑" },
]

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL: "bg-gray-100 text-gray-600",
  HEALTH: "bg-emerald-100 text-emerald-700",
  NUTRITION: "bg-orange-100 text-orange-700",
  TRAINING: "bg-blue-100 text-blue-700",
  SHOW_OFF: "bg-pink-100 text-pink-700",
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState("ALL")
  const [showWrite, setShowWrite] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  // Write form
  const [writeTitle, setWriteTitle] = useState("")
  const [writeContent, setWriteContent] = useState("")
  const [writeCategory, setWriteCategory] = useState("GENERAL")
  const [submitting, setSubmitting] = useState(false)

  // Post detail
  const [detailPost, setDetailPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [commentInput, setCommentInput] = useState("")
  const [commentLoading, setCommentLoading] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [category])

  async function loadPosts() {
    setLoading(true)
    const res = await fetch(`/api/posts?category=${category}`)
    const data = await res.json()
    if (Array.isArray(data)) setPosts(data)
    setLoading(false)
  }

  async function submitPost() {
    if (!writeTitle.trim() || !writeContent.trim()) return
    setSubmitting(true)
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: writeTitle, content: writeContent, category: writeCategory }),
    })
    setShowWrite(false)
    setWriteTitle("")
    setWriteContent("")
    setWriteCategory("GENERAL")
    setSubmitting(false)
    loadPosts()
  }

  async function openPost(postId: string) {
    setSelectedPostId(postId)
    const res = await fetch(`/api/posts/${postId}`)
    const data = await res.json()
    setDetailPost(data.post)
    setComments(data.comments || [])
    setLiked(data.liked)
    setLikesCount(data.likes_count)
  }

  async function toggleLike() {
    if (!selectedPostId) return
    await fetch(`/api/posts/${selectedPostId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "like" }),
    })
    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1)
  }

  async function submitComment() {
    if (!commentInput.trim() || !selectedPostId) return
    setCommentLoading(true)
    const res = await fetch(`/api/posts/${selectedPostId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentInput }),
    })
    const newComment = await res.json()
    setComments([...comments, newComment])
    setCommentInput("")
    setCommentLoading(false)
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "방금"
    if (mins < 60) return `${mins}분 전`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}시간 전`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}일 전`
    return new Date(dateStr).toLocaleDateString("ko")
  }

  // Post Detail View
  if (selectedPostId && detailPost) {
    return (
      <>
        <Header
          title="게시글"
          showBack
          rightAction={
            <button onClick={() => { setSelectedPostId(null); setDetailPost(null) }} className="p-2">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          }
        />
        <main className="max-w-lg mx-auto flex flex-col" style={{ height: "calc(100dvh - 60px - 64px)" }}>
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
            {/* Post */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[detailPost.category] || CATEGORY_COLORS.GENERAL}`}>
                  {CATEGORIES.find((c) => c.value === detailPost.category)?.label}
                </span>
                <span className="text-xs text-gray-400">{timeAgo(detailPost.created_at)}</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{detailPost.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{detailPost.content}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                <span>{detailPost.author_name}</span>
              </div>
            </div>

            {/* Like & Stats */}
            <div className="flex items-center gap-4 py-3 border-y border-gray-100">
              <button onClick={toggleLike} className="flex items-center gap-1.5">
                <Heart className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                <span className="text-sm text-gray-600">{likesCount}</span>
              </button>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">{comments.length}</span>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">{c.author_name}</span>
                    <span className="text-[10px] text-gray-400">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-600">{c.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Comment Input */}
          <div className="px-4 py-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); submitComment() } }}
                placeholder="댓글을 입력하세요..."
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={commentLoading}
              />
              <button
                onClick={submitComment}
                disabled={!commentInput.trim() || commentLoading}
                className="p-2.5 bg-emerald-600 text-white rounded-full disabled:opacity-40"
              >
                {commentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header title="커뮤니티" showBack />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                category === cat.value
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            아직 게시글이 없어요. 첫 번째 글을 작성해보세요!
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <button
                key={post.id}
                onClick={() => openPost(post.id)}
                className="w-full text-left bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[post.category] || CATEGORY_COLORS.GENERAL}`}>
                    {CATEGORIES.find((c) => c.value === post.category)?.label}
                  </span>
                  <span className="text-[10px] text-gray-400">{timeAgo(post.created_at)}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{post.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-400">
                  <span>{post.author_name}</span>
                  <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" /> {post.likes_count}</span>
                  <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" /> {post.comments_count}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Write Button (FAB) */}
        <button
          onClick={() => setShowWrite(true)}
          className="fixed bottom-20 right-4 max-w-lg w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-emerald-700 transition-colors z-40"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Write Modal */}
        {showWrite && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
            <div className="bg-white w-full max-w-lg rounded-t-2xl p-5 space-y-4 animate-in slide-in-from-bottom">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">글 작성</h3>
                <button onClick={() => setShowWrite(false)} className="p-1"><X className="w-5 h-5 text-gray-400" /></button>
              </div>

              <div className="flex gap-2">
                {CATEGORIES.filter((c) => c.value !== "ALL").map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setWriteCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                      writeCategory === cat.value ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={writeTitle}
                onChange={(e) => setWriteTitle(e.target.value)}
                placeholder="제목"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <textarea
                value={writeContent}
                onChange={(e) => setWriteContent(e.target.value)}
                placeholder="내용을 입력하세요..."
                rows={5}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              <button
                onClick={submitPost}
                disabled={!writeTitle.trim() || !writeContent.trim() || submitting}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "작성하기"}
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
