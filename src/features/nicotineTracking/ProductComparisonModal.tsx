import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  Button,
  Badge
} from '../../components/ui';
import { NicotineProduct } from '../../types/dataTypes';
import { Check, X, AlertTriangle } from 'lucide-react';

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: NicotineProduct[];
}

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  isOpen,
  onClose,
  products
}) => {
  if (products.length === 0) return null;
  
  // Comparison categories
  const categories = [
    { name: 'Basic Information', items: [
      { key: 'brand', label: 'Brand' },
      { key: 'category', label: 'Category' },
      { key: 'subcategory', label: 'Subcategory' },
    ]},
    { name: 'Nicotine Details', items: [
      { key: 'nicotine_strength', label: 'Nicotine Strength (mg)' },
      { key: 'nicotine_type', label: 'Nicotine Type' },
    ]},
    { name: 'Health Factors', items: [
      { key: 'chemical_concerns', label: 'Chemical Concerns' },
      { key: 'gum_health_rating', label: 'Gum Health Rating' },
    ]},
    { name: 'User Experience', items: [
      { key: 'flavors', label: 'Flavors' },
      { key: 'average_rating', label: 'Average Rating' },
    ]},
    { name: 'Price Information', items: [
      { key: 'price_range', label: 'Price Range ($)' },
    ]},
  ];
  
  // Helper function to format the value from the product
  const formatValue = (product: NicotineProduct, key: keyof NicotineProduct) => {
    const value = product[key];
    
    if (value === undefined || value === null) return 'Not available';
    
    if (key === 'chemical_concerns' || key === 'flavors' || key === 'ingredients' || key === 'warnings') {
      const array = value as string[];
      if (!array || array.length === 0) return 'None';
      return array.join(', ');
    }
    
    if (key === 'price_range') {
      return value as string;
    }
    
    if (key === 'average_rating') {
      return `${value}/5`;
    }
    
    if (key === 'gum_health_rating') {
      if (!value) return 'Not rated';
      const rating = value as number;
      return `${rating}/10 (${rating < 5 ? 'Poor' : rating < 7 ? 'Moderate' : 'Good'})`;
    }
    
    return value.toString();
  };
  
  // Get color for health impact indicators
  const getHealthImpactColor = (product: NicotineProduct, key: keyof NicotineProduct) => {
    if (key === 'chemical_concerns') {
      const concerns = product[key] as string[] | undefined;
      if (!concerns || concerns.length === 0) return 'text-green-500';
      return concerns.length < 2 ? 'text-yellow-500' : 'text-red-500';
    }
    
    if (key === 'gum_health_rating') {
      const rating = product[key] as number | undefined;
      if (!rating) return '';
      return rating < 5 ? 'text-red-500' : rating < 7 ? 'text-yellow-500' : 'text-green-500';
    }
    
    if (key === 'nicotine_strength') {
      const strength = product[key] as number;
      if (strength < 4) return 'text-green-500';
      if (strength < 8) return 'text-yellow-500';
      return 'text-red-500';
    }
    
    return '';
  };
  
  // Get health impact icon
  const getHealthImpactIcon = (product: NicotineProduct, key: keyof NicotineProduct) => {
    if (key === 'chemical_concerns') {
      const concerns = product[key] as string[] | undefined;
      if (!concerns || concerns.length === 0) return <Check className="h-4 w-4 text-green-500" />;
      return concerns.length < 2 
        ? <AlertTriangle className="h-4 w-4 text-yellow-500" />
        : <X className="h-4 w-4 text-red-500" />;
    }
    
    if (key === 'gum_health_rating') {
      const rating = product[key] as number | undefined;
      if (!rating) return null;
      return rating < 5 
        ? <X className="h-4 w-4 text-red-500" />
        : rating < 7 
          ? <AlertTriangle className="h-4 w-4 text-yellow-500" />
          : <Check className="h-4 w-4 text-green-500" />;
    }
    
    return null;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Product Comparison</DialogTitle>
          <DialogDescription>
            Compare details between {products.length} selected nicotine products
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6">
          {/* Product headers */}
          <div className="grid grid-cols-[200px_repeat(auto-fill,minmax(180px,1fr))] gap-4 pb-4 border-b">
            <div className="font-medium">Product</div>
            {products.map((product) => (
              <div key={product.id} className="font-medium text-center">
                {product.name}
                <div className="text-sm font-normal text-muted-foreground">{product.brand}</div>
              </div>
            ))}
          </div>
          
          {/* Comparison categories and items */}
          {categories.map((category) => (
            <div key={category.name} className="mt-6">
              <h3 className="font-semibold mb-3">{category.name}</h3>
              
              {category.items.map((item) => (
                <div 
                  key={item.key} 
                  className="grid grid-cols-[200px_repeat(auto-fill,minmax(180px,1fr))] gap-4 py-2 border-b border-gray-100 dark:border-gray-800"
                >
                  <div className="text-sm font-medium">{item.label}</div>
                  
                  {products.map((product) => {
                    const key = item.key as keyof NicotineProduct;
                    const healthColor = getHealthImpactColor(product, key);
                    const healthIcon = getHealthImpactIcon(product, key);
                    
                    return (
                      <div 
                        key={`${product.id}-${item.key}`} 
                        className={`text-sm text-center ${healthColor}`}
                      >
                        {healthIcon && (
                          <span className="inline-flex items-center mr-1">
                            {healthIcon}
                          </span>
                        )}
                        {formatValue(product, key)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 