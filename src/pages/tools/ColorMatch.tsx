
import { TopNav } from "@/components/layout/TopNav"
import ColorMatchGame from "@/components/games/ColorMatch"

export default function ColorMatch() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto p-4">
        <ColorMatchGame />
      </div>
    </div>
  )
}
