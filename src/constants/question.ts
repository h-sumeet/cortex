// Question API constants
export const QUESTION_DEFAULTS = {
  FETCH_LIMIT: 1, // Default: fetch 1 question at a time
  MAX_LIMIT: 1, // Maximum questions per request
} as const;

export const DIFFICULTY_LEVELS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const;
