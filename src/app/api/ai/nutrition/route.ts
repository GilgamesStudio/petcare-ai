import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { species, breed, age, weight, currentFood, treats, supplements } = await req.json()

    if (!species || !currentFood) {
      return NextResponse.json({ error: "species and currentFood required" }, { status: 400 })
    }

    const speciesLabel = species === "DOG" ? "개" : "고양이"
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `당신은 반려동물 영양학 전문가입니다. 다음 정보를 바탕으로 영양 분석을 해주세요.

반려동물 정보:
- 종류: ${speciesLabel}
${breed ? `- 품종: ${breed}` : ""}
${age ? `- 나이: ${age}` : ""}
${weight ? `- 체중: ${weight}kg` : ""}

현재 급여 정보:
- 주식 사료: ${currentFood}
${treats ? `- 간식: ${treats}` : ""}
${supplements ? `- 보충제: ${supplements}` : ""}

반드시 아래 JSON 형식으로만 응답하세요:
{
  "overallScore": (0~100 정수, 100이 최적),
  "overallGrade": "A/B/C/D",
  "analysis": {
    "protein": { "score": (0~100), "comment": "한줄 평가" },
    "fat": { "score": (0~100), "comment": "한줄 평가" },
    "fiber": { "score": (0~100), "comment": "한줄 평가" },
    "vitamins": { "score": (0~100), "comment": "한줄 평가" },
    "minerals": { "score": (0~100), "comment": "한줄 평가" }
  },
  "concerns": ["주의사항1", "주의사항2"],
  "recommendations": ["추천사항1", "추천사항2", "추천사항3"],
  "supplementSuggestions": [
    { "name": "보충제명", "reason": "추천 이유 (1문장)" }
  ],
  "dailyCalories": "하루 권장 칼로리 (예: 300~350kcal)",
  "feedingTip": "급여 팁 (1-2문장)"
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        return NextResponse.json(JSON.parse(jsonMatch[0]))
      } catch { /* fallback */ }
    }

    return NextResponse.json({ error: "Failed to analyze" }, { status: 500 })
  } catch (error) {
    console.error("Nutrition API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
