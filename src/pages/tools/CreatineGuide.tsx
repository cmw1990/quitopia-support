
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreatineTracker } from "@/components/supplements/creatine/CreatineTracker"
import { CreatineIntakeForm } from "@/components/supplements/creatine/CreatineIntakeForm"

export default function CreatineGuide() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['creatine-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creatine_products')
        .select('*')
        .order('brand')
      
      if (error) throw error
      return data
    }
  })

  return (
    <ToolAnalyticsWrapper 
      toolName="creatine-guide"
      toolType="biohacking"
      toolSettings={{}}
    >
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto p-4">
          <Tabs defaultValue="guide" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="guide">Guide</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="guide">
              <Card>
                <CardHeader>
                  <CardTitle>Creatine Guide</CardTitle>
                  <CardDescription>
                    Comprehensive guide to creatine supplementation: benefits, dosage, and timing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold mb-2">What is Creatine?</h3>
                      <p className="text-muted-foreground">
                        Creatine is a naturally occurring compound found in muscle cells. It helps your muscles produce energy for high-intensity, short-duration activities like weightlifting and sprinting.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">Benefits</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Increases muscle strength and power</li>
                        <li>Improves high-intensity exercise performance</li>
                        <li>Supports muscle growth</li>
                        <li>May enhance cognitive function</li>
                        <li>Well-researched safety profile</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">Recommended Dosage</h3>
                      <p className="text-muted-foreground">
                        Standard dosage is 5 grams per day. Loading phase (optional): 20g per day for 5-7 days, divided into 4 servings.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2">Timing</h3>
                      <p className="text-muted-foreground">
                        Creatine can be taken at any time of day. Consistent daily intake is more important than specific timing.
                      </p>
                    </section>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle>Creatine Products</CardTitle>
                  <CardDescription>
                    Curated list of high-quality creatine supplements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div>Loading products...</div>
                  ) : products?.length === 0 ? (
                    <div>No products found in the database.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products?.map((product) => (
                        <Card key={product.id} className="overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg">{product.name}</CardTitle>
                            <Badge>{product.form}</Badge>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                            <div className="space-y-2">
                              <p className="text-sm">Brand: {product.brand}</p>
                              <p className="text-sm">Serving Size: {product.serving_size_grams}g</p>
                              <p className="text-sm">Servings: {product.servings_per_container}</p>
                              {product.price && (
                                <p className="text-sm">Price: ${product.price}</p>
                              )}
                              {product.third_party_tested && (
                                <Badge variant="secondary">Third Party Tested</Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tracking">
              <div className="grid gap-6">
                <CreatineIntakeForm />
                <CreatineTracker />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ToolAnalyticsWrapper>
  )
}
