import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Session } from '@supabase/supabase-js';
import { supabaseRestCall } from "../../api/apiCompatibility";
import { GameComponentProps } from './types';
import { Wind, ArrowLeft, Sun, Cloud, Leaf, Droplet, MoveHorizontal } from 'lucide-react';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';

interface ZenGardenProps extends GameComponentProps {
  session: Session | null;
}

interface GardenItem {
  id: string;
  type: 'rock' | 'plant' | 'water' | 'sand';
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

const ZenGarden: React.FC<ZenGardenProps> = ({
  session,
  onComplete,
  difficulty = 'medium',
  onBack
}) => {
  // Game state
  const [activeTab, setActiveTab] = useState<'garden' | 'elements' | 'actions'>('garden');
  const [gardenItems, setGardenItems] = useState<GardenItem[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<GardenItem | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [ambientSound, setAmbientSound] = useState<boolean>(true);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [relaxationScore, setRelaxationScore] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedTool, setSelectedTool] = useState<'move' | 'rotate' | 'resize' | 'delete'>('move');
  
  // Refs
  const gardenRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/sounds/zen-ambient.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  // Time tracking
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Handle ambient sound
  useEffect(() => {
    if (ambientSound && !audioPlaying && audioRef.current) {
      audioRef.current.play().then(() => {
        setAudioPlaying(true);
      }).catch(error => {
        console.error('Error playing audio:', error);
        setAudioPlaying(false);
      });
    } else if ((!ambientSound || !audioRef.current) && audioPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setAudioPlaying(false);
    }
  }, [ambientSound, audioPlaying]);
  
  // Calculate relaxation score based on garden composition and time spent
  useEffect(() => {
    // At least 3 minutes for good score
    const timeMultiplier = Math.min(1, timeSpent / 180);
    
    // Balance of elements improves score (having different types)
    const elementTypes = new Set(gardenItems.map(item => item.type));
    const diversityScore = Math.min(1, elementTypes.size / 4);
    
    // Having at least a few items
    const quantityScore = Math.min(1, gardenItems.length / 8);
    
    // Calculate final score (0-100)
    const calculatedScore = Math.round((timeMultiplier * 0.4 + diversityScore * 0.3 + quantityScore * 0.3) * 100);
    setRelaxationScore(calculatedScore);
    
    // Complete the game if spent at least 3 minutes and scored over 70
    if (timeSpent >= 180 && calculatedScore >= 70 && !saved) {
      saveProgress();
    }
  }, [timeSpent, gardenItems, saved]);
  
  // Add new item to garden
  const addItem = (type: GardenItem['type']) => {
    if (!gardenRef.current) return;
    
    // Get garden dimensions
    const gardenRect = gardenRef.current.getBoundingClientRect();
    
    // Create a new item at the center
    const newItem: GardenItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      x: gardenRect.width / 2,
      y: gardenRect.height / 2,
      rotation: Math.random() * 360,
      scale: 1
    };
    
    setGardenItems([...gardenItems, newItem]);
    setSelectedItemIndex(gardenItems.length);
  };
  
  // Handle item drag
  const handleDragStart = (index: number) => {
    setSelectedItemIndex(index);
    setDraggedItem(gardenItems[index]);
  };
  
  // Handle drag update
  const handleDragUpdate = (info: any, index: number) => {
    if (selectedTool !== 'move') return;
    
    const updatedItems = [...gardenItems];
    updatedItems[index] = {
      ...updatedItems[index],
      x: updatedItems[index].x + info.delta.x,
      y: updatedItems[index].y + info.delta.y
    };
    setGardenItems(updatedItems);
  };
  
  // Handle item rotation
  const handleRotate = (change: number) => {
    if (selectedItemIndex === null) return;
    
    const updatedItems = [...gardenItems];
    updatedItems[selectedItemIndex] = {
      ...updatedItems[selectedItemIndex],
      rotation: (updatedItems[selectedItemIndex].rotation + change) % 360
    };
    setGardenItems(updatedItems);
  };
  
