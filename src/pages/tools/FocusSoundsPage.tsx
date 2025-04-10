import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Headphones, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FocusSounds } from '@/components/tools/FocusSounds';
import { TopNav } from '@/components/layout/TopNav';

export function FocusSoundsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopNav />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="flex items-center mb-2">
            <Button variant="ghost" size="sm" asChild className="mr-2">
              <Link to="/web-tools">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Tools
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="p-3 bg-primary/10 rounded-lg mr-4">
              <Headphones className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Focus Sounds</h1>
              <p className="text-lg text-muted-foreground mt-1">
                Create your perfect audio environment for deep work and relaxation
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <FocusSounds />
          
          <div className="mt-10 space-y-6">
            <div className="bg-muted/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">Why Ambient Sounds Help Focus</h2>
              <p className="text-muted-foreground mb-4">
                Research has shown that ambient noise can improve cognitive function and concentration, 
                especially for people with ADHD. Background sounds mask distracting noises and create a 
                consistent audio environment that helps maintain focus during work sessions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-background p-4 rounded-lg">
                  <h3 className="font-medium mb-1">White Noise</h3>
                  <p className="text-sm text-muted-foreground">
                    Best for masking variable background noises and general distraction reduction.
                  </p>
                </div>
                <div className="bg-background p-4 rounded-lg">
                  <h3 className="font-medium mb-1">Pink & Brown Noise</h3>
                  <p className="text-sm text-muted-foreground">
                    More natural sounding than white noise, better for extended work sessions.
                  </p>
                </div>
                <div className="bg-background p-4 rounded-lg">
                  <h3 className="font-medium mb-1">Nature Sounds</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a calming environment that reduces stress and improves focus.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">Ready for More Focus Tools?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Create an account to save your sound preferences, track your focus sessions,
              and access our complete suite of productivity tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/register">
                  Create Free Account 
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/web-tools">
                  Explore Other Tools
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 border-t mt-10">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Easier Focus | All Rights Reserved</p>
          <div className="mt-2">
            <Link to="/privacy" className="hover:text-primary transition-colors mx-2">Privacy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors mx-2">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default FocusSoundsPage; 