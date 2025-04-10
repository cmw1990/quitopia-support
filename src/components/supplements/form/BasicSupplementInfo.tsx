import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BasicSupplementInfoProps {
  supplementName: string;
  setSupplementName: (value: string) => void;
  dosage: string;
  setDosage: (value: string) => void;
  form: string;
  setForm: (value: string) => void;
  brand: string;
  setBrand: (value: string) => void;
  cost: string;
  setCost: (value: string) => void;
  source: string;
  setSource: (value: string) => void;
}

export function BasicSupplementInfo({
  supplementName,
  setSupplementName,
  dosage,
  setDosage,
  form,
  setForm,
  brand,
  setBrand,
  cost,
  setCost,
  source,
  setSource,
}: BasicSupplementInfoProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="supplementName">Supplement Name *</Label>
        <Input
          id="supplementName"
          value={supplementName}
          onChange={(e) => setSupplementName(e.target.value)}
          placeholder="Enter supplement name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dosage">Dosage *</Label>
        <Input
          id="dosage"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          placeholder="e.g., 500mg"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="form">Form</Label>
        <Select value={form} onValueChange={setForm}>
          <SelectTrigger>
            <SelectValue placeholder="Select form" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pill">Pill</SelectItem>
            <SelectItem value="powder">Powder</SelectItem>
            <SelectItem value="liquid">Liquid</SelectItem>
            <SelectItem value="gummy">Gummy</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand">Brand</Label>
        <Input
          id="brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="Enter brand name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cost">Cost</Label>
        <Input
          id="cost"
          type="number"
          step="0.01"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="Enter cost"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">Source</Label>
        <Input
          id="source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Where did you get it?"
        />
      </div>
    </div>
  );
}