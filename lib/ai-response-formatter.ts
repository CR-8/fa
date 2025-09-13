export interface FormattedAIResponse {
  message: string
  suggestedProducts: string[]
}

export function formatAIResponse(rawResponse: string): FormattedAIResponse {
  // Extract product IDs from the response
  const productIdMatches = rawResponse.match(/Product ID[s]?:\s*([0-9,\s]+)/gi)
  const suggestedProductIds = productIdMatches 
    ? productIdMatches
        .join(' ')
        .replace(/Product ID[s]?:\s*/gi, '')
        .split(/[,\s]+/)
        .map(id => id.trim())
        .filter(id => id && /^\d+$/.test(id))
    : []

  // Clean up the message
  let cleanMessage = rawResponse
    // Remove product ID references
    .replace(/\(Product ID[^)]*\)/gi, '')
    .replace(/Product ID[s]?:\s*[0-9,\s]+/gi, '')
    // Clean up excessive asterisks and formatting
    .replace(/\*\*([^*]+)\*\*/g, '**$1**') // Ensure proper bold formatting
    .replace(/\* \*\*/g, '* **') // Fix list item formatting
    .replace(/\*\s+/g, '* ') // Clean up list spacing
    // Remove redundant whitespace
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim()

  // Add proper markdown formatting for better readability
  cleanMessage = cleanMessage
    // Ensure proper spacing around headers
    .replace(/^([^#\n])/gm, '\n$1')
    .replace(/\n\n\n+/g, '\n\n')
    .trim()

  return {
    message: cleanMessage,
    suggestedProducts: suggestedProductIds
  }
}

export function extractProductRecommendations(response: string): string[] {
  const patterns = [
    /Product ID[s]?:\s*([0-9,\s]+)/gi,
    /ID[s]?:\s*([0-9,\s]+)/gi,
    /product[s]?\s+([0-9,\s]+)/gi
  ]
  
  const allMatches: string[] = []
  
  patterns.forEach(pattern => {
    const matches = response.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const ids = match.replace(/[^0-9,\s]/g, '')
          .split(/[,\s]+/)
          .map(id => id.trim())
          .filter(id => id && /^\d+$/.test(id))
        allMatches.push(...ids)
      })
    }
  })
  
  // Remove duplicates and return
  return [...new Set(allMatches)]
}