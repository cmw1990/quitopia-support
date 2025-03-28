import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Star, Zap, AlertCircle, Info, ExternalLink, Heart, ShoppingCart, Share2 } from 'lucide-react';
import { NRTProduct, SideEffectSeverity } from './nrt-types';
import { ScrollArea } from '../ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

interface ProductDetailModalProps {
  product: NRTProduct;
  onClose: () => void;
  isFavorite: boolean;
  toggleFavorite: (id: string) => void;
  showAffiliate: boolean;
  onPurchase?: () => void;
  onAffiliateClick?: (product: NRTProduct) => Promise<void>;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  isFavorite,
  toggleFavorite,
  showAffiliate,
  onPurchase,
  onAffiliateClick
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Helper function to get appropriate badge color for side effect severity
  const getSeverityColor = (severity: SideEffectSeverity) => {
    switch (severity) {
      case 'severe': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'moderate': return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'mild': return 'bg-green-500 hover:bg-green-600 text-white';
      default: return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };
  
  // Format price range for display
  const formatPriceRange = (min: number, max: number) => {
    return `$${min.toFixed(2)}${max > min ? ` - $${max.toFixed(2)}` : ''}`;
  };
  
  // Copy affiliate link to clipboard
  const copyAffiliateLink = () => {
    navigator.clipboard.writeText(product.affiliateLink)
      .then(() => {
        alert('Affiliate link copied to clipboard!');
      })
      .catch(() => {
        alert('Failed to copy affiliate link. Please try again.');
      });
  };
  
  // Handle affiliate purchase
  const handlePurchase = async () => {
    if (onAffiliateClick) {
      await onAffiliateClick(product);
    } else if (onPurchase) {
      onPurchase();
    } else {
      window.open(product.affiliateLink, '_blank');
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-start">
            <div>
              <span className="text-xl font-bold">{product.name}</span>
              <Badge variant="outline" className="ml-2">{product.category}</Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`${isFavorite ? 'text-red-500' : 'text-muted-foreground'}`}
              onClick={() => toggleFavorite(product.id)}
            >
              <Heart className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} />
            </Button>
          </DialogTitle>
          <DialogDescription className="flex justify-between items-center">
            <span className="font-medium">{product.brand}</span>
            <div className="flex items-center">
              <div className="flex items-center mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4"
                    fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                    stroke={i < Math.floor(product.rating) ? 'none' : 'currentColor'}
                    color={i < Math.floor(product.rating) ? 'orange' : 'gray'}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="sideEffects">Side Effects</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="pr-4" style={{ maxHeight: 'calc(70vh - 180px)' }}>
            <TabsContent value="overview" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p>{product.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="text-sm font-semibold mb-2">Key Details</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Price:</span> 
                          <span>{formatPriceRange(product.priceRange.min, product.priceRange.max)}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Nicotine Content:</span> 
                          <span>{product.nicotineContent}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Availability:</span> 
                          <span className="capitalize">{product.availability.replace('-', ' ')}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Initial Effect:</span>
                          <span>{product.effectivenessTime.min === product.effectivenessTime.max ? 
                            `${product.effectivenessTime.min} min` : 
                            `${product.effectivenessTime.min}-${product.effectivenessTime.max} min`}
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="text-sm font-semibold mb-2">Effectiveness</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Strength:</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Zap
                                  key={i}
                                  className={`h-4 w-4 ${i < product.strength ? 'text-yellow-500' : 'text-gray-300'}`}
                                  fill={i < product.strength ? 'currentColor' : 'none'}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Effectiveness:</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < product.effectivenessRating ? 'text-orange-500' : 'text-gray-300'}`}
                                  fill={i < product.effectivenessRating ? 'currentColor' : 'none'}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.features.map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {product.additionalNotes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Additional Notes</h3>
                    <p className="text-sm">{product.additionalNotes}</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="usage" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">How to Use</h3>
                  <ol className="space-y-3">
                    {product.usageInstructions.map((step) => (
                      <li key={step.step} className="flex">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 text-sm">
                          {step.step}
                        </span>
                        <span>{step.instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2 text-blue-500" />
                      Important Usage Tips
                    </h4>
                    <ul className="space-y-2 text-sm list-disc pl-5">
                      <li>Follow the recommended dosage based on your smoking habits.</li>
                      <li>Start with a higher strength if you smoke more than 20 cigarettes per day.</li>
                      <li>Gradually reduce the strength over time according to manufacturer guidelines.</li>
                      <li>Do not use other nicotine products simultaneously unless directed by a healthcare provider.</li>
                      <li>Stop using and consult a doctor if you experience severe side effects.</li>
                    </ul>
                  </CardContent>
                </Card>
                
                {product.category === 'gum' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Common Mistakes to Avoid</h3>
                    <ul className="space-y-2 text-sm list-disc pl-5">
                      <li>Chewing too quickly (leads to excess nicotine release)</li>
                      <li>Chewing continuously (reduces effectiveness)</li>
                      <li>Drinking acidic beverages like coffee or soda while using (reduces absorption)</li>
                      <li>Using fewer pieces than recommended (may not effectively control cravings)</li>
                    </ul>
                  </div>
                )}
                
                {product.category === 'patch' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Common Mistakes to Avoid</h3>
                    <ul className="space-y-2 text-sm list-disc pl-5">
                      <li>Applying to irritated, oily, or hairy skin (reduces adhesion)</li>
                      <li>Using the same skin area daily (increases skin irritation)</li>
                      <li>Cutting patches (affects controlled release mechanism)</li>
                      <li>Removing overnight if experiencing sleep disturbances (consider removing before bed)</li>
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="sideEffects" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Potential Side Effects</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    All nicotine replacement products may cause side effects. Most are mild and temporary as your body adjusts to reduced nicotine intake.
                  </p>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {product.sideEffects.map((effect, index) => (
                      <AccordionItem key={index} value={`effect-${index}`}>
                        <AccordionTrigger className="py-2">
                          <div className="flex items-center">
                            <Badge className={`mr-2 ${getSeverityColor(effect.severity)}`}>
                              {effect.severity}
                            </Badge>
                            <span>{effect.name}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {effect.frequency}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm pl-2">{effect.description}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
                
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center text-yellow-800">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      When to Seek Medical Attention
                    </h4>
                    <ul className="space-y-2 text-sm list-disc pl-5 text-yellow-800">
                      <li>Severe skin rash or allergic reaction</li>
                      <li>Irregular heartbeat or heart palpitations</li>
                      <li>Severe nausea, vomiting, or abdominal pain</li>
                      <li>Severe headache or dizziness</li>
                      <li>Difficulty breathing or chest pain</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="recommendations" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Best For</h3>
                  <ul className="space-y-2">
                    {product.bestFor.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Not Recommended For</h3>
                  <ul className="space-y-2">
                    {product.notRecommendedFor.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold mb-2">Expert Recommendation</h4>
                    <p className="text-sm">
                      {product.category === 'patch' && "Patches are ideal for those who want steady nicotine delivery with minimal effort. Best combined with a fast-acting NRT like gum or lozenge for breakthrough cravings."}
                      {product.category === 'gum' && "Gum is excellent for those who need quick craving relief and enjoy having control over when to use it. Great for those who miss the oral satisfaction of smoking."}
                      {product.category === 'lozenge' && "Lozenges are perfect for discreet, on-demand craving relief without the need to chew. Ideal for those in smoke-free environments or professional settings."}
                      {product.category === 'inhaler' && "Inhalers are best for those who miss the hand-to-mouth ritual of smoking. They provide both nicotine and behavioral substitution for cigarettes."}
                      {product.category === 'spray' && "Sprays provide the fastest nicotine delivery of any NRT product. Ideal for those with intense, sudden cravings that need immediate relief."}
                    </p>
                  </CardContent>
                </Card>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Related Quitting Strategies</h3>
                  <ul className="space-y-2 text-sm list-disc pl-5">
                    <li>
                      <span className="font-medium">Combination Therapy:</span> Consider using this {product.category} with a complementary NRT product (e.g., patch + gum) for better results.
                    </li>
                    <li>
                      <span className="font-medium">Behavioral Support:</span> Pair with counseling or a support group for the best chances of success.
                    </li>
                    <li>
                      <span className="font-medium">Gradual Reduction:</span> Use the product according to the recommended schedule to gradually reduce nicotine dependency.
                    </li>
                    <li>
                      <span className="font-medium">Trigger Management:</span> Identify smoking triggers and have this product readily available during those times.
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
          {showAffiliate && (
            <Button onClick={handlePurchase} className="w-full sm:w-auto">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Purchase
            </Button>
          )}
          
          <Button variant="outline" onClick={() => copyAffiliateLink()} className="w-full sm:w-auto">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          
          <div className="flex-1"></div>
          
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal; 