import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BasicSupplementInfo } from "./form/BasicSupplementInfo";
import { ImpactRatings } from "./form/ImpactRatings";
import { AdditionalDetails } from "./form/AdditionalDetails";
import { ReminderSettings } from "./form/ReminderSettings";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { SupplementAIAnalysis } from "@/components/supplements/SupplementAIAnalysis";

export function SupplementIntakeForm({
  onSubmit,
}: {
  onSubmit: (values: any) => void;
}) {
  const [supplementName, setSupplementName] = useState("");
  const [dosage, setDosage] = useState("");
  const [form, setForm] = useState("pill");
  const [brand, setBrand] = useState("");
  const [cost, setCost] = useState("");
  const [source, setSource] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [storageConditions, setStorageConditions] = useState("");
  const [purchaseLocation, setPurchaseLocation] = useState("");
  const [verifiedPurchase, setVerifiedPurchase] = useState(false);
  const [effectivenessRating, setEffectivenessRating] = useState(5);
  const [energyImpact, setEnergyImpact] = useState(5);
  const [stressImpact, setStressImpact] = useState(5);
  const [focusImpact, setFocusImpact] = useState(5);
  const [moodImpact, setMoodImpact] = useState(5);
  const [sleepImpact, setSleepImpact] = useState(5);
  const [sideEffects, setSideEffects] = useState("");
  const [timingNotes, setTimingNotes] = useState("");
  const [interactionNotes, setInteractionNotes] = useState("");
  const [notes, setNotes] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [photoUrl, setPhotoUrl] = useState("");

  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplementName || !dosage) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      supplement_name: supplementName,
      dosage,
      form,
      brand,
      cost: cost ? parseFloat(cost) : null,
      source,
      batch_number: batchNumber,
      expiration_date: expirationDate,
      storage_conditions: storageConditions,
      purchase_location: purchaseLocation,
      verified_purchase: verifiedPurchase,
      effectiveness_rating: effectivenessRating,
      energy_impact: energyImpact,
      stress_impact: stressImpact,
      focus_impact: focusImpact,
      mood_impact: moodImpact,
      sleep_impact: sleepImpact,
      side_effects: sideEffects,
      timing_notes: timingNotes,
      interaction_notes: interactionNotes,
      notes,
      reminder_enabled: reminderEnabled,
      reminder_time: reminderTime,
      photo_url: photoUrl,
      time_taken: new Date().toISOString(),
    });

    // Reset form
    setSupplementName("");
    setDosage("");
    setForm("pill");
    setBrand("");
    setCost("");
    setSource("");
    setBatchNumber("");
    setExpirationDate("");
    setStorageConditions("");
    setPurchaseLocation("");
    setVerifiedPurchase(false);
    setEffectivenessRating(5);
    setEnergyImpact(5);
    setStressImpact(5);
    setFocusImpact(5);
    setMoodImpact(5);
    setSleepImpact(5);
    setSideEffects("");
    setTimingNotes("");
    setInteractionNotes("");
    setNotes("");
    setReminderEnabled(false);
    setReminderTime("09:00");
    setPhotoUrl("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="reminder">Reminder</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4">
          <BasicSupplementInfo
            supplementName={supplementName}
            setSupplementName={setSupplementName}
            dosage={dosage}
            setDosage={setDosage}
            form={form}
            setForm={setForm}
            brand={brand}
            setBrand={setBrand}
            cost={cost}
            setCost={setCost}
            source={source}
            setSource={setSource}
          />
        </TabsContent>

        <TabsContent value="impact" className="mt-4">
          <ImpactRatings
            effectivenessRating={effectivenessRating}
            setEffectivenessRating={setEffectivenessRating}
            energyImpact={energyImpact}
            setEnergyImpact={setEnergyImpact}
            stressImpact={stressImpact}
            setStressImpact={setStressImpact}
            focusImpact={focusImpact}
            setFocusImpact={setFocusImpact}
            moodImpact={moodImpact}
            setMoodImpact={setMoodImpact}
            sleepImpact={sleepImpact}
            setSleepImpact={setSleepImpact}
          />
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <AdditionalDetails
            batchNumber={batchNumber}
            setBatchNumber={setBatchNumber}
            expirationDate={expirationDate}
            setExpirationDate={setExpirationDate}
            storageConditions={storageConditions}
            setStorageConditions={setStorageConditions}
            purchaseLocation={purchaseLocation}
            setPurchaseLocation={setPurchaseLocation}
            verifiedPurchase={verifiedPurchase}
            setVerifiedPurchase={setVerifiedPurchase}
            sideEffects={sideEffects}
            setSideEffects={setSideEffects}
            timingNotes={timingNotes}
            setTimingNotes={setTimingNotes}
            interactionNotes={interactionNotes}
            setInteractionNotes={setInteractionNotes}
            notes={notes}
            setNotes={setNotes}
            photoUrl={photoUrl}
            setPhotoUrl={setPhotoUrl}
            supplementName={supplementName}
          />
        </TabsContent>

        <TabsContent value="reminder" className="mt-4">
          <ReminderSettings
            reminderEnabled={reminderEnabled}
            setReminderEnabled={setReminderEnabled}
            reminderTime={reminderTime}
            setReminderTime={setReminderTime}
          />
        </TabsContent>

        <TabsContent value="analysis" className="mt-4">
          <SupplementAIAnalysis
            supplementName={supplementName}
            supplementData={{
              dosage,
              form,
              effectiveness_rating: effectivenessRating,
              energy_impact: energyImpact,
              stress_impact: stressImpact,
              focus_impact: focusImpact,
              mood_impact: moodImpact,
              sleep_impact: sleepImpact,
            }}
          />
        </TabsContent>
      </Tabs>

      <Button type="submit" className="w-full">
        Log Supplement
      </Button>
    </form>
  );
}