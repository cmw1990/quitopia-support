import React, { Fragment } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { handleImageError, getSecureImageUrl } from '@/utils/image-utils';

const testimonialsData = [
  {
    quote: "Easier Focus has completely transformed how I manage my ADHD. The task breakdown tool helps me tackle even the most overwhelming projects.",
    author: "Alex Johnson",
    role: "Software Developer",
    rating: 5,
    avatar: "/images/default-avatar.svg"
  },
  {
    quote: "The energy management feature helped me identify my peak productivity hours and schedule my most important tasks accordingly. Game changer!",
    author: "Sarah Miller",
    role: "Marketing Executive",
    rating: 5,
    avatar: "/images/default-avatar.svg"
  },
  {
    quote: "I used to struggle with constant distractions, but the distraction blocker and pomodoro timer have helped me stay on track like never before.",
    author: "Michael Thompson",
    role: "Graphic Designer",
    rating: 4,
    avatar: "/images/default-avatar.svg"
  },
  {
    quote: "As someone with chronic fatigue, the energy tracking tools have been invaluable in managing my limited energy throughout the day.",
    author: "Jamie Lee",
    role: "College Student",
    rating: 5,
    avatar: "/images/default-avatar.svg"
  }
];

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const gridVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80 } }
};

const TestimonialsSection: React.FC = () => {
  return (
    <motion.section 
      id="testimonials"
      className="w-full py-16 md:py-24 lg:py-32 bg-muted/40 relative overflow-hidden"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Subtle background noise pattern - Corrected SVG embedding */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      ></div>
      
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16 md:mb-20">
          <motion.div 
            className="inline-block rounded-lg bg-primary/10 border border-primary/20 px-3 py-1 text-sm font-medium text-primary shadow-sm"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            What Users Say
          </motion.div>
          <motion.h2 
            className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Don't Just Take Our Word For It
          </motion.h2>
          <motion.p 
            className="max-w-[900px] text-muted-foreground md:text-xl/relaxed"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Hear from real users who transformed their focus and productivity with Easier Focus.
          </motion.p>
        </div>
        
        <motion.div 
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {testimonialsData.map((testimonial, i) => (
            <motion.div key={i} variants={itemVariants} className="group/card">
              <Card className={cn(
                "flex flex-col h-full bg-card rounded-xl overflow-hidden border border-border/50 relative",
                "transition-all duration-300 ease-out",
                "hover:shadow-lg hover:shadow-muted/15 hover:border-border/80 hover:-translate-y-1 hover:scale-[1.01]"
              )}>
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-background/10 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                
                <CardContent className="p-6 flex flex-col flex-grow relative z-10">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400 transition-transform duration-200 group-hover/card:scale-110" />
                    ))}
                    {[...Array(5 - testimonial.rating)].map((_, j) => (
                      <Star key={j + testimonial.rating} className="h-5 w-5 text-muted-foreground/30 transition-transform duration-200 group-hover/card:scale-90" />
                    ))}
                  </div>
                  <div className="relative flex-grow mb-5">
                    <Quote className="absolute -top-2 -left-3 h-8 w-8 text-primary/20 transform -scale-x-100" aria-hidden="true" />
                    <blockquote className="pl-4">
                      <p className="text-md text-foreground/80 italic leading-relaxed">{testimonial.quote}</p>
                    </blockquote>
                    <Quote className="absolute -bottom-2 -right-1 h-8 w-8 text-primary/20" aria-hidden="true" />
                  </div>
                  <div className="mt-auto flex items-center gap-4 pt-5 border-t border-border/50">
                    <Avatar className="h-11 w-11 border-2 border-primary/10 transition-transform duration-300 group-hover/card:scale-105">
                      <AvatarImage 
                        src={getSecureImageUrl(testimonial.avatar, 'avatar')} 
                        alt={testimonial.author} 
                        onError={(e) => handleImageError(e, 'avatar')}
                      />
                      <AvatarFallback 
                        className="avatar-fallback text-sm font-semibold bg-muted text-muted-foreground"
                        style={{ display: 'flex'}} // Ensure fallback shows initially
                       >
                         {testimonial.author.split(' ').map(n => n[0]).join('').toUpperCase()}
                       </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default TestimonialsSection;