export interface CreateProviderInput {
  provider: string;
  provider_slug: string;
}

export interface UpdateProviderInput {
  provider?: string;
  provider_slug?: string;
}

export interface ProviderResponse {
  id: string;
  provider: string;
  provider_slug: string;
  topic_count: number;
  created_at: Date;
  updated_at: Date;
}
