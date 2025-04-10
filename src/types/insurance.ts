
export interface InsuranceProvider {
  id: string;
  name: string;
  payer_id: string;
  provider_network: string[];
  claims_api_endpoint?: string;
  eligibility_api_endpoint?: string;
  verification_method: 'manual' | 'api';
  supported_claim_types: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InsuranceEligibilityCheck {
  id: string;
  client_insurance_id: string;
  professional_id: string;
  verification_date: string;
  status: 'pending' | 'verified' | 'failed';
  coverage_details?: Record<string, any>;
  copay_amount?: number;
  coinsurance_percentage?: number;
  deductible_remaining?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface InsuranceClaimSubmission {
  id: string;
  claim_id: string;
  submission_date: string;
  status: 'pending' | 'submitted' | 'accepted' | 'rejected' | 'paid';
  payer_claim_id?: string;
  submission_method: 'electronic' | 'manual';
  response_details?: Record<string, any>;
  error_message?: string;
  created_at: string;
  updated_at: string;
}
