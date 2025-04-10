import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, Image, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useToast } from "@/hooks/use-toast";
import { handleImageError, getSecureImageUrl } from "@/utils/image-utils";

interface PhotoUploadProps {
  supplementName: string;
  onPhotoUploaded: (url: string) => void;
  currentImageUrl?: string;
}

export function PhotoUpload({ supplementName, onPhotoUploaded, currentImageUrl }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('supplementName', supplementName);

      const { data, error } = await supabase.functions.invoke('upload-supplement-photo', {
        body: formData,
      });

      if (error) throw error;
      
      const secureUrl = getSecureImageUrl(data.url, 'supplement');
      setPreviewUrl(secureUrl);
      onPhotoUploaded(data.url);
      
      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="photo">Photo</Label>
      {previewUrl && (
        <div className="mb-2 relative w-24 h-24 rounded overflow-hidden border border-border">
          <img 
            src={previewUrl}
            alt={supplementName}
            className="w-full h-full object-cover"
            onError={(e) => handleImageError(e, 'supplement')}
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isUploading}
        >
          <Label htmlFor="photo" className="cursor-pointer flex items-center gap-2">
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : previewUrl ? (
              <Image className="h-4 w-4" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            {previewUrl ? "Change Photo" : "Upload Photo"}
          </Label>
        </Button>
        <input
          type="file"
          id="photo"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
    </div>
  );
}