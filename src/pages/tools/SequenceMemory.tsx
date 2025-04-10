
import { TopNav } from "@/components/layout/TopNav"
import SequenceMemoryGame from "@/components/games/SequenceMemory"

export default function SequenceMemory() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto p-4">
        <SequenceMemoryGame />
      </div>
    </div>
  )
}
