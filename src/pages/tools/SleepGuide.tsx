
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Book, Brain, Clock, Moon, ShoppingBag, Thermometer } from "lucide-react"
import { Link } from "react-router-dom"

interface GuideSection {
  title: string
  description: string
  icon: React.ReactNode
  path: string
  categories: string[]
}

export default function SleepGuide() {
  const { data: featuredGuides, isLoading: guidesLoading } = useQuery({
    queryKey: ['sleep_guides', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sleep_guides')
        .select('*')
        .eq('published', true)
        .order('view_count', { ascending: false })
        .limit(3)
      
      if (error) throw error
      return data
    }
  })

  const sections: GuideSection[] = [
    {
      title: "Sleep Science & Education",
      description: "Learn about sleep cycles, circadian rhythms, and the science behind quality rest.",
      icon: <Brain className="h-6 w-6 text-primary" />,
      path: "/tools/sleep-guide/science",
      categories: ["science", "education"]
    },
    {
      title: "Sleep Disorders & Solutions",
      description: "Understanding common sleep disorders and evidence-based treatments.",
      icon: <Book className="h-6 w-6 text-primary" />,
      path: "/tools/sleep-guide/disorders",
      categories: ["health", "medical"]
    },
    {
      title: "Sleep Environment",
      description: "Optimize your bedroom for the perfect sleep environment.",
      icon: <Thermometer className="h-6 w-6 text-primary" />,
      path: "/tools/sleep-guide/environment",
      categories: ["lifestyle", "environment"]
    },
    {
      title: "Sleep Gear Reviews",
      description: "Expert reviews of mattresses, pillows, and sleep technology.",
      icon: <ShoppingBag className="h-6 w-6 text-primary" />,
      path: "/tools/sleep-guide/gear",
      categories: ["products", "reviews"]
    },
    {
      title: "Sleep Tracking & Tools",
      description: "Digital tools and trackers for monitoring your sleep patterns.",
      icon: <Clock className="h-6 w-6 text-primary" />,
      path: "/tools/sleep-guide/tools",
      categories: ["technology", "tracking"]
    },
    {
      title: "Better Sleep Habits",
      description: "Develop healthy sleep habits and routines for optimal rest.",
      icon: <Moon className="h-6 w-6 text-primary" />,
      path: "/tools/sleep-guide/habits",
      categories: ["lifestyle", "habits"]
    }
  ]

  return (
    <ToolAnalyticsWrapper 
      toolName="sleep-guide"
      toolType="education"
      toolSettings={{}}
    >
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto p-4">
          {/* Hero Section */}
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold">The Well-Recharged Guide to Sleep</CardTitle>
              <CardDescription className="text-xl mt-2">
                Your comprehensive resource for better sleep, backed by science and experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center gap-4">
              <Link to="/tools/sleep-guide/assessment">
                <Button size="lg">
                  Take Sleep Assessment
                </Button>
              </Link>
              <Link to="/tools/sleep-guide/tools">
                <Button variant="outline" size="lg">
                  Explore Sleep Tools
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Main Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sections.map((section) => (
              <Link to={section.path} key={section.title}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        {section.icon}
                      </div>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-4">
                      {section.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2">
                      {section.categories.map((category) => (
                        <Badge key={category} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Featured Guides */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Featured Sleep Guides</CardTitle>
              <CardDescription>Popular articles and resources from our experts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {guidesLoading ? (
                  <p>Loading featured guides...</p>
                ) : featuredGuides?.map((guide) => (
                  <Link to={`/tools/sleep-guide/${guide.slug}`} key={guide.id}>
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{guide.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {guide.meta_description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Tools Section */}
          <Card>
            <CardHeader>
              <CardTitle>Essential Sleep Tools</CardTitle>
              <CardDescription>Quick access to our most popular sleep tools</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link to="/tools/sleep-calculator">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <Clock className="h-6 w-6 text-primary mb-2" />
                    <CardTitle className="text-lg">Sleep Calculator</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
              <Link to="/tools/white-noise">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <Moon className="h-6 w-6 text-primary mb-2" />
                    <CardTitle className="text-lg">White Noise</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
              <Link to="/tools/sleep-track">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <Brain className="h-6 w-6 text-primary mb-2" />
                    <CardTitle className="text-lg">Sleep Tracker</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
              <Link to="/tools/sleep">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <Brain className="h-6 w-6 text-primary mb-2" />
                    <CardTitle className="text-lg">Sleep Tips</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolAnalyticsWrapper>
  )
}
