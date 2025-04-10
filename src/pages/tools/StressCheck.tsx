
import { TopNav } from "@/components/layout/TopNav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Brain, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const questions = [
  {
    id: 1,
    text: "How often have you felt overwhelmed by your responsibilities in the past week?"
  },
  {
    id: 2,
    text: "How would you rate your sleep quality recently?"
  },
  {
    id: 3,
    text: "How often do you feel irritable or anxious?"
  },
  {
    id: 4,
    text: "How well can you concentrate on tasks?"
  },
  {
    id: 5,
    text: "How would you rate your energy levels throughout the day?"
  }
]

export default function StressCheck() {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [showResults, setShowResults] = useState(false)
  const { toast } = useToast()

  const handleAnswer = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: parseInt(value)
    }))
  }

  const calculateStressLevel = () => {
    if (Object.keys(answers).length < questions.length) {
      toast({
        title: "Please answer all questions",
        description: "We need all questions answered to give you an accurate assessment.",
        variant: "destructive"
      })
      return
    }

    const total = Object.values(answers).reduce((sum, value) => sum + value, 0)
    const average = total / questions.length
    setShowResults(true)
  }

  const getStressLevel = () => {
    const average = Object.values(answers).reduce((sum, value) => sum + value, 0) / questions.length
    if (average <= 1) return { level: "Low", description: "Your stress levels appear to be well managed." }
    if (average <= 2) return { level: "Moderate", description: "You're experiencing some stress, but it's manageable." }
    if (average <= 3) return { level: "High", description: "Your stress levels are elevated. Consider stress management techniques." }
    return { level: "Severe", description: "Your stress levels are very high. Consider speaking with a healthcare professional." }
  }

  const resetCheck = () => {
    setAnswers({})
    setShowResults(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <CardTitle>Stress Check</CardTitle>
            </div>
            <CardDescription>
              Answer these questions to get an assessment of your current stress levels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showResults ? (
              <div className="space-y-6">
                {questions.map((question) => (
                  <div key={question.id} className="space-y-4">
                    <Label className="text-lg">{question.text}</Label>
                    <RadioGroup
                      onValueChange={(value) => handleAnswer(question.id, value)}
                      value={answers[question.id]?.toString()}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="0" id={`q${question.id}-0`} />
                        <Label htmlFor={`q${question.id}-0`}>Never/Very Good</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id={`q${question.id}-1`} />
                        <Label htmlFor={`q${question.id}-1`}>Sometimes/Good</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id={`q${question.id}-2`} />
                        <Label htmlFor={`q${question.id}-2`}>Often/Fair</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id={`q${question.id}-3`} />
                        <Label htmlFor={`q${question.id}-3`}>Very Often/Poor</Label>
                      </div>
                    </RadioGroup>
                  </div>
                ))}
                <Button onClick={calculateStressLevel} className="w-full">
                  Calculate Results
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-secondary/10 rounded-lg text-center">
                  <h3 className="text-2xl font-bold mb-2">
                    Stress Level: {getStressLevel().level}
                  </h3>
                  <p className="text-muted-foreground">
                    {getStressLevel().description}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Practice deep breathing exercises</li>
                    <li>Maintain a regular sleep schedule</li>
                    <li>Exercise regularly</li>
                    <li>Take regular breaks during work</li>
                    <li>Consider meditation or mindfulness practices</li>
                  </ul>
                </div>

                <Button onClick={resetCheck} variant="outline" className="w-full">
                  Take Another Assessment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
