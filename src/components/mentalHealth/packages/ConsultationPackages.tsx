
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Clock, DollarSign } from "lucide-react";

export function ConsultationPackages() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: "",
    description: "",
    session_count: 1,
    validity_days: 30,
    price: 0,
  });

  const { data: packages } = useQuery({
    queryKey: ['consultation-packages'],
    queryFn: async () => {
      const { data } = await supabase
        .from('consultation_packages')
        .select(`
          *,
          professional:professional_id (
            full_name
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      return data;
    }
  });

  const createPackage = useMutation({
    mutationFn: async (packageData: typeof newPackage) => {
      const { data, error } = await supabase
        .from('consultation_packages')
        .insert([{
          ...packageData,
          professional_id: session?.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation-packages'] });
      setNewPackage({
        name: "",
        description: "",
        session_count: 1,
        validity_days: 30,
        price: 0,
      });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Package created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create package",
        variant: "destructive"
      });
      console.error('Package creation error:', error);
    }
  });

  const purchasePackage = useMutation({
    mutationFn: async (pkg: any) => {
      const { data, error } = await supabase
        .from('package_purchases')
        .insert({
          package_id: pkg.id,
          client_id: session?.user?.id,
          professional_id: pkg.professional_id,
          sessions_remaining: pkg.session_count,
          expires_at: new Date(Date.now() + pkg.validity_days * 24 * 60 * 60 * 1000).toISOString(),
          total_amount: pkg.price,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Package purchased successfully! You can now book sessions with this professional."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to purchase package. Please try again.",
        variant: "destructive"
      });
      console.error('Package purchase error:', error);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Consultation Packages</h2>
        {session?.user?.id && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create Package</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Consultation Package</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                createPackage.mutate(newPackage);
              }} className="space-y-4">
                <Input
                  placeholder="Package Name"
                  value={newPackage.name}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <Textarea
                  placeholder="Description"
                  value={newPackage.description}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Number of Sessions"
                    value={newPackage.session_count}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, session_count: parseInt(e.target.value) }))}
                    required
                    min={1}
                  />
                  <Input
                    type="number"
                    placeholder="Validity (days)"
                    value={newPackage.validity_days}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, validity_days: parseInt(e.target.value) }))}
                    required
                    min={1}
                  />
                </div>
                <Input
                  type="number"
                  placeholder="Price"
                  value={newPackage.price}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  required
                  min={0}
                  step={0.01}
                />
                <Button type="submit" className="w-full" disabled={createPackage.isPending}>
                  {createPackage.isPending ? "Creating..." : "Create Package"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages?.map((pkg) => (
          <Card key={pkg.id} className="relative overflow-hidden">
            {pkg.professional_id === session?.user?.id && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                Your Package
              </div>
            )}
            <CardHeader>
              <CardTitle>{pkg.name}</CardTitle>
              <p className="text-2xl font-bold text-primary">
                ${pkg.price.toFixed(2)}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{pkg.description}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4" />
                  <span>{pkg.session_count} sessions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Valid for {pkg.validity_days} days</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>By {pkg.professional?.full_name}</span>
                </div>
              </div>
              {pkg.professional_id !== session?.user?.id && (
                <Button 
                  className="w-full mt-4" 
                  onClick={() => purchasePackage.mutate(pkg)}
                  disabled={purchasePackage.isPending}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  {purchasePackage.isPending ? "Processing..." : "Purchase Package"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
