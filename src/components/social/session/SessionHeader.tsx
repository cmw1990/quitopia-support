import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export const SessionHeader = () => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        Upcoming Group Sessions
      </CardTitle>
    </CardHeader>
  );
};