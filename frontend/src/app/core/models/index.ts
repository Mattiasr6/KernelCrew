// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// User models
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Instructor {
  id: number;
  name: string;
}

// Auth payloads
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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Auth responses
export interface AuthData {
  user: User;
  token: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: AuthData;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    expires_in: number;
  };
}

// Course models
export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  instructor_id: number;
  status: 'draft' | 'published';
  instructor?: Instructor;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface CoursesMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CoursesResponse {
  success: boolean;
  message: string;
  data: Course[];
  meta: CoursesMeta;
}

export interface CourseResponse {
  success: boolean;
  message: string;
  data: Course;
}

// Course payloads
export interface CreateCourseRequest {
  title: string;
  description?: string;
  syllabus?: string;
  duration_hours: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  requirements?: string;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  syllabus?: string;
  duration_hours?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  requirements?: string;
  is_published?: boolean;
}

export interface CourseFilterParams {
  page?: number;
  per_page?: number;
  search?: string;
  level?: string;
  category?: string;
  is_published?: boolean;
  instructor_id?: number;
}

export interface CourseFilters {
  page?: number;
  per_page?: number;
  search?: string;
  min_price?: number;
  max_price?: number;
}

// User management (Admin)
export interface UserListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    meta: UserListMeta;
  };
}

export interface UserResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'admin' | 'instructor' | 'student';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'admin' | 'instructor' | 'student';
  is_active?: boolean;
}

// API Error
export interface ApiError {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

// Pagination params
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

// Subscription models (for Sprint 2)
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