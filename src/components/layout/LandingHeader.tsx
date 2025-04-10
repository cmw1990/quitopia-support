import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link as ScrollLink, scroller } from 'react-scroll';
import { Button } from '@/components/ui/button';
import { Zap, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion'; // Added framer-motion import

interface LandingHeaderProps {
  className?: string;
}

const navLinks = [
  { label: "Features", to: "features" },
  { label: "Pricing", to: "pricing" },
  { label: "Testimonials", to: "testimonials" },
];

export const LandingHeader: React.FC<LandingHeaderProps> = ({ className }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      
      // Update active link based on scroll position
      let currentSection = '';
      navLinks.forEach(link => {
        const element = document.getElementById(link.to);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Consider a section active if its top is within the top half of the viewport
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= 100) { 
            currentSection = link.to;
          }
        }
      });
      setActiveLink(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial scroll position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLinkClick = (to: string) => {
    setIsMobileMenuOpen(false); // Close menu on link click
    setActiveLink(to); // Set active link immediately for visual feedback
    scroller.scrollTo(to, {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart',
      offset: -60 // Adjust offset based on header height
    });
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b transition-all duration-300 ease-out",
      isScrolled ? "border-border/60 bg-background/90 backdrop-blur-lg shadow-sm" : "border-transparent bg-background/80 backdrop-blur-md",
      className
    )}>
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <RouterLink to="/" className="flex items-center space-x-2 mr-6" onClick={() => handleLinkClick('hero') /* Scroll to top if needed */}>
          <Zap className="h-6 w-6 text-primary transition-transform duration-300 hover:scale-110" />
          <span className="font-bold sm:inline-block">Easier Focus</span>
        </RouterLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <ScrollLink
              key={link.label}
              to={link.to}
              spy={true}
              smooth={true}
              offset={-60}
              duration={800}
              onSetActive={() => setActiveLink(link.to)} // Update active state via react-scroll
              onClick={() => handleLinkClick(link.to)} // Handle click for immediate feedback if needed
              className={cn(
                "cursor-pointer transition-colors duration-200 hover:text-primary",
                activeLink === link.to ? "text-primary font-semibold" : "text-muted-foreground"
              )}
            >
              {link.label}
            </ScrollLink>
          ))}
        </nav>

        {/* Auth Buttons (Desktop) */}
        <div className="hidden md:flex items-center space-x-2">
          <RouterLink
            to="/easier-focus/auth/login" 
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            Log in
          </RouterLink>
          <RouterLink to="/easier-focus/auth/signup"> 
            <Button size="sm" variant="outline" className="transition-all duration-200 hover:border-primary hover:text-primary">
              Sign Up Free
            </Button>
          </RouterLink>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu} aria-label="Toggle menu">
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 w-full bg-background/95 backdrop-blur-lg border-b border-border/60 shadow-md md:hidden p-4"
        >
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <ScrollLink
                key={link.label}
                to={link.to}
                spy={true}
                smooth={true}
                offset={-60}
                duration={800}
                onClick={() => handleLinkClick(link.to)}
                className={cn(
                  "cursor-pointer text-base font-medium transition-colors duration-200 hover:text-primary",
                  activeLink === link.to ? "text-primary" : "text-foreground"
                )}
              >
                {link.label}
              </ScrollLink>
            ))}
            <div className="border-t border-border/50 pt-4 flex flex-col space-y-3">
              <RouterLink
                to="/easier-focus/auth/login"
                onClick={toggleMobileMenu}
                className={cn(
                  "inline-flex h-10 items-center justify-center rounded-md bg-transparent px-4 py-2 text-base font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                )}
              >
                Log in
              </RouterLink>
              <RouterLink to="/easier-focus/auth/signup" onClick={toggleMobileMenu}>
                <Button size="sm" className="w-full" variant="default">
                  Sign Up Free
                </Button>
              </RouterLink>
            </div>
          </nav>
        </motion.div>
      )}
    </header>
  );
};