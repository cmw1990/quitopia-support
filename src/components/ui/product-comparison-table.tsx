import React from 'react';
import { CheckCircle, XCircle, AlertCircle, DollarSign, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// Simple table components
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

// Star rating component
interface StarRatingProps {
  rating: number;
  maxRating?: number;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  className
}) => {
  return (
    <div className={cn("flex items-center", className)}>
      {Array.from({ length: maxRating }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4 mr-0.5",
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          )}
        />
      ))}
    </div>
  );
};

// Product Types
type ProductCategory = 'Patch' | 'Gum' | 'Lozenge' | 'Inhaler' | 'Spray';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  nicotineContent: string;
  duration: string;
  rating: number;
  imageUrl?: string;
  pros: string[];
  cons: string[];
}

interface ProductComparisonTableProps {
  products: Product[];
  className?: string;
}

export const ProductComparisonTable: React.FC<ProductComparisonTableProps> = ({
  products,
  className
}) => {
  if (!products || products.length === 0) {
    return <div className="text-center p-4">No products to display</div>;
  }

  // Group products by category
  const groupedProducts = products.reduce<Record<string, Product[]>>((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  return (
    <div className={cn("space-y-6", className)}>
      {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
        <div key={category} className="rounded-lg border shadow-sm">
          <div className="bg-muted/50 px-4 py-3 rounded-t-lg border-b">
            <h3 className="font-medium">{category}</h3>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Nicotine</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.imageUrl || '/placeholder-product.png'}
                        alt={product.name}
                        className="h-10 w-10 rounded object-contain bg-white p-1 border"
                      />
                      <span>{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.nicotineContent}</TableCell>
                  <TableCell>{product.duration}</TableCell>
                  <TableCell>
                    <StarRating rating={product.rating} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}; 