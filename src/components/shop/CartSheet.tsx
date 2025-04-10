import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from "lucide-react"
import { useCart } from "./CartProvider"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/AuthProvider"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/supabase-client"

export function CartSheet() {
  const [open, setOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { items, removeFromCart, updateQuantity, total } = useCart()
  const { session } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleCheckout = async () => {
    if (!session?.user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to checkout",
        variant: "destructive"
      })
      navigate("/auth")
      return
    }

    setIsProcessing(true)
    try {
      // Get first product's vendor_id
      const firstProduct = items[0]
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: session.user.id,
          total_amount: total,
          status: 'pending',
          vendor_id: firstProduct.product.vendor_id,
          billing_address: {}, // Empty object for now
          shipping_address: {}  // Empty object for now
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: item.product.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Close the cart sheet
      setOpen(false)
      
      // Show success message
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase"
      })
    } catch (error) {
      console.error('Error creating order:', error)
      toast({
        title: "Error placing order",
        description: "Please try again later",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-12rem)] mt-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <ShoppingCart className="h-8 w-8 mb-2" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {item.product.image_url && (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-16 w-16 object-cover rounded-md"
                      />
                    )}
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.product.price}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {items.length > 0 && (
          <div className="space-y-4 mt-4">
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span className="font-medium">${total.toFixed(2)}</span>
            </div>
            <Button 
              className="w-full" 
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isProcessing ? "Processing..." : "Proceed to Checkout"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
