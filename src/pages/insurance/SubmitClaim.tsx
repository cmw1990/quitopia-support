import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/db-client";

const claimFormSchema = z.object({
  service_date: z.date({
    required_error: "Service date is required",
  }),
  billed_amount: z.string().min(1, "Billed amount is required"),
  diagnosis_codes: z.string().min(1, "At least one diagnosis code is required"),
  procedure_codes: z.string().min(1, "At least one procedure code is required"),
  notes: z.string().optional(),
});

export function SubmitClaim() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof claimFormSchema>>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      notes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof claimFormSchema>) {
    setIsSubmitting(true);
    try {
      // Get user from stored session
      const storedSession = localStorage.getItem('supabase.auth.token');
      const session = storedSession ? JSON.parse(storedSession) : null;
      
      if (!session || !session.access_token) {
        toast({
          title: "Authentication required",
          description: "Please log in to submit claims",
          variant: "destructive",
        });
        return;
      }

      // Get user info
      const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_KEY
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const user = await userResponse.json();

      // Submit claim
      const response = await fetch(`${SUPABASE_URL}/rest/v1/insurance_claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          service_date: values.service_date.toISOString(),
          billed_amount: parseFloat(values.billed_amount),
          diagnosis_codes: values.diagnosis_codes.split(",").map(code => code.trim()),
          procedure_codes: values.procedure_codes.split(",").map(code => code.trim()),
          notes: values.notes,
          status: "pending",
          submission_date: new Date().toISOString(),
          user_id: user.id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      toast({
        title: "Claim submitted successfully",
        description: "Your claim has been received and is being processed",
      });

      navigate("/insurance");
    } catch (error) {
      console.error("Error submitting claim:", error);
      toast({
        title: "Error submitting claim",
        description: "There was an error submitting your claim. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Submit Insurance Claim</CardTitle>
          <CardDescription>
            Fill out the form below to submit a new insurance claim
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="service_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Service Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billed_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billed Amount ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="diagnosis_codes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosis Codes (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. F41.1, F32.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="procedure_codes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Procedure Codes (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 90834, 90837" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/insurance")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Claim"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
