
import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { MapPin, Gift, Ticket, TrendingUp, Store, Coffee, Target } from "lucide-react"

export function AdGuide() {
  const navigate = useNavigate()
  
  const features = [
    {
      icon: Target,
      title: "Targeted Advertising",
      description: "Reach your ideal customers with precise demographic, geographic and interest-based targeting."
    },
    {
      icon: Store,
      title: "Store Location Promotion",
      description: "Promote your physical stores with location-based ads that reach nearby customers."
    },
    {
      icon: Coffee,
      title: "Perfect for Cafes & Restaurants",
      description: "Special features for food service businesses to promote new items and daily specials."
    },
    {
      icon: Gift,
      title: "Free Sample Campaigns",
      description: "Run free sample campaigns to get your products into customers' hands."
    },
    {
      icon: Ticket,
      title: "Coupon Management",
      description: "Create and track digital coupons to drive sales and measure promotions."
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Get detailed insights into campaign performance, customer behavior and ROI."
    },
    {
      icon: MapPin,
      title: "Geo-Targeting",
      description: "Target specific countries, regions, or cities to optimize your ad spend."
    }
  ]

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Advertise With Us</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Reach health-conscious customers and grow your business with our targeted advertising solutions
        </p>
        <Button 
          size="lg" 
          onClick={() => navigate('/vendor/ads/dashboard')}
          className="mt-4"
        >
          Go to Ad Dashboard
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <Card key={i}>
            <CardHeader>
              <feature.icon className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Why Advertise With Us?</CardTitle>
          <CardDescription>
            Reach an engaged audience of health-conscious consumers
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <h3 className="font-semibold mb-2">Engaged Audience</h3>
            <p className="text-muted-foreground">
              Our users are actively seeking health and wellness products and services, making them the perfect audience for relevant businesses.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Flexible Options</h3>
            <p className="text-muted-foreground">
              From display ads to free samples and coupons, choose the advertising options that work best for your business.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Smart Targeting</h3>
            <p className="text-muted-foreground">
              Use our advanced targeting options to reach users based on location, interests, and behaviors.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Real-Time Analytics</h3>
            <p className="text-muted-foreground">
              Track your campaign performance in real-time and optimize for better results.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center space-y-4 pb-8">
        <h2 className="text-2xl font-semibold">Ready to get started?</h2>
        <Button 
          size="lg" 
          onClick={() => navigate('/vendor/ads/dashboard')}
        >
          Create Your First Campaign
        </Button>
      </div>
    </div>
  )
}
