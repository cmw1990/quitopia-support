import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Brain, Calendar, Coffee, BarChart2, Clock, Shield, Zap, Check, Sparkles, Users, BookOpen, Download, Laptop, Smartphone, HeartPulse, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import FeaturesSection from './landing/FeaturesSection'
import TestimonialsSection from './landing/TestimonialsSection'
import PricingSection from './landing/PricingSection'
import CallToActionSection from './landing/CallToActionSection'
import { Footer } from './Footer'
import { handleImageError, getSecureImageUrl } from '@/utils/image-utils'

export function LandingPage() {
  const navigate = useNavigate()
  
  const features = [
    {
      icon: <Brain className="h-10 w-10 text-primary" />,
      title: 'Focus Enhancement',
      description: 'Powerful techniques to improve concentration and minimize distractions, especially designed for those with ADHD.'
    },
    {
      icon: <Clock className="h-10 w-10 text-blue-500" />,
      title: 'Smart Focus Timer',
      description: 'Enhanced Pomodoro timer with distraction tracking and focus metrics to maximize your productivity.'
    },
    {
      icon: <Zap className="h-10 w-10 text-yellow-500" />,
      title: 'Energy Management',
      description: 'Track and optimize your physical, mental, and emotional energy levels throughout the day.'
    },
    {
      icon: <Shield className="h-10 w-10 text-green-500" />,
      title: 'Anti-Distraction Tools',
      description: 'Practical strategies and tools to block distractions and maintain your attention on what matters.'
    },
    {
      icon: <BarChart2 className="h-10 w-10 text-purple-500" />,
      title: 'Progress Analytics',
      description: 'Comprehensive insights into your focus habits, patterns, and improvements over time.'
    },
    {
      icon: <Calendar className="h-10 w-10 text-orange-500" />,
      title: 'Routine Builder',
      description: 'Create and maintain healthy routines that work with your natural energy patterns.'
    }
  ]
  
  const adhd_tools = [
    {
      icon: <Sparkles className="h-8 w-8 text-fuchsia-500" />,
      title: 'Executive Function Support',
      description: 'Tools to assist with planning, organization, time management, and task prioritization.',
      benefits: [
        'Task breakdown assistance',
        'Time estimation guidance',
        'Organization strategies',
        'Prioritization frameworks'
      ]
    },
    {
      icon: <HeartPulse className="h-8 w-8 text-rose-500" />,
      title: 'Emotional Regulation',
      description: 'Techniques to manage emotional responses and reduce overwhelm.',
      benefits: [
        'Stress reduction exercises',
        'Emotion tracking tools',
        'Mindfulness techniques',
        'Overwhelm prevention strategies'
      ]
    },
    {
      icon: <Shield className="h-8 w-8 text-emerald-500" />,
      title: 'Distraction Management',
      description: 'Custom solutions to identify and block common ADHD distraction triggers.',
      benefits: [
        'Website & app blocking',
        'Environmental optimization',
        'Notification management',
        'Focus environment creator'
      ]
    },
    {
      icon: <Users className="h-8 w-8 text-sky-500" />,
      title: 'Body Doubling',
      description: 'Virtual accountability partners and community support for enhanced focus.',
      benefits: [
        'Virtual co-working sessions',
        'Accountability partnerships',
        'Community challenges',
        'Focus tracking with friends'
      ]
    }
  ]
  
  const platforms = [
    {
      icon: <Laptop className="h-10 w-10 text-slate-700 dark:text-slate-300" />,
      title: 'Web Application',
      description: 'Access all features from any browser with our comprehensive web platform.',
      buttonText: 'Explore WebApp',
      action: () => navigate('/web-app')
    },
    {
      icon: <Smartphone className="h-10 w-10 text-slate-700 dark:text-slate-300" />,
      title: 'Mobile App',
      description: 'Take your focus tools on the go with our native iOS and Android applications.',
      buttonText: 'Learn About Mobile',
      action: () => navigate('/mobile-app')
    },
    {
      icon: <BookOpen className="h-10 w-10 text-slate-700 dark:text-slate-300" />,
      title: 'Focus Tools',
      description: 'Use our standalone tools without creating an account for quick focus help.',
      buttonText: 'Try Web Tools',
      action: () => navigate('/web-tools')
    }
  ]
  
  const testimonials = [
    {
      quote: "Easier Focus has completely transformed how I manage my day. As someone with ADHD, I've tried dozens of apps, but this is the first one that actually understands my challenges.",
      author: "Jamie T.",
      role: "Software Developer",
      image: "/images/default-avatar.svg"
    },
    {
      quote: "The energy management feature is a game-changer. I now understand my productivity patterns and can plan my day accordingly. My work output has increased by at least 30%.",
      author: "Alex M.",
      role: "Marketing Director",
      image: "/images/default-avatar.svg"
    },
    {
      quote: "I love how this app combines focus techniques with energy management. It's like having a personal productivity coach in my pocket at all times.",
      author: "Sam R.",
      role: "Graduate Student",
      image: "/images/default-avatar.svg"
    },
    {
      quote: "After being diagnosed with ADHD at 35, I was looking for ways to manage my symptoms better. This app's ADHD-specific tools have given me structure I never had before.",
      author: "Riley J.",
      role: "Graphic Designer",
      image: "/images/default-avatar.svg"
    }
  ]
  
  const benefits = [
    "Increased productivity and focus",
    "Reduced distractions and procrastination",
    "Better energy management throughout the day",
    "Improved work-life balance",
    "Decreased mental fatigue and burnout",
    "Greater sense of accomplishment",
    "Personalized strategies for your unique challenges"
  ]
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-4 py-1.5 px-3 text-sm border-primary/50 text-primary shadow-sm">
                Neurodiversity-First Focus Platform
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
                Reclaim Your Focus,<br />
                <span className="text-primary">Master Your Productivity</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 md:max-w-xl">
                The world's most comprehensive suite of tools for focus enhancement, energy management, and distraction control. Engineered for ADHD, designed for everyone seeking peak performance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/register')}
                  className="gap-2 shadow-lg hover:shadow-primary/30 transition-shadow duration-300"
                >
                  Get Started - It's Free <ArrowRight className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Explore Features
                </Button>
              </div>
            </motion.div>
            
            <motion.div 
              className="md:w-1/2 mt-10 md:mt-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative aspect-[16/10] bg-gradient-to-br from-primary/10 via-background to-muted rounded-xl shadow-2xl overflow-hidden border border-border/50 p-2">
                <div className="w-full h-full bg-background rounded-lg flex items-center justify-center text-muted-foreground">
                  <img 
                    src={getSecureImageUrl('/images/hero-image.png', 'hero')}
                    alt="Easier Focus App Interface Preview" 
                    className="w-full h-full object-cover rounded-md"
                    onError={(e) => handleImageError(e, 'hero')}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50"></div>
        <motion.div 
          className="absolute -top-20 -right-32 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl opacity-40"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
      </section>
      
      {/* Features Section - REMOVING THIS as FeaturesSection component is used later */}
      {/* 
      <section id="features" className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-3">Core Pillars</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Unlock Peak Performance</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Easier Focus integrates evidence-based techniques into a seamless experience designed for sustained focus and energy.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="h-full"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <Card className="h-full flex flex-col transform transition-all duration-300 hover:scale-[1.03] hover:shadow-lg dark:hover:shadow-primary/20">
                  <CardHeader>
                    <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit">{feature.icon}</div>
                    <CardTitle className="text-xl tracking-tight">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                  {feature.title === 'Smart Focus Timer' && (
                    <CardFooter>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-primary" 
                        onClick={() => navigate('/app/focus-timer')}
                      >
                        Try the Timer <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      */}
      
      {/* ADHD Support Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-3 border-fuchsia-500/50 text-fuchsia-500">Tailored for Neurodiversity</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">ADHD-Specific Support Tools</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Tools designed with ADHD challenges in mind, promoting structure, reducing overwhelm, and supporting executive functions.
            </p>
          </motion.div>
          
          <Tabs defaultValue={adhd_tools[0].title} className="w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex justify-center mb-10"
            >
              {/* Enhanced TabsList styling */}
              <TabsList className="grid w-full max-w-2xl grid-cols-2 md:grid-cols-4 h-auto p-1.5 bg-muted rounded-lg shadow-inner gap-1">
                {adhd_tools.map((tool) => (
                  <TabsTrigger 
                    key={tool.title} 
                    value={tool.title} 
                    className="flex-1 py-2.5 px-2 text-xs sm:text-sm rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200 ease-in-out hover:bg-background/60"
                  >
                    <div className="flex items-center justify-center gap-2 font-medium">
                      {React.cloneElement(tool.icon, { className: "h-5 w-5 flex-shrink-0" })}
                      <span className="truncate">{tool.title}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </motion.div>
            
            <div className="relative"> {/* Added relative container for potential absolute positioning inside TabsContent */}
              {adhd_tools.map((tool) => (
                <TabsContent 
                  key={tool.title} 
                  value={tool.title} 
                  className="focus-visible:ring-0 focus-visible:ring-offset-0" // Remove potential focus rings
                >
                  <motion.div
                    key={tool.title} // Add key here for animation reset on tab change
                    initial={{ opacity: 0.5, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} // Add exit animation
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {/* Enhanced Card Styling */}
                    <Card className="bg-gradient-to-br from-background via-muted/50 to-background border border-border/60 rounded-xl shadow-md overflow-hidden">
                      <CardHeader className="p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                          <div className="p-3 bg-primary/10 rounded-lg w-fit flex-shrink-0">
                            {React.cloneElement(tool.icon, { className: "h-7 w-7" })}
                          </div>
                          <div className="flex-grow">
                            <CardTitle className="text-xl md:text-2xl font-semibold tracking-tight">{tool.title}</CardTitle>
                            <CardDescription className="text-base md:text-lg mt-1 text-muted-foreground/90">{tool.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 md:p-8 pt-0">
                        <h4 className="font-semibold mb-4 text-lg text-foreground">Key Benefits:</h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                          {tool.benefits.map((benefit, idx) => (
                            <motion.li 
                              key={idx} 
                              className="flex items-start gap-3"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: idx * 0.05 }}
                            >
                              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5 bg-green-500/10 p-0.5 rounded-full" />
                              <span className="text-sm md:text-base text-muted-foreground">{benefit}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </section>
      
      {/* Science Behind Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-3 border-blue-500/50 text-blue-500">Evidence-Based Approach</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Grounded in Science</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Easier Focus isn't just guesswork. Our tools and techniques are rooted in cognitive science and neurodiversity research to deliver real results.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="h-8 w-8 text-primary" />,
                title: "Cognitive Load Theory",
                description: "We help you manage mental effort, breaking down complex tasks to prevent overwhelm and maintain focus momentum."
              },
              {
                icon: <Sparkles className="h-8 w-8 text-yellow-500" />,
                title: "Dopamine Regulation Support",
                description: "Our gamification and reward systems are designed to align with ADHD neurochemistry, boosting motivation and task completion."
              },
              {
                icon: <Clock className="h-8 w-8 text-green-500" />,
                title: "Behavioral Activation",
                description: "Structured routines and micro-task management encourage starting and completing tasks, combating procrastination."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="h-full"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <Card className="h-full text-center bg-background">
                  <CardHeader className="items-center">
                    <div className="mb-4 p-3 bg-blue-500/10 rounded-lg w-fit">{item.icon}</div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{item.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <Button variant="link" onClick={() => navigate('/science')} className="text-primary">
              Learn More About Our Approach <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* Benefits Section - REMOVING THIS */}
      {/* 
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Unlock Your Potential</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience tangible benefits by incorporating Easier Focus into your daily routine.
            </p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* Pricing Section */}
      <PricingSection />
      
      {/* Footer */}
      <Footer />
    </div>
  )
} 