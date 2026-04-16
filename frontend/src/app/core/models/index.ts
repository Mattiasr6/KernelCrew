export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  short_description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  duration: number;
  price: number;
  thumbnail?: string;
  instructor_id: number;
  instructor_name?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseListResponse {
  data: Course[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  max_courses: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  plan_name: string;
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
