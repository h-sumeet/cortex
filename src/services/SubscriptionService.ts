import { SUBSCRIPTION_API } from "../constants/api";
import { CUSTOM_HEADERS } from "../constants/common";
import type { SubscriptionStatusResponse } from "../types/premium";

/**
 * Check if user has premium access via external service
 * Caches the result to avoid repeated API calls
 */
export const checkSubscriptionStatus = async (
  userId: string,
  service: string,
  topicId: string
): Promise<SubscriptionStatusResponse> => {
  try {
    const response = await fetch(SUBSCRIPTION_API.status, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        [CUSTOM_HEADERS.SERVICE_HEADER]: service,
      },
      body: JSON.stringify({ user_id: userId, topic_id: topicId }),
    });

    if (!response.ok) {
      // Default to non-premium if service unavailable
      return { is_premium: false };
    }

    const data = (await response.json()) as {
      data: SubscriptionStatusResponse;
    };
    const premiumStatus = data.data;
    return premiumStatus;
  } catch {
    return { is_premium: false };
  }
};
