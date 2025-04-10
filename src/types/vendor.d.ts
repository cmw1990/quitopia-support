
export interface Vendor {
  id: string;
  name: string;
  description: string;
  claimed_by: string;
  rules_accepted: boolean;
  rules_accepted_at: string | null;
  business_registration: string | null;
  tax_id: string | null;
  return_policy: string | null;
  shipping_policy: string | null;
  customer_service_email: string | null;
  customer_service_phone: string | null;
  created_at: string;
}
