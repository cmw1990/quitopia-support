import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDistractionManager } from '@/hooks/useDistractionManager';
import {
  DigitalMinimalism,
  DistractionAnalytics,
  EnvironmentOptimizer,
  BlockingScheduler
} from './distraction';
import { 
  Shield,  
  Plus,
  Calendar,
  Lock,
  Target
} from 'lucide-react';
import { BlockedSite } from '@/lib/types/distraction-types';

const siteCategories: { value: BlockedSite['category']; label: string; icon: React.ElementType }[] = [
  { value: 'social', label: 'Social Media', icon: Target },
  { value: 'entertainment', label: 'Entertainment', icon: Target },
  { value: 'shopping', label: 'Shopping', icon: Target },
  { value: 'news', label: 'News', icon: Target },
  { value: 'productivity', label: 'Productivity', icon: Target },
  { value: 'other', label: 'Other', icon: Target }
];

export const DistractionBlocker: React.FC = () => {
  const {
    state,
    actions
  } = useDistractionManager();

  const [newSite, setNewSite] = React.useState('');
  const [selectedSite, setSelectedSite] = React.useState<BlockedSite | null>(null);

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-bold">Distraction Blocker</h2>
        </div>
        <Switch
          checked={state.isBlockingEnabled}
          onCheckedChange={actions.toggleBlocking}
          className="data-[state=checked]:bg-purple-500"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="sites" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="sites">Sites</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="sites" role="tabpanel" aria-label="Sites">
          {/* Site Category Selection */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {siteCategories.map(category => (
              <Button
                key={category.value}
                variant="outline"
                onClick={() => actions.setSelectedCategory(category.value)}
                className={`${
                  state.selectedCategory === category.value
                    ? 'border-2 border-purple-500'
                    : ''
                }`}
              >
                <category.icon className="h-4 w-4 mr-2" />
                {category.label}
              </Button>
            ))}
          </div>

          {/* Add New Site */}
          <div className="flex gap-2 mb-6">
            <Input
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
              placeholder="Enter website to block (e.g., facebook.com)"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newSite) {
                  actions.addBlockedSite(newSite);
                  setNewSite('');
                }
              }}
            />
            <Button 
              onClick={() => {
                if (newSite) {
                  actions.addBlockedSite(newSite);
                  setNewSite('');
                }
              }}
              disabled={!newSite}
              aria-label="Add site"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Blocked Sites List */}
          <div className="space-y-2">
            {state.blockedSites
              .filter(site => state.selectedCategory === 'all' || site.category === state.selectedCategory)
              .map((site) => (
                <div
                  key={site.id}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Lock className={`h-4 w-4 ${
                      site.block_intensity === 'strict' ? 'text-red-500' :
                      site.block_intensity === 'moderate' ? 'text-yellow-500' :
                      'text-green-500'
                    }`} />
                    <span>{site.domain}</span>
                    <Badge variant="secondary">{site.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSite(site);
                        actions.toggleView('showScheduler');
                      }}
                      aria-label="Schedule blocking"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => actions.removeBlockedSite(site.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove site"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" role="tabpanel" aria-label="Analytics">
          <DistractionAnalytics
            stats={state.blockingStats}
            patterns={state.distractionPatterns}
            logs={state.distractionLogs}
          />
        </TabsContent>

        <TabsContent value="environment" role="tabpanel" aria-label="Environment">
          <EnvironmentOptimizer
            recommendations={state.environmentRecommendations}
            onImplement={(id) => {
              // Implementation logic
            }}
            onDismiss={(id) => {
              // Dismissal logic
            }}
          />
        </TabsContent>

        <TabsContent value="goals" role="tabpanel" aria-label="Goals">
          <DigitalMinimalism
            goals={state.digitalGoals}
            onUpdate={actions.updateDigitalGoal}
            onAddReflection={(goalId, reflection) => {
              // Add reflection logic
            }}
            onCompleteMilestone={(goalId, milestoneIndex) => {
              // Complete milestone logic
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Scheduling Interface */}
      {state.showScheduler && selectedSite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <BlockingScheduler
              site={selectedSite}
              onUpdateSchedule={(schedules) => {
                actions.updateBlockedSite(selectedSite.id, {
                  blockingSchedule: schedules
                });
                actions.toggleView('showScheduler');
                setSelectedSite(null);
              }}
              onCancel={() => {
                actions.toggleView('showScheduler');
                setSelectedSite(null);
              }}
            />
          </div>
        </div>
      )}
    </Card>
  );
};
