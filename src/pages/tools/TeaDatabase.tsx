
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { Badge } from "@/components/ui/badge"

export default function TeaDatabase() {
  const { data: teas, isLoading } = useQuery({
    queryKey: ['teas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teas')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data
    }
  })

  return (
    <ToolAnalyticsWrapper 
      toolName="tea-database"
      toolType="biohacking"
      toolSettings={{}}
    >
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto p-4">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tea Database</CardTitle>
              <CardDescription>
                Comprehensive guide to teas, their compounds, health benefits, and brewing methods.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading tea database...</div>
              ) : teas?.length === 0 ? (
                <div>No teas found in the database.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teas?.map((tea) => (
                    <Card key={tea.id} className="overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-lg">{tea.name}</CardTitle>
                        <Badge>{tea.type}</Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{tea.description}</p>
                        {tea.caffeine_content && (
                          <p className="text-sm">Caffeine: {tea.caffeine_content}</p>
                        )}
                        {tea.compounds && tea.compounds.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium mb-1">Key Compounds:</p>
                            <div className="flex flex-wrap gap-1">
                              {tea.compounds.map((compound) => (
                                <Badge key={compound} variant="secondary">
                                  {compound}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {tea.health_benefits && tea.health_benefits.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium mb-1">Health Benefits:</p>
                            <ul className="text-sm list-disc list-inside">
                              {tea.health_benefits.map((benefit) => (
                                <li key={benefit}>{benefit}</li>
                              ))}
                            </ul>
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
