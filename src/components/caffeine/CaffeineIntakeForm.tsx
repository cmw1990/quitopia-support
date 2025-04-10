import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info } from "lucide-react";
import { useState } from "react";

const CAFFEINE_REFERENCE = [
  { name: "Coffee (8 oz)", amount: 95 },
  { name: "Espresso (1 oz)", amount: 64 },
  { name: "Black Tea (8 oz)", amount: 47 },
  { name: "Green Tea (8 oz)", amount: 28 },
  { name: "Energy Drink (8 oz)", amount: 80 },
  { name: "Cola (12 oz)", amount: 34 },
];

interface CaffeineIntakeFormProps {
  onSubmit: (values: { amount: string; energyRating: string; consumedAt: string }) => void;
}

export const CaffeineIntakeForm = ({ onSubmit }: CaffeineIntakeFormProps) => {
  const [amount, setAmount] = useState("");
  const [energyRating, setEnergyRating] = useState("");
  const [consumedAt, setConsumedAt] = useState(new Date().toISOString().slice(0, 16));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ amount, energyRating, consumedAt });
    setAmount("");
    setEnergyRating("");
    setConsumedAt(new Date().toISOString().slice(0, 16));
  };

  const getEnergyColor = (rating: string) => {
    const numRating = parseInt(rating);
    if (!numRating) return "bg-gray-100";
    if (numRating <= 3) return "bg-energy-low";
    if (numRating <= 7) return "bg-energy-medium";
    return "bg-energy-high";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="amount">Caffeine Amount (mg)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">Common Caffeine Amounts</h4>
                <div className="grid gap-2">
                  {CAFFEINE_REFERENCE.map((item) => (
                    <div 
                      key={item.name} 
                      className="flex justify-between text-sm cursor-pointer hover:bg-accent/50 p-1 rounded"
                      onClick={() => setAmount(item.amount.toString())}
                    >
                      <span>{item.name}</span>
                      <span className="font-medium">{item.amount} mg</span>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Input
          id="amount"
          type="number"
          placeholder="e.g., 95 for a cup of coffee"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="text-lg"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="energyRating">Energy Rating (1-10)</Label>
        <div className="relative">
          <Input
            id="energyRating"
            type="number"
            min="1"
            max="10"
            placeholder="Rate your energy level"
            value={energyRating}
            onChange={(e) => setEnergyRating(e.target.value)}
            className={`text-lg transition-colors ${getEnergyColor(energyRating)}`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
            {[1, 5, 10].map((level) => (
              <div
                key={level}
                className={`w-2 h-2 rounded-full ${getEnergyColor(level.toString())}`}
                title={level === 1 ? "Low" : level === 5 ? "Medium" : "High"}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="consumedAt">Time Consumed</Label>
        <Input
          id="consumedAt"
          type="datetime-local"
          value={consumedAt}
          onChange={(e) => setConsumedAt(e.target.value)}
          className="text-lg"
        />
      </div>
      <Button type="submit" className="w-full">
        Log Intake
      </Button>
    </form>
  );
};