
import { TopNav } from "@/components/layout/TopNav"
import MentalRotationGame from "@/components/games/MentalRotation"

export default function MentalRotation() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto p-4">
        <MentalRotationGame />
      </div>
    </div>
  )
}
