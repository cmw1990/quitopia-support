import React from 'react';
import { Button } from '@/components/ui/button';
import { Link as RouterLink } from 'react-router-dom';
import { scroller } from 'react-scroll';
import { Facebook, Twitter, Instagram, Zap, Github, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LandingFooterProps {
  className?: string;
}

interface FooterLink {
  label: string;
  href: string;
  to?: string;
  type: 'router' | 'scroll' | 'external';
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features", to: "features", type: 'scroll' },
      { label: "Pricing", href: "/pricing", type: 'router' },
      { label: "Testimonials", href: "#testimonials", to: "testimonials", type: 'scroll' },
      { label: "How It Works", href: "#how-it-works", to: "how-it-works", type: 'scroll' },
    ]
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog", type: 'router' },
      { label: "FAQ", href: "#faq", to: "faq", type: 'scroll' },
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about", type: 'router' },
      { label: "Contact", href: "/contact", type: 'router' },
      { label: "Privacy Policy", href: "/privacy", type: 'router' },
      { label: "Terms of Service", href: "/terms", type: 'router' },
    ]
  }
];

const socialLinks = [
  { label: "Twitter", icon: Twitter, href: "https://x.com/wellcharged" },
  { label: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/wellcharged" },
  { label: "GitHub", icon: Github, href: "https://github.com/wellcharged" },
];

export const LandingFooter: React.FC<LandingFooterProps> = ({ className }) => {

  const handleScrollClick = (targetId: string) => {
    scroller.scrollTo(targetId, {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart',
      offset: -60
    });
  };

  return (
    <footer className={cn(
      "border-t border-border/60 bg-muted/50 relative overflow-hidden", 
      className
    )}>
      <div className="absolute inset-0 -z-10 opacity-50 bg-gradient-to-b from-transparent via-background/5 to-background/10"></div>

      <div className="container px-4 py-12 md:px-6 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <RouterLink to="/" className="mb-4 flex items-center space-x-2">
              <Zap className="h-7 w-7 text-primary" />
              <span className="text-xl font-semibold">Easier Focus</span>
            </RouterLink>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              The comprehensive app for focus, ADHD support, and energy management.
            </p>
            <div className="mt-6 flex space-x-1">
              {socialLinks.map((social) => (
                <a 
                  key={social.label} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group"
                  aria-label={social.label}
                >
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <social.icon className="h-5 w-5 text-muted-foreground transition-all duration-200 group-hover:text-primary group-hover:scale-110" />
                  </Button>
                </a>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <div className="text-sm font-semibold tracking-wide uppercase text-foreground">
                {section.title}
              </div>
              <ul className="space-y-3 text-sm">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.type === 'scroll' && link.to ? (
                      <button
                        onClick={() => handleScrollClick(link.to!)}
                        className="text-left cursor-pointer text-muted-foreground transition-all duration-200 ease-out hover:text-foreground hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm bg-transparent border-none p-0"
                      >
                        {link.label}
                      </button>
                    ) : link.type === 'router' ? (
                      <RouterLink 
                        to={link.href} 
                        className="text-muted-foreground transition-all duration-200 ease-out hover:text-foreground hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
                      >
                        {link.label}
                      </RouterLink>
                    ) : (
                       <a 
                        href={link.href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground transition-all duration-200 ease-out hover:text-foreground hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
                      >
                        {link.label}
                       </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Easier Focus by Well-Charged. All rights reserved.
        </div>
      </div>
    </footer>
  );
};