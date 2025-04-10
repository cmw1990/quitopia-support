
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TeaVendorList } from "../vendors/TeaVendorList"

export function TeaVendorsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tea Vendors</CardTitle>
      </CardHeader>
      <CardContent>
        <TeaVendorList />
      </CardContent>
    </Card>
  )
}
