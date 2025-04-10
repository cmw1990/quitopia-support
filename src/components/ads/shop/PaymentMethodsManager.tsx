
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"
import { Loader2, CreditCard, Trash2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"

interface AccountDetails {
  accountName: string;
  accountNumber: string;
  routingNumber?: string;
}

interface PaymentMethod {
  id: string;
  type: 'bank_account' | 'paypal';
  account_details: AccountDetails;
  is_default: boolean;
  created_at: string;
}

export function PaymentMethodsManager() {
  const { session } = useAuth()
  const { toast } = useToast()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newMethod, setNewMethod] = useState({
    type: 'bank_account',
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    isDefault: false
  })

  const { data: paymentMethods, refetch } = useQuery({
    queryKey: ['payment-methods', session?.user?.id],
    queryFn: async () => {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session?.user?.id)
        .single()

      if (!vendorData) return []

      const { data, error } = await supabase
        .from('vendor_payment_methods')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Cast the data to ensure account_details is properly typed
      return (data as any[]).map(method => ({
        ...method,
        account_details: method.account_details as AccountDetails
      })) as PaymentMethod[]
    },
    enabled: !!session?.user?.id
  })

  const handleAddMethod = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    try {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session.user.id)
        .single()

      if (!vendorData) throw new Error('Vendor not found')

      // If this is set as default, update other methods to non-default
      if (newMethod.isDefault) {
        await supabase
          .from('vendor_payment_methods')
          .update({ is_default: false })
          .eq('vendor_id', vendorData.id)
      }

      const accountDetails = {
        accountName: newMethod.accountName,
        accountNumber: newMethod.accountNumber,
        routingNumber: newMethod.routingNumber
      }

      const { error } = await supabase
        .from('vendor_payment_methods')
        .insert({
          vendor_id: vendorData.id,
          type: newMethod.type,
          account_details: accountDetails,
          is_default: newMethod.isDefault
        })

      if (error) throw error

      toast({
        title: "Payment method added",
        description: "Your payment method has been added successfully"
      })

      setShowAddDialog(false)
      setNewMethod({
        type: 'bank_account',
        accountName: '',
        accountNumber: '',
        routingNumber: '',
        isDefault: false
      })
      refetch()
    } catch (error) {
      console.error('Error adding payment method:', error)
      toast({
        title: "Error",
        description: "Failed to add payment method",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vendor_payment_methods')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Payment method removed",
        description: "The payment method has been removed successfully"
      })

      refetch()
    } catch (error) {
      console.error('Error removing payment method:', error)
      toast({
        title: "Error",
        description: "Failed to remove payment method",
        variant: "destructive"
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>
          Manage your payment methods for receiving payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <CreditCard className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
                <DialogDescription>
                  Enter your payment method details
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <RadioGroup
                  value={newMethod.type}
                  onValueChange={(value: 'bank_account' | 'paypal') => setNewMethod(prev => ({ ...prev, type: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank_account" id="bank" />
                    <Label htmlFor="bank">Bank Account</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal">PayPal</Label>
                  </div>
                </RadioGroup>

                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={newMethod.accountName}
                    onChange={(e) => setNewMethod(prev => ({ ...prev, accountName: e.target.value }))}
                  />
                </div>

                {newMethod.type === 'bank_account' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        value={newMethod.accountNumber}
                        onChange={(e) => setNewMethod(prev => ({ ...prev, accountNumber: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="routingNumber">Routing Number</Label>
                      <Input
                        id="routingNumber"
                        value={newMethod.routingNumber}
                        onChange={(e) => setNewMethod(prev => ({ ...prev, routingNumber: e.target.value }))}
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newMethod.isDefault}
                    onCheckedChange={(checked) => setNewMethod(prev => ({ ...prev, isDefault: checked }))}
                  />
                  <Label>Set as default payment method</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMethod} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Method'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="mt-6">
            {paymentMethods?.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border rounded-lg mb-2"
              >
                <div>
                  <div className="flex items-center">
                    <p className="font-medium capitalize">{method.type}</p>
                    {method.is_default && (
                      <Badge variant="secondary" className="ml-2">Default</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {method.account_details.accountName}
                    {method.type === 'bank_account' && method.account_details.accountNumber && 
                      ` (**** ${method.account_details.accountNumber.slice(-4)})`}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(method.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
