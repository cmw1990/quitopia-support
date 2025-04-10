import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface CognitiveProfile {
  attention: number;
  memory: number;
  processing: number;
  executive: number;
  verbal: number;
  visual: number;
  overall: number;
  recommendations: string[];
  energyPatterns: {
    peakHours: string[];
    restPeriods: string[];
    optimalDuration: number;
  };
}

interface AssessmentModule {
  id: string;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
  score?: number;
}

const ASSESSMENT_MODULES: AssessmentModule[] = [
  {
    id: 'attention',
    title: 'Sustained Attention',
    description: 'Measures your ability to maintain focus over time',
    duration: 5,
    completed: false
  },
  {
    id: 'working-memory',
    title: 'Working Memory',
    description: 'Tests your ability to hold and manipulate information',
    duration: 7,
    completed: false
  },
  {
    id: 'processing',
    title: 'Processing Speed',
    description: 'Evaluates how quickly you can process information',
    duration: 6,
    completed: false
  },
  {
    id: 'executive',
    title: 'Executive Function',
    description: 'Assesses planning and decision-making abilities',
    duration: 8,
    completed: false
  },
  {
    id: 'verbal',
    title: 'Verbal Fluency',
    description: 'Tests language processing and word retrieval',
    duration: 5,
    completed: false
  }
];

export function CognitiveAssessment() {
  const [activeTab, setActiveTab] = useState('overview');
  const [modules, setModules] = useState(ASSESSMENT_MODULES);
  const [profile, setProfile] = useState<CognitiveProfile | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const { toast } = useToast();

  const startAssessment = useCallback(() => {
    setIsAssessing(true);
    // In a real implementation, this would start the first assessment module
    toast({
      title: "Assessment Started",
      description: "Complete each module to receive your cognitive profile",
    });
  }, [toast]);

  const completeModule = useCallback((moduleId: string, score: number) => {
    setModules(prev => prev.map(m => 
      m.id === moduleId ? { ...m, completed: true, score } : m
    ));
  }, []);

  const generateProfile = useCallback(() => {
    // In a real implementation, this would analyze all module results
    const mockProfile: CognitiveProfile = {
      attention: 85,
      memory: 78,
      processing: 92,
      executive: 88,
      verbal: 82,
      visual: 90,
      overall: 86,
      recommendations: [
        "Schedule complex tasks during your peak energy hours (9-11 AM)",
        "Take regular breaks every 45-60 minutes",
        "Practice mindfulness exercises between cognitive tasks",
        "Use memory games during energy dips to maintain alertness"
      ],
      energyPatterns: {
        peakHours: ["09:00", "10:00", "11:00", "16:00", "17:00"],
        restPeriods: ["13:00", "15:00"],
        optimalDuration: 45
      }
    };
    setProfile(mockProfile);
  }, []);

  return (
    <Card className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold">Cognitive Assessment</h3>
            <p className="text-muted-foreground">
              Complete a comprehensive assessment to understand your cognitive strengths
              and optimize your energy patterns.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">What You'll Learn:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Your peak cognitive performance hours</li>
              <li>Optimal work/rest patterns</li>
              <li>Personalized brain training recommendations</li>
              <li>Energy management strategies</li>
            </ul>
          </div>

          <Button onClick={() => setActiveTab('assessment')} size="lg">
            Start Assessment
          </Button>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-6">
          <div className="space-y-4">
            {modules.map(module => (
              <div
                key={module.id}
                className={cn(
                  "p-4 rounded-lg border",
                  module.completed ? "bg-muted" : "bg-card"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{module.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {module.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {module.duration} min
                    </div>
                    {module.completed && (
                      <div className="text-sm text-primary">
                        Score: {module.score}
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  variant={module.completed ? "secondary" : "default"}
                  size="sm"
                  className="w-full"
                  disabled={module.completed}
                  onClick={() => completeModule(module.id, Math.random() * 20 + 80)}
                >
                  {module.completed ? "Completed" : "Start"}
                </Button>
              </div>
            ))}
          </div>

          <Button
            onClick={() => {
              generateProfile();
              setActiveTab('profile');
            }}
            disabled={!modules.every(m => m.completed)}
          >
            Generate Cognitive Profile
          </Button>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          {profile ? (
            <>
              <div>
                <h3 className="text-2xl font-bold mb-2">Your Cognitive Profile</h3>
                <div className="text-lg font-semibold text-primary">
                  Overall Score: {profile.overall}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Attention</span>
                    <span>{profile.attention}%</span>
                  </div>
                  <Progress value={profile.attention} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory</span>
                    <span>{profile.memory}%</span>
                  </div>
                  <Progress value={profile.memory} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing Speed</span>
                    <span>{profile.processing}%</span>
                  </div>
                  <Progress value={profile.processing} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Executive Function</span>
                    <span>{profile.executive}%</span>
                  </div>
                  <Progress value={profile.executive} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Verbal Ability</span>
                    <span>{profile.verbal}%</span>
                  </div>
                  <Progress value={profile.verbal} />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Energy Pattern Insights</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Peak Hours: {profile.energyPatterns.peakHours.join(", ")}</p>
                  <p>Rest Periods: {profile.energyPatterns.restPeriods.join(", ")}</p>
                  <p>Optimal Session Duration: {profile.energyPatterns.optimalDuration} minutes</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Recommendations</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {profile.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Complete the assessment to view your cognitive profile
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
