
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdBlockingRules } from "@/components/adblocking/AdBlockingRules";
import { AdBlockingExceptions } from "@/components/adblocking/AdBlockingExceptions";
import { AdBlockingStats } from "@/components/adblocking/AdBlockingStats";
import { AdBlockingControls } from "@/components/adblocking/AdBlockingControls";
import { FilterListManager } from "@/components/adblocking/FilterListManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, ShieldOff, List, Activity, ListFilter } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export function AdBlockerPage() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState("rules");

  if (!session) {
    return <div>Please login to access ad blocking features.</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-full">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Ad Blocker</h1>
      </div>

      <AdBlockingStats />
      <AdBlockingControls />

      <Card>
        <CardHeader>
          <CardTitle>Advanced Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rules" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Rules
              </TabsTrigger>
              <TabsTrigger value="exceptions" className="flex items-center gap-2">
                <ShieldOff className="h-4 w-4" />
                Exceptions
              </TabsTrigger>
              <TabsTrigger value="filter-lists" className="flex items-center gap-2">
                <ListFilter className="h-4 w-4" />
                Filter Lists
              </TabsTrigger>
            </TabsList>
            <TabsContent value="rules">
              <AdBlockingRules />
            </TabsContent>
            <TabsContent value="exceptions">
              <AdBlockingExceptions />
            </TabsContent>
            <TabsContent value="filter-lists">
              <FilterListManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdBlockerPage;
