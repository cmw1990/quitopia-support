
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"
import { Loader2, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function VendorVerification() {
  const { session } = useAuth()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const { data: requirements, refetch } = useQuery({
    queryKey: ['vendor-verification', session?.user?.id],
    queryFn: async () => {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session?.user?.id)
        .single()

      if (!vendorData) return []

      const { data, error } = await supabase
        .from('vendor_verification_requirements')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!session?.user?.id
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !session?.user?.id) return

    setUploading(true)
    try {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session.user.id)
        .single()

      if (!vendorData) throw new Error('Vendor not found')

      const fileExt = selectedFile.name.split('.').pop()
      const filePath = `${session.user.id}/${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('verification-docs')
        .upload(filePath, selectedFile)

      if (uploadError) throw uploadError

      const { error: insertError } = await supabase
        .from('vendor_verification_requirements')
        .insert({
          vendor_id: vendorData.id,
          document_type: 'business_license',
          document_url: filePath
        })

      if (insertError) throw insertError

      toast({
        title: "Document uploaded",
        description: "Your verification document has been submitted for review"
      })

      setSelectedFile(null)
      refetch()
    } catch (error) {
      console.error('Error uploading document:', error)
      toast({
        title: "Error",
        description: "Failed to upload verification document",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Requirements</CardTitle>
        <CardDescription>
          Submit required documents to verify your business
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label htmlFor="document">Business License or Registration</Label>
            <Input
              id="document"
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png"
              disabled={uploading}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Upload a clear copy of your business license or registration document
            </p>
          </div>

          {selectedFile && (
            <Button
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          )}

          <div className="mt-6">
            <h3 className="font-medium mb-4">Submitted Documents</h3>
            {requirements?.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-4 border rounded-lg mb-2"
              >
                <div>
                  <p className="font-medium">{req.document_type}</p>
                  <p className="text-sm text-muted-foreground">
                    Submitted on {new Date(req.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={req.status === 'pending' ? 'secondary' : 'default'}>
                  {req.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
