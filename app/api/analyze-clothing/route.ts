import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, description } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    console.log('Starting clothing analysis for:', imageUrl)

    // Check if Google API key is configured
    if (!process.env.GOOGLE_API_KEY) {
      console.warn('Google API key not configured, using fallback analysis')
      return NextResponse.json({ 
        metadata: getFallbackMetadata(description),
        usedFallback: true 
      })
    }

    try {
      // Fetch image with timeout
      const imageResponse = await Promise.race([
        fetch(imageUrl),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Image fetch timeout')), 10000)
        )
      ])
      
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

      // Gemini API call with timeout
      const result = await Promise.race([
        model.generateContent([
          prompt,
          {
            inlineData: {
              mimeType,
              data: base64Image
            }
          }
        ]),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Gemini API timeout')), 20000)
        )
      ])

      const response = await result.response
      const text = response.text()

      console.log('Gemini API response:', text)

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
      
      console.log('Parsed metadata:', fallbackMetadata)
      return NextResponse.json({ metadata: fallbackMetadata })

    } catch (aiError: any) {
      console.error('AI analysis failed:', aiError.message)
      console.log('Using fallback analysis based on description')
      
      // Return fallback metadata instead of failing
      return NextResponse.json({ 
        metadata: getFallbackMetadata(description),
        usedFallback: true,
        fallbackReason: aiError.message 
      })
    }

  } catch (error) {
    console.error('Clothing analysis error:', error)
    
    // Return fallback metadata even on error
    return NextResponse.json({ 
      metadata: getFallbackMetadata(''),
      usedFallback: true,
      error: 'Analysis service unavailable' 
    })
  }
}

function getFallbackMetadata(description?: string): any {
  // Extract basic info from description if available
  const desc = (description || '').toLowerCase()
  
  let type = 'other'
  if (desc.includes('shirt') || desc.includes('t-shirt') || desc.includes('tee')) type = 'shirt'
  else if (desc.includes('pant') || desc.includes('jean') || desc.includes('trouser')) type = 'pants'
  else if (desc.includes('suit')) type = 'suit'
  else if (desc.includes('dress')) type = 'dress'
  else if (desc.includes('jacket') || desc.includes('coat')) type = 'outerwear'
  
  let style = 'casual'
  if (desc.includes('formal') || desc.includes('business')) style = 'formal'
  else if (desc.includes('sport')) style = 'athletic'
  
  return {
    type,
    colors: 'Various',
    style,
    material: 'Unknown',
    pattern: 'Unknown',
    fit: 'Regular',
    features: description || 'User uploaded item',
    confidence_score: 0.5
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
