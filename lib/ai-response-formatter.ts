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

  // Clean up the message - be more careful with markdown preservation
  let cleanMessage = rawResponse
    // Remove product ID references but preserve markdown structure
    .replace(/\(Product ID[^)]*\)/gi, '')
    .replace(/Product ID[s]?:\s*[0-9,\s]+/gi, '')
    // Clean up excessive whitespace but preserve intentional line breaks
    .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace excessive newlines with double newline
    .trim()

  // Ensure proper markdown formatting
  cleanMessage = cleanMessage
    // Fix common markdown issues
    .replace(/\*\*\s+/g, '**') // Remove spaces after bold markers
    .replace(/\s+\*\*/g, '**') // Remove spaces before bold markers
    .replace(/\*\s+\*/g, '**') // Fix broken bold formatting
    // Ensure proper list formatting
    .replace(/^\*\s+/gm, '* ') // Ensure single space after list markers
    .replace(/^-\s+/gm, '- ') // Ensure single space after dash markers
    // Clean up headers
    .replace(/^#+\s*/gm, (match) => match.trim() + ' ') // Ensure space after header markers

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