// Premium access types

export interface SubscriptionStatusResponse {
  is_premium: boolean;
  plan?: string;
  expires_at?: string;
}

export interface SubscriptionCheckResult {
  has_access: boolean;
  reason?: string;
}
