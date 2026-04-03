import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI, Content } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const SYSTEM_PROMPT = `당신은 "펫케어 AI 수의사"입니다. 반려동물(개, 고양이) 건강 상담 전문 AI 챗봇입니다.

역할:
- 보호자가 설명하는 증상을 듣고, 가능한 원인과 대처법을 안내합니다.
- 긴급한 증상일 경우 즉시 동물병원 방문을 권유합니다.
- 친절하고 공감적인 톤으로 대화합니다.

규칙:
1. 항상 한국어로 답변하세요.
2. 답변은 간결하게 2-4문장으로 하세요.
3. 심각한 증상(구토 반복, 출혈, 발작, 의식 저하 등)에는 반드시 "🚨 긴급: 즉시 동물병원을 방문하세요"를 포함하세요.
4. 진단을 내리지 마세요. "~일 수 있습니다", "~가 의심됩니다" 같은 표현을 사용하세요.
5. 관련 건강체크 기능이 있다면 추천하세요 (예: "눈 건강체크를 해보시겠어요?").
6. 의약품 처방이나 용량을 절대 안내하지 마세요.

참고 - 앱에서 제공하는 건강체크 종류:
- 눈(EYES): 충혈, 눈곱, 결막 상태
- 피부(SKIN): 발적, 탈모, 건조
- 치아(TEETH): 치석, 잇몸 염증
- 귀(EARS): 귀지, 염증, 이물질
- 발(PAWS): 패드 상태, 발톱
- 보행(GAIT): 보행 이상, 근골격`

export async function POST(req: NextRequest) {
  try {
    const { message, history, petInfo } = await req.json()

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // 반려동물 정보가 있으면 시스템 프롬프트에 추가
    let contextPrompt = SYSTEM_PROMPT
    if (petInfo) {
      contextPrompt += `\n\n현재 상담 중인 반려동물 정보:
- 이름: ${petInfo.name}
- 종: ${petInfo.species === "DOG" ? "개" : "고양이"}
${petInfo.breed ? `- 품종: ${petInfo.breed}` : ""}
${petInfo.weight ? `- 체중: ${petInfo.weight}kg` : ""}
${petInfo.birthDate ? `- 생년월일: ${petInfo.birthDate}` : ""}`
    }

    // 대화 히스토리 구성
    const chatHistory: Content[] = [
      { role: "user", parts: [{ text: contextPrompt + "\n\n위 내용을 숙지하고, 이제부터 반려동물 건강 상담을 시작합니다. 첫 인사를 해주세요." }] },
      { role: "model", parts: [{ text: petInfo ? `안녕하세요! ${petInfo.name} 보호자님 😊 펫케어 AI 수의사입니다. ${petInfo.name}에 대해 궁금한 점이나 걱정되는 증상이 있으시면 편하게 말씀해주세요.` : "안녕하세요! 펫케어 AI 수의사입니다 😊 반려동물의 건강에 대해 궁금한 점이 있으시면 편하게 말씀해주세요." }] },
    ]

    // 이전 대화 히스토리 추가
    if (Array.isArray(history)) {
      for (const msg of history) {
        chatHistory.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        })
      }
    }

    const chat = model.startChat({ history: chatHistory })
    const result = await chat.sendMessage(message)
    const reply = result.response.text()

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({
      reply: "죄송합니다, 일시적으로 응답할 수 없습니다. 잠시 후 다시 시도해주세요.",
    })
  }
}
