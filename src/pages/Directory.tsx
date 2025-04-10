import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Brain, Heart, Zap, Sun, Moon, Leaf, Activity, Shield, Coffee, TestTube, FlaskConical } from "lucide-react"

export default function Directory() {
  const categories = [
    {
      title: "Nootropics & Cognitive Enhancement",
      description: "Comprehensive database of cognitive enhancers, memory boosters, and brain optimization compounds.",
      icon: Brain,
      link: "/tools/nootropics",
      subcategories: ["Racetams", "Adaptogens", "Cholinergics", "Natural Nootropics", "Peptides", "Smart Drugs"]
    },
    {
      title: "Tea & Botanical Compounds",
      description: "Extensive guide to teas, their compounds, benefits, and brewing methods.",
      icon: Leaf,
      link: "/tools/tea-database",
      subcategories: ["Green Tea", "Black Tea", "Oolong", "Pu-erh", "White Tea", "Herbal Blends"]
    },
    {
      title: "Energy Enhancement",
      description: "Database of energy drinks, stimulants, and natural energy boosters with detailed analysis.",
      icon: Zap,
      link: "/tools/energy-enhancement",
      subcategories: ["Energy Drinks", "Natural Stimulants", "Pre-Workouts", "Caffeine Sources"]
    },
    {
      title: "Sleep Optimization",
      description: "Evidence-based methods for improving sleep quality and recovery.",
      icon: Moon,
      link: "/tools/sleep",
      subcategories: ["Sleep Tracking", "Circadian Optimization", "Sleep Environment", "Natural Sleep Aids"]
    },
    {
      title: "Cardiovascular Enhancement",
      description: "Protocols for heart health, circulation, and vascular optimization.",
      icon: Heart,
      link: "/tools/cardiovascular",
      subcategories: ["HRV Training", "Blood Flow Enhancement", "Endothelial Health"]
    },
    {
      title: "Light Optimization",
      description: "Strategic light exposure protocols for circadian health and cellular function.",
      icon: Sun,
      link: "/tools/light",
      subcategories: ["Red Light Therapy", "Blue Light Management", "Photobiomodulation"]
    },
    {
      title: "Physical Performance",
      description: "Evidence-based protocols for strength, endurance, and recovery optimization.",
      icon: Activity,
      link: "/tools/performance",
      subcategories: ["Recovery Methods", "Movement Enhancement", "Training Protocols"]
    },
    {
      title: "Immune Function",
      description: "Comprehensive guide to immune system optimization and resilience.",
      icon: Shield,
      link: "/tools/immune",
      subcategories: ["Immune Modulators", "Stress Response", "Cellular Defense"]
    },
    {
      title: "Metabolic Enhancement",
      description: "Protocols for optimizing metabolism and cellular energy production.",
      icon: FlaskConical,
      link: "/tools/metabolic",
      subcategories: ["Glucose Optimization", "Mitochondrial Function", "Metabolic Flexibility"]
    },
    {
      title: "Caffeine Guide & Calculator",
      description: "Comprehensive database of caffeine content in beverages, metabolism calculator, and consumption tracking.",
      icon: Coffee,
      link: "/tools/caffeine-calculator",
      subcategories: ["Coffee Types", "Energy Drinks", "Teas", "Supplements", "Metabolism Calculator"]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto p-4">
        <div className="max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl font-bold mb-4">Biohacking Directory</h1>
          <p className="text-muted-foreground">
            A comprehensive repository of evidence-based biological optimization protocols, compounds, and technologies.
            Each category contains detailed analysis, dosing protocols, and scientific research.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  {React.createElement(category.icon, {
                    className: "h-6 w-6 text-primary"
                  })}
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Key Areas:</div>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {category.subcategories.map((sub) => (
                      <li key={sub}>{sub}</li>
                    ))}
                  </ul>
                  <Link to={category.link}>
                    <Button className="w-full mt-4">
                      View Database
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12 p-6">
          <CardHeader>
            <CardTitle>Research & Safety Guidelines</CardTitle>
            <CardDescription>
              Essential principles for safe and effective protocol implementation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Implementation Protocol</h3>
                <ul className="list-disc list-inside text-muted-foreground">
                  <li>Always begin with thorough baseline measurements</li>
                  <li>Start with minimal effective doses</li>
                  <li>Document all responses systematically</li>
                  <li>Maintain detailed logs for longitudinal analysis</li>
                  <li>Regular biomarker monitoring when applicable</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Safety Considerations</h3>
                <ul className="list-disc list-inside text-muted-foreground">
                  <li>Consult healthcare professionals before starting any protocol</li>
                  <li>Research potential interactions thoroughly</li>
                  <li>Maintain comprehensive documentation</li>
                  <li>Have clear protocols for adverse reactions</li>
                  <li>Regular safety and efficacy assessments</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Quality Assurance</h3>
                <ul className="list-disc list-inside text-muted-foreground">
                  <li>Source compounds from reputable suppliers</li>
                  <li>Verify third-party testing when available</li>
                  <li>Store substances according to specifications</li>
                  <li>Track batch numbers and expiration dates</li>
                  <li>Regular quality assessment protocols</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
