import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Coffee, Apple, Hand, ExternalLink } from 'lucide-react';

interface HolisticAlternativesProps {
  onComplete: (newIntensity: number) => void;
}

// Holistic alternatives by category
const alternatives = {
  oral: [
    {
      name: 'Cinnamon Stick',
      description: 'Hold between fingers and draw to mouth like a cigarette. The scent and taste provide sensory satisfaction.',
      ingredients: 'Cinnamon stick',
      effect: 'Provides oral stimulation and pleasant aroma',
      preparation: 'Use as is, or lightly moisten the tip with water',
      category: 'Natural'
    },
    {
      name: 'Herbal Tea Ritual',
      description: 'Replace smoking breaks with a mindful tea ritual that engages multiple senses.',
      ingredients: 'Caffeine-free herbal tea (chamomile, rooibos, or mint)',
      effect: 'Gives hands something to do, provides pleasant aroma and taste',
      preparation: 'Brew tea and focus on the sensory experience',
      category: 'Natural'
    },
    {
      name: 'Clove & Cardamom',
      description: 'Traditional Eastern remedy for cigarette cravings that provides strong oral sensations.',
      ingredients: 'Whole cloves, cardamom pods',
      effect: 'Creates a tingling sensation similar to smoking',
      preparation: 'Gently chew a single clove or cardamom pod',
      category: 'Natural'
    }
  ],
  sensory: [
    {
      name: 'Essential Oil Inhaler',
      description: 'Portable inhaler with essential oils that can satisfy the sensory aspects of smoking.',
      ingredients: 'Essential oils (eucalyptus, peppermint, black pepper)',
      effect: 'Stimulates respiratory system similar to smoking',
      preparation: 'Add drops to a personal inhaler tube or handkerchief',
      category: 'Natural'
    },
    {
      name: 'Aromatic Sensory Jar',
      description: 'Create a small jar with fragrant items that you can open and smell during cravings.',
      ingredients: 'Coffee beans, cinnamon sticks, citrus peels, or vanilla pod',
      effect: 'Provides strong sensory distraction from cravings',
      preparation: 'Combine ingredients in a small sealed jar',
      category: 'DIY'
    },
    {
      name: 'Sensory Breathing',
      description: 'A breathing technique that focuses on the sensations of breath entering and leaving the body.',
      ingredients: 'None required',
      effect: 'Mimics the deep inhalation of smoking',
      preparation: 'Breathe in deeply through the nose, feeling the air, hold, then exhale slowly',
      category: 'Natural'
    }
  ],
  tactile: [
    {
      name: 'Stress Ball or Fidget',
      description: 'Keep hands busy and redirect nervous energy during cravings.',
      ingredients: 'Stress ball, fidget cube, or worry stone',
      effect: 'Addresses the hand-to-mouth habit and nervous energy',
      preparation: 'Keep handy in pockets, desk, or car',
      category: 'Tool'
    },
    {
      name: 'Textured Worry Stone',
      description: 'Natural stone with a thumb-sized depression that can be rubbed during cravings.',
      ingredients: 'Smooth river stone or commercial worry stone',
      effect: 'Provides soothing tactile stimulation',
      preparation: 'Carry in pocket and use during cravings',
      category: 'Natural'
    },
    {
      name: 'Hand Exercise Routine',
      description: 'Sequence of hand exercises to redirect craving energy and busy your hands.',
      ingredients: 'None required',
      effect: 'Distracts from hand-to-mouth habit',
      preparation: 'Practice finger tapping, hand stretches, or grip exercises',
      category: 'Natural'
    }
  ]
};

export const HolisticAlternatives: React.FC<HolisticAlternativesProps> = ({ onComplete }) => {
  const [activeCategory, setActiveCategory] = useState('oral');
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);
  const [alternativeComplete, setAlternativeComplete] = useState(false);
  const [currentIntensity, setCurrentIntensity] = useState(5);
  
  const getSelectedAlternative = () => {
    const categoryAlternatives = alternatives[activeCategory as keyof typeof alternatives];
    return categoryAlternatives.find(alt => alt.name === selectedAlternative);
  };
  
  const handleSelectAlternative = (name: string) => {
    setSelectedAlternative(name);
    setAlternativeComplete(false);
  };
  
  const handleCompleteAlternative = () => {
    setAlternativeComplete(true);
  };
  
  const handleSubmitRating = () => {
    onComplete(currentIntensity);
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'oral':
        return <Coffee className="h-4 w-4" />;
      case 'sensory':
        return <Apple className="h-4 w-4" />;
      case 'tactile':
        return <Hand className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-4">
      {!selectedAlternative ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Holistic alternatives provide natural substitutes for different aspects of smoking, addressing oral fixation, sensory experiences, and hand movements.
          </p>
          
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="oral" className="flex items-center">
                <Coffee className="h-4 w-4 mr-2" />
                Oral
              </TabsTrigger>
              <TabsTrigger value="sensory" className="flex items-center">
                <Apple className="h-4 w-4 mr-2" />
                Sensory
              </TabsTrigger>
              <TabsTrigger value="tactile" className="flex items-center">
                <Hand className="h-4 w-4 mr-2" />
                Tactile
              </TabsTrigger>
            </TabsList>
            
            {Object.entries(alternatives).map(([category, categoryAlternatives]) => (
              <TabsContent key={category} value={category} className="mt-4">
                <div className="grid gap-4">
                  {categoryAlternatives.map(alternative => (
                    <Card 
                      key={alternative.name} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSelectAlternative(alternative.name)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{alternative.name}</CardTitle>
                          <Badge variant="outline">
                            {alternative.category}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {alternative.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </>
      ) : !alternativeComplete ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedAlternative(null)}
            >
              Back to alternatives
            </Button>
            <Badge variant="outline">
              {getCategoryIcon(activeCategory)}
              <span className="ml-1 capitalize">{activeCategory}</span>
            </Badge>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{getSelectedAlternative()?.name}</CardTitle>
                <Badge variant="outline">{getSelectedAlternative()?.category}</Badge>
              </div>
              <CardDescription>
                {getSelectedAlternative()?.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">What You'll Need:</h4>
                <p className="text-sm">{getSelectedAlternative()?.ingredients}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">How It Helps:</h4>
                <p className="text-sm">{getSelectedAlternative()?.effect}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">How To Use:</h4>
                <p className="text-sm">{getSelectedAlternative()?.preparation}</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open(`https://www.google.com/search?q=${getSelectedAlternative()?.name}+smoking+alternative`, '_blank')}
              >
                Learn More <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
              <Button 
                className="w-full"
                onClick={handleCompleteAlternative}
              >
                <Check className="mr-2 h-4 w-4" />
                I've Tried This Alternative
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-medium">How intense is your craving now?</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">1 (Very Mild)</span>
              <span className="text-sm">10 (Very Intense)</span>
            </div>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[currentIntensity]}
              onValueChange={(val) => setCurrentIntensity(val[0])}
            />
          </div>
          
          <Button onClick={handleSubmitRating} className="w-full">
            Complete & Continue
          </Button>
        </div>
      )}
    </div>
  );
}; 