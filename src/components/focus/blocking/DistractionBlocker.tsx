import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, X, Settings2, Eye, EyeOff, Clock, Check, ExternalLink, AlertTriangle, Bell, Moon } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { focusDb } from "@/lib/focus-db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COMMON_SITES = [
  { value: 'facebook.com', label: 'Facebook' },
  { value: 'twitter.com', label: 'Twitter' },
  { value: 'instagram.com', label: 'Instagram' },
  { value: 'youtube.com', label: 'YouTube' },
  { value: 'reddit.com', label: 'Reddit' },
  { value: 'tiktok.com', label: 'TikTok' },
  { value: 'netflix.com', label: 'Netflix' },
  { value: 'amazon.com', label: 'Amazon' },
  { value: 'pinterest.com', label: 'Pinterest' },
  { value: 'linkedin.com', label: 'LinkedIn' },
];

interface BlockedSite {
  id: string;
  domain: string;
  isBlocked: boolean;
}

interface BlockingSettings {
  blockAds: boolean;
  blockSocialMedia: boolean;
  blockNotifications: boolean;
  allowlist: string[];
  scheduleEnabled: boolean;
  scheduleStart: string;
  scheduleEnd: string;
  quietModeEnabled: boolean;
  blockLevel: string;
}

export const DistractionBlocker = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newSite, setNewSite] = useState("");
  const [quickAddSite, setQuickAddSite] = useState("");
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [blockingActive, setBlockingActive] = useState(false);
  const [settings, setSettings] = useState<BlockingSettings>({
    blockAds: true,
    blockSocialMedia: true,
    blockNotifications: true,
    allowlist: [],
    scheduleEnabled: false,
    scheduleStart: "09:00",
    scheduleEnd: "17:00",
    quietModeEnabled: false,
    blockLevel: "medium"
  });
  const [allowlistEntry, setAllowlistEntry] = useState("");

  // Load blocked sites
  const { data: blockedSites = [], isLoading: sitesLoading } = useQuery({
    queryKey: ['blocked-sites'],
    queryFn: () => focusDb.getBlockedSites(),
    enabled: !!session?.user
  });

  // Load blocking settings
  const { data: savedSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['blocking-settings'],
    queryFn: () => focusDb.getBlockingSettings(),
    onSuccess: (data) => {
      if (data) {
        setSettings({
          ...settings,
          blockAds: data.blockAds || true,
          blockSocialMedia: data.blockSocialMedia || true,
          blockNotifications: data.blockNotifications || true,
          allowlist: data.allowlist || [],
          scheduleEnabled: data.scheduleEnabled || false,
          scheduleStart: data.scheduleStart || "09:00",
          scheduleEnd: data.scheduleEnd || "17:00",
          quietModeEnabled: data.quietModeEnabled || false,
          blockLevel: data.blockLevel || "medium"
        });
      }
    },
    enabled: !!session?.user
  });

  // Update settings
  const updateSettings = useMutation({
    mutationFn: async (newSettings: BlockingSettings) => {
      await focusDb.updateBlockingSettings(newSettings);
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your blocking settings have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ['blocking-settings'] });
    },
  });

  // Add site to block list
  const addSite = useMutation({
    mutationFn: async (domain: string) => {
      await focusDb.addBlockedSite({ domain });
    },
    onSuccess: () => {
      setNewSite("");
      setQuickAddSite("");
      toast({
        title: "Site added",
        description: "The site has been added to your block list.",
      });
      queryClient.invalidateQueries({ queryKey: ['blocked-sites'] });
    },
  });

  // Remove site from block list
  const removeSite = useMutation({
    mutationFn: async (id: string) => {
      await focusDb.removeBlockedSite(id);
    },
    onSuccess: () => {
      toast({
        title: "Site removed",
        description: "The site has been removed from your block list.",
      });
      queryClient.invalidateQueries({ queryKey: ['blocked-sites'] });
    },
  });

  // Toggle site blocking
  const toggleSite = useMutation({
    mutationFn: async ({ id, isBlocked }: { id: string; isBlocked: boolean }) => {
      await focusDb.updateBlockedSite(id, { isBlocked });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-sites'] });
    },
  });

  // Toggle focus mode
  const toggleFocusMode = () => {
    setBlockingActive(!blockingActive);
    toast({
      title: blockingActive ? "Focus mode deactivated" : "Focus mode activated",
      description: blockingActive 
        ? "Distractions are now allowed" 
        : "Distractions are now being blocked according to your settings",
    });
    
    // In a real implementation, this would connect to a browser extension
    // For now, we're just toggling the state
  };

  // Add site to allowlist
  const addToAllowlist = () => {
    if (!allowlistEntry) return;
    
    const updatedAllowlist = [...settings.allowlist, allowlistEntry];
    setSettings({...settings, allowlist: updatedAllowlist});
    updateSettings.mutate({...settings, allowlist: updatedAllowlist});
    setAllowlistEntry("");
  };

  // Remove site from allowlist
  const removeFromAllowlist = (site: string) => {
    const updatedAllowlist = settings.allowlist.filter(s => s !== site);
    setSettings({...settings, allowlist: updatedAllowlist});
    updateSettings.mutate({...settings, allowlist: updatedAllowlist});
  };

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateSettings.mutate(newSettings);
  };

  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite) return;
    addSite.mutate(newSite);
  };

  const handleQuickAddSite = () => {
    if (!quickAddSite) return;
    addSite.mutate(quickAddSite);
  };

  const activeSites = blockedSites.filter((site: any) => site.is_blocked).length;
  const totalSites = blockedSites.length;

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            <CardTitle>Distraction Blocker</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              {blockingActive ? (
                <Badge className="bg-green-500">Active</Badge>
              ) : (
                <Badge variant="outline">Inactive</Badge>
              )}
            </div>
            <Button 
              onClick={toggleFocusMode}
              variant={blockingActive ? "destructive" : "default"}
              className="transition-all"
            >
              {blockingActive ? "Disable" : "Enable"} Focus Mode
            </Button>
          </div>
        </div>
        <CardDescription>
          Block distracting websites and notifications to stay focused
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <Tabs defaultValue="sites" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="sites">Blocked Sites</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="allowlist">Allowlist</TabsTrigger>
          </TabsList>

          <TabsContent value="sites" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {activeSites} active blocks / {totalSites} total sites
              </div>
              
              <Select value={quickAddSite} onValueChange={setQuickAddSite}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Common sites..." />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_SITES.map(site => (
                    <SelectItem key={site.value} value={site.value}>
                      {site.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button size="sm" onClick={handleQuickAddSite} disabled={!quickAddSite}>
                <Plus className="h-4 w-4 mr-1" /> Quick Add
              </Button>
            </div>

            {/* Custom site form */}
            <form onSubmit={handleAddSite} className="flex gap-2 mb-4">
              <Input
                value={newSite}
                onChange={(e) => setNewSite(e.target.value)}
                placeholder="Enter website domain (e.g., facebook.com)"
                className="flex-1"
              />
              <Button type="submit" disabled={!newSite}>
                <Plus className="h-4 w-4 mr-2" />
                Add Custom
              </Button>
            </form>

            {/* Blocked sites list */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {sitesLoading ? (
                <p className="text-center py-4 text-muted-foreground">Loading your sites...</p>
              ) : blockedSites.length === 0 ? (
                <Card className="p-8 border-dashed">
                  <div className="text-center text-muted-foreground space-y-2">
                    <AlertTriangle className="h-12 w-12 mx-auto text-orange-500/50" />
                    <p>No sites in your block list yet</p>
                    <p className="text-sm">Add distracting websites to start blocking them</p>
                  </div>
                </Card>
              ) : (
                blockedSites.map((site: any) => (
                  <div
                    key={site.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <span>{site.domain}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={site.is_blocked}
                        onCheckedChange={(checked) =>
                          toggleSite.mutate({ id: site.id, isBlocked: checked })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSite.mutate(site.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-muted/50">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="blockAds" className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-500" />
                    Block Advertisements
                  </Label>
                  <Switch
                    id="blockAds"
                    checked={settings.blockAds}
                    onCheckedChange={(checked) =>
                      handleSettingChange("blockAds", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="blockSocialMedia" className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4 text-blue-500" />
                    Block Social Media
                  </Label>
                  <Switch
                    id="blockSocialMedia"
                    checked={settings.blockSocialMedia}
                    onCheckedChange={(checked) =>
                      handleSettingChange("blockSocialMedia", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="blockNotifications" className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-yellow-500" />
                    Block Notifications
                  </Label>
                  <Switch
                    id="blockNotifications"
                    checked={settings.blockNotifications}
                    onCheckedChange={(checked) =>
                      handleSettingChange("blockNotifications", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="quietModeEnabled" className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-purple-500" />
                    Quiet Mode
                  </Label>
                  <Switch
                    id="quietModeEnabled"
                    checked={settings.quietModeEnabled}
                    onCheckedChange={(checked) =>
                      handleSettingChange("quietModeEnabled", checked)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blockLevel">Blocking Intensity</Label>
                  <Select
                    value={settings.blockLevel}
                    onValueChange={(value) => handleSettingChange("blockLevel", value)}
                  >
                    <SelectTrigger id="blockLevel">
                      <SelectValue placeholder="Select blocking level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Only explicitly listed sites)</SelectItem>
                      <SelectItem value="medium">Medium (Listed + social media)</SelectItem>
                      <SelectItem value="high">High (All distractions)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="scheduleEnabled">Enable Schedule</Label>
                  <Switch
                    id="scheduleEnabled"
                    checked={settings.scheduleEnabled}
                    onCheckedChange={(checked) =>
                      handleSettingChange("scheduleEnabled", checked)
                    }
                  />
                </div>

                {settings.scheduleEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={settings.scheduleStart}
                        onChange={(e) =>
                          handleSettingChange("scheduleStart", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={settings.scheduleEnd}
                        onChange={(e) =>
                          handleSettingChange("scheduleEnd", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Browser Extension</h3>
                <p className="text-sm text-muted-foreground">
                  Required for full site blocking
                </p>
              </div>

              {extensionInstalled ? (
                <Badge className="bg-green-500 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Installed
                </Badge>
              ) : (
                <Button variant="outline" size="sm">
                  Install Extension
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="allowlist" className="space-y-4">
            <div className="space-y-2">
              <Label>Add site to allowlist</Label>
              <div className="flex gap-2">
                <Input
                  value={allowlistEntry}
                  onChange={(e) => setAllowlistEntry(e.target.value)}
                  placeholder="Enter domain to allow"
                  className="flex-1"
                />
                <Button onClick={addToAllowlist} disabled={!allowlistEntry}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Sites in your allowlist will always be accessible, even during focus mode
              </p>
            </div>

            <div className="space-y-2">
              <Label>Current Allowlist</Label>
              <div className="border rounded-md p-4">
                {settings.allowlist.length === 0 ? (
                  <p className="text-center text-muted-foreground py-2">No sites in your allowlist</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {settings.allowlist.map((site) => (
                      <Badge key={site} variant="secondary" className="flex gap-1 items-center">
                        {site}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                          onClick={() => removeFromAllowlist(site)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
