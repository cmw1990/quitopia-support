import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Github, Twitter, Linkedin } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <motion.footer 
      className="bg-background border-t border-border/50 py-12 mt-16"
      variants={footerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="flex justify-center md:justify-start items-center gap-2 mb-3">
              <Brain className="h-7 w-7 text-primary"/>
              <span className="font-semibold text-xl text-foreground">Easier Focus</span>
            </div>
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Well-Charged Inc. All rights reserved.</p>
          </div>
          
          <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-sm">
            <Link to="/features" className="text-muted-foreground hover:text-primary transition-colors duration-200">Features</Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors duration-200">Pricing</Link>
            <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors duration-200">Contact Us</Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors duration-200">Privacy Policy</Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors duration-200">Terms of Service</Link>
          </nav>
        </div>
        
        {/* Optional: Separator and Social Links */}
        {/* 
        <Separator className="my-8 bg-border/50" />
        <div className="flex justify-center gap-6">
          <Link to="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
            <Twitter className="h-5 w-5" />
          </Link>
          <Link to="#" aria-label="GitHub" className="text-muted-foreground hover:text-primary transition-colors">
            <Github className="h-5 w-5" />
          </Link>
          <Link to="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
            <Linkedin className="h-5 w-5" />
          </Link>
        </div> 
        */}
      </div>
    </motion.footer>
  )
} 