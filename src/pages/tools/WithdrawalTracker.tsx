
import { TopNav } from "@/components/layout/TopNav"
import { WithdrawalTracker as WithdrawalTrackerComponent } from "@/components/sobriety/WithdrawalTracker"

export default function WithdrawalTracker() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto p-4">
        <WithdrawalTrackerComponent />
      </div>
    </div>
  )
}
