import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";
import { useState } from "react";

const NICOTINE_REFERENCE = [
  // Cigarettes and traditional products
  { name: "Cigarette (Regular)", amount: 12, type: "cigarette" },
  { name: "Cigarette (Light)", amount: 8, type: "cigarette" },
  { name: "Cigar (Regular)", amount: 13.3, type: "cigar" },
  { name: "Pipe (per bowl)", amount: 30.08, type: "pipe" },
  
  // Smokeless tobacco
  { name: "Nicotine Pouch (Regular)", amount: 4, type: "pouch" },
  { name: "Nicotine Pouch (Strong)", amount: 8, type: "pouch" },
  { name: "Nicotine Pouch (Extra Strong)", amount: 11.2, type: "pouch" },
  
  // NRT Products
  { name: "Nicotine Gum (2mg)", amount: 2, type: "nrt" },
  { name: "Nicotine Gum (4mg)", amount: 4, type: "nrt" },
  { name: "Nicotine Lozenge (2mg)", amount: 2, type: "nrt" },
  { name: "Nicotine Patch (21mg/24hr)", amount: 21, type: "nrt" },
  
  // Vaping products
  { name: "Vape (Low strength)", amount: 3, type: "vape" },
  { name: "Vape (Medium strength)", amount: 6, type: "vape" },
  { name: "Vape (High strength)", amount: 12, type: "vape" },
];

const PRODUCT_TYPES = [
  { value: "cigarette", label: "Cigarette" },
  { value: "cigar", label: "Cigar" },
  { value: "pipe", label: "Pipe Tobacco" },
  { value: "pouch", label: "Nicotine Pouch" },
  { value: "nrt", label: "NRT (Nicotine Replacement)" },
  { value: "vape", label: "Vape/E-cigarette" },
  { value: "gum", label: "Nicotine Gum" },
  { value: "lozenge", label: "Nicotine Lozenge" },
  { value: "patch", label: "Nicotine Patch" },
];

interface NicotineIntakeFormProps {
  onSubmit: (values: { amount: string; energyRating: string; consumedAt: string; type: string }) => void;
}

export const NicotineIntakeForm = ({ onSubmit }: NicotineIntakeFormProps) => {
  const [amount, setAmount] = useState("");
  const [energyRating, setEnergyRating] = useState("");
  const [type, setType] = useState("pouch");
  const [consumedAt, setConsumedAt] = useState(new Date().toISOString().slice(0, 16));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ amount, energyRating, consumedAt, type });
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

  const filteredReference = type ? NICOTINE_REFERENCE.filter(item => item.type === type) : NICOTINE_REFERENCE;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Product Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Select product type" />
          </SelectTrigger>
          <SelectContent>
            {PRODUCT_TYPES.map((productType) => (
              <SelectItem key={productType.value} value={productType.value}>
                {productType.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="amount">Nicotine Amount (mg)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">Common Amounts for {PRODUCT_TYPES.find(p => p.value === type)?.label}</h4>
                <div className="grid gap-2">
                  {filteredReference.map((item) => (
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
                {type === "cigarette" && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Consider switching to nicotine pouches or NRT products for a safer alternative.
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Input
          id="amount"
          type="number"
          step="0.1"
          placeholder="Enter nicotine amount in mg"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="text-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="energyRating">Energy Impact (1-10)</Label>
        <div className="relative">
          <Input
            id="energyRating"
            type="number"
            min="1"
            max="10"
            placeholder="Rate energy impact"
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