import apiClient from "./axiosConfig";
import type { User } from "../types/user.types";

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface AuthResponse {
  token: string;
  user: User;
  // Add other user properties if your backend returns them
}

// Replace with your actual DTOs if they exist
export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export const register = async (
  userData: RegisterDto
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/auth/register",
    userData
  );
  return response.data;
};

export const login = async (userData: LoginDto): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/auth/login", userData);
  return response.data;
};
