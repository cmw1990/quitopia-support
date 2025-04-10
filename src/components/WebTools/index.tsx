import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Download,
  Check,
  Settings,
  Clock,
  X,
  Shield,
  BookOpen,
  Bookmark,
  Layers,
  FileText,
  Sliders,
  Youtube,
  Bell
} from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { Progress } from '../ui/progress';
import { useAuth } from '../AuthProvider';
import { supabaseRequest } from '../../utils/supabaseRequest';
import { motion } from 'framer-motion';

interface WebTool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  installLink: string;
  isInstalled: boolean;
  chromeExtensionId?: string;
  firefoxAddonId?: string;
  safariAppId?: string;
  version: string;
  category: 'focus' | 'productivity' | 'distraction-blocking';
  features: string[];
  popularity: number;
  installCount: number;
  releaseDate: string;
  hasOptions: boolean;
}

interface UserExtension {
  id: string;
  user_id: string;
  extension_id: string;
  installed_at: string;
  last_used: string;
  is_enabled: boolean;
  settings: Record<string, any> | null;
}

export function WebTools() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [webTools, setWebTools] = useState<WebTool[]>([]);
  const [userExtensions, setUserExtensions] = useState<UserExtension[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'popularity' | 'newest' | 'name'>('popularity');
  const [installInProgress, setInstallInProgress] = useState<string | null>(null);
  const [currentBrowser, setCurrentBrowser] = useState<'chrome' | 'firefox' | 'safari' | 'edge' | 'brave' | 'unknown'>('unknown');

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('chrome') > -1 && userAgent.indexOf('edge') === -1 && userAgent.indexOf('brave') === -1) {
      setCurrentBrowser('chrome');
    } else if (userAgent.indexOf('firefox') > -1) {
      setCurrentBrowser('firefox');
    } else if (userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1) {
      setCurrentBrowser('safari');
    } else if (userAgent.indexOf('edge') > -1) {
      setCurrentBrowser('edge');
    } else if (userAgent.indexOf('brave') > -1) {
      setCurrentBrowser('brave');
    }

    fetchWebTools();

    if (session?.user) {
      fetchUserExtensions();
    }
  }, [session?.user]);

  const fetchWebTools = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error: toolsError } = await supabaseRequest<WebTool[]>('/rest/v1/web_tools', { method: 'GET' });
      if (toolsError) throw toolsError;
      if (data) {
        const toolsWithIcons = data.map((tool: WebTool) => ({
          ...tool,
          icon: getIconForTool(tool.title),
        }));
        setWebTools(toolsWithIcons);
      }
    } catch (error) {
      console.error('Error fetching web tools:', error);
      toast({
        title: 'Error',
        description: 'Failed to load web tools. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserExtensions = async (): Promise<void> => {
    try {
      const { data, error: userExtError } = await supabaseRequest<UserExtension[]>(`/rest/v1/user_extensions?user_id=eq.${session?.user.id}`, { method: 'GET' });
      if (userExtError) throw userExtError;
      if (data) {
        setUserExtensions(data);
      }
    } catch (error) {
      console.error('Error fetching user extensions:', error);
    }
  };

  const getIconForTool = (title: string): React.ReactNode => {
    if (title.includes('Focus Browser')) return <Shield className="h-6 w-6" />;
    if (title.includes('Tab Limiter')) return <Layers className="h-6 w-6" />;
    if (title.includes('Focus Mode')) return <FileText className="h-6 w-6" />;
    if (title.includes('Notification')) return <Bell className="h-6 w-6" />;
    if (title.includes('Timer')) return <Clock className="h-6 w-6" />;
    if (title.includes('Reading')) return <BookOpen className="h-6 w-6" />;
    if (title.includes('Bookmark')) return <Bookmark className="h-6 w-6" />;
    if (title.includes('Dashboard')) return <Sliders className="h-6 w-6" />;
    if (title.includes('YouTube')) return <Youtube className="h-6 w-6" />;

    return <Shield className="h-6 w-6" />;
  };

  const handleInstall = async (tool: WebTool): Promise<void> => {
    setInstallInProgress(tool.id);
    setTimeout(async () => {
      if (currentBrowser === 'chrome' && tool.chromeExtensionId) {
        try {
          window.open(`https://chrome.google.com/webstore/detail/${tool.chromeExtensionId}`, '_blank');
        } catch (error) {
          console.error('Error installing extension:', error);
        }
      } else {
        window.open(tool.installLink, '_blank');
      }

      if (session?.user) {
        try {
          const installData = {
            user_id: session.user.id,
            extension_id: tool.id,
            installed_at: new Date().toISOString(),
            last_used: new Date().toISOString(),
            is_enabled: true,
            settings: null
          };

          const { error: installError } = await supabaseRequest('/rest/v1/user_extensions', {
            method: 'POST',
            headers: { 'Prefer': 'return=minimal' },
            body: JSON.stringify(installData)
          });
          if (installError) throw installError;

          setUserExtensions(prev => [...prev, installData as UserExtension]);

          toast({
            title: 'Extension Installed',
            description: `${tool.title} has been successfully installed.`,
          });
        } catch (error) {
          console.error('Error recording extension installation:', error);
        }
      }
      setInstallInProgress(null);
    }, 1500);
  };

  const handleToggleExtension = async (extensionId: string, currentState: boolean): Promise<any> => {
    if (!session?.user) return;

    try {
      const { error: toggleError } = await supabaseRequest(`/rest/v1/user_extensions?user_id=eq.${session.user.id}&extension_id=eq.${extensionId}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({ is_enabled: !currentState })
      });
      if (toggleError) throw toggleError;

      setUserExtensions(prev =>
        prev.map(ext =>
          ext.extension_id === extensionId ? { ...ext, is_enabled: !currentState } : ext
        )
      );

      toast({
        title: currentState ? 'Extension Disabled' : 'Extension Enabled',
        description: `The extension has been ${currentState ? 'disabled' : 'enabled'}.`,
      });
    } catch (error) {
      console.error('Error toggling extension state:', error);
      toast({
        title: 'Error',
        description: 'Failed to update extension settings.',
        variant: 'destructive',
      });
    }
  };

  const openExtensionSettings = (tool: WebTool) => {
    if (currentBrowser === 'chrome' && tool.chromeExtensionId) {
      window.open(`chrome://extensions/?id=${tool.chromeExtensionId}`, '_blank');
    } else {
      navigate(`/easier-focus/web-tools/${tool.id}/settings`);
    }
  };

  const isToolInstalled = (toolId: string) => {
    return userExtensions.some(ext => ext.extension_id === toolId && ext.is_enabled);
  };

  const filteredTools = webTools
    .filter(tool =>
      (selectedCategory === 'all' || tool.category === selectedCategory) &&
      (searchQuery === '' ||
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortOrder === 'popularity') return b.popularity - a.popularity;
      if (sortOrder === 'newest') return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-gray-800">Web Focus Tools</h1>
          <p className="text-lg text-gray-600 mt-2">Enhance your focus while browsing with our suite of browser extensions and web tools.</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Supported Browsers</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { name: 'Chrome', icon: '🌐', supported: true },
              { name: 'Firefox', icon: '🦊', supported: true },
              { name: 'Safari', icon: '🧭', supported: currentBrowser === 'safari' },
              { name: 'Edge', icon: '📐', supported: true },
              { name: 'Brave', icon: '🦁', supported: true },
            ].map((browser) => (
              <div key={browser.name} className="text-center relative">
                <div className={`text-4xl mb-2 ${!browser.supported ? 'opacity-50' : ''}`}>{browser.icon}</div>
                <p className={`font-medium ${!browser.supported ? 'text-gray-400' : 'text-gray-700'}`}>{browser.name}</p>
                {browser.name.toLowerCase() === currentBrowser && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white text-xs">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                {!browser.supported && (
                  <p className="text-xs text-gray-400">Coming soon</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Filtering Controls */}
        <input
          type="search"
          placeholder="Search tools..."
          className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <TabsTrigger value="all" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">All Tools</TabsTrigger>
              <TabsTrigger value="focus" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Focus</TabsTrigger>
              <TabsTrigger value="productivity" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Productivity</TabsTrigger>
              <TabsTrigger value="distraction-blocking" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Blocking</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
              >
                <option value="popularity">Popularity</option>
                <option value="newest">Newest</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 sm:grid-cols-1 ">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="h-full opacity-60 animate-pulse">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  <div className="mt-6">
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredTools.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500">No tools match your search criteria.</p>
            </div>
          ) : (
            filteredTools.map((tool) => {
              const installed = isToolInstalled(tool.id);

              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`h-full transition-all duration-300 rounded-xl shadow-md hover:shadow-xl transform hover:scale-105 border border-gray-200 bg-white`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-full text-blue-500" style={{ backgroundColor: 'rgba(147, 197, 253, 0.3)' }}>
                            {tool.icon}
                          </div>
                          <CardTitle className="text-lg font-semibold">{tool.title}</CardTitle>
                        </div>
                        {installed && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                      <CardDescription className="mt-2 text-gray-600">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500 mr-2">Popularity:</span>
                          <Progress value={tool.popularity} className="h-2 flex-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-sm">
                          <div>
                            <span className="text-gray-500">Version:</span> {tool.version}
                          </div>
                          <div>
                            <span className="text-gray-500">Users:</span> {tool.installCount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-3">
                      {installed ? (
                        <div className="flex flex-col w-full space-y-2">
                          <Button
                            variant="outline"
                            onClick={() => handleToggleExtension(tool.id, true)}
                            className="w-full justify-between"
                          >
                            Disable Extension
                            <X className="h-4 w-4 ml-2" />
                          </Button>
                          {tool.hasOptions && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openExtensionSettings(tool)}
                              className="w-full justify-between"
                            >
                              Extension Settings
                              <Settings className="h-4 w-4 ml-2" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Button
                          className="w-full justify-between"
                          onClick={() => handleInstall(tool)}
                          disabled={installInProgress === tool.id}
                        >
                          {installInProgress === tool.id ? (
                            <>
                              Installing...
                              <span className="animate-spin ml-2">⏳</span>
                            </>
                          ) : (
                            <>
                              Install Extension
                              <Download className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Sync Across Devices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <img src="/public/images/sync-devices.png" alt="Sync Across Devices" className="mb-4 rounded-lg shadow-md" />
              <p className="text-lg mb-4">
                Keep your focus settings, blocked sites, and productivity data in sync across all your devices.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="mr-2 text-green-600"><Check className="h-4 w-4" /></span>
                  Seamless transition between devices
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-600"><Check className="h-4 w-4" /></span>
                  Unified focus history and analytics
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-600"><Check className="h-4 w-4" /></span>
                  Shared block lists and settings
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-600"><Check className="h-4 w-4" /></span>
                  Cloud backup of all your focus data
                </li>
              </ul>
              <Button onClick={() => navigate('/easier-focus/settings/sync')}>
                Configure Sync Settings
              </Button>
            </div>
            <div className="bg-blue-100 rounded-xl text-center p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="text-6xl mb-4 animate-spin">🔄</div>
              <p className="text-lg font-medium mb-2 text-blue-800">All Your Devices, One Focus System</p>
              <p className="text-gray-600">
                Maintain your productivity environment everywhere.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
