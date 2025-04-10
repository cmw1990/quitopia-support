
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TeaLibraryCard } from "../TeaLibraryCard"

export function TeaLibraryTab() {
  const { data: teas } = useQuery({
    queryKey: ['herbal-teas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('herbal_teas')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data
    }
  })

  return (
    <div className="grid gap-6">
      {/* Tea Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Tea Guide</CardTitle>
          <CardDescription>Comprehensive guide to various tea types and their properties</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teas?.map((tea) => (
              <TeaLibraryCard key={tea.id} tea={tea} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Traditional Use & Science */}
      <Card>
        <CardHeader>
          <CardTitle>Traditional Use & Science</CardTitle>
          <CardDescription>Historical context and scientific research</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {teas?.filter(tea => tea.traditional_uses).map((tea) => (
              <TeaLibraryCard key={tea.id} tea={tea} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
