// Type declarations for components
declare module '../../components/Header' {
  interface HeaderProps {
    title: string;
    subtitle?: string;
    className?: string;
  }
  export const Header: React.FC<HeaderProps>;
}

declare module './components/HealthCalculatorsTool' {
  import { Session } from '@supabase/supabase-js';
  interface HealthCalculatorsToolProps {
    session: Session | null;
  }
  export const HealthCalculatorsTool: React.FC<HealthCalculatorsToolProps>;
}

declare module './components/MoodSupportTool' {
  import { Session } from '@supabase/supabase-js';
  interface MoodSupportToolProps {
    session: Session | null;
  }
  export const MoodSupportTool: React.FC<MoodSupportToolProps>;
}

declare module './components/EnergyManagementTool' {
  import { Session } from '@supabase/supabase-js';
  interface EnergyManagementToolProps {
    session: Session | null;
  }
  export const EnergyManagementTool: React.FC<EnergyManagementToolProps>;
}

declare module './components/FatigueManagementTool' {
  import { Session } from '@supabase/supabase-js';
  interface FatigueManagementToolProps {
    session: Session | null;
  }
  export const FatigueManagementTool: React.FC<FatigueManagementToolProps>;
}

declare module '../features/nicotineTracking/ProductComparisonModal' {
  import { NicotineProduct } from '../types/dataTypes';
  
  interface ProductComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: NicotineProduct[];
  }
  
  export const ProductComparisonModal: React.FC<ProductComparisonModalProps>;
}

declare module '../features/nicotineTracking/productData' {
  import { NicotineProduct, ProductCategory } from '../types/dataTypes';
  
  export const PRODUCT_CATEGORIES: ProductCategory[];
  export const NICOTINE_PRODUCTS: NicotineProduct[];
} 