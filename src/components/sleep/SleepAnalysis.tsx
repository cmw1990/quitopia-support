import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Brain, Loader2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/supabase-client"

interface SleepAnalysisProps {
  sleepData: {
    movements: number[]
    startTime: string
    duration: number
    sensitivity: number
  }
}

export const SleepAnalysis = ({ sleepData }: SleepAnalysisProps) => {
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { toast } = useToast()

  const analyzeSleep = async () => {
    try {
      setIsAnalyzing(true)
      const { data, error } = await supabase.functions.invoke('analyze-sleep', {
        body: { sleepData }
      })

      if (error) throw error

      setAnalysis(data.choices[0].message.content)
      toast({
        title: "Analysis Complete",
        description: "Your sleep data has been analyzed using advanced AI algorithms.",
      })
    } catch (error) {
      console.error('Error analyzing sleep:', error)
      toast({
        title: "Error",
        description: "Failed to analyze sleep data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Sleep Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <Button 
            onClick={analyzeSleep} 
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Sleep Patterns...
              </>
            ) : (
              'Get Advanced AI Analysis'
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {analysis}
            </div>
            <Button 
              variant="outline" 
              onClick={() => setAnalysis(null)}
              size="sm"
            >
              Get New Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}