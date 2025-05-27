import { 
  getAccessToken, 
  refreshAccessToken, 
  clearAuth, 
  getRefreshToken,
  AUTH_API 
} from './auth';

// Base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// API request options type
export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

// Error class for API errors
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Core API fetcher function with token refresh logic
 */
export async function fetchAPI<T>(
  endpoint: string, 
  options: ApiOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    requireAuth = false,
  } = options;

  // Create request headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add auth token if required
  if (requireAuth) {
    const token = getAccessToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    } else {
      throw new ApiError('Authentication required', 401);
    }
  }

  // Create request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    // Make the API request
    let response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
    
    // Handle token expiration
    if (response.status === 401 && requireAuth) {
      const newToken = await refreshAccessToken();
      
      if (newToken) {
        // Retry the request with new token
        requestHeaders.Authorization = `Bearer ${newToken}`;
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...requestOptions,
          headers: requestHeaders,
        });
      } else {
        // If can't refresh token, clear auth and throw error
        clearAuth();
        throw new ApiError('Session expired. Please log in again.', 401);
      }
    }
    
    // Handle unsuccessful responses
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Something went wrong' }));
      throw new ApiError(error.message || `HTTP error ${response.status}`, response.status);
    }
    
    // Return success response
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error('API request failed:', error);
    throw new ApiError('Network error', 0);
  }
}

// Auth-related API methods
export const authAPI = {
  login: async (email: string, password: string) => {
    return fetchAPI(AUTH_API.LOGIN, {
      method: 'POST',
      body: { email, password },
    });
  },
  
  register: async (username: string, email: string, password: string) => {
    return fetchAPI(AUTH_API.REGISTER, {
      method: 'POST',
      body: { username, email, password },
    });
  },
  
  logout: async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return;
    
    return fetchAPI(AUTH_API.LOGOUT, {
      method: 'POST',
      body: { refreshToken },
    });
  },
  
  logoutAll: async () => {
    return fetchAPI(AUTH_API.LOGOUT_ALL, {
      method: 'POST',
      requireAuth: true,
    });
  },
};

// Upload API methods
export const uploadAPI = {
  uploadImage: async (imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const token = getAccessToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error uploading image' }));
      throw new ApiError(error.message || `HTTP error ${response.status}`, response.status);
    }
    
    return response.json();
  }
};

// Posts API methods
export const postsAPI = {
  getAllPosts: async () => {
    return fetchAPI('/api/posts', {
      requireAuth: false,
    });
  },
  getPostsByCategory: async (categoryId: string) => {
    return fetchAPI(`/api/posts/category/${categoryId}`, {
      requireAuth: false,
    });
  },
  
  getPostById: async (id: string) => {
    return fetchAPI(`/api/posts/${id}`, {
      requireAuth: false,
    });
  },
  
  createPost: async (postData: any) => {
    return fetchAPI('/api/posts', {
      method: 'POST',
      body: postData,
      requireAuth: true,
    });
  },
  
  updatePost: async (id: string, postData: any) => {
    return fetchAPI(`/api/posts/${id}`, {
      method: 'PUT',
      body: postData,
      requireAuth: true,
    });
  },
  
  deletePost: async (id: string) => {
    return fetchAPI(`/api/posts/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  },
  
  trackPostView: async (id: string) => {
    return fetchAPI(`/api/posts/${id}/view`, {
      method: 'POST',
    });
  }
};

// Categories API methods
export const categoriesAPI = {
  getAllCategories: async () => {
    return fetchAPI('/api/categories', {
      requireAuth: true,
    });
  },
  
  getPublicCategories: async () => {
    return fetchAPI('/api/categories/public', {
      requireAuth: false,
    });
  },
  
  getCategoryById: async (id: string) => {
    return fetchAPI(`/api/categories/${id}`, {
      requireAuth: true,
    });
  },
  
  createCategory: async (categoryData: any) => {
    return fetchAPI('/api/categories', {
      method: 'POST',
      body: categoryData,
      requireAuth: true,
    });
  },
  
  updateCategory: async (id: string, categoryData: any) => {
    return fetchAPI(`/api/categories/${id}`, {
      method: 'PUT',
      body: categoryData,
      requireAuth: true,
    });
  },
  
  deleteCategory: async (id: string) => {
    return fetchAPI(`/api/categories/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  }

};

// Comments API methods
export const commentsAPI = {
  getAllComments: async () => {
    return fetchAPI('/api/comments', {
      requireAuth: true,
    });
  },
  
  getCommentById: async (id: string) => {
    return fetchAPI(`/api/comments/${id}`, {
      requireAuth: true,
    });
  },
  
  getCommentsByPostId: async (postId: string) => {
    return fetchAPI(`/api/comments/post/${postId}`, {
      requireAuth: false,
    });
  },
  getPostByCategoryId: async (categoryId: string) => { 
    return fetchAPI(`/api/posts/category/${categoryId}`, {
      requireAuth: false,
    });
  },

  createComment: async (commentData: any) => {
    return fetchAPI('/api/comments', {
      method: 'POST',
      body: commentData,
      requireAuth: true,
    });
  },
  
  updateComment: async (id: string, commentData: any) => {
    return fetchAPI(`/api/comments/${id}`, {
      method: 'PUT',
      body: commentData,
      requireAuth: true,
    });
  },
  
  deleteComment: async (id: string) => {
    return fetchAPI(`/api/comments/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  },
  
  approveComment: async (id: string) => {
    return fetchAPI(`/api/comments/${id}/approve`, {
      method: 'PUT',
      requireAuth: true,
    });
  },
  
  rejectComment: async (id: string) => {
    return fetchAPI(`/api/comments/${id}/reject`, {
      method: 'PUT',
      requireAuth: true,
    });
  }
};

// Users API methods
export const usersAPI = {
  getAllUsers: async () => {
    return fetchAPI('/api/users', {
      requireAuth: true,
    });
  },
  
  getUserById: async (id: string) => {
    return fetchAPI(`/api/users/${id}`, {
      requireAuth: true,
    });
  },
  
  createUser: async (userData: any) => {
    return fetchAPI('/api/users', {
      method: 'POST',
      body: userData,
      requireAuth: true,
    });
  },
  
  updateUser: async (id: string, userData: any) => {
    return fetchAPI(`/api/users/${id}`, {
      method: 'PUT',
      body: userData,
      requireAuth: true,
    });
  },
  
  deleteUser: async (id: string) => {
    return fetchAPI(`/api/users/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  }
};
