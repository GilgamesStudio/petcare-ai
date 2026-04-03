import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category")

  let query = supabase
    .from("posts")
    .select("*, users!posts_user_id_fkey(name), comments(count), post_likes(count)")
    .order("created_at", { ascending: false })
    .limit(50)

  if (category && category !== "ALL") {
    query = query.eq("category", category)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const posts = (data || []).map((p: Record<string, unknown>) => ({
    ...p,
    author_name: (p.users as Record<string, unknown>)?.name || "익명",
    comments_count: Array.isArray(p.comments) ? (p.comments[0] as Record<string, unknown>)?.count || 0 : 0,
    likes_count: Array.isArray(p.post_likes) ? (p.post_likes[0] as Record<string, unknown>)?.count || 0 : 0,
  }))

  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, content, category } = await req.json()
  if (!title || !content) return NextResponse.json({ error: "title and content required" }, { status: 400 })

  const { data, error } = await supabase
    .from("posts")
    .insert({ user_id: session.user.id, title, content, category: category || "GENERAL" })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
