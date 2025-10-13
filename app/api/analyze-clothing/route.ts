import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, description } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    // Get the image data from Cloudinary URL
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image')
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')

    // Determine MIME type from URL
    const mimeType = imageUrl.includes('.jpg') || imageUrl.includes('.jpeg')
      ? 'image/jpeg'
      : imageUrl.includes('.png')
      ? 'image/png'
      : 'image/jpeg'

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `Analyze this clothing item and provide detailed metadata. Include:
- Type of clothing (shirt, pants, dress, etc.)
- Color(s)
- Style/occasion (casual, formal, business, etc.)
- Material/fabric if visible
- Pattern (solid, striped, patterned, etc.)
- Fit (loose, fitted, slim, etc.)
- Any notable features or details

Additional context: ${description || 'No additional description provided'}

Return the analysis as a JSON object with these fields: type, colors, style, material, pattern, fit, features, confidence_score (0-1)`

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

    // Try to parse the JSON response
    try {
      const metadata = JSON.parse(text)
      return NextResponse.json({ metadata })
    } catch (parseError) {
      // If JSON parsing fails, create a structured response from the text
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
      return NextResponse.json({ metadata: fallbackMetadata })
    }

  } catch (error) {
    console.error('Clothing analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze clothing item' },
      { status: 500 }
    )
  }
}

function extractFromText(text: string, field: string): string {
  const lowerText = text.toLowerCase()
  const fieldIndex = lowerText.indexOf(field + ':')
  if (fieldIndex !== -1) {
    const start = fieldIndex + field.length + 1
    const end = lowerText.indexOf('\n', start)
    return text.substring(start, end !== -1 ? end : text.length).trim()
  }
  return 'Unknown'
}