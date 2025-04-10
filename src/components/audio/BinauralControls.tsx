import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, Volume2, Info } from "lucide-react"
import { BINAURAL_RANGES, BinauralBeatType } from "@/lib/audio-engine"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export interface BinauralControlsProps {
  binauralFrequency: number
  binauralVolume: number
  onFrequencyChange: (frequency: number) => void
  onVolumeChange: (volume: number) => void
  frequencyDescription?: string
  isPlaying?: boolean
}

const frequencyRanges = {
  delta: { min: 0.5, max: 4, default: 2 },
  theta: { min: 4, max: 8, default: 6 },
  alpha: { min: 8, max: 14, default: 10 },
  beta: { min: 14, max: 30, default: 20 },
  gamma: { min: 30, max: 40, default: 35 }
}

export function BinauralControls({
  binauralFrequency,
  binauralVolume,
  onFrequencyChange,
  onVolumeChange,
  frequencyDescription,
  isPlaying = false
}: BinauralControlsProps) {
  const [activeTab, setActiveTab] = useState<BinauralBeatType>(() => {
    return getCurrentFrequencyType(binauralFrequency)
  })
  const [hoverFrequency, setHoverFrequency] = useState<number | null>(null)

  // Update active tab when frequency changes externally
  useEffect(() => {
    const type = getCurrentFrequencyType(binauralFrequency)
    if (type !== activeTab) {
      setActiveTab(type)
    }
  }, [binauralFrequency])

  function getCurrentFrequencyType(freq: number): BinauralBeatType {
    for (const [type, range] of Object.entries(frequencyRanges)) {
      if (freq >= range.min && freq <= range.max) {
        return type as BinauralBeatType
      }
    }
    return "alpha" // Default
  }

  function handleTabChange(value: string) {
    const newTab = value as BinauralBeatType
    setActiveTab(newTab)
    
    // Set frequency to the default for this range
    const newFrequency = frequencyRanges[newTab].default
    onFrequencyChange(newFrequency)
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Brain className="h-5 w-5 text-primary mr-2" />
            <span className="font-medium">Binaural Beat Frequency</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[300px]">
                <p>Binaural beats are an auditory illusion perceived when two different pure-tone sine waves are presented to each ear.</p>
                <p className="mt-2">Different frequency ranges affect your brain state differently.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full grid grid-cols-5">
            {Object.keys(frequencyRanges).map((type) => (
              <TabsTrigger key={type} value={type} className="capitalize">
                {type}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(frequencyRanges).map(([type, range]) => (
            <TabsContent key={type} value={type} className="pt-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      {BINAURAL_RANGES[type as BinauralBeatType]?.name || type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                    <Badge variant="outline" className="font-mono">
                      {binauralFrequency.toFixed(1)} Hz
                    </Badge>
                  </div>

                  <div 
                    className="h-1 bg-muted rounded-full relative"
                    onMouseLeave={() => setHoverFrequency(null)}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const percent = (e.clientX - rect.left) / rect.width
                      const freq = range.min + percent * (range.max - range.min)
                      setHoverFrequency(Math.min(range.max, Math.max(range.min, freq)))
                    }}
                  >
                    {/* Track background with gradient */}
                    <div 
                      className="absolute top-0 left-0 h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, 
                          var(--primary-300) 0%, 
                          var(--primary-500) 50%, 
                          var(--primary-700) 100%)`,
                        width: `${((binauralFrequency - range.min) / (range.max - range.min)) * 100}%`,
                        opacity: isPlaying ? 1 : 0.6
                      }}
                    />
                    
                    {/* Pulsing circle when playing */}
                    {isPlaying && (
                      <motion.div 
                        className="w-3 h-3 bg-primary rounded-full absolute top-1/2 transform -translate-y-1/2"
                        style={{
                          left: `${((binauralFrequency - range.min) / (range.max - range.min)) * 100}%`,
                          filter: "drop-shadow(0 0 3px var(--primary-500))"
                        }}
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                    )}
                    
                    {/* Hover indicator */}
                    {hoverFrequency !== null && (
                      <div 
                        className="absolute top-[-8px] transform -translate-x-1/2 text-xs opacity-80 pointer-events-none"
                        style={{ 
                          left: `${((hoverFrequency - range.min) / (range.max - range.min)) * 100}%`,
                        }}
                      >
                        {hoverFrequency.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>

                <Slider
                  value={[binauralFrequency]}
                  min={range.min}
                  max={range.max}
                  step={0.1}
                  onValueChange={(value) => onFrequencyChange(value[0])}
                />

                <div className="flex justify-between items-center pt-1">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{BINAURAL_RANGES[type as BinauralBeatType]?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {BINAURAL_RANGES[type as BinauralBeatType]?.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Slider 
                      value={[binauralVolume]} 
                      min={0} 
                      max={1} 
                      step={0.01} 
                      onValueChange={(value) => onVolumeChange(value[0])} 
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
