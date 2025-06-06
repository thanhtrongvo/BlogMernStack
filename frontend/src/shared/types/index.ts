// User types
export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  role: 'admin' | 'user';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Post types
export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  featured_image?: string;
  status: 'draft' | 'published' | 'archived';
  author: User;
  category: Category;
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

// Comment types
export interface Comment {
  id: string;
  content: string;
  author: User;
  post: Post;
  parentId?: string;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// API Response types that match backend MongoDB format
export interface ApiPost {
  _id: string;
  title: string;
  content: string;
  image?: string;
  author: string | {
    _id: string;
    name: string;
    email?: string;
  };
  category: {
    _id: string;
    name: string;
    description?: string;
  };
  status: boolean; // true = published, false = draft
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiComment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email?: string;
  };
  postId: string | {
    _id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiCategory {
  _id: string;
  name: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  postCount?: number;
  color?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface FormError {
  field: string;
  message: string;
}

// Dashboard types
export interface DashboardStats {
  stats: {
    postCount: number;
    userCount: number;
    commentCount: number;
    totalViews: number;
  };
  updatedAt: string;
}

// UI types
export interface SelectOption {
  value: string;
  label: string;
}

export interface TableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: any) => React.ReactNode;
}

// Filter types
export interface PostFilters {
  category?: string;
  status?: string;
  author?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserFilters {
  role?: string;
  isVerified?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
