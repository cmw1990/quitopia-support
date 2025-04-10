import React, { useState, useEffect } from "react";
import { BookOpen, Clock, ArrowRight, Search, Filter, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";

interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  readTime: string;
  publishedDate: string;
  author: {
    name: string;
    avatar?: string;
    credential: string;
  };
  imageUrl?: string;
  slug: string;
  content?: string;
}

const WebappQuittingGuides = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<Article[]>([
    {
      id: "1",
      title: "Cold Turkey: Pros and Cons of Quitting Abruptly",
      summary: "Learn about the benefits and challenges of the cold turkey approach to quitting smoking, including success rates and coping strategies.",
      category: "methods",
      readTime: "7 min",
      publishedDate: "May 15, 2023",
      author: {
        name: "Dr. Sarah Johnson",
        credential: "Addiction Specialist",
        avatar: "/images/avatars/doctor-1.jpg"
      },
      imageUrl: "/images/articles/cold-turkey.jpg",
      slug: "cold-turkey-pros-cons"
    },
    {
      id: "2",
      title: "Nicotine Replacement Therapy: A Comprehensive Guide",
      summary: "Explore the various forms of NRT, how they work to reduce withdrawal symptoms, and how to use them effectively for a successful quit.",
      category: "nrt",
      readTime: "10 min",
      publishedDate: "June 3, 2023",
      author: {
        name: "Dr. Michael Chen",
        credential: "Pulmonologist",
        avatar: "/images/avatars/doctor-2.jpg"
      },
      imageUrl: "/images/articles/nrt-guide.jpg",
      slug: "nrt-comprehensive-guide"
    },
    {
      id: "3",
      title: "Tapering Method: Gradually Reducing Your Nicotine Intake",
      summary: "Discover how to create an effective tapering plan to slowly reduce your nicotine consumption while minimizing withdrawal symptoms.",
      category: "methods",
      readTime: "8 min",
      publishedDate: "June 10, 2023",
      author: {
        name: "Emma Williams",
        credential: "Smoking Cessation Counselor",
        avatar: "/images/avatars/counselor-1.jpg"
      },
      imageUrl: "/images/articles/tapering-method.jpg",
      slug: "tapering-method-guide"
    },
    {
      id: "4",
      title: "Cognitive Behavioral Therapy for Smoking Cessation",
      summary: "Learn how CBT techniques can help you identify and change thought patterns and behaviors related to smoking addiction.",
      category: "therapy",
      readTime: "12 min",
      publishedDate: "July 2, 2023",
      author: {
        name: "Dr. Jessica Thompson",
        credential: "Clinical Psychologist",
        avatar: "/images/avatars/doctor-3.jpg"
      },
      imageUrl: "/images/articles/cbt-smoking.jpg",
      slug: "cbt-smoking-cessation"
    },
    {
      id: "5",
      title: "Mindfulness and Meditation for Craving Management",
      summary: "Explore mindfulness-based approaches to managing nicotine cravings and reducing the stress associated with quitting smoking.",
      category: "wellbeing",
      readTime: "9 min",
      publishedDate: "July 18, 2023",
      author: {
        name: "Robert Garcia",
        credential: "Mindfulness Instructor",
        avatar: "/images/avatars/instructor-1.jpg"
      },
      imageUrl: "/images/articles/mindfulness-cravings.jpg",
      slug: "mindfulness-craving-management"
    },
    {
      id: "6",
      title: "Prescription Medications to Help You Quit Smoking",
      summary: "A detailed overview of prescription medications like Chantix (varenicline) and Zyban (bupropion) and how they can aid your quit journey.",
      category: "medication",
      readTime: "11 min",
      publishedDate: "August 5, 2023",
      author: {
        name: "Dr. Alan Roberts",
        credential: "Family Physician",
        avatar: "/images/avatars/doctor-4.jpg"
      },
      imageUrl: "/images/articles/prescription-meds.jpg",
      slug: "prescription-medications-quit-smoking"
    },
    {
      id: "7",
      title: "Creating a Personal Quit Plan That Works",
      summary: "Step-by-step guidance on developing a personalized quitting strategy that addresses your specific smoking triggers and habits.",
      category: "planning",
      readTime: "14 min",
      publishedDate: "August 20, 2023",
      author: {
        name: "Lisa Patel",
        credential: "Tobacco Treatment Specialist",
        avatar: "/images/avatars/specialist-1.jpg"
      },
      imageUrl: "/images/articles/quit-plan.jpg",
      slug: "personal-quit-plan"
    },
    {
      id: "8",
      title: "Managing Withdrawal: What to Expect and How to Cope",
      summary: "Prepare yourself for the physical and psychological withdrawal symptoms and learn effective strategies to manage them.",
      category: "wellbeing",
      readTime: "10 min",
      publishedDate: "September 7, 2023",
      author: {
        name: "Dr. Thomas Wilson",
        credential: "Neurologist",
        avatar: "/images/avatars/doctor-5.jpg"
      },
      imageUrl: "/images/articles/withdrawal-management.jpg",
      slug: "managing-withdrawal-symptoms"
    },
    {
      id: "9",
      title: "The Role of Support Groups in Smoking Cessation",
      summary: "Discover how joining a support group can significantly increase your chances of quitting successfully through shared experiences and accountability.",
      category: "support",
      readTime: "8 min",
      publishedDate: "September 22, 2023",
      author: {
        name: "Maria Rodriguez",
        credential: "Support Group Facilitator",
        avatar: "/images/avatars/facilitator-1.jpg"
      },
      imageUrl: "/images/articles/support-groups.jpg",
      slug: "support-groups-smoking-cessation"
    },
    {
      id: "10",
      title: "Relapse Prevention: Staying Smoke-Free for Good",
      summary: "Learn effective strategies to prevent relapse and maintain your smoke-free status even during stressful or triggering situations.",
      category: "wellbeing",
      readTime: "11 min",
      publishedDate: "October 10, 2023",
      author: {
        name: "Dr. Katherine Lee",
        credential: "Addiction Psychiatrist",
        avatar: "/images/avatars/doctor-6.jpg"
      },
      imageUrl: "/images/articles/relapse-prevention.jpg",
      slug: "relapse-prevention-strategies"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("articles");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (slug) {
      const article = articles.find(a => a.slug === slug);
      if (article) {
        setSelectedArticle(article);
      }
    } else {
      setSelectedArticle(null);
    }
  }, [slug, articles]);

  useEffect(() => {
    const articlesWithContent = articles.map(article => ({
      ...article,
      content: `
        <h1>${article.title}</h1>
        <p class="article-meta">Published on ${article.publishedDate} by ${article.author.name}, ${article.author.credential}</p>
        
        <div class="article-intro">
          <p>${article.summary}</p>
          <p>This comprehensive guide will help you understand the ${article.title.toLowerCase()} approach to quitting smoking and how it can benefit your journey to becoming smoke-free.</p>
        </div>
        
        <h2>Understanding ${article.category === 'nrt' ? 'Nicotine Replacement Therapy' : 
                          article.category === 'methods' ? 'Different Quitting Methods' :
                          article.category === 'therapy' ? 'Therapeutic Approaches' :
                          article.category === 'wellbeing' ? 'Wellness Strategies' :
                          article.category === 'medication' ? 'Medication Options' :
                          article.category === 'planning' ? 'Planning Strategies' : 'This Approach'}</h2>
        
        <p>When it comes to quitting smoking, having the right tools and knowledge is essential. ${article.title} provides a structured approach that many have found effective in their quit journey.</p>
        
        <p>The key benefits include:</p>
        <ul>
          <li>Reduced withdrawal symptoms</li>
          <li>Higher success rates than quitting cold turkey</li>
          <li>Personalized approach to meet individual needs</li>
          <li>Scientific backing from multiple clinical studies</li>
        </ul>
        
        <h2>How To Get Started</h2>
        
        <p>Beginning your journey with ${article.title.split(':')[0]} requires some preparation. Here's a simple step-by-step guide:</p>
        
        <ol>
          <li>Consult with a healthcare provider to ensure this method is right for you</li>
          <li>Create a quit plan with specific goals and timelines</li>
          <li>Gather the necessary resources and support</li>
          <li>Set a quit date and prepare for it mentally</li>
          <li>Follow through with the plan, adjusting as needed</li>
        </ol>
        
        <h2>Common Challenges and Solutions</h2>
        
        <p>Even with the best methods, quitting smoking comes with challenges. Here are some common obstacles and how to overcome them:</p>
        
        <h3>Dealing with Cravings</h3>
        <p>Cravings are temporary but intense urges to smoke that typically last 3-5 minutes. When a craving hits, try the 4 Ds: Delay, Deep breathe, Drink water, and Do something else.</p>
        
        <h3>Managing Stress</h3>
        <p>Many people smoke to cope with stress, so finding alternative stress management techniques is crucial. Consider meditation, exercise, or speaking with a counselor.</p>
        
        <h3>Weight Gain Concerns</h3>
        <p>Some people worry about gaining weight after quitting. Plan ahead with healthy snacks and regular physical activity to manage this common concern.</p>
        
        <h2>Success Stories</h2>
        
        <p>Many former smokers have found success using ${article.title.split(':')[0]}. Their experiences can provide inspiration and practical insights for your own journey.</p>
        
        <blockquote>
          "After 15 years of smoking, I never thought I could quit. Using ${article.title.split(':')[0]} made the difference for me. It's been two years now, and I haven't looked back." - Former smoker
        </blockquote>
        
        <h2>Conclusion</h2>
        
        <p>Quitting smoking is one of the most important health decisions you can make. With ${article.title}, you have a science-backed method to help you succeed. Remember that quitting is a journey, and each attempt brings you closer to success.</p>
        
        <p>For personalized support on your quit journey, consider creating an account with our app to track your progress and get customized recommendations.</p>
      `
    }));
    
    setArticles(articlesWithContent);
  }, []);

  const handleArticleClick = (slug: string) => {
    navigate(`/webapp/quitting-guides/${slug}`);
  };

  const categories = [
    { value: "all", label: "All Articles" },
    { value: "methods", label: "Quitting Methods" },
    { value: "nrt", label: "NRT Guides" },
    { value: "medication", label: "Medication" },
    { value: "therapy", label: "Therapy" },
    { value: "wellbeing", label: "Well-being" },
    { value: "planning", label: "Planning" },
    { value: "support", label: "Support" },
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (activeTab === "newest") {
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
    }
    if (activeTab === "popular") {
      return (parseInt(b.id) % 10) - (parseInt(a.id) % 10);
    }
    return 0;
  });

  if (selectedArticle) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6 text-green-600 hover:text-green-800"
          onClick={() => navigate('/webapp/quitting-guides')}
        >
          &larr; Back to Guides
        </Button>
        
        <div className="relative h-64 md:h-80 mb-8 bg-gray-100 rounded-lg overflow-hidden">
          {selectedArticle.imageUrl ? (
            <img 
              src={selectedArticle.imageUrl} 
              alt={selectedArticle.title} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpen className="h-20 w-20 text-green-200" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <Badge className="bg-green-500 text-white border-0 mb-3">
              {categories.find(c => c.value === selectedArticle.category)?.label || selectedArticle.category}
            </Badge>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{selectedArticle.title}</h1>
            <div className="flex items-center text-white/80">
              <Clock className="h-4 w-4 mr-1" />
              <span className="mr-4">{selectedArticle.readTime}</span>
              <span>{selectedArticle.publishedDate}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center mb-8 p-4 bg-green-50 rounded-lg border border-green-100">
          <Avatar className="h-12 w-12 mr-4">
            <AvatarImage src={selectedArticle.author.avatar} alt={selectedArticle.author.name} />
            <AvatarFallback className="bg-green-200 text-green-800">
              {selectedArticle.author.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{selectedArticle.author.name}</p>
            <p className="text-sm text-gray-600">{selectedArticle.author.credential}</p>
          </div>
        </div>
        
        <div className="prose prose-green max-w-none">
          <div dangerouslySetInnerHTML={{ __html: selectedArticle.content || '' }} />
        </div>

        <div className="mt-16 bg-green-50 p-8 rounded-lg border border-green-100 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-4">Ready to Put This Into Practice?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Create an account to get personalized recommendations, track your quit journey, and access exclusive guides tailored to your specific quitting goals.
          </p>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            Create Free Account
          </Button>
        </div>
        
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-6">Related Guides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles
              .filter(a => a.id !== selectedArticle.id && a.category === selectedArticle.category)
              .slice(0, 3)
              .map(article => (
                <Card 
                  key={article.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
                  onClick={() => handleArticleClick(article.slug)}
                >
                  <div className="h-40 bg-gray-100 relative">
                    {article.imageUrl ? (
                      <img 
                        src={article.imageUrl} 
                        alt={article.title} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-10 w-10 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="pt-4 pb-2">
                    <CardTitle className="text-base line-clamp-2">{article.title}</CardTitle>
                  </CardHeader>
                  <CardFooter className="pt-0 pb-4">
                    <Button variant="ghost" className="p-0 h-auto text-green-600 hover:text-green-800">
                      Read Guide <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col items-start mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <BookOpen className="h-6 w-6 text-green-600" />
          <h1 className="text-3xl font-bold text-green-800">Quitting Guides</h1>
        </div>
        <p className="text-gray-600 text-lg mb-4">
          Evidence-based resources to help you quit smoking successfully. Browse our collection of guides and articles about different quitting methods.
        </p>
        <Separator className="mb-6" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search guides and articles..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-md px-3 py-2 bg-white text-gray-800"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Tabs defaultValue="articles" onValueChange={setActiveTab} className="mb-8">
        <TabsList className="bg-green-50 border border-green-100">
          <TabsTrigger value="articles" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Articles
          </TabsTrigger>
          <TabsTrigger value="popular" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Most Popular
          </TabsTrigger>
          <TabsTrigger value="newest" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Newest
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredArticles.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">No articles match your search criteria.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Featured article (first article) */}
          {activeTab === "articles" && filteredArticles.length > 0 && (
            <Card 
              className="overflow-hidden mb-10 bg-gradient-to-r from-green-50 to-white border-green-100 cursor-pointer"
              onClick={() => handleArticleClick(filteredArticles[0].slug)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 flex flex-col justify-center">
                  <Badge className="bg-green-100 text-green-800 border-0 mb-3 w-fit">
                    {categories.find(c => c.value === filteredArticles[0].category)?.label || filteredArticles[0].category}
                  </Badge>
                  <CardTitle className="text-2xl md:text-3xl mb-3">{filteredArticles[0].title}</CardTitle>
                  <CardDescription className="text-base mb-6">{filteredArticles[0].summary}</CardDescription>
                  <div className="flex items-center mb-4">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={filteredArticles[0].author.avatar} alt={filteredArticles[0].author.name} />
                      <AvatarFallback className="bg-green-200 text-green-800">
                        {filteredArticles[0].author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{filteredArticles[0].author.name}</p>
                      <p className="text-xs text-gray-500">{filteredArticles[0].author.credential}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-5">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="mr-4">{filteredArticles[0].readTime}</span>
                    <span>{filteredArticles[0].publishedDate}</span>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700 text-white w-fit">
                    Read Article <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="relative h-64 md:h-auto bg-gray-100">
                  {filteredArticles[0].imageUrl ? (
                    <img 
                      src={filteredArticles[0].imageUrl} 
                      alt={filteredArticles[0].title} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="h-16 w-16 text-green-200" />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Rest of the articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.slice(activeTab === "articles" ? 1 : 0).map((article) => (
              <Card 
                key={article.id} 
                className="overflow-hidden flex flex-col h-full border-gray-200 hover:border-green-200 transition-colors cursor-pointer"
                onClick={() => handleArticleClick(article.slug)}
              >
                <div className="h-48 bg-gray-100 relative">
                  {article.imageUrl ? (
                    <img 
                      src={article.imageUrl} 
                      alt={article.title} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  <Badge className="absolute top-3 left-3 bg-green-100 text-green-800 border-0">
                    {categories.find(c => c.value === article.category)?.label || article.category}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2 hover:text-green-700 transition-colors">
                    {article.title}
                  </CardTitle>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="mr-4">{article.readTime}</span>
                    <span>{article.publishedDate}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-600 line-clamp-3">{article.summary}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between pt-0">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={article.author.avatar} alt={article.author.name} />
                      <AvatarFallback className="bg-green-100 text-green-800 text-xs">
                        {article.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{article.author.name}</span>
                  </div>
                  <Button variant="ghost" className="p-0 h-auto text-green-600 hover:text-green-800">
                    Read <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="text-center mt-16 bg-green-50 p-8 rounded-lg border border-green-100">
        <h2 className="text-2xl font-bold text-green-800 mb-4">Need Personalized Guidance?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Create an account to get personalized recommendations, track your quit journey, and access exclusive guides tailored to your specific quitting goals.
        </p>
        <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
          Create Free Account
        </Button>
      </div>
    </div>
  );
};

export default WebappQuittingGuides; 