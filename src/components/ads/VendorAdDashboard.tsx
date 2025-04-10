
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdCampaignForm } from './AdCampaignForm'
import { CouponManager } from './CouponManager'
import { SampleManager } from './SampleManager'
import { AdAnalytics } from './analytics/AdAnalytics'
import { AdGuide } from './AdGuide'
import { RewardThresholdsManager } from './RewardThresholdsManager'
import { OrderManager } from './shop/OrderManager'
import { DeliveryManager } from './shop/DeliveryManager'
import { ProductManager } from './shop/ProductManager'
import { MessagingCenter } from './shop/MessagingCenter'
import { VendorSettings } from './shop/VendorSettings'
import { ShippingZonesManager } from './shop/ShippingZonesManager'
import { CategoriesManager } from './shop/CategoriesManager'
import { InventoryManager } from './shop/InventoryManager'
import { VendorAnalytics } from './shop/VendorAnalytics'
import { useVendorSetup } from '@/hooks/useVendorSetup'
import { VendorVerification } from './shop/VendorVerification'
import { PaymentMethodsManager } from './shop/PaymentMethodsManager'
import { WebhookManager } from './shop/WebhookManager'
import { NotificationPreferencesManager } from './shop/NotificationPreferencesManager'
import { AIAnalytics } from './shop/AIAnalytics'
import { CustomerEngagement } from './shop/CustomerEngagement'
import { LoyaltyProgram } from './shop/LoyaltyProgram'
import { MultiLocationInventory } from './shop/MultiLocationInventory'
import { SmartNotifications } from './shop/SmartNotifications'
import { MarketplaceIntegration } from './shop/MarketplaceIntegration'

export function VendorAdDashboard() {
  const { isSetupComplete, setupModal } = useVendorSetup();

  return (
    <div className="space-y-6">
      {setupModal}
      
      <Card>
        <CardHeader>
          <CardTitle>Vendor Dashboard</CardTitle>
          <CardDescription>
            Manage your store, orders, advertising campaigns, and customer relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="guide" className="space-y-4">
            <TabsList className="grid grid-cols-23 scroll-pl-6 overflow-x-auto">
              <TabsTrigger value="guide">Guide</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="campaigns">Ads</TabsTrigger>
              <TabsTrigger value="coupons">Coupons</TabsTrigger>
              <TabsTrigger value="samples">Samples</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="ai-analytics">AI Insights</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
              <TabsTrigger value="multi-location">Locations</TabsTrigger>
              <TabsTrigger value="smart-notifications">Smart Alerts</TabsTrigger>
              <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="guide">
              <AdGuide />
            </TabsContent>

            <TabsContent value="orders">
              <OrderManager />
            </TabsContent>

            <TabsContent value="products">
              <ProductManager />
            </TabsContent>

            <TabsContent value="inventory">
              <InventoryManager />
            </TabsContent>

            <TabsContent value="categories">
              <CategoriesManager />
            </TabsContent>

            <TabsContent value="shipping">
              <ShippingZonesManager />
            </TabsContent>

            <TabsContent value="delivery">
              <DeliveryManager />
            </TabsContent>

            <TabsContent value="messages">
              <MessagingCenter />
            </TabsContent>

            <TabsContent value="campaigns">
              <AdCampaignForm />
            </TabsContent>

            <TabsContent value="coupons">
              <CouponManager />
            </TabsContent>

            <TabsContent value="samples">
              <SampleManager />
            </TabsContent>

            <TabsContent value="analytics">
              <VendorAnalytics />
            </TabsContent>

            <TabsContent value="ai-analytics">
              <AIAnalytics />
            </TabsContent>

            <TabsContent value="engagement">
              <CustomerEngagement />
            </TabsContent>

            <TabsContent value="loyalty">
              <LoyaltyProgram />
            </TabsContent>

            <TabsContent value="multi-location">
              <MultiLocationInventory />
            </TabsContent>

            <TabsContent value="smart-notifications">
              <SmartNotifications />
            </TabsContent>

            <TabsContent value="marketplace">
              <MarketplaceIntegration />
            </TabsContent>

            <TabsContent value="settings">
              <VendorSettings />
            </TabsContent>

            <TabsContent value="verification">
              <VendorVerification />
            </TabsContent>

            <TabsContent value="payments">
              <PaymentMethodsManager />
            </TabsContent>

            <TabsContent value="webhooks">
              <WebhookManager />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationPreferencesManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
