"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useGuest } from "@/contexts/guest-context"
import { useVoiceSearch } from "@/hooks/use-voice-search"
import { processVoiceSearchWithGemini, extractSearchKeywords } from "@/lib/voice-search-utils"
import { generateMenuQRCode, downloadQRCode } from "@/lib/qr-utils"
import { fetchMenu, createOrder, MenuItem as APIMenuItem, OrderItem as APIOrderItem } from "@/lib/api-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import Chatbot from "@/components/chatbot"
import { 
  ArrowLeft, 
  QrCode,
  Mic,
  MicOff,
  Search,
  Plus,
  Minus,
  ShoppingCart,
  Users,
  DollarSign,
  CreditCard,
  Check,
  Bell,
  Star,
  Clock,
  Flame,
  Leaf,
  Coffee,
  Utensils,
  Pizza,
  Sandwich,
  IceCream,
  Wine,
  Languages,
  Volume2,
  Share2,
  User,
  AlertCircle,
  Home,
  Download
} from "lucide-react"

type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'zh' | 'ja' | 'ar'

type MenuCategory = 'appetizers' | 'mains' | 'desserts' | 'beverages' | 'specials'

interface MenuItem {
  id: string
  name: string
  nameTranslations: Record<Language, string>
  description: string
  descriptionTranslations: Record<Language, string>
  price: number
  category: MenuCategory
  image: string
  dietary: ('vegetarian' | 'vegan' | 'gluten-free' | 'spicy')[]
  rating: number
  prepTime: number
  calories?: number
}

interface CartItem extends MenuItem {
  quantity: number
  specialInstructions?: string
}

interface GroupMember {
  id: string
  name: string
  items: CartItem[]
  total: number
}

