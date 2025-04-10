import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Ban,
  Save,
  Loader2,
  Trash2,
  PlusCircle,
  Network,
  Video,
  Newspaper,
  Lock
} from 'lucide-react';
import {
  DistractionSettings,
  getUserDistractionSettings,
  updateUserDistractionSettings
} from '@/api/supabaseClient';
import { useAuth } from '@/components/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';

// Define categories
interface BlockCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const blockCategories: BlockCategory[] = [
  { id: 'social', label: 'Social Media', icon: <Network className="h-4 w-4" /> },
  { id: 'video', label: 'Video Streaming', icon: <Video className="h-4 w-4" /> },
  { id: 'news', label: 'News Outlets', icon: <Newspaper className="h-4 w-4" /> },
];

// Initial empty state
const initialSettings: DistractionSettings = {
  blocked_sites_categories: { social: false, video: false, news: false },
  custom_blocked_sites: [],
  schedules: [],
  notifications_blocked: false, // Add if needed in UI
  strict_mode: false,
};

export const DistractionBlockerSettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<DistractionSettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [customSiteInput, setCustomSiteInput] = useState('');

  // Fetch settings on mount
  useEffect(() => {
    if (!user) return;
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        // Use placeholder API call
        const loadedSettings = await getUserDistractionSettings(user.id);
        if (loadedSettings) {
          // Ensure all categories exist in the loaded settings
          const currentCategories = loadedSettings.blocked_sites_categories || {};
          const defaultCategories = initialSettings.blocked_sites_categories;
          const mergedCategories = { ...defaultCategories, ...currentCategories };

          setSettings({
             ...initialSettings, // Start with defaults
             ...loadedSettings, // Override with loaded
             blocked_sites_categories: mergedCategories // Ensure categories are merged
           });

        } else {
          // Use initial settings if none found
          setSettings(initialSettings);
        }
      } catch (error) {
        console.error("Failed to load distraction settings:", error);
        toast.error("Could not load settings. Using defaults.");
        setSettings(initialSettings);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, [user]);

  // Handle state changes
  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      blocked_sites_categories: {
        ...prev.blocked_sites_categories,
        [categoryId]: checked,
      },
    }));
  };

  const handleAddCustomSite = () => {
    if (customSiteInput.trim() && !settings.custom_blocked_sites.includes(customSiteInput.trim())) {
      const domain = customSiteInput.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]; // Basic domain extraction
      if (domain) { // Check if domain extraction resulted in a non-empty string
        setSettings(prev => ({
          ...prev,
          custom_blocked_sites: [...prev.custom_blocked_sites, domain],
        }));
        setCustomSiteInput('');
      } else {
         toast.warning("Invalid domain format. Please enter a valid website address (e.g., example.com).");
      }
    } else if (settings.custom_blocked_sites.includes(customSiteInput.trim())) {
      toast.info("This site is already in the block list.");
    } else {
      toast.warning("Please enter a website domain to add.");
    }
  };

  const handleRemoveCustomSite = (siteToRemove: string) => {
    setSettings(prev => ({
      ...prev,
      custom_blocked_sites: prev.custom_blocked_sites.filter(site => site !== siteToRemove),
    }));
  };

  const handleStrictModeToggle = (checked: boolean) => {
    setSettings(prev => ({ ...prev, strict_mode: checked }));
  };

  // Save settings
  const handleSaveChanges = async () => {
    if (!user) {
      toast.error("You must be logged in to save settings.");
      return;
    }
    setIsSaving(true);
    try {
      // Prepare payload (remove fields not relevant for update if necessary)
      const { id, updated_at, user_id, ...payload } = settings;
      // Use placeholder API call
      const updated = await updateUserDistractionSettings(user.id, payload);
      setSettings(updated); // Update state with potentially returned data (e.g., ID, timestamp)
      toast.success("Distraction blocker settings saved!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Ban className="h-5 w-5" /> Distraction Blocker</CardTitle>
          <CardDescription>Manage websites and apps to block during focus.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Ban className="h-5 w-5" /> Distraction Blocker</CardTitle>
        <CardDescription>Manage websites and apps to block during focus sessions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Blocking */}
        <div className="space-y-3">
          <Label className="font-semibold">Block Categories</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {blockCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  {category.icon}
                  <span className="text-sm">{category.label}</span>
                </div>
                <Switch
                  checked={settings.blocked_sites_categories[category.id] || false}
                  onCheckedChange={(checked) => handleCategoryToggle(category.id, checked)}
                  aria-label={`Block ${category.label}`}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Custom Site Blocking */}
        <div className="space-y-3">
          <Label htmlFor="custom-site" className="font-semibold">Custom Blocked Sites</Label>
          <div className="flex gap-2">
            <Input
              id="custom-site"
              placeholder="e.g., example.com"
              value={customSiteInput}
              onChange={(e) => setCustomSiteInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSite(); }}}
              className="flex-grow"
            />
            <Button onClick={handleAddCustomSite} variant="outline" size="icon" aria-label="Add custom site">
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          {settings.custom_blocked_sites.length > 0 && (
            <div className="space-y-2 pt-2 max-h-40 overflow-y-auto pr-2">
              <AnimatePresence>
                {settings.custom_blocked_sites.map((site) => (
                  <motion.div
                    key={site}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, x: -20 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 50, mass: 0.5 }}
                    className="flex items-center justify-between p-2 pl-3 border rounded-md bg-muted/20"
                  >
                    <span className="text-sm font-mono truncate mr-2">{site}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={() => handleRemoveCustomSite(site)}
                      aria-label={`Remove ${site}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Strict Mode */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary/80" />
              <div>
                <Label htmlFor="strict-mode" className="font-semibold cursor-pointer">Strict Mode</Label>
                <p className="text-xs text-muted-foreground">Prevent changing settings during active focus sessions.</p>
              </div>
            </div>
            <Switch
              id="strict-mode"
              checked={settings.strict_mode}
              onCheckedChange={handleStrictModeToggle}
            />
          </div>
        </div>

      </CardContent>
      <CardFooter className="border-t pt-4 pb-4 flex justify-end">
        <Button onClick={handleSaveChanges} disabled={isSaving || isLoading}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DistractionBlockerSettings; 