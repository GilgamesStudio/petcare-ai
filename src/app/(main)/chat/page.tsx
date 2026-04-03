"use client"

import { useState, useRef, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Send, Loader2, Stethoscope, Camera } from "lucide-react"
import { useRouter } from "next/navigation"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface Pet {
  id: string
  name: string
  species: string
  breed?: string
  weight?: number
  birth_date?: string
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedPetId, setSelectedPetId] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/pets")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPets(data)
          if (data.length === 1) setSelectedPetId(data[0].id)
        }
      })
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const selectedPet = pets.find((p) => p.id === selectedPetId)

  const quickQuestions = [
    "우리 아이가 밥을 안 먹어요",
    "눈곱이 많이 끼어요",
    "자꾸 긁어요",
    "구토를 했어요",
  ]

  async function sendMessage(text?: string) {
    const msg = text || input.trim()
    if (!msg || loading) return

    setInput("")
    const userMsg: Message = { role: "user", content: msg }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: messages,
          petInfo: selectedPet
            ? {
                name: selectedPet.name,
                species: selectedPet.species,
                breed: selectedPet.breed,
                weight: selectedPet.weight,
                birthDate: selectedPet.birth_date,
              }
            : null,
        }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "죄송합니다, 오류가 발생했습니다. 다시 시도해주세요." },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 메시지에서 건강체크 추천 감지
  function parseHealthCheckSuggestion(content: string) {
    const types: { type: string; label: string }[] = [
      { type: "EYES", label: "눈 건강체크" },
      { type: "SKIN", label: "피부 건강체크" },
      { type: "TEETH", label: "치아 건강체크" },
      { type: "EARS", label: "귀 건강체크" },
      { type: "PAWS", label: "발 건강체크" },
      { type: "GAIT", label: "보행 건강체크" },
    ]
    return types.filter(
      (t) => content.includes(t.label) || content.includes(t.type)
    )
  }

  return (
    <>
      <Header
        title="AI 증상 상담"
        showBack
        rightAction={
          <button
            onClick={() => {
              setMessages([])
            }}
            className="text-xs text-gray-500 px-2 py-1"
          >
            새 상담
          </button>
        }
      />

      <main className="max-w-lg mx-auto flex flex-col" style={{ height: "calc(100dvh - 60px - 64px)" }}>
        {/* Pet Selection */}
        {pets.length > 0 && (
          <div className="px-4 py-2 border-b border-gray-100 bg-white">
            <div className="flex gap-2 overflow-x-auto">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => setSelectedPetId(pet.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedPetId === pet.id
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                      : "bg-gray-100 text-gray-500 border border-transparent"
                  }`}
                >
                  <span>{pet.species === "DOG" ? "🐶" : "🐱"}</span>
                  {pet.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <Stethoscope className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">AI 수의사 상담</h2>
                <p className="text-sm text-gray-500">
                  반려동물의 증상이나 걱정되는 점을<br />편하게 말씀해주세요
                </p>
              </div>
              <div className="w-full space-y-2">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-emerald-600 text-white rounded-br-md"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {/* 건강체크 추천 버튼 */}
                    {msg.role === "assistant" &&
                      parseHealthCheckSuggestion(msg.content).map((hc) => (
                        <button
                          key={hc.type}
                          onClick={() => router.push(`/health-check?type=${hc.type}`)}
                          className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-700"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          {hc.label} 하러 가기
                        </button>
                      ))}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
                    <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="증상을 설명해주세요..."
              className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="p-2.5 bg-emerald-600 text-white rounded-full disabled:opacity-40 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
