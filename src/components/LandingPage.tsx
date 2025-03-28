import React from 'react';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { 
  Button,
  Card, 
  CardContent,
  Badge
} from './ui';
import { Battery, BrainCircuit, Clock, Heart, Lightbulb, Smile, Star, Trophy, Zap, CheckCircle, ArrowRight, Users, Hourglass, ThumbsUp, Coffee, Sunrise, Cigarette, Hand, LineChart, Snowflake, Hash, Utensils, Database, Book, Check, Leaf, Menu, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Calendar, CalendarDays } from 'lucide-react';

interface LandingPageProps {
  session: Session | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({ session }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleGetStarted = () => {
    if (session) {
      navigate('app');
    } else {
      navigate('auth');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Menu Bar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Leaf className="h-6 w-6 text-green-600 dark:text-green-500 mr-2" />
                <span className="font-bold text-xl">Mission Fresh</span>
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <nav className="hidden md:flex space-x-8">
              <Link 
                to="app/nrt-directory" 
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium"
              >
                NRT Directory
              </Link>
              <Link 
                to="app/alternative-products" 
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium"
              >
                Smokeless Alternatives
              </Link>
              <Link 
                to="app/guides" 
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium"
              >
                Quitting Guides
              </Link>
              <Link 
                to="app/community" 
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium"
              >
                Community
              </Link>
            </nav>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
            
            {/* Login/Get Started Button */}
            <div className="hidden md:block">
              <Button 
                onClick={handleGetStarted}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {session ? 'Dashboard' : 'Get Started'}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-2 pb-4">
              <Link 
                to="app/nrt-directory" 
                className="block py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium"
              >
                NRT Directory
              </Link>
              <Link 
                to="app/alternative-products" 
                className="block py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium"
              >
                Smokeless Alternatives
              </Link>
              <Link 
                to="app/guides" 
                className="block py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium"
              >
                Quitting Guides
              </Link>
              <Link 
                to="app/community" 
                className="block py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium"
              >
                Community
              </Link>
              <Button 
                onClick={handleGetStarted}
                className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {session ? 'Dashboard' : 'Get Started'}
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-green-800 to-green-700 text-white py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Welcome to <span className="block text-green-300">Mission Fresh</span>
              </h1>
              <p className="text-xl md:text-2xl mb-4 text-green-100">
                The world's most comprehensive quit-smoking app, focused on your complete well-being.
              </p>
              <p className="text-lg mb-8 text-green-200">
                No matter your goal or preferred method, we provide the tools, support, and guidance without judgment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-green-600 hover:bg-green-700 text-white border-none"
                >
                  {session ? 'Go to Your Dashboard' : 'Start Your Quit Journey'}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => navigate('app/community')}
                >
                  Join Quitting Community
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 bg-green-500 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute inset-4 bg-green-400 rounded-full opacity-20 animate-pulse animation-delay-1000"></div>
                <div className="absolute inset-8 bg-green-600 rounded-full opacity-20 animate-pulse animation-delay-2000"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Leaf className="w-32 h-32 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Directories Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Explore Our Quit Smoking Resources</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Find the right products and alternatives to support your journey</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* NRT Directory Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <Cigarette className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="ml-4 text-xl font-semibold">NRT Product Directory</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Explore FDA-approved nicotine replacement therapies including patches, gums, lozenges, inhalers, and prescription medications.
                </p>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Compare effectiveness and side effects</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Read user reviews and experiences</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Find the right dosage for your needs</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = '/app/nrt-directory'}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Browse NRT Products
                </Button>
              </div>
            </div>
            
            {/* Alternative Products Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="ml-4 text-xl font-semibold">Smokeless Alternatives</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Discover non-smoking products like nicotine pouches, lozenges, and other smokeless options that may help you quit.
                </p>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Browse alternative nicotine products</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Learn about harm reduction options</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Find products by strength and flavor</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = '/app/alternative-products'}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Explore Alternatives
                </Button>
              </div>
            </div>

            {/* Quitting Guides Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="ml-4 text-xl font-semibold">Quitting Guides</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get expert advice on different quitting methods, manage withdrawal symptoms, and learn strategies for long-term success.
                </p>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Expert articles on quitting methods</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Withdrawal management strategies</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>Step-by-step quitting plans</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = '/app/quitting-guides'}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Explore Guides
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Quitting Methods Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <div className="mb-3">
              <Badge variant="outline">Whatever Your Goal</Badge>
            </div>
            <h2 className="text-3xl font-bold mb-4">Support for Every Quitting Method</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Unlike other apps that only support cold turkey, we understand that quitting is personal. 
              We provide comprehensive support for all approaches without judgment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Method 1 */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
                    <Snowflake className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Cold Turkey</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Complete cessation all at once. Our app provides intensive energy and mood support during the critical first weeks.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Method 2 */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-4">
                    <LineChart className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Gradual Reduction</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Systematically reduce consumption at your own pace. We'll help you track and adjust your reduction schedule.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Method 3 */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                    <Hourglass className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Delay Technique</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Progressively extend the time between each use. Our tools help you manage cravings during longer waiting periods.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Method 4 */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                    <Hand className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Nicotine Replacement</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Using replacements like patches or gum. We help manage the transition and gradual tapering of replacement products.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Method 5 */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                    <Hash className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Cut Triggers</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Identify and eliminate smoking triggers one by one. Our app helps you track situations that prompt usage.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Method 6 */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4">
                    <ThumbsUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Reduction Only</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Just want to cut back? No problem. Set your own goals and we'll help you reach them without pressuring complete cessation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center mt-8">
            <Button 
              onClick={handleGetStarted}
              className="flex items-center gap-2"
            >
              Find Your Best Method
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <div className="mb-3">
              <Badge variant="outline">Comprehensive Support</Badge>
            </div>
            <h2 className="text-3xl font-bold mb-4">Beyond Motivation and Logging</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Mission Fresh provides all the practical tools you need to manage energy, mood, and focus challenges 
              during your quit journey — the real reasons most quit attempts fail.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" />
                Real-Time Progress Tracking
              </h3>
              <p className="mb-4">
                Every cravings log, mood update, and progress milestone is saved to your secure personal database.
                All data is synchronized across devices so you can track your journey anywhere.
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Data We Track For You:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Daily consumption of multiple nicotine products</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Cravings intensity, triggers, and resolution strategies</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Energy levels throughout your quit process</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Mood patterns and emotional responses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Money saved and health improvements</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Book className="h-6 w-6 text-primary" />
                Method-Specific Guidance
              </h3>
              <p className="mb-4">
                Whether you're going cold turkey or gradually reducing, Mission Fresh adapts to your preferred quitting strategy
                with personalized guidance and tools.
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Tailored Support:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Customized reduction plans and schedules</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>NRT (Nicotine Replacement Therapy) tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Trigger identification and management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Delay technique timers and distractions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Expert-backed guidance for each method</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-none shadow-lg">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Energy Management</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our proprietary energy tools help combat fatigue and energy crashes when nicotine is no longer 
                    providing artificial stimulation.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-none shadow-lg">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                    <Smile className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Mood Support</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Interactive mood games and personalized strategies help stabilize emotions during 
                    withdrawal, reducing irritability and anxiety.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-none shadow-lg">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                    <BrainCircuit className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Holistic Approach</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Specialized nutrition, hydration, sleep, and exercise plans work together to support your
                    body and mind during the quitting process.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Non-judgmental Approach Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <div className="mb-3">
                <Badge variant="outline">Zero Judgment</Badge>
              </div>
              <h2 className="text-3xl font-bold mb-4">Your Journey, Your Way</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                Mission Fresh is built on a foundation of non-judgment. Whether you want to quit completely, 
                reduce your consumption, or just prepare for a future quit attempt — we meet you where you are.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-600 dark:text-gray-400">Set your own goals based on what works for YOU, not someone else's expectations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-600 dark:text-gray-400">Slip-ups are treated as learning opportunities, not failures</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-600 dark:text-gray-400">Personalized support that adapts to your unique triggers and challenges</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-600 dark:text-gray-400">Supporting multiple nicotine products: cigarettes, vaping, pouches, and more</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-4">
              <div className="bg-indigo-100 dark:bg-indigo-900/40 p-6 rounded-lg">
                <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-3" />
                <h3 className="text-lg font-medium mb-2">Community Support</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Connect with others on similar journeys without fear of criticism.
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/40 p-6 rounded-lg">
                <Sunrise className="h-8 w-8 text-green-600 dark:text-green-400 mb-3" />
                <h3 className="text-lg font-medium mb-2">Fresh Start</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Every day is a new opportunity — restart anytime without shame.
                </p>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900/40 p-6 rounded-lg">
                <Coffee className="h-8 w-8 text-amber-600 dark:text-amber-400 mb-3" />
                <h3 className="text-lg font-medium mb-2">Quit Your Way</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Customizable plans that respect your preferences and lifestyle.
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/40 p-6 rounded-lg">
                <Heart className="h-8 w-8 text-green-600 dark:text-green-400 mb-3" />
                <h3 className="text-lg font-medium mb-2">Emotional Support</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Tools to manage the complex emotions that arise during quitting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 bg-green-50 dark:bg-green-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4 text-green-800 dark:text-green-400">The Benefits of Quitting Are Immediate</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Your body begins to heal as soon as you stop smoking. With Mission Fresh by your side,
              you'll track these health milestones and celebrate each achievement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center border border-green-100 dark:border-green-900/50">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-green-700 dark:text-green-500">20 Minutes</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your heart rate and blood pressure drop to normal levels, improving circulation.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center border border-green-100 dark:border-green-900/50">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-green-700 dark:text-green-500">2 Weeks</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Lung function improves and circulation gets better. Walking becomes easier.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center border border-green-100 dark:border-green-900/50">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-green-700 dark:text-green-500">1 Month</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your lungs begin to heal, reducing risk of infection and improving overall breathing.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center border border-green-100 dark:border-green-900/50">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-green-700 dark:text-green-500">1 Year</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your risk of heart disease drops to half that of a smoker. A major milestone worth celebrating!
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button onClick={handleGetStarted} size="lg" className="bg-green-600 hover:bg-green-700">
              Start Your Healing Journey
            </Button>
          </div>
        </div>
      </section>

      {/* Real Tools Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <div className="mb-3">
              <Badge variant="outline">Real Tools, Not Just Tracking</Badge>
            </div>
            <h2 className="text-3xl font-bold mb-4">Comprehensive Toolkit</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Mission Fresh provides practical tools you can use every day to overcome the challenges of quitting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Energy Management Plan</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Personalized strategies to maintain energy levels throughout the quitting process.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                    <BrainCircuit className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Craving Distraction Games</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Interactive games specifically designed to redirect your focus during cravings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                    <Smile className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Mood Management Exercises</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Tools to identify and improve your emotional state during challenging moments.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                    <Utensils className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Nutrition Planner</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Guidance on foods that support energy, focus, and mood during the quitting process.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Community Support</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Connect with other quitters to share experiences, tips, and encouragement.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                    <LineChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Progress Analytics</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Comprehensive tracking of cravings, energy, mood, and achievements over time.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-indigo-900 text-white">
        <div className="container px-4 mx-auto text-center">
          <div className="bg-indigo-800/50 p-6 rounded-xl max-w-4xl mx-auto border border-indigo-700">
            <h2 className="text-3xl font-bold mb-6">Begin Your Journey to Freedom Today</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of users who have successfully quit smoking without suffering from the energy crashes
              and mood swings that typically lead to relapse.
              <span className="block text-indigo-200 mt-2">Quitting doesn't have to be miserable. Start with Mission Fresh today.</span>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-indigo-800 p-4 rounded-lg">
                <div className="flex justify-center mb-2">
                  <Database className="h-7 w-7 text-indigo-300" />
                </div>
                <h3 className="font-semibold mb-1">Secure Data Storage</h3>
                <p className="text-sm text-indigo-200">All your progress is securely stored and synced across devices</p>
              </div>
              
              <div className="bg-indigo-800 p-4 rounded-lg">
                <div className="flex justify-center mb-2">
                  <Zap className="h-7 w-7 text-indigo-300" />
                </div>
                <h3 className="font-semibold mb-1">Personalized Methods</h3>
                <p className="text-sm text-indigo-200">Choose from 6 different quitting strategies tailored to your needs</p>
              </div>
              
              <div className="bg-indigo-800 p-4 rounded-lg">
                <div className="flex justify-center mb-2">
                  <CheckCircle className="h-7 w-7 text-indigo-300" />
                </div>
                <h3 className="font-semibold mb-1">Comprehensive Support</h3>
                <p className="text-sm text-indigo-200">Energy, mood, and craving management all in one app</p>
              </div>
            </div>
            
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-white text-indigo-900 hover:bg-indigo-100 px-8"
            >
              Begin Your Quit Journey Now
            </Button>
          </div>
        </div>
      </section>

      <div className="px-6 py-10 bg-green-50 dark:bg-green-900/20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800 dark:text-green-400 mb-4">
              Explore Our Quit Smoking Resources
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Mission Fresh offers comprehensive resources to support your journey to becoming smoke-free, including
              directories of products that can help manage cravings and reduce withdrawal symptoms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-green-100 dark:border-green-800 hover:shadow-lg transition-shadow">
              <div className="p-1 bg-gradient-to-r from-green-400 to-green-600"></div>
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 mb-4 mx-auto">
                  <Cigarette className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-center text-green-700 dark:text-green-500 mb-2">NRT Directory</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                  Browse our comprehensive directory of FDA-approved Nicotine Replacement Therapy products, including patches,
                  gums, lozenges, inhalers, and sprays.
                </p>
                <ul className="text-sm space-y-2 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Detailed product information and user reviews</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Compare effectiveness for different types of smokers</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Find where to purchase with trusted vendors</span>
                  </li>
                </ul>
                <div className="text-center">
                  <Link to="/app/nrt-directory" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Explore NRT Products
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-green-100 dark:border-green-800 hover:shadow-lg transition-shadow">
              <div className="p-1 bg-gradient-to-r from-green-400 to-green-600"></div>
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 mb-4 mx-auto">
                  <Leaf className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-center text-green-700 dark:text-green-500 mb-2">Alternative Products</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                  Discover tobacco-free alternatives that can help you manage nicotine cravings while avoiding the harmful
                  effects of tobacco smoke.
                </p>
                <ul className="text-sm space-y-2 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Smoke-free nicotine pouches, lozenges, and more</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>User reviews and ratings from the community</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Find products that fit your lifestyle and preferences</span>
                  </li>
                </ul>
                <div className="text-center">
                  <Link to="/app/alternative-products" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Explore Alternatives
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
