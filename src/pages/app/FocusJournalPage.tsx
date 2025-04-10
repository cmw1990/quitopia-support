import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  Clock, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  ChevronDown,
  ArrowUpRight,
  Star,
  BookmarkPlus,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { BarChart4 } from 'lucide-react';

// Define the types
interface FocusEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood: number;
  focus_score: number;
  session_duration: number;
  energy_level: number;
  insights: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
}

interface FocusStats {
  total_entries: number;
  avg_focus_score: number;
  avg_session_duration: number;
  total_focus_time: number;
  common_tags: string[];
  improvement_areas: string[];
  most_productive_time: string;
}

const defaultEntry: Omit<FocusEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  title: '',
  content: '',
  mood: 7,
  focus_score: 8,
  session_duration: 25,
  energy_level: 7,
  insights: [],
  tags: [],
  is_favorite: false
};

const FocusJournal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('entries');
  const [entries, setEntries] = useState<FocusEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<FocusEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Omit<FocusEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>>(defaultEntry);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [stats, setStats] = useState<FocusStats>({
    total_entries: 0,
    avg_focus_score: 0,
    avg_session_duration: 0,
    total_focus_time: 0,
    common_tags: [],
    improvement_areas: [],
    most_productive_time: ''
  });
  const [allTags, setAllTags] = useState<string[]>([]);
  const [newInsight, setNewInsight] = useState('');
  const [newTag, setNewTag] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest_focus'>('newest');

  // Load entries
  useEffect(() => {
    if (!user) return;
    
    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('focus_journal')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          setEntries(data);
          setFilteredEntries(data);
          
          // Extract all unique tags
          const tags = data.flatMap(entry => entry.tags);
          setAllTags([...new Set(tags)]);
          
          // Calculate stats
          if (data.length > 0) {
            const totalFocusScore = data.reduce((sum, entry) => sum + entry.focus_score, 0);
            const totalDuration = data.reduce((sum, entry) => sum + entry.session_duration, 0);
            
            // Count tag occurrences
            const tagCount: Record<string, number> = {};
            data.forEach(entry => {
              entry.tags.forEach((tag: string) => {
                tagCount[tag] = (tagCount[tag] || 0) + 1;
              });
            });
            
            // Sort tags by count
            const sortedTags = Object.entries(tagCount)
              .sort((a, b) => b[1] - a[1])
              .map(([tag]) => tag)
              .slice(0, 5);
              
            setStats({
              total_entries: data.length,
              avg_focus_score: totalFocusScore / data.length,
              avg_session_duration: totalDuration / data.length,
              total_focus_time: totalDuration,
              common_tags: sortedTags,
              improvement_areas: ['Distraction management', 'Session length', 'Consistency'],
              most_productive_time: 'Morning'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching entries:', error);
        toast({
          title: 'Failed to load journal entries',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEntries();
  }, [user, toast]);
  
  // Filter entries based on search and tag filter
  useEffect(() => {
    if (!entries.length) return;
    
    let filtered = [...entries];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(query) || 
        entry.content.toLowerCase().includes(query) ||
        entry.insights.some(insight => insight.toLowerCase().includes(query)) ||
        entry.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply tag filter
    if (filterTag !== 'all') {
      filtered = filtered.filter(entry => 
        entry.tags.includes(filterTag)
      );
    }
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortOrder === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        return b.focus_score - a.focus_score;
      }
    });
    
    setFilteredEntries(filtered);
  }, [entries, searchQuery, filterTag, sortOrder]);
  
  // Save entry
  const saveEntry = async () => {
    if (!user) return;
    
    if (!currentEntry.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your entry.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      if (isEditing && editId) {
        // Update existing entry
        const { error } = await supabase
          .from('focus_journal')
          .update({
            ...currentEntry,
            updated_at: new Date().toISOString()
          })
          .eq('id', editId);
          
        if (error) throw error;
        
        // Update local state
        setEntries(prev => prev.map(entry => 
          entry.id === editId ? 
            { 
              ...entry, 
              ...currentEntry,
              updated_at: new Date().toISOString()
            } : 
            entry
        ));
        
        toast({
          title: 'Entry updated',
          description: 'Your journal entry has been updated.',
        });
      } else {
        // Create new entry
        const { data, error } = await supabase
          .from('focus_journal')
          .insert({
            user_id: user.id,
            ...currentEntry,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
          
        if (error) throw error;
        
        // Update local state
        if (data) {
          setEntries(prev => [data[0], ...prev]);
        }
        
        toast({
          title: 'Entry saved',
          description: 'Your journal entry has been saved.',
        });
      }
      
      // Reset form and close dialog
      setCurrentEntry(defaultEntry);
      setShowEntryDialog(false);
      setIsEditing(false);
      setEditId(null);
      
      // Update tag list
      const newTags = currentEntry.tags.filter(tag => !allTags.includes(tag));
      if (newTags.length) {
        setAllTags(prev => [...prev, ...newTags]);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: 'Failed to save entry',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };
  
  // Delete entry
  const deleteEntry = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('focus_journal')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setEntries(prev => prev.filter(entry => entry.id !== id));
      
      toast({
        title: 'Entry deleted',
        description: 'Your journal entry has been deleted.',
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: 'Failed to delete entry',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };
  
  // Toggle favorite status
  const toggleFavorite = async (id: string, currentStatus: boolean) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('focus_journal')
        .update({ is_favorite: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, is_favorite: !currentStatus } : entry
      ));
    } catch (error) {
      console.error('Error updating favorite status:', error);
      toast({
        title: 'Failed to update favorite status',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };
  
  // Add insight
  const addInsight = () => {
    if (!newInsight.trim()) return;
    
    setCurrentEntry(prev => ({
      ...prev,
      insights: [...prev.insights, newInsight.trim()]
    }));
    
    setNewInsight('');
  };
  
  // Remove insight
  const removeInsight = (index: number) => {
    setCurrentEntry(prev => ({
      ...prev,
      insights: prev.insights.filter((_, i) => i !== index)
    }));
  };
  
  // Add tag
  const addTag = () => {
    if (!newTag.trim()) return;
    
    setCurrentEntry(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()]
    }));
    
    setNewTag('');
  };
  
  // Remove tag
  const removeTag = (index: number) => {
    setCurrentEntry(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };
  
  // Edit entry
  const editEntry = (entry: FocusEntry) => {
    const { id, user_id, created_at, updated_at, ...rest } = entry;
    setCurrentEntry(rest);
    setIsEditing(true);
    setEditId(id);
    setShowEntryDialog(true);
  };
  
  // Format duration in minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }
    
    return `${hours} hr ${remainingMinutes} min`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  // Get color for focus score
  const getFocusScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-blue-500';
    if (score >= 4) return 'text-amber-500';
    return 'text-red-500';
  };
  
  // Reset form
  const resetForm = () => {
    setCurrentEntry(defaultEntry);
    setIsEditing(false);
    setEditId(null);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-7 w-7 text-primary" />
              Focus Journal
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your focus journey with insights and reflections
            </p>
          </div>
          
          <Dialog open={showEntryDialog} onOpenChange={setShowEntryDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="gap-2">
                <Plus className="h-4 w-4" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>{isEditing ? 'Edit Entry' : 'New Journal Entry'}</DialogTitle>
                <DialogDescription>
                  Record your focus session insights and reflections
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a title for your entry"
                    value={currentEntry.title}
                    onChange={(e) => setCurrentEntry((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="focus-score">Focus Score (1-10)</Label>
                    <Select 
                      value={currentEntry.focus_score.toString()} 
                      onValueChange={(value) => setCurrentEntry((prev) => ({ ...prev, focus_score: parseInt(value) }))}
                    >
                      <SelectTrigger id="focus-score">
                        <SelectValue placeholder="Select score" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="energy-level">Energy Level (1-10)</Label>
                    <Select 
                      value={currentEntry.energy_level.toString()} 
                      onValueChange={(value) => setCurrentEntry((prev) => ({ ...prev, energy_level: parseInt(value) }))}
                    >
                      <SelectTrigger id="energy-level">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mood">Mood (1-10)</Label>
                    <Select 
                      value={currentEntry.mood.toString()} 
                      onValueChange={(value) => setCurrentEntry((prev) => ({ ...prev, mood: parseInt(value) }))}
                    >
                      <SelectTrigger id="mood">
                        <SelectValue placeholder="Select mood" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duration">Session Duration (minutes)</Label>
                    <Select 
                      value={currentEntry.session_duration.toString()} 
                      onValueChange={(value) => setCurrentEntry((prev) => ({ ...prev, session_duration: parseInt(value) }))}
                    >
                      <SelectTrigger id="duration">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {[15, 25, 30, 45, 60, 90, 120].map(num => (
                          <SelectItem key={num} value={num.toString()}>{formatDuration(num)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Reflection</Label>
                  <Textarea
                    id="content"
                    placeholder="What went well? What challenges did you face? How did you feel during your focus session?"
                    value={currentEntry.content}
                    onChange={(e) => setCurrentEntry((prev) => ({ ...prev, content: e.target.value }))}
                    rows={5}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Insights</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a key insight or learning"
                      value={newInsight}
                      onChange={(e) => setNewInsight(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addInsight();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addInsight}>Add</Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentEntry.insights.map((insight, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1 px-3">
                        {insight}
                        <button 
                          type="button" 
                          onClick={() => removeInsight(index)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>Add</Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentEntry.tags.map((tag, index) => (
                      <Badge key={index} className="flex items-center gap-1 py-1 px-3">
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => removeTag(index)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEntryDialog(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={saveEntry}>
                  {isEditing ? 'Update Entry' : 'Save Entry'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-background border">
          <TabsTrigger value="entries" className="gap-1">
            <BookOpen className="h-4 w-4 mr-1" />
            Entries
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-1">
            <Zap className="h-4 w-4 mr-1" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-1">
            <BarChart4 className="h-4 w-4 mr-1" />
            Statistics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="entries" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search entries..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest' | 'highest_focus') => setSortOrder(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest_focus">Highest Focus Score</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredEntries.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No entries found</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  {entries.length === 0 
                    ? "You haven't created any journal entries yet. Record your focus sessions to track your progress."
                    : "No entries match your current filters. Try adjusting your search or filter criteria."}
                </p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setFilterTag('all');
                  resetForm();
                  setShowEntryDialog(true);
                }}>
                  Create Your First Entry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map(entry => (
                <Card key={entry.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="border-r border-border p-4 md:p-6 flex flex-col items-center justify-center md:w-36 bg-muted/30">
                      <div className={`text-2xl font-bold ${getFocusScoreColor(entry.focus_score)}`}>
                        {entry.focus_score}/10
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">Focus Score</div>
                      <div className="text-sm font-medium">{formatDuration(entry.session_duration)}</div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                    </div>
                    
                    <div className="flex-1 p-4 md:p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-medium flex items-center gap-2">
                            {entry.title}
                            {entry.is_favorite && (
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            )}
                          </h3>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(entry.created_at)}
                            <span className="mx-2">•</span>
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFavorite(entry.id, entry.is_favorite)}
                            title={entry.is_favorite ? "Remove from favorites" : "Add to favorites"}
                          >
                            <Star className={`h-4 w-4 ${entry.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => editEntry(entry)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {entry.content}
                      </p>
                      
                      {entry.insights.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs font-medium mb-1">Insights:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {entry.insights.slice(0, 3).map((insight, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {insight}
                              </Badge>
                            ))}
                            {entry.insights.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{entry.insights.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {entry.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>
                Patterns and learnings from your focus sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Create journal entries to generate insights
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recurring Patterns</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-muted/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Most Productive Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg font-medium">{stats.most_productive_time}</div>
                          <p className="text-sm text-muted-foreground">
                            Your focus scores tend to be highest during morning hours
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Optimal Session Length</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg font-medium">
                            {formatDuration(Math.round(stats.avg_session_duration))}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Your most effective sessions tend to be around this duration
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Improvement Opportunities</h3>
                    <ul className="space-y-3">
                      {stats.improvement_areas.map((area, index) => (
                        <li key={index} className="flex gap-3">
                          <div className="mt-0.5 bg-primary/10 text-primary rounded-full p-1">
                            <ArrowUpRight className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{area}</div>
                            <p className="text-sm text-muted-foreground">
                              {index === 0 && "Try using website blockers and notification silencing"}
                              {index === 1 && "Gradually increase your session duration for deeper work"}
                              {index === 2 && "Aim for regular daily focus blocks, even if short"}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Common Themes</h3>
                    <div className="flex flex-wrap gap-2">
                      {stats.common_tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_entries}</div>
                <p className="text-xs text-muted-foreground">
                  Journal entries recorded
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Focus Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getFocusScoreColor(stats.avg_focus_score)}`}>
                  {stats.avg_focus_score.toFixed(1)}/10
                </div>
                <p className="text-xs text-muted-foreground">
                  Overall focus quality
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Focus Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(stats.total_focus_time)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Time spent in focused work
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Focus Statistics</CardTitle>
              <CardDescription>
                Your focus metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <BarChart4 className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="mt-4">
                  Detailed focus analytics visualization coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FocusJournal; 