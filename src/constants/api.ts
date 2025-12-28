import { config } from "../config/app";

const CREDLOCK_URL = config.credlockUrl;

export const CREDLOCK_API = {
  profile: {
    getUser: `${CREDLOCK_URL}/api/auth/profile`,
  },
};