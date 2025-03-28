import { NicotineProduct } from '../../types/dataTypes';

// Product categories
export const PRODUCT_CATEGORIES = [
  { id: 'cigarette', name: 'Cigarettes' },
  { id: 'vape', name: 'Vapes & E-cigs' },
  { id: 'pouch', name: 'Nicotine Pouches' },
  { id: 'gum', name: 'Nicotine Gum' },
  { id: 'lozenge', name: 'Nicotine Lozenges' },
  { id: 'patch', name: 'Nicotine Patches' },
  { id: 'other', name: 'Other Products' },
];

// Sample product data
export const NICOTINE_PRODUCTS: NicotineProduct[] = [
  // Cigarettes
  {
    id: 'cig-001',
    name: 'Classic Red',
    brand: 'Marlboro',
    category: 'cigarette',
    nicotine_strength: 12.0,
    nicotine_type: 'Freebase',
    description: 'Traditional full-flavor cigarette with a rich tobacco taste.',
    image_url: 'https://example.com/images/marlboro-red.jpg',
    ingredients: ['Tobacco', 'Water', 'Sweeteners', 'Cocoa', 'Licorice'],
    warnings: [
      'Causes cancer',
      'Damages lungs',
      'Highly addictive',
      'Contains over 70 carcinogens'
    ],
    chemical_concerns: ['Arsenic', 'Benzene', 'Cadmium', 'Formaldehyde'],
    price_range: '$8.50 - $12.00',
    average_rating: 3.8,
    total_reviews: 1245,
    gum_health_rating: 2
  },
  {
    id: 'cig-002',
    name: 'Gold Light',
    brand: 'Marlboro',
    category: 'cigarette',
    nicotine_strength: 8.0,
    nicotine_type: 'Freebase',
    description: 'Lighter version with a smoother taste and reduced harshness.',
    image_url: 'https://example.com/images/marlboro-gold.jpg',
    ingredients: ['Tobacco', 'Water', 'Sweeteners', 'Flavoring'],
    warnings: [
      'Causes cancer',
      'Damages lungs',
      'Addictive substance',
      'Low tar does not mean safer'
    ],
    chemical_concerns: ['Arsenic', 'Lead', 'Formaldehyde'],
    price_range: '$8.50 - $12.00',
    average_rating: 3.6,
    total_reviews: 987,
    gum_health_rating: 2.5
  },
  {
    id: 'cig-003',
    name: 'Blue Ice',
    brand: 'Camel',
    category: 'cigarette',
    nicotine_strength: 10.0,
    nicotine_type: 'Freebase',
    description: 'Mentholated cigarette with a cool, refreshing taste.',
    image_url: 'https://example.com/images/camel-blue.jpg',
    ingredients: ['Tobacco', 'Water', 'Menthol', 'Sweeteners'],
    warnings: [
      'Causes cancer',
      'Damages lungs',
      'Menthol masks harshness but does not reduce harm'
    ],
    flavors: ['Menthol'],
    chemical_concerns: ['Arsenic', 'Benzene', 'Formaldehyde'],
    price_range: '$7.50 - $11.00',
    average_rating: 3.9,
    total_reviews: 782,
    gum_health_rating: 2
  },
  
  // Vapes
  {
    id: 'vape-001',
    name: 'Blue Razz Disposable',
    brand: 'Vuse',
    category: 'vape',
    nicotine_strength: 18.0,
    nicotine_type: 'Salt',
    description: 'Disposable vape with blue raspberry flavor and salt nicotine for a smooth hit.',
    image_url: 'https://example.com/images/vuse-bluerazz.jpg',
    ingredients: ['Propylene Glycol', 'Vegetable Glycerin', 'Nicotine Salt', 'Flavorings'],
    warnings: [
      'Contains nicotine, an addictive chemical',
      'Not for use by non-smokers',
      'Keep away from children'
    ],
    flavors: ['Blue Raspberry', 'Sweet'],
    chemical_concerns: ['Diacetyl', 'Acrolein'],
    price_range: '$15.99 - $22.99',
    average_rating: 4.1,
    total_reviews: 456,
    gum_health_rating: 5
  },
  {
    id: 'vape-002',
    name: 'Classic Tobacco Pod',
    brand: 'JUUL',
    category: 'vape',
    nicotine_strength: 35.0,
    nicotine_type: 'Salt',
    description: 'Traditional tobacco flavor pod with high-strength nicotine salt.',
    image_url: 'https://example.com/images/juul-tobacco.jpg',
    ingredients: ['Propylene Glycol', 'Vegetable Glycerin', 'Nicotine Salt', 'Flavorings'],
    warnings: [
      'Contains high concentration of nicotine',
      'May be more addictive than traditional cigarettes',
      'Keep away from children'
    ],
    flavors: ['Tobacco'],
    chemical_concerns: ['Benzoic Acid'],
    price_range: '$16.99 - $19.99',
    average_rating: 3.7,
    total_reviews: 823,
    gum_health_rating: 4
  },
  {
    id: 'vape-003',
    name: 'Mango Ice 5000',
    brand: 'Elf Bar',
    category: 'vape',
    nicotine_strength: 50.0,
    nicotine_type: 'Salt',
    description: 'Long-lasting disposable vape with tropical mango and cool ice flavor.',
    image_url: 'https://example.com/images/elfbar-mango.jpg',
    ingredients: ['Propylene Glycol', 'Vegetable Glycerin', 'Nicotine Salt', 'Flavorings'],
    warnings: [
      'Contains very high nicotine concentration',
      'Not for non-smokers or light smokers',
      'May cause nicotine poisoning if overused'
    ],
    flavors: ['Mango', 'Menthol', 'Sweet'],
    chemical_concerns: ['Diacetyl'],
    price_range: '$14.99 - $19.99',
    average_rating: 4.5,
    total_reviews: 1289,
    gum_health_rating: 4
  },
  {
    id: 'vape-004',
    name: 'Fresh Mint Pod',
    brand: 'JUUL',
    category: 'vape',
    nicotine_strength: 35.0,
    nicotine_type: 'Salt',
    description: 'Cool mint flavor pod with high-strength nicotine salt.',
    image_url: 'https://example.com/images/juul-mint.jpg',
    ingredients: ['Propylene Glycol', 'Vegetable Glycerin', 'Nicotine Salt', 'Flavorings'],
    warnings: [
      'Contains high concentration of nicotine',
      'May be more addictive than traditional cigarettes',
      'Keep away from children'
    ],
    flavors: ['Mint', 'Menthol'],
    chemical_concerns: ['Benzoic Acid'],
    price_range: '$16.99 - $19.99',
    average_rating: 4.2,
    total_reviews: 753,
    gum_health_rating: 4
  },
  
  // Nicotine Pouches
  {
    id: 'pouch-001',
    name: 'Wintergreen 4mg',
    brand: 'ZYN',
    category: 'pouch',
    nicotine_strength: 4.0,
    nicotine_type: 'Pharmaceutical',
    description: 'Tobacco-free nicotine pouches with a refreshing wintergreen flavor. Discreet and smokeless.',
    image_url: 'https://example.com/images/zyn-wintergreen.jpg',
    ingredients: ['Nicotine', 'Plant Fibers', 'Salt', 'Flavoring'],
    warnings: [
      'Contains nicotine, an addictive chemical',
      'Not for use by non-tobacco users'
    ],
    flavors: ['Wintergreen', 'Mint'],
    price_range: '$4.99 - $6.99',
    average_rating: 4.7,
    total_reviews: 532,
    gum_health_rating: 7
  },
  {
    id: 'pouch-002',
    name: 'Citrus 6mg',
    brand: 'ON!',
    category: 'pouch',
    nicotine_strength: 6.0,
    nicotine_type: 'Pharmaceutical',
    description: 'Small, discreet tobacco-free nicotine pouches with a refreshing citrus flavor.',
    image_url: 'https://example.com/images/on-citrus.jpg',
    ingredients: ['Nicotine', 'Microcrystalline Cellulose', 'Salt', 'Flavoring'],
    warnings: [
      'Contains nicotine, an addictive chemical',
      'Not for use by non-tobacco users'
    ],
    flavors: ['Citrus', 'Orange', 'Lemon'],
    price_range: '$3.99 - $5.99',
    average_rating: 4.3,
    total_reviews: 298,
    gum_health_rating: 6.5
  },
  {
    id: 'pouch-003',
    name: 'Coffee 8mg',
    brand: 'VELO',
    category: 'pouch',
    nicotine_strength: 8.0,
    nicotine_type: 'Pharmaceutical',
    description: 'Strong tobacco-free nicotine pouches with rich coffee flavor. Designed for experienced users.',
    image_url: 'https://example.com/images/velo-coffee.jpg',
    ingredients: ['Nicotine', 'Plant Fibers', 'Salt', 'Coffee Flavoring'],
    warnings: [
      'Contains high nicotine concentration',
      'Not for beginners or non-tobacco users'
    ],
    flavors: ['Coffee', 'Mocha'],
    price_range: '$4.49 - $6.49',
    average_rating: 4.0,
    total_reviews: 187,
    gum_health_rating: 6
  },
  {
    id: 'pouch-004',
    name: 'Berry Frost 3mg',
    brand: 'LYFT',
    category: 'pouch',
    nicotine_strength: 3.0,
    nicotine_type: 'Pharmaceutical',
    description: 'Mild strength pouches with a mix of berry and mint flavors. Perfect for beginners.',
    image_url: 'https://example.com/images/lyft-berry.jpg',
    ingredients: ['Nicotine', 'Plant Fibers', 'Salt', 'Natural Flavoring'],
    warnings: [
      'Contains nicotine, an addictive chemical',
      'Not for use by non-tobacco users'
    ],
    flavors: ['Berry', 'Mint', 'Blueberry'],
    price_range: '$4.29 - $5.99',
    average_rating: 4.5,
    total_reviews: 321,
    gum_health_rating: 7.5
  },
  
  // Nicotine Gum
  {
    id: 'gum-001',
    name: 'Original 2mg',
    brand: 'Nicorette',
    category: 'gum',
    nicotine_strength: 2.0,
    nicotine_type: 'Polacrilex',
    description: 'Classic nicotine replacement therapy gum with original flavor. Helps reduce cravings.',
    image_url: 'https://example.com/images/nicorette-original.jpg',
    ingredients: ['Nicotine Polacrilex', 'Gum Base', 'Sorbitol', 'Sweeteners'],
    warnings: [
      'Do not use more than directed',
      'Not for use by non-smokers'
    ],
    flavors: ['Original'],
    price_range: '$35.99 - $49.99',
    average_rating: 3.9,
    total_reviews: 824,
    gum_health_rating: 8
  },
  {
    id: 'gum-002',
    name: 'Fruit Chill 4mg',
    brand: 'Nicorette',
    category: 'gum',
    nicotine_strength: 4.0,
    nicotine_type: 'Polacrilex',
    description: 'Higher-strength NRT gum with a refreshing fruit flavor. For heavier smokers.',
    image_url: 'https://example.com/images/nicorette-fruit.jpg',
    ingredients: ['Nicotine Polacrilex', 'Gum Base', 'Sorbitol', 'Fruit Flavorings'],
    warnings: [
      'Do not use more than directed',
      'Not for use by non-smokers or light smokers'
    ],
    flavors: ['Mixed Fruit', 'Berry'],
    price_range: '$39.99 - $52.99',
    average_rating: 4.1,
    total_reviews: 612,
    gum_health_rating: 8
  },
  
  // Nicotine Lozenges
  {
    id: 'loz-001',
    name: 'Mint 2mg',
    brand: 'Nicorette',
    category: 'lozenge',
    nicotine_strength: 2.0,
    nicotine_type: 'Polacrilex',
    description: 'Slow-dissolving mint lozenge that releases nicotine gradually to help with cravings.',
    image_url: 'https://example.com/images/nicorette-lozenge.jpg',
    ingredients: ['Nicotine Polacrilex', 'Aspartame', 'Flavoring', 'Sweeteners'],
    warnings: [
      'Do not use more than directed',
      'Keep out of reach of children'
    ],
    flavors: ['Mint'],
    price_range: '$42.99 - $54.99',
    average_rating: 4.3,
    total_reviews: 478,
    gum_health_rating: 9
  },
  {
    id: 'loz-002',
    name: 'Cherry 4mg',
    brand: 'Commit',
    category: 'lozenge',
    nicotine_strength: 4.0,
    nicotine_type: 'Polacrilex',
    description: 'Higher-strength lozenge with cherry flavor for heavier smokers.',
    image_url: 'https://example.com/images/commit-cherry.jpg',
    ingredients: ['Nicotine Polacrilex', 'Aspartame', 'Cherry Flavoring', 'Sweeteners'],
    warnings: [
      'Do not use more than directed',
      'Not for non-smokers or light smokers'
    ],
    flavors: ['Cherry'],
    price_range: '$44.99 - $57.99',
    average_rating: 4.0,
    total_reviews: 342,
    gum_health_rating: 9
  },
  
  // Nicotine Patches
  {
    id: 'patch-001',
    name: 'Clear 21mg/24hr',
    brand: 'NicoDerm CQ',
    category: 'patch',
    nicotine_strength: 21.0,
    nicotine_type: 'Transdermal',
    description: 'Step 1 transdermal patch delivering steady nicotine over 24 hours. For heavy smokers.',
    image_url: 'https://example.com/images/nicoderm-21.jpg',
    ingredients: ['Nicotine', 'Adhesive Materials', 'Backing Film'],
    warnings: [
      'Do not use if you continue to smoke',
      'May cause skin irritation',
      'Not for non-smokers'
    ],
    price_range: '$39.99 - $49.99',
    average_rating: 4.5,
    total_reviews: 921,
    gum_health_rating: 10
  },
  {
    id: 'patch-002',
    name: 'Clear 14mg/24hr',
    brand: 'NicoDerm CQ',
    category: 'patch',
    nicotine_strength: 14.0,
    nicotine_type: 'Transdermal',
    description: 'Step 2 transdermal patch delivering medium nicotine dose over 24 hours.',
    image_url: 'https://example.com/images/nicoderm-14.jpg',
    ingredients: ['Nicotine', 'Adhesive Materials', 'Backing Film'],
    warnings: [
      'Do not use if you continue to smoke',
      'May cause skin irritation'
    ],
    price_range: '$38.99 - $48.99',
    average_rating: 4.4,
    total_reviews: 783,
    gum_health_rating: 10
  },
  {
    id: 'patch-003',
    name: 'Clear 7mg/24hr',
    brand: 'NicoDerm CQ',
    category: 'patch',
    nicotine_strength: 7.0,
    nicotine_type: 'Transdermal',
    description: 'Step 3 transdermal patch delivering low nicotine dose over 24 hours. Final step in quitting.',
    image_url: 'https://example.com/images/nicoderm-7.jpg',
    ingredients: ['Nicotine', 'Adhesive Materials', 'Backing Film'],
    warnings: [
      'Do not use if you continue to smoke',
      'May cause skin irritation'
    ],
    price_range: '$37.99 - $47.99',
    average_rating: 4.3,
    total_reviews: 645,
    gum_health_rating: 10
  }
]; 