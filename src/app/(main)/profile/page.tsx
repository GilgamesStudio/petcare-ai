"use client"

import { useSession, signOut } from "next-auth/react"
import { Header } from "@/components/layout/header"
import { useRouter } from "next/navigation"
import {
  User, PawPrint, Shield, Bell, HelpCircle,
  ChevronRight, LogOut, Heart
} from "lucide-react"

export default function ProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()

  async function handleLogout() {
    await signOut({ redirect: false })
    router.push("/login")
  }

  const menuItems = [
    { icon: PawPrint, label: "내 반려동물", href: "/my-pets" },
    { icon: Heart, label: "건강 체크 기록", href: "/dashboard" },
    { icon: Bell, label: "알림 설정", href: "#" },
    { icon: Shield, label: "개인정보 보호", href: "#" },
    { icon: HelpCircle, label: "도움말", href: "#" },
  ]

  return (
    <>
      <Header title="프로필" />
      <main className="max-w-lg mx-auto px-4 py-5 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {session?.user?.name || "사용자"}
              </h2>
              <p className="text-sm text-gray-500">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={() => item.href !== "#" && router.push(item.href)}
              className={`w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left ${
                i < menuItems.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <item.icon className="w-5 h-5 text-gray-400" />
              <span className="flex-1 text-sm font-medium text-gray-700">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-white rounded-2xl py-4 shadow-sm text-red-500 font-medium hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </button>

        <p className="text-center text-xs text-gray-400">PetCare AI v1.0.0</p>
      </main>
    </>
  )
}
