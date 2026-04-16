import { Observable, of, delay, throwError } from 'rxjs';
import { 
  LoginRequest, 
  RegisterRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest,
  AuthResponse,
  ForgotPasswordResponse,
  User,
  Course,
  CoursesResponse,
  CourseResponse,
  CreateCourseRequest,
  UsersResponse,
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest
} from '../models';

// Mock Users
const mockUsers: User[] = [
  { id: 1, name: 'Admin User', email: 'admin@kernellearn.com', role: 'admin', is_active: true, created_at: '2026-04-01T08:00:00Z' },
  { id: 2, name: 'Carlos Instructor', email: 'carlos@ejemplo.com', role: 'instructor', is_active: true, created_at: '2026-04-05T10:00:00Z' },
  { id: 3, name: 'Juan Estudiante', email: 'juan@ejemplo.com', role: 'student', is_active: true, created_at: '2026-04-10T08:00:00Z' },
];

// Mock Courses
const mockCourses: Course[] = [
  {
    id: 1,
    title: 'Introducción a Python',
    description: 'Aprende los fundamentos de Python desde cero con este curso completo',
    short_description: 'Fundamentos de Python',
    level: 'beginner',
    category: 'programming',
    duration_hours: 20,
    instructor_name: 'Carlos Instructor',
    instructor: { id: 2, name: 'Carlos Instructor' },
    is_published: true,
    subscription_required: 'basic',
    can_enroll: true,
    syllabus: '1. Variables\n2. Tipos de datos\n3. Funciones\n4. Objetos',
    requirements: 'No se requiere experiencia previa',
    created_at: '2026-04-01T08:00:00Z'
  },
  {
    id: 2,
    title: 'JavaScript Moderno',
    description: 'Domina JavaScript ES6+ y las últimas características del lenguaje',
    short_description: 'JS moderno',
    level: 'intermediate',
    category: 'programming',
    duration_hours: 30,
    instructor_name: 'Carlos Instructor',
    instructor: { id: 2, name: 'Carlos Instructor' },
    is_published: true,
    subscription_required: 'pro',
    can_enroll: true,
    syllabus: '1. Arrow functions\n2. Promises\n3. Async/await\n4. Modules',
    requirements: 'Conocimiento básico de JS',
    created_at: '2026-04-02T08:00:00Z'
  },
  {
    id: 3,
    title: 'Advanced React Patterns',
    description: 'Patrones avanzados de arquitectura en React',
    short_description: 'React Patterns',
    level: 'advanced',
    category: 'programming',
    duration_hours: 25,
    instructor_name: 'Carlos Instructor',
    instructor: { id: 2, name: 'Carlos Instructor' },
    is_published: true,
    subscription_required: 'premium',
    can_enroll: true,
    syllabus: '1. HOCs\n2. Custom Hooks\n3. Compound Components\n4. State Machines',
    requirements: 'Experiencia con React',
    created_at: '2026-04-03T08:00:00Z'
  },
  {
    id: 4,
    title: 'Diseño UX/UI',
    description: 'Aprende a diseñar interfaces de usuario profesionales',
    short_description: 'Diseño UX/UI',
    level: 'beginner',
    category: 'design',
    duration_hours: 15,
    instructor_name: 'Carlos Instructor',
    instructor: { id: 2, name: 'Carlos Instructor' },
    is_published: false,
    syllabus: '1. Principios de diseño\n2. Wireframes\n3. Prototipado\n4. Testing',
    created_at: '2026-04-04T08:00:00Z'
  },
  {
    id: 5,
    title: 'Machine Learning Basics',
    description: 'Introducción al aprendizaje automático con Python',
    short_description: 'ML Basics',
    level: 'intermediate',
    category: 'data_science',
    duration_hours: 40,
    instructor_name: 'Carlos Instructor',
    instructor: { id: 2, name: 'Carlos Instructor' },
    is_published: true,
    syllabus: '1. Regresión\n2. Clasificación\n3. Redes neuronales\n4. Deep Learning',
    requirements: 'Conocimiento de Python y estadísticas',
    created_at: '2026-04-05T08:00:00Z'
  }
];

// ==================== AUTH MOCKS ====================

// US-01: Register
export function mockRegister(data: RegisterRequest): Observable<AuthResponse> {
  const existingUser = mockUsers.find(u => u.email === data.email);
  
  if (existingUser) {
    return throwError(() => ({
      success: false,
      message: 'Los datos proporcionados no son válidos',
      errors: { email: ['El email ya está registrado'] }
    }));
  }

  const newUser: User = {
    id: mockUsers.length + 1,
    name: data.name,
    email: data.email,
    role: 'student',
    is_active: true,
    created_at: new Date().toISOString()
  };
  mockUsers.push(newUser);

  return of({
    success: true,
    message: 'Usuario registrado exitosamente',
    data: {
      user: newUser,
      token: `1|${btoa(newUser.id + '|ABC' + Math.random().toString(36).substr(2))}`
    }
  }).pipe(delay(1000));
}

