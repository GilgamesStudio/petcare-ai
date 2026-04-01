"use client"

import { Bell, ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface HeaderProps {
  title: string
  showBack?: boolean
  rightAction?: React.ReactNode
}

export function Header({ title, showBack, rightAction }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="max-w-lg mx-auto flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          {showBack && (
            <button onClick={() => router.back()} className="p-1 -ml-1">
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {rightAction || (
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
