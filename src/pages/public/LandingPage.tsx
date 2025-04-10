import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
    ArrowRight, 
    CheckCircle, 
    Clock, 
    ListChecks, 
    Zap, 
    HeartPulse, 
    BrainCircuit, 
    Users, 
    ShieldCheck, 
    Trophy, 
    BarChart3, 
    Gamepad2
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer'; // Assuming Footer exists
import { Header } from '@/components/layout/Header'; // Assuming Header exists

// Feature List
const features = [
  { title: "Adaptive Pomodoro Timer", description: "Tailor focus/break intervals to your unique rhythm.", icon: Clock },
  { title: "Smart Task Breakdown", description: "Deconstruct overwhelming tasks into manageable steps.", icon: ListChecks },
  { title: "Energy Level Mapping", description: "Visualize and optimize your daily energy fluctuations.", icon: Zap },
  { title: "Mood & Focus Correlation", description: "Understand how your mood impacts your concentration.", icon: HeartPulse },
  { title: "Personalized Strategies", description: "Discover techniques that resonate with your focus style.", icon: BrainCircuit },
  { title: "Body Doubling Rooms", description: "Stay accountable and focused alongside peers.", icon: Users },
  { title: "Distraction Shield (Concept)", description: "Minimize interruptions during deep work sessions.", icon: ShieldCheck },
  { title: "Gamified Progress", description: "Earn achievements and track your focus milestones.", icon: Trophy },
  { title: "Insightful Analytics", description: "Gain clarity on your productivity patterns.", icon: BarChart3 },
  { title: "Focus Training Games", description: "Sharpen cognitive skills with engaging exercises.", icon: Gamepad2 },
];

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 via-blue-50 to-white dark:from-gray-950 dark:via-blue-950 dark:to-gray-900 text-gray-800 dark:text-gray-200">
      {/* Assume Header component handles nav links and theme toggle */}
      <Header /> 

      {/* Hero Section */}
      <motion.section 
        className="flex-grow container mx-auto px-4 py-20 md:py-32 flex flex-col items-center text-center"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.h1 
          className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400"
          variants={fadeInUp}
        >
          Find Your Flow, Effortlessly.
        </motion.h1>
        <motion.p 
          className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto"
          variants={fadeInUp}
        >
          EasierFocus combines science-backed techniques with a calm, intuitive design to help you conquer distractions, manage energy, and achieve deep focus – tailored for the ADHD mind.
        </motion.p>
        <motion.div variants={fadeInUp}>
          <Link to="/auth/signup">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-shadow duration-300 px-8 py-3">
              Start Focusing for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
        {/* Optional: Add subtle graphic/animation here */}
      </motion.section>

      {/* Features Section */}
      <section className="py-20 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            Tools Designed for Your Mind
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700/50"
                variants={fadeInUp}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg">
                     <feature.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{feature.title}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* How it Works / Philosophy Section (Placeholder) */}
      <section className="py-20 md:py-24 bg-gradient-to-b from-blue-50/50 to-purple-50/30 dark:from-blue-950/50 dark:to-purple-950/30">
          <div className="container mx-auto px-4 text-center max-w-3xl">
              <motion.h2 
                  className="text-3xl md:text-4xl font-bold mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5 }}
              >
                  Focus on What Matters
              </motion.h2>
              <motion.p 
                  className="text-lg text-gray-600 dark:text-gray-300 mb-10"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
              >
                  EasierFocus isn't about forcing productivity. It's about understanding your unique cognitive style and providing flexible, adaptive tools that work *with* you, not against you. We leverage evidence-based strategies in a calm, encouraging environment.
              </motion.p>
              {/* Could add bullet points or simple graphics here */}
          </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white dark:bg-gray-900">
           <div className="container mx-auto px-4 text-center">
               <motion.h2 
                   className="text-2xl md:text-3xl font-bold mb-6"
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true, amount: 0.3 }}
                   transition={{ duration: 0.5 }}
               >
                   Ready to experience calmer focus?
               </motion.h2>
               <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true, amount: 0.3 }}
                   transition={{ duration: 0.5, delay: 0.1 }}
               >
                    <Link to="/auth/signup">
                        <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-shadow duration-300 px-8 py-3">
                        Join EasierFocus Today <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
               </motion.div>
           </div>
      </section>

      {/* Assume Footer component handles copyright etc. */}
      <Footer /> 
    </div>
  );
}