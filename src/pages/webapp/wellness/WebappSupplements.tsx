import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Pill, 
  Brain, 
  Heart, 
  Battery, 
  Sun, 
  Moon, 
  AlertTriangle,
  Calendar,
  Clock,
  Check,
  Plus,
  Coffee,
  Wind
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const WebappSupplements: React.FC = () => {
  const supplementCategories = [
    {
      name: "Energy & Focus",
      icon: Battery,
      supplements: [
        {
          name: "Vitamin B Complex",
          dosage: "50mg",
          timing: "Morning",
          taken: true,
          benefits: ["Energy production", "Mental clarity", "Metabolism support"]
        },
        {
          name: "CoQ10",
          dosage: "100mg",
          timing: "Morning",
          taken: false,
          benefits: ["Cellular energy", "Heart health", "Antioxidant support"]
        }
      ]
    },
    {
      name: "Cognitive Function",
      icon: Brain,
      supplements: [
        {
          name: "Omega-3",
          dosage: "1000mg",
          timing: "With meals",
          taken: true,
          benefits: ["Brain function", "Mental clarity", "Memory support"]
        },
        {
          name: "Lion's Mane",
          dosage: "500mg",
          timing: "Morning",
          taken: false,
          benefits: ["Cognitive enhancement", "Focus", "Nerve health"]
        }
      ]
    },
    {
      name: "Recovery & Sleep",
      icon: Moon,
      supplements: [
        {
          name: "Magnesium",
          dosage: "400mg",
          timing: "Evening",
          taken: false,
          benefits: ["Sleep quality", "Muscle recovery", "Stress reduction"]
        },
        {
          name: "Zinc",
          dosage: "15mg",
          timing: "Evening",
          taken: true,
          benefits: ["Immune support", "Recovery", "Hormone balance"]
        }
      ]
    }
  ];

  const upcomingRefills = [
    { name: "Vitamin D3", daysLeft: 5 },
    { name: "Fish Oil", daysLeft: 12 },
    { name: "Magnesium", daysLeft: 15 }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Supplements</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Supplement
        </Button>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Today's Schedule
          </CardTitle>
          <CardDescription>Track your daily supplement intake</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {supplementCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">{category.name}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.supplements.map((supplement, supIndex) => (
                      <Card key={supIndex}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-medium">{supplement.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {supplement.timing}
                              </div>
                            </div>
                            <Button 
                              variant={supplement.taken ? "default" : "outline"}
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Check className="h-4 w-4" />
                              {supplement.taken ? "Taken" : "Take"}
                            </Button>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Dosage: {supplement.dosage}
                          </div>
                          <div className="mt-2">
                            <div className="text-sm font-medium mb-1">Benefits:</div>
                            <div className="text-sm text-muted-foreground">
                              {supplement.benefits.join(", ")}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Refill Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Refill Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingRefills.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-primary" />
                  <span>{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${
                    item.daysLeft <= 7 ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                    {item.daysLeft} days left
                  </span>
                  <Button variant="outline" size="sm">Reorder</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supplement Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Supplement Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Best Practices</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Take supplements with meals when indicated
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Maintain consistent timing
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Store in a cool, dry place
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Follow recommended dosages
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Important Notes</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Consult healthcare provider before starting new supplements
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Monitor for any adverse reactions
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Check interactions with medications
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