export default function FoodOrderingPage() {
  const searchParams = useSearchParams()
  const roomNumber = searchParams.get('room') || '301'
  const tableNumber = searchParams.get('table') || '1'
  const restaurantId = searchParams.get('restaurant') || '241022a8-f6a9-4a27-b110-9c63e8646493'
  
  const router = useRouter()
  const { checkInData } = useGuest()
  const { toast } = useToast()
  
  // State management
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en')
  const [searchQuery, setSearchQuery] = useState('')
  const [voiceSearchQuery, setVoiceSearchQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'all'>('all')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [isGroupOrder, setIsGroupOrder] = useState(false)
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])
  const [currentMember, setCurrentMember] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [splitBillMode, setSplitBillMode] = useState<'equal' | 'individual' | 'custom'>('individual')
  const [showQRMenu, setShowQRMenu] = useState(false)
  const [callingWaiter, setCallingWaiter] = useState(false)
  const [menuQRImage, setMenuQRImage] = useState<string>('')
  const [generatingQR, setGeneratingQR] = useState(false)
  
  // API state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoadingMenu, setIsLoadingMenu] = useState(true)
  const [menuError, setMenuError] = useState<string | null>(null)

  // Language options
  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ]

  // Map language codes to speech recognition language codes
  const getRecognitionLanguage = (lang: Language): string => {
    const langMap: Record<Language, string> = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'zh': 'zh-CN',
      'ja': 'ja-JP',
      'ar': 'ar-SA'
    }
    return langMap[lang] || 'en-US'
  }

  // Voice search hook with dynamic language - Simple STT to search bar
  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceSearch({
    language: getRecognitionLanguage(selectedLanguage),
    continuous: false,
    interimResults: true,
    onResult: (finalTranscript) => {
      // Direct speech-to-text to search bar
      setSearchQuery(finalTranscript)
      toast({
        title: "Voice search completed",
        description: `Searching for: ${finalTranscript}`,
      })
    },
    onError: (error) => {
      toast({
        title: "Voice search error",
        description: error === 'not-allowed' 
          ? "Please allow microphone access to use voice search"
          : "An error occurred during voice search",
        variant: "destructive"
      })
    }
  })

  // Update search bar with interim results while speaking
  useEffect(() => {
    if (isListening && interimTranscript) {
      setSearchQuery(interimTranscript)
    }
  }, [interimTranscript, isListening])

  // Fetch menu items from qrback API
  useEffect(() => {
    async function loadMenu() {
      try {
        setIsLoadingMenu(true)
        setMenuError(null)
        
        const apiMenuItems = await fetchMenu(restaurantId, tableNumber)
        
        // Transform API menu items to match UI structure
        const transformedItems: MenuItem[] = apiMenuItems.map((apiItem) => {
          // Parse dietary info if it's a JSON string or array
          let dietaryArray: ('vegetarian' | 'vegan' | 'gluten-free' | 'spicy')[] = []
          if (apiItem.dietary_info) {
            if (Array.isArray(apiItem.dietary_info)) {
              dietaryArray = apiItem.dietary_info as any
            } else if (typeof apiItem.dietary_info === 'string') {
              try {
                dietaryArray = JSON.parse(apiItem.dietary_info)
              } catch {
                dietaryArray = []
              }
            }
          }
          
          // Create simple translations (same in all languages for now)
          const nameTranslations: Record<Language, string> = {
            en: apiItem.name,
            es: apiItem.name,
            fr: apiItem.name,
            de: apiItem.name,
            it: apiItem.name,
            zh: apiItem.name,
            ja: apiItem.name,
            ar: apiItem.name
          }
          
          const descTranslations: Record<Language, string> = {
            en: apiItem.description || '',
            es: apiItem.description || '',
            fr: apiItem.description || '',
            de: apiItem.description || '',
            it: apiItem.description || '',
            zh: apiItem.description || '',
            ja: apiItem.description || '',
            ar: apiItem.description || ''
          }
          
          return {
            id: String(apiItem.id),
            name: apiItem.name,
            nameTranslations,
            description: apiItem.description || '',
            descriptionTranslations: descTranslations,
            price: Number(apiItem.price),
            category: (apiItem.category || 'mains') as MenuCategory,
            image: apiItem.image_url || '/placeholder.jpg',
            dietary: dietaryArray,
            rating: 4.5, // Default rating
            prepTime: apiItem.prep_time || 15,
            calories: apiItem.calories
          }
        })
        
        setMenuItems(transformedItems)
        
        if (transformedItems.length === 0) {
          toast({
            title: "No menu items found",
            description: "The restaurant menu is currently empty. Please contact staff.",
            variant: "default"
          })
        }
      } catch (error) {
        console.error('Error fetching menu:', error)
        setMenuError(error instanceof Error ? error.message : 'Failed to load menu')
        toast({
          title: "Backend Not Connected",
          description: "Could not connect to the restaurant system on port 3001. Please start the backend.",
          variant: "destructive"
        })
        
        // Show empty state - no fallback data
        setMenuItems([])
      } finally {
        setIsLoadingMenu(false)
      }
    }
    
    loadMenu()
  }, [restaurantId, tableNumber])

  const categories = [
    { id: 'all' as const, name: 'All Items', icon: Utensils },
    { id: 'appetizers' as const, name: 'Appetizers', icon: Pizza },
    { id: 'mains' as const, name: 'Main Courses', icon: Utensils },
    { id: 'desserts' as const, name: 'Desserts', icon: IceCream },
    { id: 'beverages' as const, name: 'Beverages', icon: Coffee },
    { id: 'specials' as const, name: 'Today\'s Specials', icon: Star }
  ]

  // Voice search functionality - Simple toggle
  const handleVoiceSearch = () => {
    if (!isSupported) {
      toast({
        title: "Voice search not supported",
        description: "Your browser doesn't support voice recognition. Please use Chrome or Edge.",
        variant: "destructive"
      })
      return
    }

    if (isListening) {
      stopListening()
      toast({
        title: "Stopped listening",
        description: "Voice search stopped",
      })
    } else {
      resetTranscript()
      startListening()
      toast({
        title: "Listening...",
        description: "Speak now to search the menu",
      })
    }
  }

  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      item.nameTranslations[selectedLanguage].toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.descriptionTranslations[selectedLanguage].toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.dietary.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  // Cart management
  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const removeFromCart = (itemId: string) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId)
    
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(cartItem => 
        cartItem.id === itemId 
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ))
    } else {
      setCart(cart.filter(cartItem => cartItem.id !== itemId))
    }
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  // Group ordering
  const addGroupMember = (name: string) => {
    const newMember: GroupMember = {
      id: `member-${Date.now()}`,
      name,
      items: [],
      total: 0
    }
    setGroupMembers([...groupMembers, newMember])
  }

  const assignItemToMember = (memberId: string, item: CartItem) => {
    setGroupMembers(groupMembers.map(member => {
      if (member.id === memberId) {
        const existingItem = member.items.find(i => i.id === item.id)
        if (existingItem) {
          return {
            ...member,
            items: member.items.map(i => 
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
            total: member.total + (item.price * item.quantity)
          }
        } else {
          return {
            ...member,
            items: [...member.items, item],
            total: member.total + (item.price * item.quantity)
          }
        }
      }
      return member
    }))
  }

  // Call waiter
  const callWaiter = () => {
    setCallingWaiter(true)
    
    // Simulate calling waiter
    setTimeout(() => {
      setCallingWaiter(false)
      alert('Waiter has been notified and will arrive shortly!')
    }, 2000)
  }

  // Payment
  const handlePayment = async () => {
    try {
      // Prepare order items for API
      const orderItems: APIOrderItem[] = cart.map(item => ({
        menu_item_id: Number(item.id),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        special_notes: item.specialInstructions
      }))
      
      // Create order via API
      const order = await createOrder({
        restaurant_id: Number(restaurantId),
        table_number: Number(tableNumber),
        items: orderItems,
        total_amount: getCartTotal(),
        customer_name: checkInData?.guests?.[0]?.guestName || 'Guest',
        special_instructions: cart
          .filter(item => item.specialInstructions)
          .map(item => `${item.name}: ${item.specialInstructions}`)
          .join('; ')
      })
      
      toast({
        title: "Order placed successfully!",
        description: `Order #${order.id} - Total: $${getCartTotal().toFixed(2)}`,
      })
      
      // Clear cart and close modals
      setCart([])
      setShowPayment(false)
      setShowCart(false)
    } catch (error) {
      console.error('Error placing order:', error)
      toast({
        title: "Failed to place order",
        description: "Please try again or contact staff for assistance.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/room-services?room=${roomNumber}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Restaurant Menu</h1>
                <p className="text-sm text-gray-600">
                  {tableNumber ? `Table ${tableNumber}` : `Room ${roomNumber}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as Language)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>

              {/* Call Waiter Button */}
              <Button
                onClick={callWaiter}
                disabled={callingWaiter}
                variant="outline"
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                {callingWaiter ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                    </motion.div>
                    Calling...
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Call Waiter
                  </>
                )}
              </Button>

              {/* Cart Button */}
              <Button
                onClick={() => setShowCart(true)}
                variant="default"
                className="bg-teal-600 hover:bg-teal-700 relative"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
                {getCartItemCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                    {getCartItemCount()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Search Bar with Voice */}
          <div className="mt-4 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={`Search menu in ${languages.find(l => l.code === selectedLanguage)?.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-6 text-lg"
              />
            </div>
            
            <Button
              onClick={handleVoiceSearch}
              variant="outline"
              size="lg"
              disabled={isProcessing}
              className={`px-6 ${isListening ? 'bg-red-50 border-red-500 text-red-600' : ''}`}
            >
              {isListening ? (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <MicOff className="h-5 w-5 mr-2" />
                  </motion.div>
                  Listening...
                </>
              ) : isProcessing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Mic className="h-5 w-5 mr-2" />
                  </motion.div>
                  Processing...
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  Voice Search
                </>
              )}
            </Button>

            <Button
              onClick={async () => {
                setShowQRMenu(true)
                if (!menuQRImage) {
                  setGeneratingQR(true)
                  try {
                    const restaurantId = 'restaurant-1' // Mock restaurant ID
                    const table = tableNumber ? parseInt(tableNumber) : 1
                    const qrDataURL = await generateMenuQRCode(restaurantId, table)
                    setMenuQRImage(qrDataURL)
                  } catch (error) {
                    console.error('Error generating QR code:', error)
                    toast({
                      title: "Error",
                      description: "Failed to generate QR code",
                      variant: "destructive"
                    })
                  } finally {
                    setGeneratingQR(false)
                  }
                }
              }}
              variant="outline"
              size="lg"
              className="px-6"
            >
              <QrCode className="h-5 w-5 mr-2" />
              QR Menu
            </Button>
          </div>

          {(voiceSearchQuery || interimTranscript) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 space-y-1"
            >
              {interimTranscript && isListening && (
                <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                  <Volume2 className="h-4 w-4 animate-pulse" />
                  {interimTranscript}...
                </div>
              )}
              {voiceSearchQuery && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Volume2 className="h-4 w-4" />
                  <span className="font-medium">You said:</span> "{voiceSearchQuery}"
                  {searchQuery !== voiceSearchQuery && (
                    <span className="text-teal-600">→ Searching: "{searchQuery}"</span>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {!isSupported && (
            <div className="mt-2 flex items-center gap-2 text-sm text-teal-600 bg-teal-50 p-2 rounded">
              <AlertCircle className="h-4 w-4" />
              Voice search requires Chrome, Edge, or Safari browser
            </div>
          )}
        </div>
      </header>

      {/* Category Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => {
            const Icon = category.icon
            return (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`whitespace-nowrap ${
                  selectedCategory === category.id 
                    ? 'bg-teal-600 hover:bg-teal-700' 
                    : ''
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {category.name}
              </Button>
            )
          })}
        </div>

        {/* Group Order Toggle */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsGroupOrder(!isGroupOrder)}
              variant={isGroupOrder ? "default" : "outline"}
              className={isGroupOrder ? 'bg-slate-700 hover:bg-slate-800' : ''}
            >
              <Users className="h-4 w-4 mr-2" />
              {isGroupOrder ? 'Group Order Active' : 'Enable Group Order'}
            </Button>

            {isGroupOrder && (
              <Button
                onClick={() => {
                  const name = prompt('Enter member name:')
                  if (name) addGroupMember(name)
                }}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            )}
          </div>

          <div className="text-sm text-gray-600">
            {filteredItems.length} items found
          </div>
        </div>

        {/* Group Members */}
        {isGroupOrder && groupMembers.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {groupMembers.map(member => (
              <Card
                key={member.id}
                className={`cursor-pointer transition-all ${
                  currentMember === member.id 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200'
                }`}
                onClick={() => setCurrentMember(member.id)}
              >
                <CardContent className="p-4 min-w-[150px]">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{member.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {member.items.length} items
                  </div>
                  <div className="text-lg font-bold text-slate-700">
                    ${member.total.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Menu Items Grid */}
      <div className="container mx-auto px-4 pb-24">
        {/* Loading State */}
        {isLoadingMenu && (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Utensils className="h-12 w-12 text-slate-500" />
            </motion.div>
            <p className="mt-4 text-gray-600">Loading menu...</p>
          </div>
        )}

        {/* Error State */}
        {menuError && !isLoadingMenu && (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-gray-600 text-center">
              Unable to load menu. Please try again or contact staff.
            </p>
          </div>
        )}

        {/* Menu Grid */}
        {!isLoadingMenu && !menuError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <div className="relative h-48 bg-gradient-to-br from-orange-100 to-red-100 overflow-hidden">
                    {/* Animated GIF placeholder */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        animate={{
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {item.category === 'appetizers' && <Pizza className="h-24 w-24 text-slate-400" />}
                        {item.category === 'mains' && <Utensils className="h-24 w-24 text-slate-400" />}
                        {item.category === 'desserts' && <IceCream className="h-24 w-24 text-slate-400" />}
                        {item.category === 'beverages' && <Coffee className="h-24 w-24 text-slate-400" />}
                      </motion.div>
                    </motion.div>

                    {/* Dietary badges */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      {item.dietary.includes('vegan') && (
                        <Badge className="bg-teal-500 text-white">
                          <Leaf className="h-3 w-3 mr-1" />
                          Vegan
                        </Badge>
                      )}
                      {item.dietary.includes('spicy') && (
                        <Badge className="bg-red-500 text-white">
                          <Flame className="h-3 w-3 mr-1" />
                          Spicy
                        </Badge>
                      )}
                      {item.dietary.includes('gluten-free') && (
                        <Badge className="bg-slate-600 text-white text-xs">
                          GF
                        </Badge>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium">{item.rating}</span>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg group-hover:text-slate-700 transition-colors">
                        {item.nameTranslations[selectedLanguage]}
                      </h3>
                      <span className="text-xl font-bold text-teal-600">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.descriptionTranslations[selectedLanguage]}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.prepTime} min
                      </div>
                      {item.calories && (
                        <div className="flex items-center gap-1">
                          <Flame className="h-3 w-3" />
                          {item.calories} cal
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => {
                        addToCart(item)
                        if (isGroupOrder && currentMember) {
                          assignItemToMember(currentMember, { ...item, quantity: 1 })
                        }
                      }}
                      className="w-full bg-teal-600 hover:bg-teal-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to {isGroupOrder && currentMember ? 'Member\'s ' : ''}Order
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredItems.length === 0 && !isLoadingMenu && (
            <div className="col-span-full text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {menuItems.length === 0 ? "Backend Not Connected" : "No items found"}
              </h3>
              <p className="text-gray-600">
                {menuItems.length === 0 
                  ? "Please start the restaurant backend server on port 3001 to load menu data."
                  : "Try adjusting your search or filters"}
              </p>
              {menuItems.length === 0 && (
                <div className="text-sm text-gray-500 mt-4">
                  <p>Run: <code className="bg-gray-100 px-2 py-1 rounded">cd qrback && npm start</code></p>
                </div>
              )}
            </div>
          )}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Cart Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Your Order</h2>
                  <Button
                    onClick={() => setShowCart(false)}
                    variant="ghost"
                    size="icon"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </div>

                {/* Split Bill Options */}
                {cart.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSplitBillMode('individual')}
                      variant={splitBillMode === 'individual' ? 'default' : 'outline'}
                      size="sm"
                      className={splitBillMode === 'individual' ? 'bg-teal-600' : ''}
                    >
                      <User className="h-3 w-3 mr-1" />
                      Individual
                    </Button>
                    <Button
                      onClick={() => setSplitBillMode('equal')}
                      variant={splitBillMode === 'equal' ? 'default' : 'outline'}
                      size="sm"
                      className={splitBillMode === 'equal' ? 'bg-teal-600' : ''}
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Split Equal
                    </Button>
                    <Button
                      onClick={() => setSplitBillMode('custom')}
                      variant={splitBillMode === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      className={splitBillMode === 'custom' ? 'bg-teal-600' : ''}
                    >
                      <Share2 className="h-3 w-3 mr-1" />
                      Custom
                    </Button>
                  </div>
                )}
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium">
                                {item.nameTranslations[selectedLanguage]}
                              </h4>
                              <p className="text-sm text-gray-600">
                                ${item.price.toFixed(2)} each
                              </p>
                            </div>
                            <span className="font-bold text-orange-600">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => removeFromCart(item.id)}
                              variant="outline"
                              size="sm"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              onClick={() => addToCart(item)}
                              variant="outline"
                              size="sm"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${getCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tax (10%)</span>
                      <span className="font-medium">${(getCartTotal() * 0.1).toFixed(2)}</span>
                    </div>
                    {splitBillMode === 'equal' && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Split between</span>
                        <Input
                          type="number"
                          min="2"
                          defaultValue="2"
                          className="w-16 h-8 text-center"
                        />
                      </div>
                    )}
                    <Separator />
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-orange-600">
                        ${(getCartTotal() * 1.1).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowPayment(true)}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-lg py-6"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Proceed to Payment
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowPayment(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 className="text-2xl font-bold mb-6">Payment Options</h3>

              <div className="space-y-3">
                <Button
                  onClick={handlePayment}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-4"
                >
                  <CreditCard className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-medium">Credit/Debit Card</div>
                    <div className="text-sm text-gray-500">Pay securely with your card</div>
                  </div>
                </Button>

                <Button
                  onClick={handlePayment}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-4"
                >
                  <DollarSign className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-gray-500">Pay when your order arrives</div>
                  </div>
                </Button>

                <Button
                  onClick={handlePayment}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-4"
                >
                  <Home className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-medium">Charge to Room</div>
                    <div className="text-sm text-gray-500">Add to your room bill</div>
                  </div>
                </Button>

                <Button
                  onClick={handlePayment}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-4"
                >
                  <QrCode className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-medium">Digital Wallet</div>
                    <div className="text-sm text-gray-500">Apple Pay, Google Pay, etc.</div>
                  </div>
                </Button>
              </div>

              <Button
                onClick={() => setShowPayment(false)}
                variant="ghost"
                className="w-full mt-4"
              >
                Cancel
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Menu Modal */}
      <AnimatePresence>
        {showQRMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowQRMenu(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 className="text-2xl font-bold mb-4 text-center">Scan QR Code</h3>
              <p className="text-center text-gray-600 mb-6">
                Share this menu with your dining companions
              </p>

              {/* Actual QR Code */}
              <motion.div
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="bg-gradient-to-br from-orange-100 to-red-100 p-8 rounded-xl mb-6"
              >
                <div className="bg-white p-6 rounded-lg">
                  {menuQRImage && !generatingQR ? (
                    <img 
                      src={menuQRImage} 
                      alt="Restaurant Menu QR Code" 
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  ) : (
                    <QrCode className="h-48 w-48 mx-auto text-gray-800 animate-pulse" />
                  )}
                </div>
              </motion.div>

              <p className="text-center text-sm text-gray-500 mb-4">
                {generatingQR ? 'Generating QR code...' : 'Scan to view menu in any language'}
              </p>

              <div className="flex gap-2 mb-4">
                <Button
                  onClick={async () => {
                    if (menuQRImage) {
                      try {
                        const restaurantId = 'restaurant-1'
                        const table = tableNumber ? parseInt(tableNumber) : 1
                        const menuURL = `${typeof window !== 'undefined' ? window.location.origin : ''}/food?restaurant=${restaurantId}&table=${table}`
                        await downloadQRCode(menuURL, `menu-table-${table}`, {
                          errorCorrectionLevel: 'M',
                          width: 400,
                          margin: 2,
                        })
                      } catch (error) {
                        console.error('Error downloading QR code:', error)
                        toast({
                          title: "Error",
                          description: "Failed to download QR code",
                          variant: "destructive"
                        })
                      }
                    }
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={!menuQRImage || generatingQR}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  onClick={() => {
                    if (navigator.share && menuQRImage) {
                      navigator.share({
                        title: 'Restaurant Menu',
                        text: 'Check out our menu!',
                        url: window.location.href
                      }).catch(() => {})
                    }
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={!menuQRImage || generatingQR}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>

              <Button
                onClick={() => setShowQRMenu(false)}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}
