import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  getUser,
  getAccessToken,
  clearAuth,
  refreshAccessToken,
  storeAuth,
  type User,
} from "../services/auth";
import apiClient from "../services/apiClient";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = getUser();
      const token = getAccessToken();

      if (storedUser && token) {
        try {
          // Try to refresh token to verify that the session is still valid
          const newToken = await refreshAccessToken();
          if (newToken) {
            setUser(storedUser);
          } else {
            // If token refresh fails, clear auth
            clearAuth();
          }
        } catch (error) {
          console.error("Session validation error:", error);
          clearAuth();
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    const response = await apiClient.post<LoginResponse>("/api/auth/login", {
      email,
      password,
    });

    const { accessToken, refreshToken, user: userData } = response.data;

    // Store tokens and user data
    storeAuth({ accessToken, refreshToken }, userData);
    setUser(userData);
  };

  // Logout function
  const logout = async () => {
    try {
      await apiClient.post("/api/auth/logout", {
        refreshToken: localStorage.getItem("blogRefreshToken"),
      });
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      clearAuth();
      setUser(null);
    }
  };

  // Setup token refresh interval
  useEffect(() => {
    let refreshInterval: number | undefined;

    if (user) {
      // Refresh token every 14 minutes (access token expires after 15)
      refreshInterval = window.setInterval(
        async () => {
          try {
            await refreshAccessToken();
          } catch (error) {
            console.error("Error refreshing token:", error);
            // On refresh failure, log user out
            clearAuth();
            setUser(null);
          }
        },
        14 * 60 * 1000,
      );

      // Also refresh token on page load
      refreshAccessToken().catch((error) => {
        console.error("Error refreshing token on page load:", error);
      });
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [user]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
