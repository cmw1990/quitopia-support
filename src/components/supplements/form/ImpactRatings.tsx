import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

interface ImpactRatingsProps {
  effectivenessRating: number;
  setEffectivenessRating: (value: number) => void;
  energyImpact: number;
  setEnergyImpact: (value: number) => void;
  stressImpact: number;
  setStressImpact: (value: number) => void;
  focusImpact: number;
  setFocusImpact: (value: number) => void;
  moodImpact: number;
  setMoodImpact: (value: number) => void;
  sleepImpact: number;
  setSleepImpact: (value: number) => void;
}

export function ImpactRatings({
  effectivenessRating,
  setEffectivenessRating,
  energyImpact,
  setEnergyImpact,
  stressImpact,
  setStressImpact,
  focusImpact,
  setFocusImpact,
  moodImpact,
  setMoodImpact,
  sleepImpact,
  setSleepImpact,
}: ImpactRatingsProps) {
  const ImpactSlider = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (value: number) => void;
    label: string;
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label>{label}</Label>
        <span className="text-sm text-muted-foreground">{value}/10</span>
      </div>
      <Slider
        value={[value]}
        min={1}
        max={10}
        step={1}
        onValueChange={(values) => onChange(values[0])}
      />
    </div>
  );

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-medium">Impact Ratings</h3>
      <ImpactSlider
        label="Overall Effectiveness"
        value={effectivenessRating}
        onChange={setEffectivenessRating}
      />
      <ImpactSlider
        label="Energy Impact"
        value={energyImpact}
        onChange={setEnergyImpact}
      />
      <ImpactSlider
        label="Stress Impact"
        value={stressImpact}
        onChange={setStressImpact}
      />
      <ImpactSlider
        label="Focus Impact"
        value={focusImpact}
        onChange={setFocusImpact}
      />
      <ImpactSlider
        label="Mood Impact"
        value={moodImpact}
        onChange={setMoodImpact}
      />
      <ImpactSlider
        label="Sleep Impact"
        value={sleepImpact}
        onChange={setSleepImpact}
      />
    </Card>
  );
}