import { config } from "../config/app";

const CREDLOCK_URL = config.credlockUrl;

export const CREDLOCK_API = {
  profile: {
    getUser: `${CREDLOCK_URL}/api/auth/profile`,
  },
};

export const SUBSCRIPTION_API = {
  status: `${CREDLOCK_URL}/api/subscription/status`,
}