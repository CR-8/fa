import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, description } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    // Fetch image
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) throw new Error('Failed to fetch image')
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const mimeType = imageUrl.endsWith('.png') ? 'image/png' : 'image/jpeg'

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `Analyze this clothing item and provide the following information in a simple format:

Type: [shirt, pants, dress, etc.]
Color: [main color]
Style: [casual, formal, business, etc.]
Material: [cotton, wool, etc.]
Pattern: [solid, striped, etc.]
Fit: [loose, fitted, etc.]
Features: [any notable details]

Additional context: ${description || 'No additional description provided'}

Please respond with just the field names and values, one per line.`

    // Correct format for Gemini API with vision
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Image
        }
      }
    ])

    const response = await result.response
    const text = response.text()

    console.log('Gemini API response:', text) // Debug log

    // Since we're asking for simple text format, use fallback parsing
    const fallbackMetadata = {
      type: extractFromText(text, 'type'),
      colors: extractFromText(text, 'color'),
      style: extractFromText(text, 'style'),
      material: extractFromText(text, 'material'),
      pattern: extractFromText(text, 'pattern'),
      fit: extractFromText(text, 'fit'),
      features: extractFromText(text, 'features'),
      confidence_score: 0.8
    }
    console.log('Parsed metadata:', fallbackMetadata) // Debug log
    return NextResponse.json({ metadata: fallbackMetadata })

  } catch (error) {
    console.error('Clothing analysis error:', error)
    return NextResponse.json({ error: 'Failed to analyze clothing item' }, { status: 500 })
  }
}

function extractFromText(text: string, field: string): string {
  const lines = text.split('\n')
  const fieldLower = field.toLowerCase()

  for (const line of lines) {
    const lineLower = line.toLowerCase().trim()
    if (lineLower.startsWith(fieldLower + ':')) {
      const value = line.substring(line.indexOf(':') + 1).trim()
      return value || 'Unknown'
    }
  }

  // Fallback search
  const regex = new RegExp(`${fieldLower}\\s*:\\s*([^\\n\\r]+)`, 'i')
  const match = text.match(regex)
  if (match) {
    return match[1].trim()
  }

  return 'Unknown'
}
