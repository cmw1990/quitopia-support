import { motion } from 'framer-motion';
import { Brain, BarChart2, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { FocusSession } from '@/lib/types/focus-types';
import type { SmartPanelsProps } from './types';

export const SmartPanels: React.FC<SmartPanelsProps> = ({
  showSmartRecommendations,
  smartRecommendation,
  sessions,
  sessionCount,
  totalFocusMinutes,
  showAnalytics,
  setShowAnalytics
}: SmartPanelsProps) => {
  return (
    <motion.div 
      className="md:w-1/3 space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      {/* Smart Recommendations */}
      {showSmartRecommendations && smartRecommendation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Smart Focus Insights
            </CardTitle>
            <CardDescription>
              AI-powered recommendations based on your patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Recommended Duration</h4>
                <Badge variant="outline">{smartRecommendation.duration} min</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{smartRecommendation.reason}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Flow State Analysis</h4>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Flow Sustainability</span>
                  <Badge variant="secondary">{smartRecommendation.flowStateAnalysis.sustainabilityScore}%</Badge>
                </div>
                <Progress 
                  value={smartRecommendation.flowStateAnalysis.sustainabilityScore} 
                  className="h-1.5 mb-3"
                />
                <ul className="text-sm space-y-1">
                  {smartRecommendation.flowStateAnalysis.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Energy Optimization</h4>
              <div className="bg-muted/50 rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Peak Focus Hours</span>
                  <span className="text-sm font-medium">
                    {smartRecommendation.energyOptimization.peakTimeStart} - {smartRecommendation.energyOptimization.peakTimeEnd}
                  </span>
                </div>
                <Progress value={smartRecommendation.energyOptimization.currentLevel * 10} className="h-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            Focus Stats
          </CardTitle>
          <CardDescription>
            Your focus journey metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-2xl font-bold">{sessionCount}</span>
              <span className="text-sm text-muted-foreground block">
                Sessions Completed
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-bold">{totalFocusMinutes}</span>
              <span className="text-sm text-muted-foreground block">
                Total Minutes
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Recent Sessions</h4>
            <div className="space-y-2">
              {sessions.slice(0, 3).map((session: FocusSession, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{session.task || 'Untitled Session'}</span>
                      <Badge 
                        variant={session.completed ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {session.completed ? 'Completed' : 'Interrupted'}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(session.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{session.duration}m</span>
                </div>
              ))}
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={() => setShowAnalytics(true)}>
            View Full Analytics
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
