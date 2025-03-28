import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Textarea,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Label
} from './ui';
import { toast } from 'sonner';
import { 
  Smile, 
  Heart, 
  Cigarette, 
  Calendar, 
  PenSquare, 
  Clock, 
  ThumbsUp,
  Search,
  Leaf,
  ThumbsDown,
  MoreHorizontal,
  X,
  Check,
  ChevronDown,
  Plus,
  RefreshCw,
  BookText,
  SortAsc,
  SortDesc,
  Filter,
  Loader2,
  ArrowUpDown
} from 'lucide-react';
import { supabaseRestCall } from "../api/apiCompatibility";
import { format, parseISO, isValid, isBefore, isAfter } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import offlineStorageService, { ProgressEntry } from '../services/BackwardCompatibility';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { useOffline } from '../contexts/OfflineContext';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { OfflineStatusIndicator } from './OfflineStatusIndicator';
import { Calendar as CalendarComponent } from './ui/calendar';

interface JournalProps {
  session: Session | null;
}

type JournalTab = 'mood' | 'gratitude' | 'journey' | 'craving';

interface JournalEntry {
  id?: string;
  localId?: string;
  user_id: string;
  content: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  type: JournalTab;
  tags?: string[];
  created_at: string;
  updated_at?: string;
  synced?: boolean;
}

const MOODS = [
  { value: 1, label: 'Very Bad', icon: <ThumbsDown className="h-4 w-4 text-red-500" /> },
  { value: 2, label: 'Bad', icon: <ThumbsDown className="h-4 w-4 text-orange-500" /> },
  { value: 3, label: 'Neutral', icon: <MoreHorizontal className="h-4 w-4 text-yellow-500" /> },
  { value: 4, label: 'Good', icon: <ThumbsUp className="h-4 w-4 text-green-500" /> },
  { value: 5, label: 'Very Good', icon: <ThumbsUp className="h-4 w-4 text-emerald-500" /> }
];

// Suggested tags for each journal type
const SUGGESTED_TAGS = {
  mood: ['anxious', 'calm', 'stressed', 'happy', 'sad', 'angry', 'tired', 'energetic'],
  gratitude: ['family', 'friends', 'health', 'work', 'nature', 'progress', 'learning', 'small-wins'],
  journey: ['milestone', 'challenge', 'victory', 'relapse', 'trigger', 'craving', 'reflection', 'motivation'],
  craving: ['strong', 'mild', 'resisted', 'gave-in', 'stress-related', 'after-meal', 'social', 'emotional']
};

