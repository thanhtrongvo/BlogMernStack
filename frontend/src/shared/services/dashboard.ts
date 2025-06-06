import apiClient from './apiClient';
import type { DashboardStats } from '../types';

// Interface for chart data points
export interface ChartDataPoint {
  name: string;
  views: number;
  date?: Date;
}

// Interface for top posts
export interface TopPost {
  id: string;
  title: string;
  views: number;
  category: string;
}

// Dashboard API service
export const dashboardAPI = {
  // Get overall dashboard statistics
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/api/dashboard/stats');
    return response.data;
  },
  
  // Get weekly views data for charts
  getWeeklyViews: async (): Promise<ChartDataPoint[]> => {
    const response = await apiClient.get('/api/dashboard/views/weekly');
    return response.data;
  },
  
  // Get monthly views data for charts
  getMonthlyViews: async (): Promise<ChartDataPoint[]> => {
    const response = await apiClient.get('/api/dashboard/views/monthly');
    return response.data;
  },
  
  // Get top posts by views
  getTopPosts: async (limit: number = 5): Promise<TopPost[]> => {
    const response = await apiClient.get(`/api/dashboard/posts/top?limit=${limit}`);
    return response.data;
  },

  // Get recent posts (from posts API)
  getRecentPosts: async (limit: number = 5) => {
    const response = await apiClient.get(`/api/posts?limit=${limit}&sort=createdAt&order=desc`);
    return response.data;
  },

  // Get recent comments (from comments API) 
  getRecentComments: async (limit: number = 5) => {
    const response = await apiClient.get(`/api/comments?limit=${limit}&sort=createdAt&order=desc`);
    return response.data;
  },

  // Get categories count
  getCategoriesCount: async (): Promise<number> => {
    const response = await apiClient.get('/api/categories');
    return Array.isArray(response.data) ? response.data.length : 0;
  }
};
