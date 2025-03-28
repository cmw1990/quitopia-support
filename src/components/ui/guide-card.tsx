import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Clock, Bookmark, Share2, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export interface GuideCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  readingTime: number; // in minutes
  imageUrl?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  path: string;
  bookmarked?: boolean;
  onBookmark?: (id: string) => void;
  onShare?: (id: string) => void;
  className?: string;
}

export const GuideCard: React.FC<GuideCardProps> = ({
  id,
  title,
  description,
  category,
  readingTime,
  imageUrl,
  difficulty = 'beginner',
  path,
  bookmarked = false,
  onBookmark,
  onShare,
  className,
}) => {
  const difficultyColor = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      {imageUrl && (
        <div 
          className="w-full h-48 bg-cover bg-center" 
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}
      <CardHeader className="pb-2">
        <div className="flex gap-2 mb-2">
          <Badge variant="outline">{category}</Badge>
          <Badge className={difficultyColor[difficulty]}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
        </div>
        <CardTitle className="leading-tight">{title}</CardTitle>
        <CardDescription className="flex items-center mt-1">
          <Clock className="w-4 h-4 mr-1" />
          {readingTime} min read
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-2">
          {onBookmark && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1 h-8 w-8"
              onClick={() => onBookmark(id)}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark guide"}
            >
              <Bookmark className={cn("h-5 w-5", bookmarked && "fill-yellow-400 text-yellow-400")} />
            </Button>
          )}
          {onShare && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1 h-8 w-8"
              onClick={() => onShare(id)}
              aria-label="Share guide"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          )}
        </div>
        <Button asChild variant="default" size="sm" className="gap-1">
          <Link to={path}>
            Read Guide
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}; 