// US-02: Login
export function mockLogin(data: LoginRequest): Observable<AuthResponse> {
  const user = mockUsers.find(u => u.email === data.email);
  
  if (!user || data.password.length < 6) {
    return throwError(() => ({
      success: false,
      message: 'Credenciales inválidas',
      errors: { email: ['Las credenciales proporcionadas no son correctas'] }
    }));
  }

  return of({
    success: true,
    message: 'Inicio de sesión exitoso',
    data: {
      user,
      token: `1|${btoa(user.id + '|ABC' + Math.random().toString(36).substr(2))}`
    }
  }).pipe(delay(1000));
}

// US-04: Forgot Password
export function mockForgotPassword(data: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
  const user = mockUsers.find(u => u.email === data.email);
  
  if (!user) {
    return of({
      success: true,
      message: 'Se ha enviado un enlace de recuperación a tu correo electrónico',
      data: { token: 'mock-token-123', expires_in: 3600 }
    });
  }

  return of({
    success: true,
    message: 'Se ha enviado un enlace de recuperación a tu correo electrónico',
    data: { token: 'mock-token-123', expires_in: 3600 }
  }).pipe(delay(1000));
}

// US-04: Reset Password
export function mockResetPassword(data: ResetPasswordRequest): Observable<AuthResponse> {
  if (data.password !== data.password_confirmation) {
    return throwError(() => ({
      success: false,
      message: 'El token ha expirado o es inválido',
      errors: { token: ['El token de recuperación ha expirado. Por favor, solicita uno nuevo.'] }
    }));
  }

  return of({
    success: true,
    message: 'Contraseña restablecida exitosamente. Por favor, inicia sesión con tu nueva contraseña.',
    data: { user: mockUsers[2], token: '' }
  }).pipe(delay(1000));
}

// US-02: Logout
export function mockLogout(): Observable<{ success: boolean; message: string }> {
  return of({ success: true, message: 'Sesión cerrada exitosamente' }).pipe(delay(500));
}

// ==================== COURSE MOCKS ====================

// US-05: List Courses
export function mockGetCourses(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  level?: string;
  category?: string;
}): Observable<CoursesResponse> {
  let courses = [...mockCourses].filter(c => c.is_published);
  
  if (params?.search) {
    courses = courses.filter(c => c.title.toLowerCase().includes(params.search!.toLowerCase()));
  }
  if (params?.level) {
    courses = courses.filter(c => c.level === params.level);
  }
  if (params?.category) {
    courses = courses.filter(c => c.category === params.category);
  }

  const page = params?.page || 1;
  const perPage = params?.per_page || 10;
  const start = (page - 1) * perPage;
  const paginatedCourses = courses.slice(start, start + perPage);

  return of({
    success: true,
    data: {
      courses: paginatedCourses,
      meta: {
        current_page: page,
        last_page: Math.ceil(courses.length / perPage),
        per_page: perPage,
        total: courses.length
      },
      filters: {
        levels: ['beginner', 'intermediate', 'advanced'],
        categories: ['programming', 'design', 'data_science']
      }
    }
  }).pipe(delay(800));
}

// US-06: Get Course Detail
export function mockGetCourse(id: number): Observable<CourseResponse> {
  const course = mockCourses.find(c => c.id === id);
  
  if (!course) {
    return throwError(() => ({
      success: false,
      message: 'Curso no encontrado',
      errors: {}
    }));
  }

  return of({
    success: true,
    data: { course }
  }).pipe(delay(500));
}

// US-07: Create Course
export function mockCreateCourse(data: CreateCourseRequest): Observable<CourseResponse> {
  const newCourse: Course = {
    id: mockCourses.length + 1,
    title: data.title,
    description: data.description || '',
    short_description: data.description?.substring(0, 100),
    level: data.level,
    category: data.category,
    duration_hours: data.duration_hours,
    instructor_name: 'Carlos Instructor',
    instructor: { id: 2, name: 'Carlos Instructor' },
    is_published: false,
    syllabus: data.syllabus,
    requirements: data.requirements,
    created_at: new Date().toISOString()
  };
  mockCourses.push(newCourse);

  return of({
    success: true,
    message: 'Curso creado exitosamente',
    data: { course: newCourse }
  }).pipe(delay(1000));
}

// US-07: Update Course
export function mockUpdateCourse(id: number, data: Partial<CreateCourseRequest & { is_published: boolean }>): Observable<CourseResponse> {
  const index = mockCourses.findIndex(c => c.id === id);
  
  if (index === -1) {
    return throwError(() => ({
      success: false,
      message: 'Curso no encontrado',
      errors: {}
    }));
  }

  mockCourses[index] = { ...mockCourses[index], ...data, updated_at: new Date().toISOString() };

  return of({
    success: true,
    message: 'Curso actualizado exitosamente',
    data: { course: mockCourses[index] }
  }).pipe(delay(1000));
}

