// Premium access types

export interface PremiumStatusResponse {
  is_premium: boolean;
  plan?: string;
  expires_at?: string;
}

export interface PremiumCheckResult {
  has_access: boolean;
  reason?: string;
}
