import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Globe, Zap, Battery, Pill, Wind, Coffee, Smartphone, Laptop, Monitor, Chrome, Moon, Eye } from "lucide-react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

export function WhyUs() {
  const [selectedPersona] = useState<string>("")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Why Choose Easier Focus?</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform supports focus, ADHD, anti-distraction, and energy management with evidence-based tools.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
          <FeatureCard 
            icon={Brain} 
            title="Focus Enhancement" 
            description="Advanced focus tools including Pomodoro timers, focus scoring, and distraction monitoring to optimize your productivity." 
          />
          <FeatureCard 
            icon={Zap} 
            title="Energy Management" 
            description="Track energy levels throughout the day and receive personalized recommendations based on your ultradian rhythms." 
          />
          <FeatureCard 
            icon={Laptop} 
            title="Distraction Blocking" 
            description="Intelligent site blocking, notification management, and digital minimalism tools to keep you on track." 
          />
          <FeatureCard 
            icon={Chrome} 
            title="Anti-Googlitis" 
            description="Tools to help overcome excessive search behaviors and promote deeper focus and learning." 
          />
          <FeatureCard 
            icon={Coffee} 
            title="Lifestyle Integration" 
            description="Integrate caffeine, sleep, and nutrition tracking with your focus and energy management." 
          />
          <FeatureCard 
            icon={Smartphone} 
            title="Cross-Device Compatibility" 
            description="Use our tools seamlessly across web, desktop, and mobile platforms for continuous support." 
          />
        </section>

        <section className="mt-16 space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">How Easier Focus Transforms Your Day</h2>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
              Experience immediate improvements in productivity and wellbeing
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <TransformationCard 
              before="Constant distractions breaking your focus" 
              after="Distraction-free deep work sessions" 
              metric="Average 43% increase in focused work time" 
            />
            <TransformationCard 
              before="Afternoon energy crashes" 
              after="Optimized energy management throughout the day" 
              metric="87% of users report fewer energy dips" 
            />
            <TransformationCard 
              before="Task overwhelm and procrastination" 
              after="Clear task prioritization and completion" 
              metric="Task completion rates increase by 38%" 
            />
            <TransformationCard 
              before="Digital overload and screen fatigue" 
              after="Balanced digital usage with breaks" 
              metric="62% reduction in reported digital fatigue" 
            />
          </div>
        </section>
      </div>
              </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
          <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <Icon className="h-6 w-6 text-primary" />
          <CardTitle>{title}</CardTitle>
        </div>
                  </CardHeader>
                  <CardContent>
        <p className="text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
  )
}
                
function TransformationCard({ before, after, metric }: { before: string; after: string; metric: string }) {
  return (
                <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-muted-foreground flex items-center">
              <span className="bg-destructive/20 text-destructive rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">
                ✗
              </span>
              {before}
            </p>
            <p className="text-muted-foreground flex items-center">
              <span className="bg-green-100 text-green-700 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">
                ✓
              </span>
              {after}
            </p>
            </div>
          <div className="pt-2 border-t">
            <p className="font-medium text-sm">{metric}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

