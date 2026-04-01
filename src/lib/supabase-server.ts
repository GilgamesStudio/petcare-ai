import { createClient } from "@supabase/supabase-js"

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const SPECIES_LABELS: Record<string, string> = {
  DOG: "강아지",
  CAT: "고양이",
}

export const GENDER_LABELS: Record<string, string> = {
  MALE: "수컷",
  FEMALE: "암컷",
}

export const CHECK_TYPE_LABELS: Record<string, string> = {
  EYES: "눈",
  SKIN: "피부",
  TEETH: "치아",
  EARS: "귀",
  PAWS: "발",
  GAIT: "보행",
}

export const STATUS_LABELS: Record<string, string> = {
  NORMAL: "정상",
  CAUTION: "주의",
  WARNING: "경고",
}

export const STATUS_COLORS: Record<string, string> = {
  NORMAL: "bg-emerald-100 text-emerald-700",
  CAUTION: "bg-amber-100 text-amber-700",
  WARNING: "bg-red-100 text-red-700",
}

export const CATEGORY_LABELS: Record<string, string> = {
  HEALTH: "건강",
  NUTRITION: "영양",
  BEHAVIOR: "행동",
  TRAINING: "훈련",
}

export const CATEGORY_COLORS: Record<string, string> = {
  HEALTH: "bg-emerald-100 text-emerald-700",
  NUTRITION: "bg-blue-100 text-blue-700",
  BEHAVIOR: "bg-purple-100 text-purple-700",
  TRAINING: "bg-orange-100 text-orange-700",
}
