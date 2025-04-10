import { useState, useEffect } from 'react'
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AgeVerificationDialog } from "@/components/shop/AgeVerificationDialog"
import { NicotineWarningBanner } from "@/components/shop/NicotineWarningBanner"
import { CartSheet } from "@/components/shop/CartSheet"
import { CartProvider } from "@/components/shop/CartProvider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Store, Tag, Search, Filter } from "lucide-react"
import { useCart } from '@/components/shop/CartProvider'

export default function Shop() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showAgeVerification, setShowAgeVerification] = useState(false)
  const { session } = useAuth()
  const { toast } = useToast()
  const { addToCart } = useCart()

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          vendor:vendors (name)
        `)
        .eq('is_launched', true)

      if (searchTerm) {
        query = query.textSearch('searchable_text', searchTerm)
      }

      if (selectedCategory) {
        query = query.eq('category', selectedCategory)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    }
  })

  const { data: userPreferences } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      if (!session?.user?.id) return null
      
      const { data } = await supabase
        .from('user_content_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      return data
    },
    enabled: !!session?.user?.id
  })

  const handleProductClick = async (product: any) => {
    if (product.requires_age_verification && !userPreferences?.age_verified) {
      setShowAgeVerification(true)
      return
    }
    
    try {
      await addToCart(product.id)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast({
        title: "Error",
        description: "Could not add item to cart",
        variant: "destructive"
      })
    }
  }

  return (
    <CartProvider>
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Shop</CardTitle>
                <CardDescription>
                  Discover carefully curated products for optimal energy and focus
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <CartSheet />
                <Store className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>

            <NicotineWarningBanner />

            <Tabs defaultValue="all" className="mt-6">
              <TabsList>
                <TabsTrigger value="all">All Products</TabsTrigger>
                <TabsTrigger value="focus">Focus</TabsTrigger>
                <TabsTrigger value="energy">Energy</TabsTrigger>
                <TabsTrigger value="sleep">Sleep</TabsTrigger>
                <TabsTrigger value="nrt">NRT</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products?.map((product) => (
                    <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleProductClick(product)}>
                      <CardHeader>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <CardDescription>{product.vendor?.name}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">${product.price}</p>
                            <div className="flex gap-2">
                              {product.requires_age_verification && (
                                <Badge variant="secondary">Age Restricted</Badge>
                              )}
                              {product.tags?.map((tag: string) => (
                                <Badge key={tag} variant="outline">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Similar content for other tabs */}
            </Tabs>
          </CardContent>
        </Card>

        <AgeVerificationDialog
          isOpen={showAgeVerification}
          onClose={() => setShowAgeVerification(false)}
          onVerified={() => {
            toast({
              title: "Age Verified",
              description: "You can now access age-restricted products."
            })
          }}
        />
      </div>
    </CartProvider>
  )
}
