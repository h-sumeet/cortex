export interface CreateTopicInput {
  topic: string;
  topic_slug: string;
  provider_id: string;
  tags?: string[];
}

export interface UpdateTopicInput {
  topic?: string;
  topic_slug?: string;
  provider_id?: string;
  tags?: string[];
}

export interface TopicResponse {
  id: string;
  topic: string;
  topic_slug: string;
  provider_id: string;
  qn_count: number;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface ProviderInclude {
  id: string;
  provider: string;
  provider_slug: string;
  topic_count: number;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface TopicWithProvider extends TopicResponse {
  provider: ProviderInclude;
}
