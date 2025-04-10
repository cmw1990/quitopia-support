
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"

export function MultiLocationInventory() {
  const { data: locations } = useQuery({
    queryKey: ['vendor-locations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('vendor_locations')
        .select(`
          *,
          inventory_locations(*)
        `)
      return data
    }
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Multi-Location Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {locations?.map((location) => (
              <div key={location.id} className="border rounded p-4">
                <h3 className="font-medium">{location.location_name}</h3>
                <p className="text-sm text-muted-foreground">{location.address}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-medium">Inventory</h4>
                  <div className="mt-2 space-y-2">
                    {location.inventory_locations?.map((inventory) => (
                      <div key={inventory.id} className="flex justify-between">
                        <span>{inventory.product_id}</span>
                        <span>{inventory.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