  // Handle item resize
  const handleResize = (value: number[]) => {
    if (selectedItemIndex === null) return;
    
    const updatedItems = [...gardenItems];
    updatedItems[selectedItemIndex] = {
      ...updatedItems[selectedItemIndex],
      scale: value[0]
    };
    setGardenItems(updatedItems);
  };
  
  // Delete selected item
  const deleteItem = () => {
    if (selectedItemIndex === null) return;
    
    const updatedItems = [...gardenItems];
    updatedItems.splice(selectedItemIndex, 1);
    setGardenItems(updatedItems);
    setSelectedItemIndex(null);
  };
  
  // Save garden progress to database
  const saveProgress = async () => {
    if (!session?.user?.id) return;
    
    try {
      await supabaseRestCall(
        '/rest/v1/game_progress',
        {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            user_id: session.user.id,
            game_id: 'zen-garden',
            score: relaxationScore,
            time_played: timeSpent,
            difficulty: difficulty,
            data: JSON.stringify(gardenItems),
            completed_at: new Date().toISOString()
          })
        },
        session
      );
      
      setSaved(true);
      
      if (onComplete) {
        onComplete(relaxationScore);
      }
    } catch (error) {
      console.error('Error saving game progress:', error instanceof Error ? error.message : 'Unknown error');
    }
  };
  
  // Get element icon based on type
  const getItemIcon = (type: GardenItem['type']) => {
    switch (type) {
      case 'rock':
        return (
          <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" className="text-gray-600">
            <path d="M20 8.99997L14 3.99997L4 3.99997L2 7.99997L4 15L8 18L19 18L22 14L20 8.99997Z" />
          </svg>
        );
      case 'plant':
        return <Leaf className="w-full h-full text-green-600" />;
      case 'water':
        return <Droplet className="w-full h-full text-blue-500" />;
      case 'sand':
        return (
          <svg viewBox="0 0 24 24" width="100%" height="100%" stroke="currentColor" fill="none" className="text-amber-500">
            <path d="M8 15L3 21H21L16 15M8 15L12 9M8 15H16M16 15L12 9M12 9L14 6L10 3L8 6L12 9" />
          </svg>
        );
      default:
        return <div className="w-full h-full bg-gray-300 rounded-full" />;
    }
  };
  
  // Format time in mm:ss format
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={onBack} className="p-0 h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-semibold">Zen Garden</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <Switch
            checked={ambientSound}
            onCheckedChange={setAmbientSound}
            id="sound-toggle"
          />
          <Label htmlFor="sound-toggle" className="text-sm">Ambient Sound</Label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-4">
        {/* Garden Area */}
        <Card className="overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Your Zen Garden</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formatTime(timeSpent)}
              </div>
            </div>
            <CardDescription>
              Arrange elements to create your perfect zen space
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-4">
            <div 
              ref={gardenRef}
              className={`relative w-full h-[300px] md:h-[400px] bg-gradient-to-br from-amber-50 to-stone-100 rounded-lg overflow-hidden border shadow-inner ${showGrid ? 'bg-grid' : ''}`}
              onClick={() => setSelectedItemIndex(null)}
            >
              {gardenItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className={`absolute cursor-grab active:cursor-grabbing ${selectedItemIndex === index ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  style={{
                    width: `${50 * item.scale}px`,
                    height: `${50 * item.scale}px`,
                    top: 0,
                    left: 0,
                    x: item.x - ((50 * item.scale) / 2),
                    y: item.y - ((50 * item.scale) / 2),
                    rotate: item.rotation,
                    zIndex: selectedItemIndex === index ? 10 : 1
                  }}
                  drag={selectedTool === 'move'}
                  dragMomentum={false}
                  onDragStart={() => handleDragStart(index)}
                  onDrag={(_, info) => handleDragUpdate(info, index)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItemIndex(index);
                  }}
                >
                  {getItemIcon(item.type)}
                </motion.div>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="p-4 pt-2 flex flex-wrap gap-2">
            <div className="flex items-center gap-2 mr-auto">
              <div className="text-sm font-medium">Relaxation Score:</div>
              <div className="text-sm font-bold">{relaxationScore}%</div>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-out" 
                  style={{ width: `${relaxationScore}%` }}
                ></div>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowGrid(!showGrid)}
            >
              {showGrid ? 'Hide Grid' : 'Show Grid'}
            </Button>
            
            <Button
              size="sm"
              variant="default"
              onClick={saveProgress}
              disabled={saved}
            >
              {saved ? 'Garden Saved' : 'Save Garden'}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Controls */}
        <Card>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="w-full">
              <TabsTrigger value="garden" className="flex-1">Garden</TabsTrigger>
              <TabsTrigger value="elements" className="flex-1">Elements</TabsTrigger>
              <TabsTrigger value="actions" className="flex-1">Tools</TabsTrigger>
            </TabsList>
            
            <TabsContent value="garden" className="p-4 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Instructions</h3>
                <p className="text-sm text-muted-foreground">
                  Create your zen garden by adding and arranging elements. Spend at least 3 minutes 
                  for the best relaxation benefits.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Your Garden</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Elements:</span>
                    <span>{gardenItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span>{formatTime(timeSpent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Score:</span>
                    <span>{relaxationScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span>{saved ? 'Saved' : 'Unsaved'}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="elements" className="p-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Add Elements</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col gap-1"
                    onClick={() => addItem('rock')}
                  >
                    <div className="w-6 h-6">
                      {getItemIcon('rock')}
                    </div>
                    <span className="text-xs">Rock</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col gap-1"
                    onClick={() => addItem('plant')}
                  >
                    <div className="w-6 h-6">
                      {getItemIcon('plant')}
                    </div>
                    <span className="text-xs">Plant</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col gap-1"
                    onClick={() => addItem('water')}
                  >
                    <div className="w-6 h-6">
                      {getItemIcon('water')}
                    </div>
                    <span className="text-xs">Water</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col gap-1"
                    onClick={() => addItem('sand')}
                  >
                    <div className="w-6 h-6">
                      {getItemIcon('sand')}
                    </div>
                    <span className="text-xs">Sand</span>
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="actions" className="p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Select Tool</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={selectedTool === 'move' ? 'default' : 'outline'}
                      className="h-10"
                      onClick={() => setSelectedTool('move')}
                    >
                      <MoveHorizontal className="h-4 w-4 mr-2" />
                      Move
                    </Button>
                    
                    <Button
                      variant={selectedTool === 'rotate' ? 'default' : 'outline'}
                      className="h-10"
                      onClick={() => setSelectedTool('rotate')}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Rotate
                    </Button>
                    
                    <Button
                      variant={selectedTool === 'resize' ? 'default' : 'outline'}
                      className="h-10"
                      onClick={() => setSelectedTool('resize')}
                    >
                      <Maximize className="h-4 w-4 mr-2" />
                      Resize
                    </Button>
                    
                    <Button
                      variant={selectedTool === 'delete' ? 'destructive' : 'outline'}
                      className="h-10"
                      onClick={() => {
                        setSelectedTool('delete');
                        if (selectedItemIndex !== null) {
                          deleteItem();
                        }
                      }}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
                
                {selectedTool === 'rotate' && selectedItemIndex !== null && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Rotation</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRotate(-45)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRotate(45)}
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {selectedTool === 'resize' && selectedItemIndex !== null && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Size</h3>
                    <Slider
                      min={0.5}
                      max={3}
                      step={0.1}
                      value={[gardenItems[selectedItemIndex]?.scale || 1]}
                      onValueChange={handleResize}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

// Missing components definition
const Clock = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const RotateCcw = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 2v6h6" />
    <path d="M3 8c0 9.94 8.06 18 18 18a18 18 0 0 0 18-18S29 3 21 3c-6.91 0-15 4-18 5Z" />
  </svg>
);

const RotateCw = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 2v6h-6" />
    <path d="M21 8A9 9 0 0 0 3 8a9 9 0 0 0 18 0Z" />
  </svg>
);

const Maximize = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
);

const Trash = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

export default ZenGarden; 