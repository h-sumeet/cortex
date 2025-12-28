// User types from CREDLOCK service
export interface CredlockUser {
  id: string;
  fullname: string;
  email: string;
  email_verified: boolean;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CredlockResponse {
  status: string;
  code: number;
  msg: string;
  data: {
    user: CredlockUser;
  };
}

// Authenticated user attached to request
export interface AuthenticatedUser {
  id: string;
  fullname: string;
  email: string;
}

// User topic data (bookmarks per topic)
export interface UserTopicData {
  topic_id: string;
  bookmarked: number[];
}
