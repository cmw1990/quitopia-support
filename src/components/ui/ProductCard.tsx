import React from "react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { Star, Heart, Check, AlertCircle } from "lucide-react";
import { SmokelessProduct } from "../../api/missionFreshApiClient";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: SmokelessProduct;
  viewMode: "grid" | "list";
  renderExtraContent?: () => React.ReactNode;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  viewMode,
  renderExtraContent
}) => {
  const navigate = useNavigate();

  // Format price with two decimal places
  const formattedPrice = product.price.toFixed(2);
  
  // Handle click to navigate to product details
  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };
  
  // Render safety concerns
  const renderConcerns = () => {
    if (product.concerns.length === 0) return null;
    
    return (
      <div className="mt-2">
        <div className="flex items-start gap-1">
          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
          <div className="text-xs text-muted-foreground">
            {product.concerns[0]}
            {product.concerns.length > 1 && ` (+${product.concerns.length - 1} more)`}
          </div>
        </div>
      </div>
    );
  };
  
  // Render star rating
  const renderRating = () => {
    return (
      <div className="flex items-center gap-1">
        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">{product.rating}</span>
        <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
      </div>
    );
  };
  
  if (viewMode === "list") {
    // List view
    return (
      <div className="flex flex-col sm:flex-row border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        <div className="sm:w-1/4 h-48 sm:h-auto relative">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          {product.isNew && (
            <Badge className="absolute top-2 left-2 bg-blue-500 text-white">New</Badge>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
            </div>
          )}
        </div>
        <div className="flex-1 p-4">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-medium">{product.name}</h3>
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium mr-2">{product.brand}</span>
                <Badge variant="outline" className="mr-1 capitalize">
                  {product.category.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {product.strength}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-medium">${formattedPrice}</div>
              {renderRating()}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
          
          <div className="flex flex-wrap gap-1 mb-2">
            {product.flavors.map(flavor => (
              <Badge key={flavor} variant="secondary" className="text-xs">
                {flavor}
              </Badge>
            ))}
          </div>
          
          {renderConcerns()}
          
          {product.isNatural && (
            <div className="flex items-center mt-2 text-green-600 text-sm">
              <Check className="h-4 w-4 mr-1" />
              Natural Ingredients
            </div>
          )}
          
          {renderExtraContent && renderExtraContent()}
          
          <div className="flex justify-end mt-3">
            <Button 
              onClick={handleClick}
              disabled={!product.inStock}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Grid view
  return (
    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow relative">
      <div className="relative h-48">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
        {product.isNew && (
          <Badge className="absolute top-2 left-2 bg-blue-500 text-white">New</Badge>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
          </div>
        )}
        <Button 
          size="icon" 
          variant="ghost" 
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{product.name}</CardTitle>
          <div className="text-lg font-medium">${formattedPrice}</div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{product.brand}</span>
          {renderRating()}
        </div>
      </CardHeader>
      
      <CardContent className="py-2">
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge variant="outline" className="capitalize">
            {product.category.replace('_', ' ')}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {product.strength}
          </Badge>
          {product.flavors.length > 0 && (
            <Badge variant="secondary">
              {product.flavors[0]}
              {product.flavors.length > 1 && ` +${product.flavors.length - 1}`}
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        
        {renderConcerns()}
        
        {product.isNatural && (
          <div className="flex items-center mt-2 text-green-600 text-xs">
            <Check className="h-3 w-3 mr-1" />
            Natural Ingredients
          </div>
        )}
        
        {renderExtraContent && renderExtraContent()}
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button 
          className="w-full" 
          onClick={handleClick}
          disabled={!product.inStock}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}; 