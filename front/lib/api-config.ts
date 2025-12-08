/**
 * API Configuration for Restaurant/Food Services
 * 
 * The qrback service (restaurant QR menu backend) runs on port 3000
 * and provides menu management, orders, and admin authentication.
 */

// Restaurant Backend API (qrback service on port 3000)
export const RESTAURANT_API_URL = process.env.NEXT_PUBLIC_RESTAURANT_API_URL || 'http://localhost:3000'

// Main Hotel Backend API (back service on port 5000)
export const HOTEL_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

/**
 * Restaurant/Menu API Endpoints (qrback)
 */
export const restaurantEndpoints = {
  // Menu endpoints
  getMenu: (restaurantId: string, tableNumber: string) => 
    `${RESTAURANT_API_URL}/api/menus/${restaurantId}/${tableNumber}`,
  
  // Order endpoints
  createOrder: `${RESTAURANT_API_URL}/api/orders`,
  getOrders: (restaurantId: string) => 
    `${RESTAURANT_API_URL}/api/orders/${restaurantId}`,
  getOrderStats: (restaurantId: string) => 
    `${RESTAURANT_API_URL}/api/orders/${restaurantId}/stats`,
  updateOrderStatus: (orderId: string) => 
    `${RESTAURANT_API_URL}/api/orders/${orderId}/status`,
  
  // Admin endpoints (for staff)
  adminLogin: `${RESTAURANT_API_URL}/api/admin/login`,
  getAdminMenus: `${RESTAURANT_API_URL}/api/menus/admin`,
  createMenuItem: `${RESTAURANT_API_URL}/api/menus/admin`,
  updateMenuItem: (id: string) => 
    `${RESTAURANT_API_URL}/api/menus/admin/${id}`,
  deleteMenuItem: (id: string) => 
    `${RESTAURANT_API_URL}/api/menus/admin/${id}`,
}

/**
 * Hotel API Endpoints (back service)
 */
export const hotelEndpoints = {
  // Room endpoints
  getRooms: `${HOTEL_API_URL}/rooms`,
  createRoom: `${HOTEL_API_URL}/rooms`,
  updateRoom: (id: string) => `${HOTEL_API_URL}/rooms/${id}`,
  deleteRoom: (id: string) => `${HOTEL_API_URL}/rooms/${id}`,
  
  // Property endpoints
  getProperties: `${HOTEL_API_URL}/properties`,
  getProperty: (id: string) => `${HOTEL_API_URL}/properties/${id}`,
}

/**
 * API Response Types
 */

// Menu Item from qrback API
export interface MenuItem {
  id: number
  restaurant_id: number
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  is_available: boolean
  dietary_info?: string[]
  prep_time?: number
  calories?: number
  spice_level?: number
  sort_order?: number
  created_at: string
  updated_at: string
}

// Order from qrback API
export interface Order {
  id: number
  restaurant_id: number
  table_number: number
  items: OrderItem[]
  special_instructions?: string
  total_amount: number
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  customer_name?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  menu_item_id: number
  name: string
  price: number
  quantity: number
  special_notes?: string
}

/**
 * Helper function to fetch menu
 */
export async function fetchMenu(restaurantId: string, tableNumber: string): Promise<MenuItem[]> {
  const response = await fetch(restaurantEndpoints.getMenu(restaurantId, tableNumber))
  if (!response.ok) {
    throw new Error('Failed to fetch menu')
  }
  const data = await response.json()
  
  // The qrback API returns { restaurant, table_number, menu }
  // where menu is an object with categories as keys
  // We need to flatten it into a single array
  const menuItems: MenuItem[] = []
  
  if (data.menu) {
    Object.keys(data.menu).forEach(category => {
      const items = data.menu[category]
      items.forEach((item: any) => {
        menuItems.push({
          ...item,
          category: category.toLowerCase()
        })
      })
    })
  }
  
  return menuItems
}

/**
 * Helper function to create order
 */
export async function createOrder(orderData: {
  restaurant_id: number
  table_number: number
  items: OrderItem[]
  special_instructions?: string
  total_amount: number
  customer_name?: string
}): Promise<Order> {
  const response = await fetch(restaurantEndpoints.createOrder, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  })
  
  if (!response.ok) {
    throw new Error('Failed to create order')
  }
  
  const data = await response.json()
  return data.order
}
