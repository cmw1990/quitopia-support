import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PhotoUpload } from "./PhotoUpload";

interface AdditionalDetailsProps {
  batchNumber: string;
  setBatchNumber: (value: string) => void;
  expirationDate: string;
  setExpirationDate: (value: string) => void;
  storageConditions: string;
  setStorageConditions: (value: string) => void;
  purchaseLocation: string;
  setPurchaseLocation: (value: string) => void;
  verifiedPurchase: boolean;
  setVerifiedPurchase: (value: boolean) => void;
  sideEffects: string;
  setSideEffects: (value: string) => void;
  timingNotes: string;
  setTimingNotes: (value: string) => void;
  interactionNotes: string;
  setInteractionNotes: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  photoUrl: string;
  setPhotoUrl: (value: string) => void;
  supplementName: string;
}

export function AdditionalDetails({
  batchNumber,
  setBatchNumber,
  expirationDate,
  setExpirationDate,
  storageConditions,
  setStorageConditions,
  purchaseLocation,
  setPurchaseLocation,
  verifiedPurchase,
  setVerifiedPurchase,
  sideEffects,
  setSideEffects,
  timingNotes,
  setTimingNotes,
  interactionNotes,
  setInteractionNotes,
  notes,
  setNotes,
  photoUrl,
  setPhotoUrl,
  supplementName,
}: AdditionalDetailsProps) {
  return (
    <div className="grid gap-4">
      <PhotoUpload 
        supplementName={supplementName}
        onPhotoUploaded={setPhotoUrl}
      />

      <div className="space-y-2">
        <Label htmlFor="batchNumber">Batch Number</Label>
        <Input
          id="batchNumber"
          value={batchNumber}
          onChange={(e) => setBatchNumber(e.target.value)}
          placeholder="Enter batch number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expirationDate">Expiration Date</Label>
        <Input
          id="expirationDate"
          type="date"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="storageConditions">Storage Conditions</Label>
        <Input
          id="storageConditions"
          value={storageConditions}
          onChange={(e) => setStorageConditions(e.target.value)}
          placeholder="e.g., Store in a cool, dry place"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="purchaseLocation">Purchase Location</Label>
        <Input
          id="purchaseLocation"
          value={purchaseLocation}
          onChange={(e) => setPurchaseLocation(e.target.value)}
          placeholder="Where did you buy it?"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="verifiedPurchase"
          checked={verifiedPurchase}
          onCheckedChange={setVerifiedPurchase}
        />
        <Label htmlFor="verifiedPurchase">Verified Purchase</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sideEffects">Side Effects</Label>
        <Textarea
          id="sideEffects"
          value={sideEffects}
          onChange={(e) => setSideEffects(e.target.value)}
          placeholder="Any side effects experienced?"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="timingNotes">Timing Notes</Label>
        <Textarea
          id="timingNotes"
          value={timingNotes}
          onChange={(e) => setTimingNotes(e.target.value)}
          placeholder="Best time to take, intervals, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="interactionNotes">Interaction Notes</Label>
        <Textarea
          id="interactionNotes"
          value={interactionNotes}
          onChange={(e) => setInteractionNotes(e.target.value)}
          placeholder="Any interactions with other supplements or medications?"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any other notes or observations?"
        />
      </div>
    </div>
  );
}