export interface BotConfig {
  hotelInfo: string
  lastUpdated: string | null
  documentName: string | null
}

export const loadBotConfig = (): BotConfig | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const savedConfig = localStorage.getItem('botConfig')
    if (savedConfig) {
      return JSON.parse(savedConfig)
    }
  } catch (error) {
    console.error('Error loading bot config:', error)
  }
  
  return null
}

export const getBotKnowledgeBase = (): string => {
  const config = loadBotConfig()
  return config?.hotelInfo || ''
}

export const hasBotKnowledge = (): boolean => {
  const kb = getBotKnowledgeBase()
  return kb.trim().length > 0
}
