import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { AxiosError } from "axios";
import {
  login as apiLogin,
  register as apiRegister,
  type LoginDto,
  type RegisterDto,
} from "../services/authApi";
import { message } from "antd";
import type { User } from "../types/user.types"; // Import User type

// Define types for user and auth state
// Remove the local User interface, we'll use the imported one.

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem("token");
    // User data will be fetched if token is valid, or set upon login/register
    return {
      token,
      user: null,
      isAuthenticated: !!token,
      isLoading: true,
    };
  });
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const validateTokenAndFetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        // In a real app, you'd have an endpoint like /auth/me to get user data
        // For now, we'll assume if a token exists, we need to fetch user details.
        // This part needs a backend endpoint to verify token and get user.
        // For now, let's assume token presence implies auth and user will be populated on login/register.
        // Or, if your JWT contains basic user info, you could decode it here (carefully).
        // Let's simulate fetching the user if the token exists,
        // or rely on login/register to populate user.
        // For this iteration, we'll simplify and assume user data comes with login/register.
        // And on refresh, if token exists, we are "authenticated" but user object might be null until a protected call or re-login.
        // A more robust solution involves a /auth/me endpoint.

        // Let's try to get user from localStorage if previously stored
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            setAuthState((prev) => ({
              ...prev,
              user: JSON.parse(storedUser),
              isAuthenticated: true,
              isLoading: false,
            }));
          } catch (error) {
            console.error("Failed to parse user from localStorage:", error);
            localStorage.removeItem("user");
            setAuthState((prev) => ({
              ...prev,
              isAuthenticated: true,
              isLoading: false,
              user: null,
            }));
          }
        } else {
          setAuthState((prev) => ({
            ...prev,
            isAuthenticated: true,
            isLoading: false,
          }));
        }
      } else {
        setAuthState({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    validateTokenAndFetchUser();
  }, []);

  const login = async (credentials: LoginDto) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      const data = await apiLogin(credentials); // authApi.ts now returns { token, user }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); // Store user object
      setAuthState({
        token: data.token,
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      messageApi.success("Login successful!");
    } catch (error) {
      console.error("Login failed:", error);
      let errorMessage = "Login failed. Please try again.";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      messageApi.error(errorMessage);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        user: null,
        token: null,
        isAuthenticated: false,
      }));
      throw error;
    }
  };

  const register = async (userData: RegisterDto) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      const data = await apiRegister(userData); // Assuming register also returns { token, user }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); // Store user object
      setAuthState({
        token: data.token,
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      messageApi.success("Registration successful! You are now logged in.");
    } catch (error) {
      console.error("Registration failed:", error);
      let errorMessage = "Registration failed. Please try again.";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      messageApi.error(errorMessage);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        user: null,
        token: null,
        isAuthenticated: false,
      }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // Remove user from localStorage
    setAuthState({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    messageApi.info("Logged out.");
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout }}>
      {contextHolder}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
