import { config } from "../config/app";
import type {
  PremiumStatusResponse,
} from "../types/premium";

/**
 * Check if user has premium access via external service
 * Caches the result to avoid repeated API calls
 */
export const checkPremiumStatus = async (
  userId: string,
  service: string,
  topicId: string
): Promise<PremiumStatusResponse> => {
  try {
    const response = await fetch(`${config.credlockUrl}/api/premium/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-service": service,
      },
        body: JSON.stringify({ user_id: userId, topic_id: topicId }),
    });

    if (!response.ok) {
      // Default to non-premium if service unavailable
      return { is_premium: false };
    }

    const data = (await response.json()) as { data: PremiumStatusResponse };
    const premiumStatus = data.data;
    return premiumStatus;
  } catch {
    return { is_premium: false };
  }
};
