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
  image_url?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface TopicInclude {
  id: string;
  topic: string;
  topic_slug: string;
  provider_id: string;
  qn_count: number;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface ProviderWithTopics extends ProviderResponse {
  topics: TopicInclude[];
}
