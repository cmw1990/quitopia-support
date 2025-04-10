
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { Slider } from "@/components/ui/slider"
import { Toggle } from "@/components/ui/toggle"
import { Cloud, Waves, Wind, TreePine, Bird } from "lucide-react"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"

type Sound = {
  name: string
  icon: typeof Cloud
  audio: HTMLAudioElement | null
  volume: number
  isPlaying: boolean
}

export default function NatureSounds() {
  const [sounds, setSounds] = useState<Sound[]>([
    { name: "Rain", icon: Cloud, audio: null, volume: 0.5, isPlaying: false },
    { name: "Ocean", icon: Waves, audio: null, volume: 0.5, isPlaying: false },
    { name: "Wind", icon: Wind, audio: null, volume: 0.5, isPlaying: false },
    { name: "Forest", icon: TreePine, audio: null, volume: 0.5, isPlaying: false },
    { name: "Birds", icon: Bird, audio: null, volume: 0.5, isPlaying: false },
  ])

  useEffect(() => {
    // Initialize audio elements
    setSounds(prev => prev.map(sound => ({
      ...sound,
      audio: new Audio(`/sounds/${sound.name.toLowerCase()}.mp3`)
    })))

    return () => {
      // Cleanup audio elements
      sounds.forEach(sound => {
        if (sound.audio) {
          sound.audio.pause()
          sound.audio.currentTime = 0
        }
      })
    }
  }, [])

  const toggleSound = (index: number) => {
    setSounds(prev => prev.map((sound, i) => {
      if (i === index) {
        if (sound.audio) {
          if (sound.isPlaying) {
            sound.audio.pause()
          } else {
            sound.audio.loop = true
            sound.audio.volume = sound.volume
            sound.audio.play().catch(e => console.log('Audio play failed:', e))
          }
        }
        return { ...sound, isPlaying: !sound.isPlaying }
      }
      return sound
    }))
  }

  const adjustVolume = (index: number, value: number[]) => {
    setSounds(prev => prev.map((sound, i) => {
      if (i === index) {
        if (sound.audio) {
          sound.audio.volume = value[0]
        }
        return { ...sound, volume: value[0] }
      }
      return sound
    }))
  }

  const currentSettings = {
    activeSounds: sounds.filter(s => s.isPlaying).map(s => ({
      name: s.name,
      volume: s.volume
    }))
  }

  return (
    <ToolAnalyticsWrapper 
      toolName="nature-sounds"
      toolType="relaxation"
      toolSettings={currentSettings}
    >
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle>Nature Sounds</CardTitle>
              <CardDescription>
                Mix different nature sounds to create your perfect ambient environment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {sounds.map((sound, index) => (
                <div key={sound.name} className="flex items-center gap-4">
                  <Toggle
                    pressed={sound.isPlaying}
                    onPressedChange={() => toggleSound(index)}
                    className="w-[100px]"
                  >
                    <sound.icon className="h-4 w-4 mr-2" />
                    {sound.name}
                  </Toggle>
                  <div className="flex-1">
                    <Slider
                      value={[sound.volume]}
                      onValueChange={(value) => adjustVolume(index, value)}
                      max={1}
                      step={0.1}
                      disabled={!sound.isPlaying}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolAnalyticsWrapper>
  )
}
