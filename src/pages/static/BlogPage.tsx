import React from 'react';
import { LandingLayout } from '../../components/layout/LandingLayout'; // Use relative path
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Placeholder blog posts
const blogPosts = [
  {
    id: '1',
    title: 'Mastering the Pomodoro Technique for Maximum Focus',
    date: 'March 15, 2025',
    excerpt: 'Learn how the classic time management method can help you beat procrastination and stay focused throughout your workday...',
    slug: 'mastering-pomodoro' // For future linking
  },
  {
    id: '2',
    title: 'Understanding Your Energy Cycles: A Key to Productivity',
    date: 'March 10, 2025',
    excerpt: 'Discover how tracking your energy levels can unlock peak performance and help you manage chronic fatigue effectively...',
    slug: 'understanding-energy-cycles'
  },
  {
    id: '3',
    title: 'Strategies for Managing ADHD in the Workplace',
    date: 'March 5, 2025',
    excerpt: 'Practical tips and tools to navigate workplace challenges and leverage the strengths associated with ADHD...',
    slug: 'adhd-workplace-strategies'
  }
];

const BlogPage: React.FC = () => {
  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <h1 className="text-4xl font-bold tracking-tight text-center mb-8 md:mb-12">
          Easier Focus Blog
        </h1>
        <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
          Tips, insights, and strategies for focus, productivity, ADHD management, and sustainable energy.
        </p>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-card p-6 rounded-lg shadow-md border border-border/50 flex flex-col">
              <h2 className="text-xl font-semibold mb-2 text-foreground">{post.title}</h2>
              <p className="text-sm text-muted-foreground mb-4">{post.date}</p>
              <p className="text-foreground/80 flex-grow mb-6">{post.excerpt}</p>
              {/* TODO: Link to actual blog post page when created */}
              <Link to={`/blog/${post.slug}`} className="mt-auto">
                <Button variant="outline" className="w-full">Read More</Button>
              </Link>
            </div>
          ))}
        </div>
        {/* TODO: Add pagination or load more functionality */}
      </div>
    </LandingLayout>
  );
};

export default BlogPage;
