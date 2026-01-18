export interface User {
  id?: number;
  name: string;
  surname: string;
  username: string;
  email: string;
  password?: string;
  email_verified_at?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}