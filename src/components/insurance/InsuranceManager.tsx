
import { InsuranceVerification } from "./InsuranceVerification";
import { ClaimSubmission } from "./ClaimSubmission";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export const InsuranceManager = ({
  sessionId,
  clientId,
  professionalId,
  clientInsuranceId
}: {
  sessionId: string;
  clientId: string;
  professionalId: string;
  clientInsuranceId: string;
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Insurance Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <InsuranceVerification
            sessionId={sessionId}
            clientId={clientId}
            professionalId={professionalId}
          />
          
          <ClaimSubmission
            sessionId={sessionId}
            clientInsuranceId={clientInsuranceId}
            professionalId={professionalId}
          />
        </CardContent>
      </Card>
    </div>
  );
};
