
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { TeaVendorCard } from "./TeaVendorCard"
import { Skeleton } from "@/components/ui/skeleton"

interface TeaVendor {
  id: string
  name: string
  website: string
  description: string
  shipping_regions: string[]
  rating: number
  review_count: number
  verification_status: string
}

export function TeaVendorList() {
  const { data: vendors, isLoading } = useQuery({
    queryKey: ['tea-vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tea_vendors')
        .select('*')
        .order('rating', { ascending: false })
        .returns<TeaVendor[]>()
      
      if (error) throw error
      return data
    }
  })

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (!vendors?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tea vendors found</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {vendors.map((vendor) => (
        <TeaVendorCard key={vendor.id} vendor={vendor} />
      ))}
    </div>
  )
}
