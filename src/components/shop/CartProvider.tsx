
import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from "@/components/AuthProvider"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  id: string
  product_id: string
  quantity: number
  product: {
    name: string
    price: number
    image_url?: string
    vendor_id: string
  }
}

interface CartContextType {
  items: CartItem[]
  addToCart: (productId: string) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  isLoading: boolean
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { session } = useAuth()
  const { toast } = useToast()

  const fetchCartItems = async () => {
    if (!session?.user?.id) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('shopping_cart_items')
        .select(`
          id,
          product_id,
          quantity,
          product:products (
            name,
            price,
            image_url,
            vendor_id
          )
        `)
        .eq('user_id', session.user.id)

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching cart:', error)
      toast({
        title: "Error fetching cart",
        description: "Please try again later",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCartItems()
  }, [session?.user?.id])

  const addToCart = async (productId: string) => {
    if (!session?.user?.id) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('shopping_cart_items')
        .insert({
          user_id: session.user.id,
          product_id: productId,
          quantity: 1
        })

      if (error) throw error
      
      await fetchCartItems()
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart"
      })
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast({
        title: "Error adding to cart",
        description: "Please try again later",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromCart = async (itemId: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('shopping_cart_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      
      await fetchCartItems()
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart"
      })
    } catch (error) {
      console.error('Error removing from cart:', error)
      toast({
        title: "Error removing from cart",
        description: "Please try again later",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('shopping_cart_items')
        .update({ quantity })
        .eq('id', itemId)

      if (error) throw error
      
      await fetchCartItems()
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast({
        title: "Error updating quantity",
        description: "Please try again later",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const total = items.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity)
  }, 0)

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      isLoading,
      total
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
