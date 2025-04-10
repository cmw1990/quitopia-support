import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { supabaseGet, supabasePost } from "@/lib/supabaseApiService"
import { AdTierSelector } from './AdTierSelector'
import { AdPreview } from './AdPreview'
import { DisplayZone } from '@/types/supabase'

const campaignFormSchema = z.object({
  productId: z.string().uuid(),
  placementType: z.enum(['feed', 'banner', 'sidebar', 'openApp']),
  budget: z.coerce.number().positive(),
  cpc: z.coerce.number().positive(),
  durationDays: z.coerce.number().positive(),
  tier: z.enum(['basic', 'pro', 'premium']),
  targetDemographics: z.object({
    ageRanges: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional()
  }).optional()
})

// Define simple Product type
interface Product {
  id: string;
  name: string;
}

export function AdCampaignForm() {
  const { user } = useAuth()
  const { toast } = useToast()

  // Refactor products query with Product type
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['vendor-products', user?.id],
    queryFn: async (): Promise<Product[]> => {
      if (!user?.id) return [];
      const { data, error } = await supabaseGet<Product[]>(
        'products',
        `maker_id=eq.${user.id}&select=id,name`
      );
      if (error) {
        console.error("Error fetching products:", error);
        toast({ title: "Error", description: "Could not load your products." });
        return [];
      }
      // Flatten the result if necessary, return empty array if null/undefined
      return (data ? (Array.isArray(data[0]) ? data[0] : data) : []) as Product[];
    },
    enabled: !!user?.id
  })

  // Refactor display zones query, ensuring correct return type
  const { data: displayZones, isLoading: isLoadingZones } = useQuery<DisplayZone[]>({
    queryKey: ['ad-display-zones'],
    queryFn: async (): Promise<DisplayZone[]> => {
      const { data, error } = await supabaseGet<DisplayZone[]>(
        'ad_display_zones',
        'select=*&order=price_multiplier.asc'
      );
      if (error) {
        console.error("Error fetching display zones:", error);
        toast({ title: "Error", description: "Could not load ad placement zones." });
        return [];
      }
      // Flatten the result if necessary, return empty array if null/undefined
      return (data ? (Array.isArray(data[0]) ? data[0] : data) : []) as DisplayZone[];
    }
  })

  const form = useForm<z.infer<typeof campaignFormSchema>>({
    resolver: zodResolver(campaignFormSchema),
    // Provide default values, especially for potentially undefined fields
    defaultValues: {
      productId: undefined, // Explicitly undefined initially
      placementType: 'feed',
      budget: 50,
      cpc: 0.10,
      durationDays: 7,
      tier: 'basic',
      targetDemographics: {
        ageRanges: [],
        interests: [],
        locations: []
      }
    },
  })

  // Correctly find selected product, handle potential undefined products array
  const selectedProductId = form.watch('productId');
  const selectedProduct = products?.find(p => p.id === selectedProductId);

  async function onSubmit(values: z.infer<typeof campaignFormSchema>) {
    try {
      if (!user?.id) {
        throw new Error("User not authenticated")
      }
      if (!values.productId) { // Ensure product is selected
        toast({ title: "Missing Product", description: "Please select a product for the campaign.", variant: "destructive" });
        return;
      }

      const endsAt = new Date(Date.now() + values.durationDays * 24 * 60 * 60 * 1000).toISOString()
      
      // Correctly find zone, handle potential undefined displayZones array
      const zone = displayZones?.find(z => z.zone_type === values.placementType);
      const tierMultiplier = values.tier === 'premium' ? 2 : values.tier === 'pro' ? 1.5 : 1
      const adjustedCpc = values.cpc * (zone?.price_multiplier || 1) * tierMultiplier

      // Use supabasePost (already refactored, ensure stringification)
      const { error } = await supabasePost(
        'sponsored_products', 
        [{
          product_id: values.productId,
          placement_type: values.placementType,
          budget: values.budget,
          cpc: adjustedCpc,
          ends_at: endsAt,
          sponsor_id: user.id,
          tier: values.tier,
          target_demographics: JSON.stringify(values.targetDemographics || {}) // Ensure stringify handles null/undefined
        }]
      );

      if (error) throw error;

      toast({
        title: "Campaign created",
        description: "Your ad campaign has been created successfully.",
      })
      
      form.reset()
    } catch (error: any) { // Catch specific error type if known
      console.error("Error submitting campaign:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Ad Campaign</CardTitle>
        <CardDescription>
          Set up a new advertising campaign for your products
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="tier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Tier</FormLabel>
                  <FormControl>
                    <AdTierSelector 
                      value={field.value} 
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    // Use field.value which might be undefined initially
                    value={field.value || ""} 
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Handle loading state for products */} 
                      {isLoadingProducts ? (
                        <SelectItem value="loading" disabled>Loading products...</SelectItem>
                      ) : products && products.length > 0 ? (
                        // Map over products array correctly
                        products.map((product: Product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-products" disabled>No products found</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="placementType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placement Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="feed">Feed</SelectItem>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="openApp">App Open</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose where your ad will appear
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AdPreview 
              placementType={form.watch('placementType')}
              // Pass product name safely
              productName={selectedProduct?.name || "Your Product"}
            />

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Budget ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>
                    Set your total campaign budget
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cpc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Cost per Click ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>
                    Base cost per click - will be adjusted based on placement and tier
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="durationDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (Days)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    How long should the campaign run
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={form.formState.isSubmitting || isLoadingProducts || isLoadingZones}>
              {form.formState.isSubmitting ? "Creating..." : "Create Campaign"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
