export interface CreateTopicInput {
  topic: string;
  topic_slug: string;
  provider_id: string;
}

export interface UpdateTopicInput {
  topic?: string;
  topic_slug?: string;
  provider_id?: string;
}

export interface TopicResponse {
  id: string;
  topic: string;
  topic_slug: string;
  provider_id: string;
  qn_count: number;
  created_at: Date;
  updated_at: Date;
}
