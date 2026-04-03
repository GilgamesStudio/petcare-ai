import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { species, breed, age, weight } = await req.json()

    if (!species || !breed) {
      return NextResponse.json({ error: "species and breed are required" }, { status: 400 })
    }

    const speciesLabel = species === "DOG" ? "개" : "고양이"
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `당신은 반려동물 수의학 전문가입니다. ${speciesLabel} 품종 "${breed}"에 대한 맞춤형 건강 가이드를 작성해주세요.
${age ? `나이: ${age}` : ""}
${weight ? `체중: ${weight}kg` : ""}

반드시 아래 JSON 형식으로만 응답하세요:
{
  "breedInfo": {
    "origin": "원산지",
    "lifespan": "평균 수명",
    "sizeCategory": "소형/중형/대형",
    "temperament": "성격 특징 (1-2문장)"
  },
  "commonDiseases": [
    { "name": "질병명", "risk": "HIGH/MEDIUM/LOW", "description": "설명 (1문장)", "prevention": "예방법 (1문장)" }
  ],
  "careGuide": {
    "exercise": "운동 가이드 (1-2문장)",
    "nutrition": "영양 가이드 (1-2문장)",
    "grooming": "그루밍 가이드 (1-2문장)",
    "checkups": "정기검진 가이드 (1문장)"
  },
  "seasonalTips": [
    { "season": "봄/여름/가을/겨울", "tip": "계절별 관리 팁 (1문장)" }
  ]
}

commonDiseases는 3-5개, seasonalTips는 4개(계절별 1개)로 작성하세요.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return NextResponse.json(parsed)
      } catch {
        // fallback
      }
    }

    return NextResponse.json({ error: "Failed to generate guide" }, { status: 500 })
  } catch (error) {
    console.error("Breed guide API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
