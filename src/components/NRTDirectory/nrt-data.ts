import { NRTProduct, SideEffect, UsageStep, HealthImpact } from './nrt-types';

// Common side effects shared across multiple products
const commonSideEffects: Record<string, SideEffect> = {
  headache: {
    name: 'Headache',
    description: 'Mild to moderate head pain that typically resolves within a few hours.',
    frequency: 'common',
    severity: 'mild'
  },
  nauseaGum: {
    name: 'Nausea or indigestion',
    description: 'Stomach discomfort, often from swallowing nicotine when using the gum incorrectly.',
    frequency: 'common',
    severity: 'mild'
  },
  nauseaPatch: {
    name: 'Nausea',
    description: 'Stomach discomfort that typically decreases after a few days of use.',
    frequency: 'common',
    severity: 'moderate'
  },
  skinIrritation: {
    name: 'Skin irritation',
    description: 'Redness, itching or burning at the patch site.',
    frequency: 'very common',
    severity: 'mild'
  },
  sleepDisturbance: {
    name: 'Sleep disturbances',
    description: 'Vivid dreams or insomnia, particularly when wearing the patch overnight.',
    frequency: 'common',
    severity: 'moderate'
  },
  throatIrritation: {
    name: 'Throat irritation',
    description: 'Soreness or discomfort in the throat area during or after use.',
    frequency: 'common',
    severity: 'mild'
  },
  hiccups: {
    name: 'Hiccups',
    description: 'Usually caused by swallowing air while chewing too quickly.',
    frequency: 'common',
    severity: 'mild'
  },
  jawMuscleAche: {
    name: 'Jaw muscle ache',
    description: 'Soreness from chewing the gum, especially in people not used to chewing gum.',
    frequency: 'common',
    severity: 'mild'
  },
  dizziness: {
    name: 'Dizziness',
    description: 'Feeling lightheaded or unsteady, especially when starting use.',
    frequency: 'common',
    severity: 'moderate'
  },
  mouthSores: {
    name: 'Mouth or throat sores',
    description: 'Small ulcers or sores in the mouth or throat.',
    frequency: 'uncommon',
    severity: 'moderate'
  },
  coughing: {
    name: 'Coughing',
    description: 'Temporary irritation in the lungs causing coughing.',
    frequency: 'common',
    severity: 'mild'
  },
  nasalIrritation: {
    name: 'Nasal irritation',
    description: 'Irritation inside the nose, including runny nose, sneezing, or watery eyes.',
    frequency: 'very common',
    severity: 'moderate'
  },
  drySkin: {
    name: 'Dry skin',
    description: 'Flaking or dryness at the application site.',
    frequency: 'uncommon',
    severity: 'mild'
  },
  drymouth: {
    name: 'Dry mouth',
    description: 'Reduced saliva production causing mouth dryness.',
    frequency: 'common',
    severity: 'mild'
  },
  mouthTingling: {
    name: 'Mouth tingling',
    description: 'Tingling or mild burning sensation in the mouth during use.',
    frequency: 'very common',
    severity: 'mild'
  },
  insomnia: {
    name: 'Insomnia',
    description: 'Difficulty falling asleep or staying asleep.',
    frequency: 'common',
    severity: 'moderate' 
  },
  vivid_dreams: {
    name: 'Vivid dreams',
    description: 'Unusually intense or realistic dreams during sleep.',
    frequency: 'common',
    severity: 'mild'
  },
  chest_tightness: {
    name: 'Chest tightness',
    description: 'Feeling of pressure or tightness in the chest.',
    frequency: 'uncommon',
    severity: 'moderate'
  }
};

