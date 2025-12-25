export interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  permissions: Permission[];
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

export interface Loan {
  id: number;
  user_id: number;
  amount: string;
  tenure: number;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  admin_comment: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  creator?: User;
  updater?: User;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
