import React, { useState, useEffect } from 'react';
// Import only TYPES from Supabase
import type { Session } from '@supabase/supabase-js';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter,
  Button,
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  Badge,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui';
// Import from missionFreshApiClient instead of directly using supabaseRestCall
import { 
  supabaseRestCall, 
  getGuides, 
  getBookmarkedGuides, 
  getRecentlyViewedGuides,
  addBookmarkGuide,
  removeBookmarkGuide,
  recordGuideView
} from '../api/missionFreshApiClient';
import toast from 'react-hot-toast';
import { 
  Book, 
  Lock, 
  Zap, 
  Snowflake, 
  Leaf, 
  Play, 
  AlarmClock, 
  HelpCircle, 
  Search,
  Heart,
  Cigarette,
  ThumbsUp,
  Coffee,
  Check,
  RefreshCw,
  Bookmark
} from 'lucide-react';

interface GuidesHubProps {
  session: Session | null;
}

interface Guide {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'pdf';
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  published_at: string;
  thumbnail?: string;
  url: string;
  author: string;
  featured: boolean;
}

export const GuidesHub: React.FC<GuidesHubProps> = ({ session }) => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<Guide[]>([]);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [featuredGuides, setFeaturedGuides] = useState<Guide[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Guide[]>([]);
  const [bookmarkedGuides, setBookmarkedGuides] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGuides = async () => {
    setIsLoading(true);
    
    try {
      // Use the dedicated function from missionFreshApiClient
      const data = await getGuides(session);
      
      if (Array.isArray(data)) {
        setGuides(data);
        setFilteredGuides(data);
        
        // Set featured guides
        const featured = data.filter(guide => guide.featured);
        setFeaturedGuides(featured);
      } else {
        setError('Invalid response from API');
      }
      
      // Load user-specific data if logged in
      if (session) {
        try {
          // Load bookmarked guides using the dedicated function
          const bookmarksData = await getBookmarkedGuides(session);
          if (bookmarksData && Array.isArray(bookmarksData)) {
            setBookmarkedGuides(bookmarksData.map(bookmark => bookmark.guide_id));
          }
          
          // Load recently viewed guides using the dedicated function
          const viewsData = await getRecentlyViewedGuides(session);
          
          if (viewsData && Array.isArray(viewsData) && data && Array.isArray(data)) {
            const viewedGuideIds = viewsData.map(view => view.guide_id);
            const recentlyViewedGuides = data.filter(guide => viewedGuideIds.includes(guide.id));
            setRecentlyViewed(recentlyViewedGuides);
          }
        } catch (error) {
          console.error('Error loading user-specific guide data:', error);
        }
      }
    } catch (err) {
      console.error('Error loading guides:', err);
      setError('Failed to load guides. Please try again later.');
      // Fallback to mock data on error
      setGuides(fallbackGuides);
      setFilteredGuides(fallbackGuides);
      setFeaturedGuides(fallbackGuides.filter(guide => guide.featured));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadGuides();
    setIsRefreshing(false);
    toast.success('Guide content has been updated.');
  };

  const toggleBookmark = async (guide: Guide) => {
    if (!session) {
      toast.error("Please login to bookmark guides");
      return;
    }
    
    try {
      const isBookmarked = bookmarkedGuides.includes(guide.id);
      
      if (isBookmarked) {
        // Remove bookmark using dedicated function
        await removeBookmarkGuide(session, guide.id);
        
        // Update state
        setBookmarkedGuides(prev => prev.filter(id => id !== guide.id));
        toast.success(`"${guide.title}" has been removed from your bookmarks.`);
      } else {
        // Add bookmark using dedicated function
        await addBookmarkGuide(session, guide.id);
        
        // Update state
        setBookmarkedGuides(prev => [...prev, guide.id]);
        toast.success(`"${guide.title}" has been added to your bookmarks.`);
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
      toast.error("Could not update bookmark. Please try again.");
    }
  };

  useEffect(() => {
    loadGuides();
  }, [session]);

  useEffect(() => {
    if (guides.length > 0) {
      let filtered = [...guides];
      
      // Apply search filter
      if (filter) {
        const searchTerm = filter.toLowerCase();
        filtered = filtered.filter(guide => {
          return (
            guide.title.toLowerCase().includes(searchTerm) ||
            guide.description.toLowerCase().includes(searchTerm) ||
            guide.tags.some(tag => tag.toLowerCase().includes(searchTerm))
          );
        });
      }
      
      // Apply category filter
      if (categoryFilter !== 'all') {
        filtered = filtered.filter(guide => guide.category === categoryFilter);
      }
      
      // Apply type filter
      if (typeFilter !== 'all') {
        filtered = filtered.filter(guide => guide.type === typeFilter);
      }
      
      setFilteredGuides(filtered);
    }
  }, [filter, categoryFilter, typeFilter, guides]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'quit-strategies', label: 'Quit Strategies' },
    { value: 'health-benefits', label: 'Health Benefits' },
    { value: 'coping-techniques', label: 'Coping Techniques' },
    { value: 'success-stories', label: 'Success Stories' },
    { value: 'nutrition', label: 'Nutrition & Diet' },
    { value: 'exercise', label: 'Exercise & Activity' },
    { value: 'mindfulness', label: 'Mindfulness & Meditation' }
  ];

  const types = [
    { value: 'all', label: 'All Types' },
    { value: 'article', label: 'Articles' },
    { value: 'video', label: 'Videos' },
    { value: 'pdf', label: 'PDF Guides' }
  ];

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'quit-strategies': return <Cigarette className="h-5 w-5 text-red-500" />;
      case 'health-benefits': return <Heart className="h-5 w-5 text-green-500" />;
      case 'coping-techniques': return <Snowflake className="h-5 w-5 text-blue-500" />;
      case 'success-stories': return <ThumbsUp className="h-5 w-5 text-yellow-500" />;
      case 'nutrition': return <Coffee className="h-5 w-5 text-amber-500" />;
      case 'exercise': return <Zap className="h-5 w-5 text-purple-500" />;
      case 'mindfulness': return <Leaf className="h-5 w-5 text-green-500" />;
      default: return <HelpCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'article': return <Book className="h-5 w-5" />;
      case 'video': return <Play className="h-5 w-5" />;
      case 'pdf': return <Book className="h-5 w-5" />;
      default: return <HelpCircle className="h-5 w-5" />;
    }
  };

  const handleGuideClick = async (guide: Guide) => {
    if (!session) {
      // Non-logged in users can view guides but their views aren't tracked
      window.open(guide.url, '_blank');
      return;
    }
    
    try {
      // Record the guide view using the dedicated function
      await recordGuideView(session, guide.id);
      
      // Update recently viewed in the UI
      if (!recentlyViewed.some(g => g.id === guide.id)) {
        setRecentlyViewed(prevViewed => [guide, ...prevViewed].slice(0, 5));
      }
      
      // Open guide in a new tab
      window.open(guide.url, '_blank');
    } catch (error) {
      console.error('Error recording guide view:', error);
      // Still open the guide even if tracking fails
      window.open(guide.url, '_blank');
    }
  };

  // Fallback guides data in case the API fails
  const fallbackGuides: Guide[] = [
    {
      id: '1',
      title: 'First Week Without Nicotine: What to Expect',
      description: 'A comprehensive day-by-day guide on physical and psychological changes during your first week without nicotine.',
      type: 'article',
      category: 'quit-strategies',
      tags: ['withdrawal', 'early quit', 'symptoms'],
      difficulty: 'beginner',
      duration: 12,
      published_at: '2023-06-15',
      url: 'https://example.com/guides/first-week',
      author: 'Dr. Maria Johnson',
      featured: true
    },
    {
      id: '2',
      title: 'Breathing Exercises for Cravings',
      description: 'Learn powerful breathing techniques that can help manage intense cravings in just minutes.',
      type: 'video',
      category: 'coping-techniques',
      tags: ['breathing', 'mindfulness', 'cravings'],
      difficulty: 'beginner',
      duration: 8,
      published_at: '2023-05-22',
      url: 'https://example.com/guides/breathing-exercises',
      author: 'Sarah Williams, RN',
      featured: false
    },
    {
      id: '3',
      title: 'The Science of Nicotine Addiction',
      description: 'Understanding the neurological basis of nicotine addiction and how it affects your brain.',
      type: 'article',
      category: 'health-benefits',
      tags: ['science', 'addiction', 'brain'],
      difficulty: 'intermediate',
      duration: 15,
      published_at: '2023-04-18',
      url: 'https://example.com/guides/nicotine-science',
      author: 'Dr. Robert Chen',
      featured: true
    },
    {
      id: '4',
      title: 'Nutrition Tips for New Non-Smokers',
      description: 'How to maintain a healthy diet that supports your body during the quitting process.',
      type: 'pdf',
      category: 'nutrition',
      tags: ['food', 'diet', 'weight management'],
      difficulty: 'beginner',
      duration: 10,
      published_at: '2023-03-05',
      url: 'https://example.com/guides/nutrition-tips',
      author: 'Lisa Peterson, RD',
      featured: false
    },
    {
      id: '5',
      title: 'From Pack-a-Day to Marathon Runner',
      description: 'An inspiring story of transformation and the running routine that helped one person quit for good.',
      type: 'article',
      category: 'success-stories',
      tags: ['inspiration', 'exercise', 'transformation'],
      difficulty: 'beginner',
      duration: 7,
      published_at: '2023-02-10',
      url: 'https://example.com/guides/marathon-story',
      author: 'Michael Torres',
      featured: true
    },
    {
      id: '6',
      title: 'Guided Meditation for Stress Relief',
      description: 'A 10-minute guided meditation specifically designed to reduce stress during the quitting process.',
      type: 'video',
      category: 'mindfulness',
      tags: ['meditation', 'stress', 'anxiety'],
      difficulty: 'beginner',
      duration: 10,
      published_at: '2023-01-20',
      url: 'https://example.com/guides/meditation',
      author: 'Emma Scott',
      featured: false
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-4 border-b-4 border-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading guides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Guides Hub</h1>
          <p className="text-muted-foreground">
            Explore our comprehensive collection of resources to support your fresh journey
          </p>
        </div>
        <Button
          className="mt-4 md:mt-0"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Guides
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6 flex flex-wrap">
          <TabsTrigger value="all">All Guides</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
          <TabsTrigger value="recent">Recently Viewed</TabsTrigger>
        </TabsList>

        {/* Filter and Search Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          <div className="md:col-span-5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search guides..."
                className="pl-8"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
          <div className="md:col-span-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-1">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setFilter('');
                setCategoryFilter('all');
                setTypeFilter('all');
              }}
            >
              Clear
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="mt-6">
          {filteredGuides.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No guides found matching your criteria.</p>
              <Button variant="outline" className="mt-4" onClick={() => {
                setFilter('');
                setCategoryFilter('all');
                setTypeFilter('all');
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide) => (
                <Card key={guide.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{guide.title}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(guide);
                        }}
                      >
                        <Bookmark 
                          className={`h-5 w-5 ${bookmarkedGuides.includes(guide.id) ? 'fill-current text-primary' : ''}`} 
                        />
                      </Button>
                    </div>
                    <CardDescription className="text-sm">
                      {guide.author} • {new Date(guide.published_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                      {guide.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {guide.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(guide.category)}
                        <span>{categories.find(c => c.value === guide.category)?.label || guide.category}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(guide.type)}
                        <span>{guide.type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlarmClock className="h-4 w-4" />
                        <span>{guide.duration} min</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button 
                      className="w-full" 
                      onClick={() => handleGuideClick(guide)}
                    >
                      {session ? 'View Guide' : 'Login to View'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="featured" className="mt-6">
          {featuredGuides.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No featured guides available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGuides.map((guide) => (
                <Card key={guide.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{guide.title}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(guide);
                        }}
                      >
                        <Bookmark 
                          className={`h-5 w-5 ${bookmarkedGuides.includes(guide.id) ? 'fill-current text-primary' : ''}`} 
                        />
                      </Button>
                    </div>
                    <CardDescription className="text-sm">
                      {guide.author} • {new Date(guide.published_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                      {guide.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {guide.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(guide.category)}
                        <span>{categories.find(c => c.value === guide.category)?.label || guide.category}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(guide.type)}
                        <span>{guide.type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlarmClock className="h-4 w-4" />
                        <span>{guide.duration} min</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button 
                      className="w-full" 
                      onClick={() => handleGuideClick(guide)}
                    >
                      {session ? 'View Guide' : 'Login to View'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookmarked" className="mt-6">
          {!session ? (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">Please login to view your bookmarked guides.</p>
              <Button className="mt-4" onClick={() => window.location.href = "/mission-fresh/auth"}>
                Go to Login
              </Button>
            </div>
          ) : bookmarkedGuides.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">You haven't bookmarked any guides yet.</p>
              <p className="mt-2 text-muted-foreground">Browse guides and click the bookmark icon to save them for later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides
                .filter(guide => bookmarkedGuides.includes(guide.id))
                .map((guide) => (
                  <Card key={guide.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{guide.title}</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(guide);
                          }}
                        >
                          <Bookmark className="h-5 w-5 fill-current text-primary" />
                        </Button>
                      </div>
                      <CardDescription className="text-sm">
                        {guide.author} • {new Date(guide.published_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                        {guide.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {guide.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {getCategoryIcon(guide.category)}
                          <span>{categories.find(c => c.value === guide.category)?.label || guide.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(guide.type)}
                          <span>{guide.type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlarmClock className="h-4 w-4" />
                          <span>{guide.duration} min</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button 
                        className="w-full" 
                        onClick={() => handleGuideClick(guide)}
                      >
                        View Guide
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          {!session ? (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">Please login to view your recently viewed guides.</p>
              <Button className="mt-4" onClick={() => window.location.href = "/mission-fresh/auth"}>
                Go to Login
              </Button>
            </div>
          ) : recentlyViewed.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">You haven't viewed any guides yet.</p>
              <p className="mt-2 text-muted-foreground">View guides to see them appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentlyViewed.map((guide) => (
                <Card key={guide.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{guide.title}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(guide);
                        }}
                      >
                        <Bookmark 
                          className={`h-5 w-5 ${bookmarkedGuides.includes(guide.id) ? 'fill-current text-primary' : ''}`} 
                        />
                      </Button>
                    </div>
                    <CardDescription className="text-sm">
                      {guide.author} • {new Date(guide.published_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                      {guide.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {guide.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(guide.category)}
                        <span>{categories.find(c => c.value === guide.category)?.label || guide.category}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(guide.type)}
                        <span>{guide.type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlarmClock className="h-4 w-4" />
                        <span>{guide.duration} min</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button 
                      className="w-full" 
                      onClick={() => handleGuideClick(guide)}
                    >
                      View Again
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GuidesHub; 