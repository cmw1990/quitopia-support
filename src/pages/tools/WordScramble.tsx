
import { TopNav } from "@/components/layout/TopNav"
import WordScrambleGame from "@/components/games/WordScramble"

export default function WordScramble() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto p-4">
        <WordScrambleGame />
      </div>
    </div>
  )
}
