export interface UserWithRole {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role_name: string;
  created_at: string;
  updated_at: string;
}

export const USERS_PER_PAGE = 10;