// Common health impact assessments
const healthImpacts: Record<string, HealthImpact> = {
  nicotineGum: {
    gumHealth: {
      rating: 4,
      factors: [
        { description: 'Potential gum irritation from frequent use', severity: 'low' },
        { description: 'May cause temporary tooth sensitivity', severity: 'low' }
      ]
    },
    lungHealth: {
      rating: 9,
      factors: [
        { description: 'No inhalation of harmful combustion products', severity: 'low' },
        { description: 'No tar or carbon monoxide exposure', severity: 'low' }
      ]
    },
    heartHealth: {
      rating: 7,
      factors: [
        { description: 'Nicotine can temporarily increase blood pressure', severity: 'moderate' },
        { description: 'Significantly lower cardiovascular risk than smoking', severity: 'low' }
      ]
    },
    overall: 8
  },
  nicotinePatch: {
    gumHealth: {
      rating: 10,
      factors: [
        { description: 'No oral use, so no impact on gum health', severity: 'low' }
      ]
    },
    lungHealth: {
      rating: 9,
      factors: [
        { description: 'No inhalation of harmful combustion products', severity: 'low' },
        { description: 'No tar or carbon monoxide exposure', severity: 'low' }
      ]
    },
    heartHealth: {
      rating: 6,
      factors: [
        { description: 'Steady nicotine delivery may affect heart rate', severity: 'moderate' },
        { description: 'Significantly lower cardiovascular risk than smoking', severity: 'low' }
      ]
    },
    overall: 8
  },
  nicotinePouch: {
    gumHealth: {
      rating: 7,
      factors: [
        { description: 'Prolonged contact with gums may cause irritation', severity: 'low' },
        { description: 'May cause temporary gum recession at placement site', severity: 'moderate' }
      ]
    },
    lungHealth: {
      rating: 9,
      factors: [
        { description: 'No inhalation of harmful combustion products', severity: 'low' },
        { description: 'No tar or carbon monoxide exposure', severity: 'low' }
      ]
    },
    heartHealth: {
      rating: 7,
      factors: [
        { description: 'Nicotine can temporarily increase heart rate', severity: 'moderate' },
        { description: 'Significantly lower cardiovascular risk than smoking', severity: 'low' }
      ]
    },
    overall: 8
  },
  nicotineLozenge: {
    gumHealth: {
      rating: 8,
      factors: [
        { description: 'Minimal contact with gums compared to pouches', severity: 'low' },
        { description: 'Some products contain sugar that may affect teeth', severity: 'low' }
      ]
    },
    lungHealth: {
      rating: 9,
      factors: [
        { description: 'No inhalation of harmful combustion products', severity: 'low' },
        { description: 'No tar or carbon monoxide exposure', severity: 'low' }
      ]
    },
    heartHealth: {
      rating: 7,
      factors: [
        { description: 'Nicotine can temporarily increase blood pressure', severity: 'moderate' },
        { description: 'Significantly lower cardiovascular risk than smoking', severity: 'low' }
      ]
    },
    overall: 8
  },
  nicotineInhaler: {
    gumHealth: {
      rating: 10,
      factors: [
        { description: 'No oral contact, so no impact on gum health', severity: 'low' }
      ]
    },
    lungHealth: {
      rating: 8,
      factors: [
        { description: 'Some throat irritation possible', severity: 'low' },
        { description: 'Significantly less harmful than cigarette smoke', severity: 'low' }
      ]
    },
    heartHealth: {
      rating: 7,
      factors: [
        { description: 'Nicotine can temporarily increase heart rate', severity: 'moderate' },
        { description: 'Significantly lower cardiovascular risk than smoking', severity: 'low' }
      ]
    },
    overall: 8
  },
  nicotineSpray: {
    gumHealth: {
      rating: 10,
      factors: [
        { description: 'No oral contact with gums', severity: 'low' }
      ]
    },
    lungHealth: {
      rating: 7,
      factors: [
        { description: 'May cause nasal irritation with long-term use', severity: 'moderate' },
        { description: 'No smoke-related damage to lungs', severity: 'low' }
      ]
    },
    heartHealth: {
      rating: 6,
      factors: [
        { description: 'Rapid absorption may affect heart rate more than other NRTs', severity: 'moderate' },
        { description: 'Significantly lower cardiovascular risk than smoking', severity: 'low' }
      ]
    },
    overall: 8
  }
};

