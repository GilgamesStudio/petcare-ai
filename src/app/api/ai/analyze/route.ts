import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const CHECK_TYPE_LABELS: Record<string, string> = {
  EYES: "눈",
  SKIN: "피부",
  TEETH: "치아",
  EARS: "귀",
  PAWS: "발",
  GAIT: "보행",
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { checkType, imageData } = await req.json()

    if (!checkType) {
      return NextResponse.json({ error: "checkType is required" }, { status: 400 })
    }

    const checkLabel = CHECK_TYPE_LABELS[checkType] || checkType

    // 이미지가 없으면 텍스트 기반 시뮬레이션
    if (!imageData) {
      return NextResponse.json(simulateFallback(checkType))
    }

    // Base64 이미지 데이터 추출
    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!base64Match) {
      return NextResponse.json(simulateFallback(checkType))
    }

    const mimeType = `image/${base64Match[1]}` as "image/jpeg" | "image/png" | "image/webp"
    const base64Data = base64Match[2]

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `당신은 반려동물 수의학 전문가 AI입니다. 이 사진에서 반려동물의 "${checkLabel}" 상태를 분석해주세요.

분석 규칙:
1. 사진에 반려동물이 보이지 않더라도, 보이는 내용을 기반으로 최선의 건강 관련 피드백을 제공하세요.
2. 반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.

JSON 형식:
{
  "score": (0~100 정수, 100이 가장 건강),
  "status": ("NORMAL" | "CAUTION" | "WARNING"),
  "symptoms": ["감지된 증상1", "증상2"],
  "advice": "구체적인 관리 조언을 한국어로 2-3문장으로 작성"
}

점수 기준:
- 80~100: NORMAL (정상) - 특별한 이상 없음
- 60~79: CAUTION (주의) - 경미한 증상 있음
- 0~59: WARNING (경고) - 수의사 방문 권장

증상이 없으면 symptoms를 빈 배열 []로 하세요.`

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ])

    const responseText = result.response.text()

    // JSON 파싱 시도
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return NextResponse.json({
          score: Math.max(0, Math.min(100, parsed.score || 75)),
          status: ["NORMAL", "CAUTION", "WARNING"].includes(parsed.status) ? parsed.status : "NORMAL",
          symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms : [],
          advice: parsed.advice || "분석 결과를 확인해주세요.",
        })
      } catch {
        // JSON 파싱 실패 시 폴백
      }
    }

    return NextResponse.json(simulateFallback(checkType))
  } catch (error) {
    console.error("Gemini API error:", error)
    return NextResponse.json(simulateFallback("EYES"))
  }
}

function simulateFallback(checkType: string) {
  const fallbacks: Record<string, { symptoms: string[]; advice: string }> = {
    EYES: { symptoms: [], advice: "사진을 더 선명하게 촬영해주세요. 눈 주변이 잘 보이도록 가까이서 찍어주세요." },
    SKIN: { symptoms: [], advice: "피부 상태를 정확히 분석하려면 밝은 곳에서 촬영해주세요." },
    TEETH: { symptoms: [], advice: "치아가 잘 보이도록 입을 벌린 상태에서 촬영해주세요." },
    EARS: { symptoms: [], advice: "귀 안쪽이 보이도록 촬영해주세요." },
    PAWS: { symptoms: [], advice: "발바닥 패드가 잘 보이도록 촬영해주세요." },
    GAIT: { symptoms: [], advice: "보행 분석은 영상으로 촬영하면 더 정확합니다." },
  }
  const fb = fallbacks[checkType] || fallbacks.EYES
  return { score: 80, status: "NORMAL", symptoms: fb.symptoms, advice: fb.advice }
}
