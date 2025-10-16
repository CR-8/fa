import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

type WardrobeDbItem = {
  id: string
  user_id: string
  name: string
  category: string
  color?: string
  size?: string
  description?: string
  image_url: string
  metadata?: Record<string, any>
}

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Supabase environment variables are not configured')
  }
  return createClient(url, key, {
    auth: { persistSession: false }
  })
}

function buildPrompt(occasion: string, items: WardrobeDbItem[]) {
  const itemsJson = items.map(i => ({
    id: i.id,
    name: i.name,
    category: i.category,
    color: i.color,
    size: i.size,
    metadata: i.metadata || {},
  }))

  return `You are a professional stylist.
The user is asking for outfit recommendations for the occasion: "${occasion}".

You are given the user's wardrobe items as JSON array. You MUST use only these items to form complete outfit combinations. Prefer color harmony and consistent style. Consider metadata fields like style, occasion, material, pattern, and fit when relevant.

Wardrobe items (JSON):
${JSON.stringify(itemsJson)}

Return ONLY valid JSON with the following exact schema:
{
  "occasion": string,
  "recommendations": [
    {
      "title": string,              // short vibe name, e.g., "Casual Chic"
      "items": [
        { "id": string, "name": string, "category": string }
      ],
      "why": string                 // 1-2 sentences explaining color/style harmony
    }
  ]
}

Rules:
- Provide exactly 3 recommendations when possible. If the wardrobe is too small, provide as many as possible (at least 1).
- Always reference items by id that exist in the provided list.
- Keep explanations concise and practical.
`
}

function safeParseJson<T = any>(text: string): T | null {
  try {
    // Trim code fences if present
    const cleaned = text.trim().replace(/^```json\n?|```$/gim, '').trim()
    return JSON.parse(cleaned) as T
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { occasion, userId, limit } = await request.json()

    if (!occasion || typeof occasion !== 'string' || occasion.trim().length === 0) {
      return NextResponse.json({ error: 'occasion is required' }, { status: 400 })
    }

    const resolvedUserId = typeof userId === 'string' && userId.trim().length > 0 ? userId : 'user-1'

    // Fetch wardrobe
    const supabase = getServerSupabase()
    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('id,user_id,name,category,color,size,description,image_url,metadata')
      .eq('user_id', resolvedUserId)
      .order('created_at', { ascending: false })
      .limit(typeof limit === 'number' ? Math.min(Math.max(limit, 10), 200) : 100)

    if (error) {
      console.error('Supabase fetch error:', error)
      return NextResponse.json({ error: 'Failed to load wardrobe items' }, { status: 500 })
    }

    const wardrobe: WardrobeDbItem[] = data || []
    if (!wardrobe.length) {
      return NextResponse.json({ error: 'Wardrobe is empty for this user' }, { status: 400 })
    }

    // Build prompt and call Gemini
    const prompt = buildPrompt(occasion, wardrobe)

    // Try preferred model, then fallback
    const modelNames = [
      process.env.GEMINI_MODEL || 'gemini-2.0-flash'
    ]

    let aiText = ''
    let lastErr: any
    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        })
        aiText = (await result.response).text()
        if (aiText) break
      } catch (err) {
        lastErr = err
        console.warn(`Model ${modelName} failed, trying fallback...`, err)
      }
    }

    if (!aiText) {
      console.error('Gemini returned empty response', lastErr)
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
    }

    const parsed = safeParseJson<{ occasion: string; recommendations: { title: string; items: { id: string; name: string; category: string }[]; why: string }[] }>(aiText)
    if (!parsed || !Array.isArray(parsed.recommendations)) {
      // Fallback: build a naive single recommendation using top 2-3 items
      const fallback = {
        occasion,
        recommendations: [
          {
            title: 'Versatile Combo',
            items: wardrobe.slice(0, Math.min(3, wardrobe.length)).map(i => ({ id: i.id, name: i.name, category: i.category })),
            why: 'A simple, cohesive look picked from your recent items.'
          }
        ]
      }
      return NextResponse.json(fallback, { status: 200 })
    }

    // Ensure referenced IDs exist in wardrobe; filter invalids
    const validIds = new Set(wardrobe.map(w => w.id))
    const cleaned = {
      occasion: parsed.occasion || occasion,
      recommendations: parsed.recommendations
        .slice(0, 3)
        .map(rec => ({
          title: rec.title?.toString().slice(0, 60) || 'Outfit',
          why: rec.why?.toString().slice(0, 300) || '',
          items: (rec.items || [])
            .filter(it => it && typeof it.id === 'string' && validIds.has(it.id))
            .map(it => ({ id: it.id, name: it.name?.toString() || '', category: it.category?.toString() || '' }))
            .slice(1, 10) // keep 1-10 items; accidental long lists trimmed
        }))
        .filter(r => r.items.length > 0)
    }

    if (cleaned.recommendations.length === 0) {
      // Final fallback if AI referenced no valid items
      const fallback = {
        occasion,
        recommendations: [
          {
            title: 'Quick Match',
            items: wardrobe.slice(0, Math.min(3, wardrobe.length)).map(i => ({ id: i.id, name: i.name, category: i.category })),
            why: 'A quick combination from your wardrobe.'
          }
        ]
      }
      return NextResponse.json(fallback, { status: 200 })
    }

    return NextResponse.json(cleaned, { status: 200 })
  } catch (error: any) {
    console.error('Wardrobe recommendation error:', error)
    if (error?.status === 429) {
      return NextResponse.json({ error: 'Rate limited, please retry shortly.' }, { status: 429 })
    }
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}
