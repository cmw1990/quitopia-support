
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Clock, Plus, Calendar, Trash2, Save } from 'lucide-react';
import { BlockedSite, BlockingSchedule } from '@/lib/types/distraction-types';
import { useToast } from '@/hooks/use-toast';

export const BlockingScheduler: React.FC = () => {
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>([]);
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [category, setCategory] = useState<BlockedSite['category']>('social');
  const [blockIntensity, setBlockIntensity] = useState<BlockedSite['block_intensity']>('moderate');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const { toast } = useToast();

  const days = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleAddSite = () => {
    if (!newSiteUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a website URL to block",
        variant: "destructive",
      });
      return;
    }

    const newBlockedSite: BlockedSite = {
      id: Date.now().toString(),
      user_id: "current-user-id", // Would be replaced with actual user ID
      domain: newSiteUrl,
      block_intensity: blockIntensity,
      days_active: selectedDays.length > 0 ? selectedDays : undefined,
      category,
      created_at: new Date().toISOString(),
    };

    setBlockedSites([...blockedSites, newBlockedSite]);
    setNewSiteUrl('');
    setSelectedDays([]);
    
    toast({
      title: "Site Added",
      description: `${newSiteUrl} has been added to your blocked sites`,
      variant: "success",
    });
  };

  const handleRemoveSite = (id: string) => {
    setBlockedSites(blockedSites.filter(site => site.id !== id));
    
    toast({
      title: "Site Removed",
      description: "The site has been removed from your blocked list",
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Blocking Scheduler</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Add New Site to Block</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-url">Website URL</Label>
            <Input
              id="site-url"
              placeholder="e.g., facebook.com"
              value={newSiteUrl}
              onChange={(e) => setNewSiteUrl(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="intensity">Block Intensity</Label>
              <Select value={blockIntensity} onValueChange={(value: any) => setBlockIntensity(value)}>
                <SelectTrigger id="intensity">
                  <SelectValue placeholder="Select intensity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strict">Strict (Always Block)</SelectItem>
                  <SelectItem value="moderate">Moderate (Block During Schedule)</SelectItem>
                  <SelectItem value="light">Light (Warning Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Active Days</Label>
            <div className="flex flex-wrap gap-2">
              {days.map(day => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.value}
                    checked={selectedDays.includes(day.value)}
                    onCheckedChange={() => toggleDay(day.value)}
                  />
                  <Label htmlFor={day.value} className="text-sm">
                    {day.label.substring(0, 3)}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <Button onClick={handleAddSite} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Site
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {blockedSites.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">You haven't added any blocked sites yet.</div>
          </Card>
        ) : (
          blockedSites.map(site => (
            <Card key={site.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{site.domain}</h3>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <div className="flex items-center mr-3">
                        <Calendar className="h-3 w-3 mr-1" />
                        {site.days_active && site.days_active.length > 0 
                          ? site.days_active.map(day => day.substring(0, 3)).join(', ')
                          : 'Every day'}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {site.blockingSchedule 
                          ? `${site.blockingSchedule[0]?.start_time} - ${site.blockingSchedule[0]?.end_time}`
                          : 'All day'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSite(site.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
