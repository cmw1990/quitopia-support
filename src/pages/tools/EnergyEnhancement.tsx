
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { Badge } from "@/components/ui/badge"

export default function EnergyEnhancement() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['energy_products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('energy_products')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data
    }
  })

  return (
    <ToolAnalyticsWrapper 
      toolName="energy-enhancement"
      toolType="biohacking"
      toolSettings={{}}
    >
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto p-4">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Energy Enhancement Database</CardTitle>
              <CardDescription>
                Comprehensive database of energy drinks, stimulants, and natural energy boosters with detailed analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading energy products...</div>
              ) : products?.length === 0 ? (
                <div>No energy products found in the database.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products?.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <Badge>{product.type}</Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                        {product.caffeine_content && (
                          <p className="text-sm">Caffeine Content: {product.caffeine_content}mg</p>
                        )}
                        {product.ingredients && product.ingredients.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium mb-1">Ingredients:</p>
                            <div className="flex flex-wrap gap-1">
                              {product.ingredients.map((ingredient) => (
                                <Badge key={ingredient} variant="secondary">
                                  {ingredient}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {product.warnings && (
                          <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              Warning: {product.warnings}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolAnalyticsWrapper>
  )
}
