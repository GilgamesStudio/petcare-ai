"use client"

import { Suspense, useState, useRef, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import {
  Eye, Brush, SmilePlus, Ear, Footprints, Activity,
  Camera, Upload, X, Loader2
} from "lucide-react"

const checkTypes = [
  { type: "EYES", label: "눈", icon: Eye, color: "bg-blue-500", desc: "눈 충혈, 눈곱, 결막 상태 분석" },
  { type: "SKIN", label: "피부", icon: Brush, color: "bg-pink-500", desc: "피부 발적, 탈모, 건조 분석" },
  { type: "TEETH", label: "치아", icon: SmilePlus, color: "bg-purple-500", desc: "치석, 잇몸 염증, 구강 분석" },
  { type: "EARS", label: "귀", icon: Ear, color: "bg-amber-500", desc: "귀지, 염증, 이물질 분석" },
  { type: "PAWS", label: "발", icon: Footprints, color: "bg-orange-500", desc: "패드 상태, 발톱, 상처 분석" },
  { type: "GAIT", label: "보행", icon: Activity, color: "bg-teal-500", desc: "보행 패턴, 근골격 이상 분석" },
]

export default function HealthCheckPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">불러오는 중...</div>}>
      <HealthCheckContent />
    </Suspense>
  )
}

function HealthCheckContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialType = searchParams.get("type") || ""

  const [selectedType, setSelectedType] = useState(initialType)
  const [selectedPetId, setSelectedPetId] = useState("")
  const [pets, setPets] = useState<{ id: string; name: string; species: string }[]>([])
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

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

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setShowCamera(true)
    } catch {
      alert("카메라에 접근할 수 없습니다. 권한을 확인해주세요.")
    }
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d")?.drawImage(video, 0, 0)
    const imageData = canvas.toDataURL("image/jpeg", 0.8)
    setCapturedImage(imageData)
    stopCamera()
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCapturedImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function analyzeImage() {
    if (!selectedType || !selectedPetId) {
      alert("반려동물과 검사 항목을 선택해주세요")
      return
    }
    setAnalyzing(true)

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkType: selectedType, imageData: capturedImage }),
      })
      const result = await res.json()

      // 결과 저장
      await fetch("/api/health-checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pet_id: selectedPetId,
          check_type: selectedType,
          score: result.score,
          status: result.status,
          symptoms: result.symptoms,
          advice: result.advice,
        }),
      })

      // 결과 페이지로 이동
      const params = new URLSearchParams({
        score: result.score.toString(),
        status: result.status,
        symptoms: JSON.stringify(result.symptoms),
        advice: result.advice,
        checkType: selectedType,
        petId: selectedPetId,
      })
      router.push(`/health-check/result?${params.toString()}`)
    } catch {
      alert("분석 중 오류가 발생했습니다")
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <>
      <Header title="AI 건강 체크" showBack />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-6">
        {/* Pet Selection */}
        {pets.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">반려동물 선택</label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => setSelectedPetId(pet.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedPetId === pet.id
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  <span>{pet.species === "DOG" ? "🐶" : "🐱"}</span>
                  {pet.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Check Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">검사 항목</label>
          <div className="grid grid-cols-3 gap-2">
            {checkTypes.map((ct) => (
              <button
                key={ct.type}
                onClick={() => setSelectedType(ct.type)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-colors ${
                  selectedType === ct.type
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-white text-gray-600"
                }`}
              >
                <ct.icon className="w-5 h-5" />
                {ct.label}
              </button>
            ))}
          </div>
          {selectedType && (
            <p className="text-xs text-gray-500 mt-2 px-1">
              {checkTypes.find((c) => c.type === selectedType)?.desc}
            </p>
          )}
        </div>

        {/* Camera / Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">사진 촬영</label>

          {showCamera ? (
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video ref={videoRef} autoPlay playsInline className="w-full aspect-[4/3] object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <button
                  onClick={stopCamera}
                  className="p-3 bg-white/80 rounded-full"
                >
                  <X className="w-6 h-6 text-gray-700" />
                </button>
                <button
                  onClick={capturePhoto}
                  className="p-4 bg-white rounded-full shadow-lg"
                >
                  <div className="w-10 h-10 rounded-full border-4 border-emerald-500" />
                </button>
              </div>
            </div>
          ) : capturedImage ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={capturedImage} alt="촬영된 사진" className="w-full aspect-[4/3] object-cover" />
              <button
                onClick={() => setCapturedImage(null)}
                className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={startCamera}
                className="flex-1 flex flex-col items-center gap-2 bg-white border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-emerald-300 transition-colors"
              >
                <Camera className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500">카메라 촬영</span>
              </button>
              <label className="flex-1 flex flex-col items-center gap-2 bg-white border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-emerald-300 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500">사진 업로드</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* Analyze Button */}
        <button
          onClick={analyzeImage}
          disabled={!capturedImage || !selectedType || !selectedPetId || analyzing}
          className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              AI 분석 중...
            </>
          ) : (
            "AI 건강 분석 시작"
          )}
        </button>

        {!capturedImage && (
          <p className="text-xs text-gray-400 text-center">
            사진을 촬영하거나 업로드한 후 분석을 시작하세요
          </p>
        )}
      </main>
    </>
  )
}
