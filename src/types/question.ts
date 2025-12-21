export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface CreateQuestionInput {
  seq_no: number;
  topic_id: string;
  question: string;
  answer: number;
  options: QuestionOption[];
  explanation?: string;
  image_url?: string;
  difficulty: Difficulty;
  tags: string[];
  status?: string;
}

export interface UpdateQuestionInput {
  seq_no?: number;
  topic_id?: string;
  question?: string;
  answer?: number;
  options?: QuestionOption[];
  explanation?: string;
  image_url?: string;
  difficulty?: Difficulty;
  tags?: string[];
  status?: string;
}

export interface QuestionOption {
  option_no: number;
  option_text: string;
  image_url?: string;
}

export interface QuestionResponse {
  id: string;
  seq_no: number;
  topic_id: string;
  qn_slug: string;
  question: string;
  answer: number;
  options: QuestionOption[];
  explanation?: string;
  image_url?: string;
  difficulty: Difficulty;
  tags: string[];
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface QuestionFilterParams {
  topic_slug?: string;
  seq_no?: number;
  tags?: string[];
  limit?: number;
}
