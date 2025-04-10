
import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
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
import { useToast } from '../hooks/use-toast';

// Mock data for guides
const mockGuides = [
  {
    id: 1,
    title: "Getting Started with Nicotine Replacement",
    category: "beginner",
    content: "This guide will help you understand the basics of nicotine replacement therapy.",
    publishedAt: new Date().toISOString(),
    author: "Dr. Smith",
    readTime: "5 min",
    tags: ["NRT", "beginners", "guide"]
  },
  {
    id: 2,
    title: "Understanding Withdrawal Symptoms",
    category: "health",
    content: "Learn about common withdrawal symptoms and how to manage them effectively.",
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    author: "Dr. Johnson",
    readTime: "8 min",
    tags: ["withdrawal", "health", "symptoms"]
  },
  {
    id: 3,
    title: "Building New Habits",
    category: "lifestyle",
    content: "Discover techniques to replace smoking with healthier habits.",
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    author: "Jane Doe",
    readTime: "6 min",
    tags: ["habits", "lifestyle", "wellness"]
  },
  {
    id: 4,
    title: "Advanced Techniques for Managing Cravings",
    category: "advanced",
    content: "Advanced strategies for long-term quitters to manage occasional cravings.",
    publishedAt: new Date(Date.now() - 259200000).toISOString(),
    author: "Dr. Williams",
    readTime: "10 min",
    tags: ["cravings", "advanced", "techniques"]
  }
];

interface Guide {
  id: number;
  title: string;
  category: string;
  content: string;
  publishedAt: string;
  author: string;
  readTime: string;
  tags: string[];
}

interface GuidesHubProps {
  session: Session | null;
}

const GuidesHub: React.FC<GuidesHubProps> = ({ session }) => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    const loadGuides = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch from API using supabaseRestCall
        // Using mock data for now
        setTimeout(() => {
          setGuides(mockGuides);
          setFilteredGuides(mockGuides);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error loading guides:', error);
        toast({
          title: 'Error',
          description: 'Failed to load guides. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    loadGuides();
  }, [toast]);

  useEffect(() => {
    // Filter guides based on search term and category
    let result = guides;
    
    if (searchTerm) {
      result = result.filter(guide => 
        guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory !== 'all') {
      result = result.filter(guide => guide.category === selectedCategory);
    }
    
    setFilteredGuides(result);
  }, [searchTerm, selectedCategory, guides]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Guides &amp; Resources</h1>
          <p className="text-muted-foreground">
            Discover helpful guides to support your quit journey
          </p>
        </div>
        
        {session && (
          <Button>
            Bookmark for Later
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-full md:col-span-2 bg-primary/5">
          <CardHeader>
            <CardTitle>Why Read Our Guides?</CardTitle>
            <CardDescription>
              Our evidence-based guides are created by healthcare professionals and experts in smoking cessation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Research shows that people who understand the quitting process and have strategies in place are more likely to quit successfully.
              Browse our collection of guides tailored to every stage of your journey.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Find What You Need</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input 
                id="search" 
                placeholder="Search guides..." 
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Guides</TabsTrigger>
          <TabsTrigger value="recent">Recently Added</TabsTrigger>
          <TabsTrigger value="popular">Most Popular</TabsTrigger>
          {session && <TabsTrigger value="saved">Saved</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredGuides.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-center text-muted-foreground mb-4">No guides found matching your criteria.</p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}>
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGuides.map((guide) => (
                <Card key={guide.id} className="flex flex-col h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                    </div>
                    <CardDescription className="flex items-center justify-between">
                      <span>By {guide.author}</span>
                      <span className="text-xs">{guide.readTime} read</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {guide.content}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {guide.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(guide.publishedAt)}
                    </span>
                    <Button variant="ghost" size="sm">
                      Read More
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent" className="space-y-4">
          <p className="text-muted-foreground text-center py-6">Recently added guides will appear here.</p>
        </TabsContent>
        
        <TabsContent value="popular" className="space-y-4">
          <p className="text-muted-foreground text-center py-6">Popular guides will appear here.</p>
        </TabsContent>
        
        {session && (
          <TabsContent value="saved" className="space-y-4">
            <p className="text-muted-foreground text-center py-6">Your saved guides will appear here.</p>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default GuidesHub;
