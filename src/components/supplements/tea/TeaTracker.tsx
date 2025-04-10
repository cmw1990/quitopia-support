
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeaHistoryTab } from "./tabs/TeaHistoryTab"
import { TeaLibraryTab } from "./tabs/TeaLibraryTab"
import { TeaEquipmentTab } from "./tabs/TeaEquipmentTab"
import { TeaVendorsTab } from "./tabs/TeaVendorsTab"
import { TeaIntakeForm } from "./TeaIntakeForm"

export function TeaTracker() {
  return (
    <Tabs defaultValue="log" className="w-full space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="log">Log Tea</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="library">Tea Library</TabsTrigger>
        <TabsTrigger value="equipment">Equipment</TabsTrigger>
        <TabsTrigger value="vendors">Vendors</TabsTrigger>
      </TabsList>

      <TabsContent value="log">
        <TeaIntakeForm />
      </TabsContent>

      <TabsContent value="history">
        <TeaHistoryTab />
      </TabsContent>

      <TabsContent value="library">
        <TeaLibraryTab />
      </TabsContent>

      <TabsContent value="equipment">
        <TeaEquipmentTab />
      </TabsContent>

      <TabsContent value="vendors">
        <TeaVendorsTab />
      </TabsContent>
    </Tabs>
  )
}
