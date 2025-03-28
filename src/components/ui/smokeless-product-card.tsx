import React from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductRating } from "./product-rating";
import { Heart, Info, Leaf } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ExternalLink,
  Star,
  ShieldCheck,
  AlertTriangle,
  DollarSign,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { authenticatedRestCall } from '@/lib/supabase/rest-client';
import { useAuth } from '../AuthProvider';
import { formatCurrency } from '@/lib/utils';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { trackAffiliateClick, EnhancedSmokelessProduct } from '@/utils/affiliateTracking';

// Types for product data
export type ProductCategory = 
  | "nicotine_pouch" 
  | "gum" 
  | "lozenge" 
  | "patch" 
  | "inhaler" 
  | "mouth_spray" 
  | "toothpick" 
  | "other";

export type ProductStrength = 
  | "very_low" 
  | "low" 
  | "medium" 
  | "high" 
  | "very_high";

export interface SmokelessProduct {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  strength: ProductStrength;
  nicotineContent: number;
  flavors: string[];
  image: string;
  price: number;
  rating: number;
  reviewCount: number;
  description: string;
  highlights?: string[];
  concerns?: string[];
  inStock: boolean;
  isNatural: boolean;
  isNew?: boolean;
  vendor_id: string;
  country_availability: string[];
  affiliateUrl?: string;
  isAffiliate?: boolean;
  affiliateDiscount?: string;
}

export interface SmokelessProductCardProps {
  product: SmokelessProduct | EnhancedSmokelessProduct;
  layout?: 'grid' | 'list';
  onClick?: (product: SmokelessProduct | EnhancedSmokelessProduct) => void;
}

export const SmokelessProductCard: React.FC<SmokelessProductCardProps> = ({
  product,
  layout = 'grid',
  onClick,
}) => {
  const { session } = useAuth();
  
  // Format the product category for display
  const formatCategory = (category: string): string => {
    return category
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };
  
  // Format the product strength for display
  const formatStrength = (strength: string): string => {
    return strength
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };
  
  // Get style for strength badge
  const getStrengthBadgeStyle = (strength: string) => {
    switch(strength) {
      case "very_low":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "very_high":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  };
  
  // Truncate description
  const truncateDescription = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // Track affiliate link click
  const handleAffiliateClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticFeedback.medium();
    
    // Track the click
    if (session) {
      await trackAffiliateClick(
        product as EnhancedSmokelessProduct,
        {
          position: 0,
          list: 'Product Directory',
          referrer: window.location.pathname,
          discount: product.affiliateDiscount ? parseFloat(product.affiliateDiscount) : undefined
        }
      );
    }
    
    // Open the affiliate link in a new tab
    if (product.affiliateUrl) {
      window.open(product.affiliateUrl, '_blank');
    }
  };

  if (layout === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.2 }}
        onClick={() => onClick && onClick(product)}
        className="cursor-pointer"
      >
        <Card className="overflow-hidden h-full">
          <div className="flex">
            <div className="flex-shrink-0 w-[120px] h-[120px] bg-muted relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.isNew && (
                <Badge className="absolute top-2 left-2 bg-blue-500">New</Badge>
              )}
              {product.isAffiliate && (
                <Badge 
                  variant="outline" 
                  className="absolute bottom-2 left-2 bg-amber-100 text-amber-800 border-amber-200"
                >
                  <DollarSign className="h-3 w-3 mr-1" />
                  Partner
                </Badge>
              )}
            </div>
            <div className="flex-1 flex flex-col">
              <CardHeader className="p-3 pb-1">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-base">{product.name}</CardTitle>
                    <CardDescription className="text-xs">{product.brand}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-1 text-xs">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span>{product.rating}</span>
                    <span className="text-muted-foreground">({product.reviewCount})</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-1 pb-0 flex-1">
                <div className="flex gap-1 mb-1 flex-wrap">
                  <Badge variant="secondary" className="text-xs font-normal">
                    {formatCategory(product.category)}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-normal">
                    {formatStrength(product.strength)}
                  </Badge>
                  {product.isNatural && (
                    <Badge variant="outline" className="text-xs font-normal text-green-600 border-green-200">
                      Natural
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {truncateDescription(product.description, 100)}
                </p>
              </CardContent>
              <CardFooter className="p-3 pt-1 flex justify-between items-center">
                <div className="text-sm font-medium">{formatCurrency(product.price)}</div>
                {product.affiliateUrl ? (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={handleAffiliateClick}
                  >
                    {product.affiliateDiscount ? 
                      <span className="flex items-center">
                        <DollarSign className="mr-1 h-3 w-3" /> 
                        Save {product.affiliateDiscount}
                      </span> : 
                      <span className="flex items-center">
                        <ExternalLink className="mr-1 h-3 w-3" /> 
                        Buy Now
                      </span>
                    }
                  </Button>
                ) : (
                  product.inStock ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">In Stock</Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-500">Out of Stock</Badge>
                  )
                )}
              </CardFooter>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick && onClick(product)}
      className="cursor-pointer"
    >
      <Card className="overflow-hidden h-full">
        <div className="relative h-48 bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.isNew && (
            <Badge className="absolute top-2 left-2 bg-blue-500">New</Badge>
          )}
          {product.isAffiliate && (
            <Badge 
              variant="outline" 
              className="absolute bottom-2 right-2 bg-amber-100 text-amber-800 border-amber-200"
            >
              <DollarSign className="h-3 w-3 mr-1" />
              Partner
            </Badge>
          )}
        </div>
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <CardDescription>{product.brand}</CardDescription>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>{product.rating}</span>
              <span className="text-muted-foreground">({product.reviewCount})</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 pb-2">
          <div className="flex gap-1 mb-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {formatCategory(product.category)}
            </Badge>
            <Badge 
              variant={product.strength === "high" ? "destructive" : "outline"} 
              className="text-xs"
            >
              {formatStrength(product.strength)}
            </Badge>
            {product.isNatural && (
              <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                Natural
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          
          <div className="mt-2">
            <div className="flex justify-between items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-sm cursor-help">
                      <Activity className="w-4 h-4 text-zinc-400" />
                      <span>{product.nicotineContent} mg/g</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Nicotine content per gram</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {product.concerns && product.concerns.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-amber-500 cursor-help">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-[200px]">
                        <p className="font-semibold mb-1 text-sm">Health Concerns:</p>
                        <ul className="text-xs space-y-1 list-disc pl-4">
                          {product.concerns.map((concern, i) => (
                            <li key={i}>{concern}</li>
                          ))}
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-2 flex justify-between items-center">
          <div className="font-semibold">{formatCurrency(product.price)}</div>
          {product.affiliateUrl ? (
            <Button 
              size="sm" 
              variant="default" 
              className={product.affiliateDiscount ? "bg-amber-500 hover:bg-amber-600" : ""}
              onClick={handleAffiliateClick}
            >
              {product.affiliateDiscount ? 
                <span className="flex items-center">
                  <DollarSign className="mr-1 h-4 w-4" /> 
                  Save {product.affiliateDiscount}
                </span> : 
                <span className="flex items-center">
                  <ExternalLink className="mr-1 h-4 w-4" /> 
                  Buy Now
                </span>
              }
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              disabled={!product.inStock}
            >
              {product.inStock ? "View Details" : "Out of Stock"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}; 