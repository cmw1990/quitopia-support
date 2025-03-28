import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Twitter, Facebook, Instagram, Linkedin, Share2, Link2, Download, Check, Smartphone } from 'lucide-react';

// Define social platform types
type SocialPlatform = 'twitter' | 'facebook' | 'instagram' | 'linkedIn' | 'whatsapp';

// Define share item interface
interface ShareItem {
  title: string;
  description: string;
  imageUrl?: string;
  shareUrl?: string;
  achievementId?: string;
  id?: string;
  type?: string;
}

interface SocialShareDialogProps {
  item: ShareItem;
  trigger?: React.ReactNode;
  onClose?: () => void;
  onShare?: (platform: SocialPlatform) => void;
}

export const SocialShareDialog: React.FC<SocialShareDialogProps> = ({ 
  item, 
  trigger,
  onClose,
  onShare
}) => {
  const { session } = useAuth();
  const shareRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [shareMessage, setShareMessage] = useState(
    `Check out my progress on Mission Fresh: ${item.title}. ${item.description}`
  );
  const [isPublic, setIsPublic] = useState(true);
  const [shareImage, setShareImage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if Web Share API is available
  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  // Check device on component mount
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    // Generate initial preview automatically
    generateShareImage();
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Handle platform selection
  const togglePlatform = (platform: SocialPlatform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  // Generate image for sharing
  const generateShareImage = async () => {
    if (shareRef.current) {
      try {
        setIsGeneratingImage(true);
        const canvas = await html2canvas(shareRef.current, {
          scale: 2, // Higher quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        const image = canvas.toDataURL('image/png');
        setShareImage(image);
        setIsGeneratingImage(false);
        return image;
      } catch (error) {
        console.error('Error generating share image:', error);
        toast.error('Could not generate share image');
        setIsGeneratingImage(false);
        return null;
      }
    }
    return null;
  };

  // Convert data URL to Blob
  const dataURLtoBlob = (dataURL: string) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // Share using native Web Share API
  const shareNative = async () => {
    try {
      setIsSharing(true);
      const image = shareImage || (await generateShareImage());
      let shareData: ShareData = {
        title: item.title,
        text: shareMessage,
        url: item.shareUrl || window.location.href
      };

      // If we have an image, add it to files (only works on mobile)
      if (image) {
        const blob = dataURLtoBlob(image);
        const file = new File([blob], `mission-fresh-${item.title.replace(/\s+/g, '-').toLowerCase()}.png`, { type: 'image/png' });
        shareData.files = [file];
      }

      await navigator.share(shareData);
      
      // Log the share for analytics
      logShareAnalytics('native', true);
      
      toast.success('Shared successfully!');
      
      // Call onShare callback if provided
      if (onShare) {
        onShare('twitter'); // Default to Twitter for native sharing
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Could not share. Try manual sharing instead.');
      
      // Log failed share attempt
      logShareAnalytics('native', false);
    } finally {
      setIsSharing(false);
    }
  };

  // Direct share to WhatsApp
  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${shareMessage} ${item.shareUrl || window.location.href}`);
    const whatsappUrl = `https://wa.me/?text=${text}`;
    window.open(whatsappUrl, '_blank');
    
    logShareAnalytics('whatsapp', true);
    
    if (onShare) {
      onShare('whatsapp');
    }
  };

  // Share to selected platforms
  const handleShare = async () => {
    // If Web Share API is available, use it
    if (hasNativeShare) {
      shareNative();
      return;
    }
    
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform to share to');
      return;
    }
    
    setIsSharing(true);
    const image = shareImage || (await generateShareImage());
    
    if (!image && !item.shareUrl) {
      toast.error('Nothing to share. Please generate a preview first.');
      setIsSharing(false);
      return;
    }
    
    try {
      // Handle specific platforms
      for (const platform of selectedPlatforms) {
        if (platform === 'whatsapp') {
          shareToWhatsApp();
          continue;
        }
        
        // Handle other platforms
        const shareUrl = item.shareUrl || window.location.href;
        const text = encodeURIComponent(shareMessage);
        let platformUrl = '';
        
        switch (platform) {
          case 'twitter':
            platformUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`;
            break;
          case 'facebook':
            platformUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${text}`;
            break;
          case 'instagram':
            // Instagram doesn't support direct sharing through URLs, so we'll just copy to clipboard
            toast.info('Instagram sharing requires you to copy the image and paste it in the Instagram app.');
            await navigator.clipboard.writeText(shareMessage + ' ' + shareUrl);
            break;
          case 'linkedIn':
            platformUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
            break;
        }
        
        if (platformUrl) {
          window.open(platformUrl, '_blank');
        }
        
        // Log analytics
        logShareAnalytics(platform, true);
      }
      
      toast.success(`Shared to ${selectedPlatforms.join(', ')}`);
      
      // Call onShare callback if provided
      if (onShare && selectedPlatforms.length > 0) {
        onShare(selectedPlatforms[0]);
      }
    } catch (error) {
      console.error('Error during manual sharing:', error);
      toast.error('Failed to share. Please try again.');
      
      // Log failed share attempts
      selectedPlatforms.forEach(platform => {
        logShareAnalytics(platform, false);
      });
    } finally {
      setIsSharing(false);
    }
  };

  // Log share analytics
  const logShareAnalytics = async (platform: string, success: boolean) => {
    if (!session?.user?.id) return;
    
    try {
      // Log analytics data to the backend
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/social_share_analytics`, {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          user_id: session.user.id,
          item_type: item.type || (item.achievementId ? 'achievement' : 'progress'),
          item_id: item.id || item.achievementId || 'progress',
          platform,
          success,
          is_public: isPublic,
          created_at: new Date().toISOString()
        })
      });
      
      console.log('Share analytics logged successfully:', {
        userId: session.user.id,
        itemId: item.id || item.achievementId || 'progress',
        itemTitle: item.title,
        platform,
        success,
        timestamp: new Date().toISOString(),
        isPublic
      });
    } catch (error) {
      console.error('Failed to log share analytics:', error);
    }
  };

  // Copy share link to clipboard
  const copyShareLink = () => {
    const shareUrl = item.shareUrl || window.location.href;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast.success('Link copied to clipboard');
        logShareAnalytics('clipboard', true);
      })
      .catch(() => {
        toast.error('Failed to copy link');
        logShareAnalytics('clipboard', false);
      });
  };
  
  // Download the generated image
  const downloadImage = () => {
    if (!shareImage) {
      toast.error('No image to download. Generate a preview first.');
      return;
    }
    
    const link = document.createElement('a');
    link.download = `mission-fresh-${item.title.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = shareImage;
    link.click();
    
    logShareAnalytics('download', true);
  };

  // Handle dialog close
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Get icon for platform
  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="h-4 w-4 mr-2" />;
      case 'facebook':
        return <Facebook className="h-4 w-4 mr-2" />;
      case 'instagram':
        return <Instagram className="h-4 w-4 mr-2" />;
      case 'linkedIn':
        return <Linkedin className="h-4 w-4 mr-2" />;
      case 'whatsapp':
        return <Smartphone className="h-4 w-4 mr-2" />;
      default:
        return <Share2 className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <Dialog onOpenChange={(open) => !open && handleClose()}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline">Share</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Share Your Progress</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="share" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="share">Share</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="share" className="space-y-4">
            {hasNativeShare ? (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Share using your device's native sharing</h4>
                <p className="text-xs text-gray-500">
                  You can share directly to any app on your device.
                </p>
                <Button className="w-full mt-2" onClick={shareNative}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Open Share Menu
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Share to:</h4>
                <div className="grid grid-cols-3 gap-2">
                  {(['twitter', 'facebook', 'instagram', 'linkedIn', 'whatsapp'] as unknown as SocialPlatform[]).map(platform => (
                    <Button
                      key={platform}
                      variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePlatform(platform)}
                      className="capitalize flex items-center justify-center"
                    >
                      {getPlatformIcon(platform)}
                      <span className="hidden sm:inline">{platform}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="share-message">Message</Label>
              <Input
                id="share-message"
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="public-share"
                checked={isPublic}
                onCheckedChange={(checked) => setIsPublic(checked as boolean)}
              />
              <Label htmlFor="public-share">Share publicly on Mission Fresh</Label>
            </div>
            
            <div className="border-t pt-2 mt-2">
              <Badge variant="outline" className="mr-2 mb-2">
                #MissionFresh
              </Badge>
              <Badge variant="outline" className="mr-2 mb-2">
                #SmokeFree
              </Badge>
              <Badge variant="outline" className="mb-2">
                #HealthyChoices
              </Badge>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            <div 
              ref={shareRef} 
              className="p-4 bg-white rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <img 
                  src="/logo.png" 
                  alt="Mission Fresh Logo" 
                  className="w-8 h-8" 
                />
                <h3 className="font-bold">Mission Fresh</h3>
              </div>
              
              <h4 className="font-semibold mb-1">{item.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              
              {item.imageUrl && (
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-auto rounded-md mb-2" 
                />
              )}
              
              <div className="text-xs text-gray-500 mt-2">
                Shared via Mission Fresh App
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateShareImage}
              className="w-full"
              disabled={isGeneratingImage}
            >
              {isGeneratingImage ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  Generating...
                </>
              ) : (
                shareImage ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Regenerate Preview
                  </>
                ) : (
                  'Generate Preview'
                )
              )}
            </Button>
            
            {shareImage && (
              <div className="border rounded-md p-2 mt-2">
                <p className="text-xs text-gray-500 mb-2">Preview generated</p>
                <img 
                  src={shareImage} 
                  alt="Share Preview" 
                  className="w-full h-auto rounded-md" 
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex flex-wrap gap-2 justify-between sm:justify-end">
          <Button variant="outline" onClick={() => {
            copyShareLink();
            handleClose();
          }} className="flex-1 sm:flex-initial" size="sm">
            <Link2 className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          <Button variant="outline" onClick={() => {
            downloadImage();
            handleClose();
          }} className="flex-1 sm:flex-initial" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={() => {
            handleShare();
            // Note: We don't close immediately after handleShare as it's async
            // The share operation will call onShare which should handle closing
          }} disabled={isSharing} className="flex-1 sm:flex-initial" size="sm">
            {isSharing ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                Sharing...
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};