// US-07: Delete Course
export function mockDeleteCourse(id: number): Observable<{ success: boolean; message: string }> {
  const index = mockCourses.findIndex(c => c.id === id);
  
  if (index === -1) {
    return throwError(() => ({
      success: false,
      message: 'Curso no encontrado',
      errors: {}
    }));
  }

  mockCourses.splice(index, 1);

  return of({
    success: true,
    message: 'Curso eliminado exitosamente'
  }).pipe(delay(500));
}

// US-08: Admin - Get All Courses
export function mockGetAllCourses(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  is_published?: boolean;
}): Observable<CoursesResponse> {
  let courses = [...mockCourses];
  
  if (params?.search) {
    courses = courses.filter(c => c.title.toLowerCase().includes(params.search!.toLowerCase()));
  }
  if (params?.is_published !== undefined) {
    courses = courses.filter(c => c.is_published === params.is_published);
  }

  const page = params?.page || 1;
  const perPage = params?.per_page || 15;
  const start = (page - 1) * perPage;
  const paginatedCourses = courses.slice(start, start + perPage);

  return of({
    success: true,
    data: {
      courses: paginatedCourses,
      meta: {
        current_page: page,
        last_page: Math.ceil(courses.length / perPage),
        per_page: perPage,
        total: courses.length
      }
    }
  }).pipe(delay(800));
}

// US-08: Admin - Publish Course
export function mockPublishCourse(id: number, isPublished: boolean): Observable<{ success: boolean; message: string }> {
  const course = mockCourses.find(c => c.id === id);
  
  if (!course) {
    return throwError(() => ({
      success: false,
      message: 'Curso no encontrado',
      errors: {}
    }));
  }

  course.is_published = isPublished;

  return of({
    success: true,
    message: isPublished ? 'Curso publicado exitosamente' : 'Curso despublicado exitosamente'
  }).pipe(delay(500));
}

// ==================== ADMIN USER MOCKS ====================

// US-03: Get Users
export function mockGetUsers(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
}): Observable<UsersResponse> {
  let users = [...mockUsers];
  
  if (params?.search) {
    users = users.filter(u => 
      u.name.toLowerCase().includes(params.search!.toLowerCase()) ||
      u.email.toLowerCase().includes(params.search!.toLowerCase())
    );
  }
  if (params?.role) {
    users = users.filter(u => u.role === params.role);
  }

  const page = params?.page || 1;
  const perPage = params?.per_page || 15;
  const start = (page - 1) * perPage;
  const paginatedUsers = users.slice(start, start + perPage);

  return of({
    success: true,
    data: {
      users: paginatedUsers,
      meta: {
        current_page: page,
        last_page: Math.ceil(users.length / perPage),
        per_page: perPage,
        total: users.length
      }
    }
  }).pipe(delay(800));
}

// US-03: Create User
export function mockCreateUser(data: CreateUserRequest): Observable<UserResponse> {
  const existingUser = mockUsers.find(u => u.email === data.email);
  
  if (existingUser) {
    return throwError(() => ({
      success: false,
      message: 'El email ya está registrado',
      errors: { email: ['El email ya está registrado'] }
    }));
  }

  const newUser: User = {
    id: mockUsers.length + 1,
    name: data.name,
    email: data.email,
    role: data.role,
    is_active: true,
    created_at: new Date().toISOString()
  };
  mockUsers.push(newUser);

  return of({
    success: true,
    message: 'Usuario creado exitosamente',
    data: { user: newUser }
  }).pipe(delay(1000));
}

// US-03: Update User
export function mockUpdateUser(id: number, data: UpdateUserRequest): Observable<UserResponse> {
  const index = mockUsers.findIndex(u => u.id === id);
  
  if (index === -1) {
    return throwError(() => ({
      success: false,
      message: 'Usuario no encontrado',
      errors: {}
    }));
  }

  mockUsers[index] = { 
    ...mockUsers[index], 
    ...data, 
    updated_at: new Date().toISOString() 
  };

  return of({
    success: true,
    message: 'Usuario actualizado exitosamente',
    data: { user: mockUsers[index] }
  }).pipe(delay(1000));
}

// US-03: Delete User
export function mockDeleteUser(id: number): Observable<{ success: boolean; message: string }> {
  const index = mockUsers.findIndex(u => u.id === id);
  
  if (index === -1) {
    return throwError(() => ({
      success: false,
      message: 'Usuario no encontrado',
      errors: {}
    }));
  }

  mockUsers[index].is_active = false;

  return of({
    success: true,
    message: 'Usuario eliminado exitosamente'
  }).pipe(delay(500));
}

// Export mock data for testing
export const mockData = {
  users: mockUsers,
  courses: mockCourses
};