// Product sample data
export const nrtProductsData: NRTProduct[] = [
  // Nicotine Gum Products
  {
    id: 'nrt-gum-001',
    name: 'Nicorette Gum',
    brand: 'Nicorette',
    category: 'gum',
    description: 'Nicorette gum helps reduce withdrawal symptoms including nicotine cravings. It provides nicotine in a controlled amount which is released when chewed.',
    rating: 4.3,
    features: ['Sugar-free', 'Available in multiple flavors', 'Discreet', 'Portable'],
    priceRange: { min: 28.99, max: 39.99 },
    nicotineContent: '2mg and 4mg options',
    effectivenessTime: { min: 5, max: 10 },
    effectivenessRating: 4,
    strength: 3,
    sideEffects: [
      commonSideEffects.nauseaGum,
      commonSideEffects.hiccups,
      commonSideEffects.jawMuscleAche,
      commonSideEffects.throatIrritation
    ],
    usageInstructions: [
      { step: 1, instruction: 'Chew slowly until you feel a tingling sensation (about 15 chews).' },
      { step: 2, instruction: 'Stop chewing and park the gum between your cheek and gums.' },
      { step: 3, instruction: 'When the tingling is almost gone (about a minute), start chewing again.' },
      { step: 4, instruction: 'Repeat this process for about 30 minutes.' }
    ],
    bestFor: ['People who need quick relief from cravings', 'Those who want a discreet option', 'Oral fixation needs'],
    notRecommendedFor: ['People with jaw problems', 'Denture wearers', 'Those with stomach ulcers'],
    imageUrl: '/assets/nrt/nicorette-gum.jpg',
    affiliateLink: 'https://www.amazon.com/Nicorette-Nicotine-Quit-Smoking-White/dp/B0744EKYJ4',
    availability: 'over-the-counter'
  },
  {
    id: 'nrt-gum-002',
    name: 'Habitrol Nicotine Gum',
    brand: 'Habitrol',
    category: 'gum',
    description: 'Habitrol nicotine gum is a cost-effective aid in smoking cessation, helping to reduce withdrawal symptoms by providing controlled amounts of nicotine.',
    rating: 3.9,
    features: ['Cost-effective', 'Long-lasting flavor', 'Easy to use', 'Clinically proven'],
    priceRange: { min: 19.99, max: 29.99 },
    nicotineContent: '2mg and 4mg options',
    effectivenessTime: { min: 5, max: 15 },
    effectivenessRating: 3,
    strength: 3,
    sideEffects: [
      commonSideEffects.nauseaGum,
      commonSideEffects.hiccups,
      commonSideEffects.jawMuscleAche,
      {
        name: 'Increased salivation',
        description: 'More saliva production than normal while chewing.',
        frequency: 'common',
        severity: 'mild'
      }
    ],
    usageInstructions: [
      { step: 1, instruction: 'Chew the gum slowly until you feel a tingling or peppery taste.' },
      { step: 2, instruction: 'Place (park) the gum between your cheek and gum.' },
      { step: 3, instruction: 'When the tingling fades, chew again until the sensation returns.' },
      { step: 4, instruction: 'Repeat for about 30 minutes then discard.' }
    ],
    bestFor: ['Budget-conscious smokers', 'First-time NRT users', 'Heavy smokers (with 4mg strength)'],
    notRecommendedFor: ['People sensitive to artificial sweeteners', 'Those with TMJ disorders', 'Recent heart attack survivors'],
    imageUrl: '/assets/nrt/habitrol-gum.jpg',
    affiliateLink: 'https://www.amazon.com/Habitrol-Nicotine-Gum-2mg-Fruit/dp/B00TWVDEWW',
    availability: 'over-the-counter'
  },

  // Nicotine Patch Products
  {
    id: 'nrt-patch-001',
    name: 'NicoDerm CQ Patch',
    brand: 'NicoDerm',
    category: 'patch',
    description: 'NicoDerm CQ is a clear nicotine patch that provides a steady flow of nicotine throughout the day to help prevent cravings before they start.',
    rating: 4.5,
    features: ['24-hour release', 'Clear patch design', 'Step-down therapy system', 'Water resistant'],
    priceRange: { min: 32.99, max: 44.99 },
    nicotineContent: 'Step 1: 21mg, Step 2: 14mg, Step 3: 7mg',
    effectivenessTime: { min: 30, max: 60 },
    effectivenessRating: 5,
    strength: 5,
    sideEffects: [
      commonSideEffects.skinIrritation,
      commonSideEffects.sleepDisturbance,
      commonSideEffects.headache,
      commonSideEffects.dizziness
    ],
    usageInstructions: [
      { step: 1, instruction: 'Apply to a clean, dry, hairless area of skin on your upper body or outer arm.' },
      { step: 2, instruction: 'Press the patch firmly with your palm for about 10 seconds.' },
      { step: 3, instruction: 'Wash hands after applying.' },
      { step: 4, instruction: 'Replace with a new patch after 24 hours, using a different skin site.' }
    ],
    bestFor: ['Heavy smokers starting to quit', 'People who want all-day protection from cravings', 'Those who prefer a discrete option'],
    notRecommendedFor: ['People with severe skin conditions', 'Those with known adhesive allergies', 'People who want immediate craving relief'],
    imageUrl: '/assets/nrt/nicoderm-patch.jpg',
    affiliateLink: 'https://www.amazon.com/NicoDerm-Step-Nicotine-Patches-Clear/dp/B00008IHL3',
    availability: 'over-the-counter'
  },
  {
    id: 'nrt-patch-002',
    name: 'Habitrol Nicotine Patch',
    brand: 'Habitrol',
    category: 'patch',
    description: 'Habitrol patches provide controlled release of nicotine through the skin to reduce nicotine withdrawal symptoms when quitting smoking.',
    rating: 4.1,
    features: ['Cost-effective', 'Three-step program', 'Thin design', 'Once daily application'],
    priceRange: { min: 27.99, max: 39.99 },
    nicotineContent: 'Step 1: 21mg, Step 2: 14mg, Step 3: 7mg',
    effectivenessTime: { min: 20, max: 45 },
    effectivenessRating: 4,
    strength: 4,
    sideEffects: [
      commonSideEffects.skinIrritation,
      commonSideEffects.headache,
      commonSideEffects.sleepDisturbance,
      {
        name: 'Abnormal dreams',
        description: 'Vivid or unusual dreams, particularly when worn overnight.',
        frequency: 'common',
        severity: 'mild'
      }
    ],
    usageInstructions: [
      { step: 1, instruction: 'Select a clean, dry, non-hairy area on your upper body or outer arm.' },
      { step: 2, instruction: 'Remove the protective liner and immediately apply the patch to your skin.' },
      { step: 3, instruction: 'Press firmly for 10 seconds with the palm of your hand.' },
      { step: 4, instruction: 'Replace with a new patch every 24 hours.' }
    ],
    bestFor: ['Price-conscious smokers', 'Those who prefer not to chew gum', 'Smokers who need constant nicotine levels'],
    notRecommendedFor: ['People with severe eczema or psoriasis', 'Those with adhesive allergies', 'People wanting immediate craving relief'],
    imageUrl: '/assets/nrt/habitrol-patch.jpg',
    affiliateLink: 'https://www.amazon.com/Habitrol-Nicotine-Transdermal-System-Patch/dp/B00PZPG7OI',
    availability: 'over-the-counter'
  },

  // Nicotine Lozenges
  {
    id: 'nrt-lozenge-001',
    name: 'Nicorette Lozenges',
    brand: 'Nicorette',
    category: 'lozenge',
    description: 'Nicorette Lozenges dissolve completely in your mouth, releasing medicine that binds to nicotine receptors in your brain to help relieve cravings.',
    rating: 4.4,
    features: ['Discreet', 'Available in multiple flavors', 'Sugar-free', 'No chewing required'],
    priceRange: { min: 29.99, max: 42.99 },
    nicotineContent: '2mg and 4mg options',
    effectivenessTime: { min: 3, max: 5 },
    effectivenessRating: 4,
    strength: 3,
    sideEffects: [
      commonSideEffects.nauseaGum,
      commonSideEffects.headache,
      commonSideEffects.hiccups,
      commonSideEffects.throatIrritation
    ],
    usageInstructions: [
      { step: 1, instruction: 'Place the lozenge in your mouth and allow it to slowly dissolve (20-30 minutes).' },
      { step: 2, instruction: 'Occasionally move the lozenge from one side of your mouth to the other.' },
      { step: 3, instruction: 'Do not chew or swallow the lozenge.' },
      { step: 4, instruction: 'Do not eat or drink for 15 minutes before using or while the lozenge is in your mouth.' }
    ],
    bestFor: ['People who dislike chewing gum', 'Those who need discreet options', 'Smokers wanting a controlled release of nicotine'],
    notRecommendedFor: ['People with mouth sores', 'Those with swallowing difficulties', 'People with phenylketonuria (contains phenylalanine)'],
    imageUrl: '/assets/nrt/nicorette-lozenge.jpg',
    affiliateLink: 'https://www.amazon.com/Nicorette-Nicotine-Lozenge-Stop-Smoking/dp/B00NP7DG8I',
    availability: 'over-the-counter',
    healthImpact: healthImpacts.nicotineLozenge
  },

  // Nicotine Inhalers
  {
    id: 'nrt-inhaler-001',
    name: 'Nicorette Inhaler',
    brand: 'Nicorette',
    category: 'inhaler',
    description: 'The Nicorette Inhaler helps reduce cravings by providing both nicotine and hand-to-mouth ritual satisfaction similar to smoking.',
    rating: 3.8,
    features: ['Mimics hand-to-mouth action of smoking', 'Discreet cartridge system', 'Reusable mouthpiece', 'Fast-acting'],
    priceRange: { min: 38.99, max: 49.99 },
    nicotineContent: '15mg per cartridge (delivers about 4mg)',
    effectivenessTime: { min: 1, max: 2 },
    effectivenessRating: 4,
    strength: 3,
    sideEffects: [
      commonSideEffects.throatIrritation,
      commonSideEffects.coughing,
      commonSideEffects.mouthSores,
      {
        name: 'Mouth and throat irritation',
        description: 'Soreness in mouth and throat from inhaled nicotine.',
        frequency: 'very common',
        severity: 'moderate'
      }
    ],
    usageInstructions: [
      { step: 1, instruction: 'Insert the cartridge into the mouthpiece.' },
      { step: 2, instruction: 'Puff on the inhaler when you have an urge to smoke.' },
      { step: 3, instruction: 'Each cartridge lasts for about 20 minutes of active puffing.' },
      { step: 4, instruction: 'Replace the cartridge when the nicotine effect weakens.' }
    ],
    bestFor: ['People who miss the hand-to-mouth action of smoking', 'Those wanting quick relief', 'Smokers needing behavioral replacement'],
    notRecommendedFor: ['People with severe asthma or COPD', 'Those with mouth or throat inflammation', 'People who prefer discreet options'],
    imageUrl: '/assets/nrt/nicorette-inhaler.jpg',
    affiliateLink: 'https://www.amazon.com/Nicorette-Inhalator-Smoking-Cessation-Cartridges/dp/B00M3GFCJE',
    availability: 'prescription',
    healthImpact: healthImpacts.nicotineInhaler
  },

  // Nicotine Sprays
  {
    id: 'nrt-spray-001',
    name: 'Nicorette QuickMist Spray',
    brand: 'Nicorette',
    category: 'spray',
    description: 'Nicorette QuickMist is a mouth spray that provides the fastest relief of nicotine cravings of any NRT product, working in just 60 seconds.',
    rating: 4.2,
    features: ['Fast-acting (60 seconds)', 'Pocket-sized', 'Fresh mint flavor', 'Discreet to use'],
    priceRange: { min: 34.99, max: 45.99 },
    nicotineContent: '1mg per spray',
    effectivenessTime: { min: 1, max: 1 },
    effectivenessRating: 5,
    strength: 4,
    sideEffects: [
      commonSideEffects.throatIrritation,
      commonSideEffects.nauseaGum,
      commonSideEffects.headache,
      {
        name: 'Tingling sensation',
        description: 'Tingling or burning sensation in the mouth after spraying.',
        frequency: 'very common',
        severity: 'mild'
      }
    ],
    usageInstructions: [
      { step: 1, instruction: 'Point the spray nozzle away from you and prime it by pressing the top of the dispenser several times until a fine mist appears.' },
      { step: 2, instruction: 'Point the spray nozzle towards your open mouth, holding it as close as possible.' },
      { step: 3, instruction: 'Press the top of the dispenser firmly to release one spray into your mouth.' },
      { step: 4, instruction: 'Do not inhale while spraying and avoid swallowing for a few seconds after spraying.' }
    ],
    bestFor: ['People needing the fastest possible craving relief', 'Those who want a discreet option', 'Smokers who need on-demand relief'],
    notRecommendedFor: ['People with severe throat inflammation', 'Those with difficulty operating spray mechanism', 'People under 18 years of age'],
    imageUrl: '/assets/nrt/nicorette-quickmist.jpg',
    affiliateLink: 'https://www.amazon.com/Nicorette-QuickMist-Fresh-150-Sprays/dp/B007FTGAMC',
    availability: 'over-the-counter'
  },
  
  // New Nicotine Pouch Products
  {
    id: 'nrt-pouch-001',
    name: 'ZYN Nicotine Pouches',
    brand: 'ZYN',
    category: 'lozenge', // Using lozenge as the closest category since pouches don't exist yet
    description: 'ZYN nicotine pouches are smoke-free, tobacco-free pouches that fit discreetly under your lip for up to an hour of nicotine satisfaction.',
    rating: 4.7,
    features: ['Tobacco-free', 'Discreet white pouches', 'No spitting required', 'Multiple flavors available'],
    priceRange: { min: 22.99, max: 29.99 },
    nicotineContent: '3mg to 6mg per pouch',
    effectivenessTime: { min: 2, max: 5 },
    effectivenessRating: 5,
    strength: 4,
    sideEffects: [
      commonSideEffects.drymouth,
      commonSideEffects.mouthTingling,
      commonSideEffects.nauseaGum,
      {
        name: 'Gum irritation',
        description: 'Redness or mild irritation where the pouch sits against the gum.',
        frequency: 'common',
        severity: 'mild'
      }
    ],
    usageInstructions: [
      { step: 1, instruction: 'Place one pouch between your upper lip and gum.' },
      { step: 2, instruction: 'Leave in place for up to 60 minutes for steady nicotine release.' },
      { step: 3, instruction: 'No need to spit while using.' },
      { step: 4, instruction: 'Dispose of used pouch responsibly after use.' }
    ],
    bestFor: ['Former smokers looking for a discreet alternative', 'People who want a tobacco-free option', "Those who don't want to chew gum"],
    notRecommendedFor: ['People with gum disease or mouth sores', 'Those sensitive to artificial sweeteners', 'People under 21 years of age'],
    imageUrl: '/assets/nrt/zyn-pouches.jpg',
    affiliateLink: 'https://www.amazon.com/ZYN-Nicotine-Pouches-Cool-Pack/dp/B07BF5F3XK',
    availability: 'over-the-counter',
    healthImpact: healthImpacts.nicotinePouch
  },
  {
    id: 'nrt-pouch-002',
    name: 'ON! Nicotine Pouches',
    brand: 'ON!',
    category: 'lozenge', // Using lozenge as the closest category
    description: 'ON! nicotine pouches provide a smoke-free, spit-free, and tobacco leaf-free way to enjoy nicotine, with a variety of flavors and strengths.',
    rating: 4.6,
    features: ['Small discreet size', 'Multiple strength options', 'Various flavors', 'Fast-acting'],
    priceRange: { min: 19.99, max: 24.99 },
    nicotineContent: '2mg, 4mg, and 8mg options',
    effectivenessTime: { min: 1, max: 4 },
    effectivenessRating: 4,
    strength: 3,
    sideEffects: [
      commonSideEffects.drymouth,
      commonSideEffects.mouthTingling,
      commonSideEffects.hiccups,
      {
        name: 'Slight lip tingling',
        description: 'Mild tingling sensation in the lip area where the pouch is placed.',
        frequency: 'very common',
        severity: 'mild'
      }
    ],
    usageInstructions: [
      { step: 1, instruction: 'Place one pouch between your upper lip and gum.' },
      { step: 2, instruction: 'Allow the pouch to sit comfortably without moving it around.' },
      { step: 3, instruction: 'Experience nicotine release for up to 30 minutes.' },
      { step: 4, instruction: 'Remove and dispose of properly when finished.' }
    ],
    bestFor: ['First-time NRT users (with lower strengths)', 'Former smokers seeking variety of flavors', 'Those needing discreet nicotine options'],
    notRecommendedFor: ['People with sensitive gums', 'Those with mouth ulcers', 'People who prefer unflavored products'],
    imageUrl: '/assets/nrt/on-pouches.jpg',
    affiliateLink: 'https://www.amazon.com/Nicotine-Pouches-Wintergreen-Cessation-Flavor/dp/B08TD1BCNX',
    availability: 'over-the-counter',
    healthImpact: healthImpacts.nicotinePouch
  },
  
  // Add more products as needed
];

// Add health impact information to existing products
nrtProductsData.forEach(product => {
  if (!product.healthImpact) {
    if (product.category === 'gum') {
      product.healthImpact = healthImpacts.nicotineGum;
    } else if (product.category === 'patch') {
      product.healthImpact = healthImpacts.nicotinePatch;
    } else if (product.category === 'lozenge') {
      product.healthImpact = healthImpacts.nicotineLozenge;
    } else if (product.category === 'inhaler') {
      product.healthImpact = healthImpacts.nicotineInhaler;
    } else if (product.category === 'spray') {
      product.healthImpact = healthImpacts.nicotineSpray;
    }
  }
});

export default nrtProductsData; 