export const Journal: React.FC<JournalProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState<JournalTab>('journey');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState<Omit<JournalEntry, 'user_id' | 'created_at'>>({
    content: '',
    type: 'journey',
    tags: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [customTag, setCustomTag] = useState('');
  const [filter, setFilter] = useState('');
  const [dateRange, setDateRange] = useState<{start: string | null, end: string | null}>({
    start: null,
    end: null
  });
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { isOnline: networkStatus } = useOfflineStatus();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isOnline } = useOffline();

  // Fetch journal entries from API or offline storage
  const fetchEntries = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    setEntries([]);
    
    try {
      if (isOnline) {
        // Use API
        const data = await supabaseRestCall<JournalEntry[]>(
          `/rest/v1/mission4_journal_entries?user_id=eq.${session.user.id}&order=created_at.${sortDirection}`,
          { method: 'GET' },
          session
        );
        
        if (Array.isArray(data)) {
          setEntries(data);
        }
      } else {
        // Use offline storage
        try {
          // Try to get from offline storage
          const offlineEntries: ProgressEntry[] = await offlineStorageService.getProgressEntries(session.user.id);
          
          // Map to journal entries format
          const mappedEntries: JournalEntry[] = offlineEntries
            .filter(entry => entry.notes) // Only include entries with notes
            .map(entry => ({
              id: entry.id,
              localId: entry.localId,
              user_id: entry.user_id,
              content: entry.notes || '',
              type: 'journey',
              tags: entry.symptoms || [],
              created_at: entry.date,
              synced: entry.synced
            }));
          
          setEntries(mappedEntries);
        } catch (error) {
          console.error('Error fetching from offline storage:', error);
          setEntries([]);
        }
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      toast.error('Failed to load journal entries');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize entries and set up active tab
  useEffect(() => {
    fetchEntries();
  }, [session, sortDirection]);

  // Update entry type when tab changes
  useEffect(() => {
    setNewEntry(prev => ({
      ...prev,
      type: activeTab,
      tags: []
    }));
  }, [activeTab]);

  // Save a new journal entry
  const saveEntry = async () => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to create journal entries');
      return;
    }

    if (!newEntry.content.trim()) {
      toast.error('Please write something before saving');
      return;
    }

    setIsSaving(true);
    try {
      const entryData: JournalEntry = {
        user_id: session.user.id,
        content: newEntry.content,
        type: activeTab,
        tags: newEntry.tags || [],
        mood: newEntry.mood,
        created_at: new Date().toISOString()
      };

      if (isOnline) {
        // Save to API
        await supabaseRestCall(
          `/rest/v1/mission4_journal_entries`,
          {
            method: 'POST',
            body: JSON.stringify(entryData)
          },
          session
        );
      } else {
        // Save to offline storage
        const offlineEntry = {
          user_id: session.user.id,
          date: new Date().toISOString().split('T')[0],
          smoke_free: true,
          notes: entryData.content,
          symptoms: entryData.tags,
          mood: entryData.mood ? String(entryData.mood) : undefined,
          created_at: new Date().toISOString(),
          synced: false
        };
        
        await offlineStorageService.saveProgress(offlineEntry);
      }

      // Update UI
      setEntries(prev => [
        {
          ...entryData,
          synced: isOnline
        },
        ...prev
      ]);

      // Reset form
      setNewEntry({
        content: '',
        type: activeTab,
        tags: []
      });

      toast.success('Journal entry saved successfully');
    } catch (error) {
      console.error('Error saving journal entry:', error);
      toast.error('Failed to save journal entry');
    } finally {
      setIsSaving(false);
    }
  };

  // Add a tag to the current entry
  const addTag = (tag: string) => {
    if (!tag.trim()) return;
    
    if (!newEntry.tags) {
      setNewEntry({ ...newEntry, tags: [tag] });
    } else if (!newEntry.tags.includes(tag)) {
      setNewEntry({ ...newEntry, tags: [...newEntry.tags, tag] });
    }
    
    setCustomTag('');
  };

  // Remove a tag from the current entry
  const removeTag = (tagToRemove: string) => {
    if (!newEntry.tags) return;
    
    setNewEntry({
      ...newEntry,
      tags: newEntry.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Filter entries based on search, date range, and active tab
  const filteredEntries = entries.filter(entry => {
    // Filter by tab type
    if (entry.type !== activeTab) return false;
    
    // Filter by search term
    if (filter && !entry.content.toLowerCase().includes(filter.toLowerCase()) && 
        !entry.tags?.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))) {
      return false;
    }
    
    // Filter by date range
    if (dateRange.start && isValid(parseISO(dateRange.start))) {
      if (isBefore(parseISO(entry.created_at), parseISO(dateRange.start))) {
        return false;
      }
    }
    
    if (dateRange.end && isValid(parseISO(dateRange.end))) {
      if (isAfter(parseISO(entry.created_at), parseISO(dateRange.end))) {
        return false;
      }
    }
    
    return true;
  });

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEntries();
    setIsRefreshing(false);
    
    toast.success('Journal entries refreshed');
  };

  const getMoodLabel = (moodValue?: number) => {
    if (!moodValue) return 'Not specified';
    return MOODS.find(m => m.value === moodValue)?.label || 'Unknown';
  };

  const getMoodIcon = (moodValue?: number) => {
    if (!moodValue) return null;
    return MOODS.find(m => m.value === moodValue)?.icon || null;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Journal</h1>
          <p className="text-muted-foreground">
            Record your thoughts, feelings, and experiences on your journey to being smoke-free
          </p>
        </div>
        
        <div className="flex items-center mt-4 md:mt-0">
          <OfflineStatusIndicator showDetails={true} />
          
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={handleRefresh} 
            disabled={isRefreshing || isLoading}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* New entry form - Full width on mobile, sidebar on desktop */}
        <div className="md:col-span-1 order-2 md:order-1">
          <Card>
            <CardHeader>
              <CardTitle>New Entry</CardTitle>
              <CardDescription>
                Create a new journal entry to track your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab as any}>
                <TabsList className="grid grid-cols-4 mb-4 w-full">
                  <TabsTrigger value="mood" className="text-xs md:text-sm">Mood</TabsTrigger>
                  <TabsTrigger value="gratitude" className="text-xs md:text-sm">Gratitude</TabsTrigger>
                  <TabsTrigger value="journey" className="text-xs md:text-sm">Journey</TabsTrigger>
                  <TabsTrigger value="craving" className="text-xs md:text-sm">Craving</TabsTrigger>
                </TabsList>
                
                <TabsContent value="mood">
                  <p className="text-sm text-muted-foreground mb-4">
                    How are you feeling today on your journey to being smoke-free?
                  </p>
                </TabsContent>
                
                <TabsContent value="gratitude">
                  <p className="text-sm text-muted-foreground mb-4">
                    What are you grateful for today? Taking time to express gratitude helps positive thinking.
                  </p>
                  
                  <div className="mb-4 p-3 bg-muted rounded-md">
                    <h4 className="font-medium mb-2">Prompts:</h4>
                    <div className="space-y-2">
                      {SUGGESTED_TAGS.gratitude.map((prompt, index) => (
                        <p 
                          key={index} 
                          className="text-sm p-2 rounded-md hover:bg-background cursor-pointer transition-colors"
                          onClick={() => setNewEntry({ ...newEntry, content: prompt })}
                        >
                          {prompt}
                        </p>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="journey">
                  <p className="text-sm text-muted-foreground mb-4">
                    Share your thoughts, challenges, and victories on your smoke-free journey.
                  </p>
                </TabsContent>
                
                <TabsContent value="craving">
                  <p className="text-sm text-muted-foreground mb-4">
                    Document your cravings, what triggered them, and how you handled the situation.
                  </p>
                </TabsContent>
                
                <div className="space-y-4">
                  {activeTab === 'mood' && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium">How are you feeling?</label>
                      <div className="flex justify-between items-center">
                        {MOODS.map((mood) => (
                          <button
                            key={mood.value}
                            type="button"
                            onClick={() => setNewEntry({ ...newEntry, mood: mood.value as 1|2|3|4|5 })}
                            className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
                              newEntry.mood === mood.value 
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-muted'
                            }`}
                            title={mood.label}
                          >
                            <span className="text-2xl">{mood.icon}</span>
                            <span className="text-xs mt-1">{mood.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <Textarea
                      placeholder="Write your entry here..."
                      className="min-h-[150px]"
                      value={newEntry.content}
                      onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                    />
                  </div>
                  
                  {(activeTab === 'journey' || activeTab === 'craving') && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Tags</label>
                        <Badge variant="outline" className="font-normal">
                          {newEntry.tags?.length || 0} selected
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {SUGGESTED_TAGS[activeTab].map((tag) => (
                          <Badge
                            key={tag}
                            variant={newEntry.tags?.includes(tag) ? "default" : "outline"}
                            className="cursor-pointer transition-colors"
                            onClick={() => newEntry.tags?.includes(tag) ? removeTag(tag) : addTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add custom tag..."
                          value={customTag}
                          onChange={(e) => setCustomTag(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            addTag(customTag);
                            setCustomTag('');
                          }}
                          disabled={!customTag.trim()}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={saveEntry} 
                disabled={isSaving || !newEntry.content.trim()}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Entry'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Entries list - Full width on mobile, main content on desktop */}
        <div className="md:col-span-2 order-1 md:order-2">
          <div className="flex flex-col space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                  <CardTitle>My Journal Entries</CardTitle>
                  
                  <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
                        className="px-2"
                      >
                        <ArrowUpDown className="h-4 w-4 mr-1" />
                        {sortDirection === 'desc' ? 'Newest first' : 'Oldest first'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="Search entries..."
                      className="pl-8"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    />
                  </div>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Filter className="mr-2 h-4 w-4" />
                        <span>{dateRange.start || dateRange.end ? 'Date filtered' : 'All dates'}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-4">
                        <div className="space-y-2 mb-2">
                          <h4 className="font-medium text-sm">Filter by date</h4>
                          <div className="grid gap-2">
                            <div className="grid gap-1">
                              <label className="text-xs">Start date</label>
                              <Input
                                type="date"
                                value={dateRange.start || ''}
                                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                className="h-8"
                              />
                            </div>
                            <div className="grid gap-1">
                              <label className="text-xs">End date</label>
                              <Input
                                type="date"
                                value={dateRange.end || ''}
                                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                className="h-8"
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDateRange({ start: '', end: '' })}
                          className="w-full mt-2"
                        >
                          Clear Filter
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardHeader>
              
              <CardContent>
                <JournalEntriesList 
                  entries={filteredEntries}
                  isLoading={isLoading}
                  getMoodIcon={getMoodIcon}
                  getMoodLabel={getMoodLabel}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Journal entries list component
interface JournalEntriesListProps {
  entries: JournalEntry[];
  isLoading: boolean;
  getMoodIcon: (mood?: number) => React.ReactNode;
  getMoodLabel: (mood?: number) => string;
}

const JournalEntriesList: React.FC<JournalEntriesListProps> = ({ 
  entries, 
  isLoading,
  getMoodIcon,
  getMoodLabel
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-4 border-b-4 border-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading entries...</p>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-muted/30 rounded-lg p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
        <BookText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No entries found</h3>
        <p className="text-muted-foreground">
          Start writing to create your first journal entry
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {entries.map((entry) => (
          <motion.div
            key={entry.id || entry.localId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className={`overflow-hidden ${!entry.synced ? 'border-amber-300 dark:border-amber-700' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(parseISO(entry.created_at), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {format(parseISO(entry.created_at), 'h:mm a')}
                    </div>
                    {!entry.synced && (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-700">
                        Offline
                      </Badge>
                    )}
                  </div>
                  {entry.mood && (
                    <div className="flex items-center gap-1 text-sm">
                      {getMoodIcon(entry.mood)}
                      <span>{getMoodLabel(entry.mood)}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{entry.content}</p>
                
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Journal; 