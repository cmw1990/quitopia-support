
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Check } from 'lucide-react'

const tiers = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Standard ad placement with basic analytics',
    multiplier: 1,
    features: ['Feed placement', 'Basic analytics', 'Standard support']
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'Premium placements with detailed analytics',
    multiplier: 1.5,
    features: ['Feed + Sidebar placement', 'Detailed analytics', 'Priority support', 'Demographic targeting']
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'All premium placements with advanced features',
    multiplier: 2,
    features: ['All premium placements', 'Advanced analytics', '24/7 support', 'AI-powered targeting', 'A/B testing']
  }
]

interface AdTierSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function AdTierSelector({ value, onChange }: AdTierSelectorProps) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="grid gap-4 md:grid-cols-3">
      {tiers.map((tier) => (
        <Card 
          key={tier.id}
          className={`relative cursor-pointer transition-all ${
            value === tier.id ? 'border-primary shadow-lg' : ''
          }`}
          onClick={() => onChange(tier.id)}
        >
          {value === tier.id && (
            <div className="absolute top-4 right-4">
              <Check className="h-6 w-6 text-primary" />
            </div>
          )}
          <CardHeader>
            <CardTitle>{tier.name}</CardTitle>
            <CardDescription>{tier.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tier.features.map((feature, i) => (
                <div key={i} className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </RadioGroup>
  )
}
