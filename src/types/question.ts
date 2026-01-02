export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface CreateQuestionInput {
  seq_no: number;
  topic_id: string;
  question: string;
  answer: number;
  options: QuestionOption[];
  explanation?: string;
  image_url?: string;
  code_snippet?: string;
  difficulty: Difficulty;
  tags: string[];
  status?: string;
  is_premium?: boolean;
}

export interface UpdateQuestionInput {
  seq_no?: number;
  topic_id?: string;
  question?: string;
  answer?: number;
  options?: QuestionOption[];
  explanation?: string;
  image_url?: string;
  code_snippet?: string;
  difficulty?: Difficulty;
  tags?: string[];
  status?: string;
  is_premium?: boolean;
}

export interface QuestionOption {
  option_no: number;
  option_text: string;
  code_snippet?: string | null;
  image_url?: string | null;
}

export interface QuestionResponse {
  id: string;
  seq_no: number;
  topic_id: string;
  qn_slug: string;
  question: string;
  answer: number;
  options: QuestionOption[];
  explanation?: string | null;
  image_url?: string | null;
  code_snippet?: string | null;
  difficulty: Difficulty;
  tags: string[];
  status: string;
  upvotes: number;
  is_premium: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface QuestionFilterParams {
  topic_slug?: string;
  seq_no?: number;
  tags?: string[];
  limit?: number;
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

export interface QuestionWithTopic extends QuestionResponse {
  topic: TopicInclude;
}

export interface QuestionsResult {
  questions: QuestionWithTopic[];
  totalCount: number;
}
