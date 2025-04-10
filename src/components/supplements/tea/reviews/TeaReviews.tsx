
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, ShoppingBag, ThumbsUp } from "lucide-react"
import { format } from "date-fns"

interface TeaReview {
  id: string
  user_id: string
  tea_id: string
  vendor_id: string
  rating: number
  review_text: string
  taste_rating: number
  aroma_rating: number
  value_rating: number
  effects_rating: number
  verified_purchase: boolean
  created_at: string
  tea: {
    name: string
    category: string
  }
  vendor: {
    name: string
  }
}

export function TeaReviews() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['tea-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tea_reviews')
        .select(`
          *,
          tea:herbal_teas(name, category),
          vendor:tea_vendors(name)
        `)
        .order('created_at', { ascending: false })
        .returns<TeaReview[]>()
      
      if (error) throw error
      return data
    }
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading reviews...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews?.map((review) => (
            <div 
              key={review.id} 
              className="border rounded-lg p-4 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {review.tea?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{review.tea?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      from {review.vendor?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{review.rating}</span>
                </div>
              </div>

              <p className="text-sm">{review.review_text}</p>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Taste: {review.taste_rating}/5
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  Effects: {review.effects_rating}/5
                </Badge>
                {review.verified_purchase && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <ShoppingBag className="h-3 w-3" />
                    Verified Purchase
                  </Badge>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                Reviewed on {format(new Date(review.created_at), 'MMM d, yyyy')}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
