
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function TeaEquipmentTab() {
  const { data: equipment } = useQuery({
    queryKey: ['tea-equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tea_equipment')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tea Equipment Guide</CardTitle>
        <CardDescription>Essential tools and equipment for tea preparation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment?.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <Badge>{item.category}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                
                {item.best_for && item.best_for.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-1">Best For:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.best_for.map((use, idx) => (
                        <Badge key={idx} variant="secondary">
                          {use}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {item.material && (
                    <p className="text-sm">Material: {item.material}</p>
                  )}
                  {item.capacity && (
                    <p className="text-sm">Capacity: {item.capacity}</p>
                  )}
                  {item.price_range && (
                    <p className="text-sm">Price Range: {item.price_range}</p>
                  )}
                </div>

                {(item.pros || item.cons) && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    {item.pros && (
                      <div>
                        <p className="text-sm font-medium mb-1">Pros:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.pros.map((pro, idx) => (
                            <Badge key={idx} variant="secondary">
                              {pro}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {item.cons && (
                      <div>
                        <p className="text-sm font-medium mb-1">Cons:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.cons.map((con, idx) => (
                            <Badge key={idx} variant="destructive">
                              {con}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {item.care_instructions && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-1">Care Instructions:</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {item.care_instructions.map((instruction, idx) => (
                        <li key={idx}>{instruction}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
