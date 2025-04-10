
import { TopNav } from "@/components/layout/TopNav"
import BrainMatch3Game from "@/components/games/BrainMatch3"

export default function BrainMatch3() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto p-4">
        <BrainMatch3Game />
      </div>
    </div>
  )
}
