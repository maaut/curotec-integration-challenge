import React, { useState, useEffect, type ReactNode } from "react";
import { AxiosError } from "axios";
import {
  login as apiLogin,
  register as apiRegister,
  type LoginDto,
  type RegisterDto,
} from "../services/authApi";
import { message } from "antd";
import type { AuthState } from "../contexts/authContext";
import { AuthContext } from "../contexts/authContext";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem("token");
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
      const data = await apiLogin(credentials);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
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
      const data = await apiRegister(userData);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
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
    localStorage.removeItem("user");
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
