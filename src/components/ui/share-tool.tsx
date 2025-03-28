import React, { useState } from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog';
import { Input } from './input';
import { Copy, Twitter, Facebook, Linkedin, Mail, Check, Share2 } from 'lucide-react';

interface ShareToolProps {
  toolName: string;
  description: string;
  url?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  iconOnly?: boolean;
}

export function ShareTool({
  toolName,
  description,
  url = window.location.href,
  className = '',
  variant = 'outline',
  size = 'default',
  iconOnly = false,
}: ShareToolProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const shareText = `Check out the ${toolName} tool from Mission Fresh - ${description}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(url);
  
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent(`Mission Fresh - ${toolName}`)}&body=${encodedText}%0A%0A${encodedUrl}`
  };
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        variant={variant} 
        size={size}
        className={className}
        aria-label="Share this tool"
      >
        <Share2 className="h-4 w-4 mr-2" />
        {!iconOnly && "Share"}
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this tool</DialogTitle>
            <DialogDescription>
              Share the {toolName} tool with friends and family to help them on their fresh journey.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <Input
                id="link"
                readOnly
                value={url}
                className="w-full"
              />
            </div>
            <Button 
              size="sm" 
              className="px-3 min-w-[4rem]"
              onClick={handleCopyLink}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copy link</span>
            </Button>
          </div>
          
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-3">Share on social media</p>
            <div className="flex gap-4">
              <a 
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 hover:text-blue-500 transition-colors"
              >
                <div className="p-2 rounded-full bg-secondary">
                  <Twitter className="h-5 w-5" />
                </div>
                <span className="text-xs">Twitter</span>
              </a>
              
              <a 
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors"
              >
                <div className="p-2 rounded-full bg-secondary">
                  <Facebook className="h-5 w-5" />
                </div>
                <span className="text-xs">Facebook</span>
              </a>
              
              <a 
                href={shareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 hover:text-blue-700 transition-colors"
              >
                <div className="p-2 rounded-full bg-secondary">
                  <Linkedin className="h-5 w-5" />
                </div>
                <span className="text-xs">LinkedIn</span>
              </a>
              
              <a 
                href={shareLinks.email}
                className="flex flex-col items-center gap-1 hover:text-green-600 transition-colors"
              >
                <div className="p-2 rounded-full bg-secondary">
                  <Mail className="h-5 w-5" />
                </div>
                <span className="text-xs">Email</span>
              </a>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 