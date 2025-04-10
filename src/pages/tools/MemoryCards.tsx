
import { TopNav } from "@/components/layout/TopNav"
import MemoryCardsGame from "@/components/games/MemoryCards"

export default function MemoryCards() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto p-4">
        <MemoryCardsGame />
      </div>
    </div>
  )
}
