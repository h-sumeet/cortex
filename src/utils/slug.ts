import crypto from "crypto";

/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A lowercase, hyphenated slug
 */
export const generateSlug = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

/**
 * Generate a cryptographic hash from a string
 * @param text - The text to hash
 * @returns A 6-character alphanumeric hash
 */
const generateHash = (text: string): string => {
  return crypto.createHash("sha256").update(text).digest("hex").substring(0, 10);
};

/**
 * Generate a unique question slug from question text
 * Takes first 8 words and adds a hash for uniqueness
 * @param question - The question text
 * @returns A short, unique slug with hash
 */
export const generateQuestionSlug = (question: string): string => {
  // Take first 8 words
  const words = question.trim().split(/\s+/).slice(0, 8).join(" ");

  // Generate base slug from first 8 words
  const baseSlug = generateSlug(words);

  // Generate hash from full question for uniqueness
  const hash = generateHash(question);

  // Combine: short-question-text-abc123
  return `${baseSlug}-${hash}`;
};
