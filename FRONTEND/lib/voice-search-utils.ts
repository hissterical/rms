/**
 * Process voice search query using Google Gemini API
 * Converts natural language to search terms
 */
export async function processVoiceSearchWithGemini(
  transcript: string,
  language: string = 'en'
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('Gemini API key not configured, using direct transcript')
    return transcript
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a restaurant menu search assistant. A customer said: "${transcript}". 
                  
Extract the key search terms they want to search for in the menu. Return ONLY the search keywords or phrases, nothing else.

Examples:
- "I want something spicy" -> "spicy"
- "Do you have any vegan options?" -> "vegan"
- "Show me the salmon dishes" -> "salmon"
- "I'm looking for dessert" -> "dessert"
- "What appetizers do you have?" -> "appetizers"
- "I need something gluten free" -> "gluten-free"
- "Can I see the drinks menu?" -> "beverages"

Return only the search terms, no explanations:`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 50,
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (generatedText) {
      return generatedText
    }

    return transcript
  } catch (error) {
    console.error('Error processing with Gemini:', error)
    // Fallback to direct transcript if API fails
    return transcript
  }
}

/**
 * Simple fallback: Extract keywords from natural language without API
 */
export function extractSearchKeywords(transcript: string): string {
  const lowercaseTranscript = transcript.toLowerCase()
  
  // Common food-related keywords
  const keywords = [
    'spicy', 'vegan', 'vegetarian', 'gluten-free', 'gluten free',
    'salmon', 'chicken', 'beef', 'fish', 'pork',
    'dessert', 'appetizer', 'main', 'drink', 'beverage',
    'salad', 'soup', 'pasta', 'rice', 'noodles',
    'curry', 'pizza', 'burger', 'sandwich',
    'coffee', 'tea', 'juice', 'wine', 'beer'
  ]

  // Find matching keywords
  const foundKeywords = keywords.filter(keyword => 
    lowercaseTranscript.includes(keyword)
  )

  if (foundKeywords.length > 0) {
    return foundKeywords[0]
  }

  // Extract main words (nouns/adjectives)
  const words = transcript.split(' ').filter(word => word.length > 3)
  return words[0] || transcript
}
