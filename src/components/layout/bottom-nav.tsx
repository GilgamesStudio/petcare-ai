"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Camera, PawPrint, Newspaper, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: Home, label: "홈" },
  { href: "/health-check", icon: Camera, label: "건강체크" },
  { href: "/my-pets", icon: PawPrint, label: "내 반려동물" },
  { href: "/feed", icon: Newspaper, label: "피드" },
  { href: "/profile", icon: User, label: "프로필" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-colors",
                isActive
                  ? "text-emerald-600"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
