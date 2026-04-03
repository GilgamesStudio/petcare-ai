import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

// 댓글 목록 + 좋아요 토글
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [postRes, commentsRes] = await Promise.all([
    supabase.from("posts").select("*, users!posts_user_id_fkey(name)").eq("id", id).single(),
    supabase.from("comments").select("*, users!comments_user_id_fkey(name)").eq("post_id", id).order("created_at", { ascending: true }),
  ])

  if (postRes.error) return NextResponse.json({ error: postRes.error.message }, { status: 500 })

  const session = await auth()
  let liked = false
  if (session?.user?.id) {
    const { data } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", id)
      .eq("user_id", session.user.id)
      .maybeSingle()
    liked = !!data
  }

  const { data: likesData } = await supabase
    .from("post_likes")
    .select("id", { count: "exact" })
    .eq("post_id", id)

  return NextResponse.json({
    post: { ...postRes.data, author_name: (postRes.data.users as Record<string, unknown>)?.name || "익명" },
    comments: (commentsRes.data || []).map((c: Record<string, unknown>) => ({
      ...c,
      author_name: (c.users as Record<string, unknown>)?.name || "익명",
    })),
    liked,
    likes_count: likesData?.length || 0,
  })
}

// 좋아요 토글
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { action } = await req.json()

  if (action === "like") {
    const { data: existing } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", id)
      .eq("user_id", session.user.id)
      .maybeSingle()

    if (existing) {
      await supabase.from("post_likes").delete().eq("id", existing.id)
    } else {
      await supabase.from("post_likes").insert({ post_id: id, user_id: session.user.id })
    }
    return NextResponse.json({ success: true })
  }

  if (action === "comment") {
    const { content } = await req.json()
    if (!content) return NextResponse.json({ error: "content required" }, { status: 400 })

    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: id, user_id: session.user.id, content })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}

// 댓글 추가
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { content } = await req.json()
  if (!content) return NextResponse.json({ error: "content required" }, { status: 400 })

  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: id, user_id: session.user.id, content })
    .select("*, users!comments_user_id_fkey(name)")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    ...data,
    author_name: (data.users as Record<string, unknown>)?.name || "익명",
  })
}
