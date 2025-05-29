import { CreateTaskDto } from "./task.dto"; // Keep if other DTOs are in this file

export interface RegisterDto {
  email: string;
  password: string;
  // You can add other fields like username if needed in your User model
}

export interface LoginDto {
  email: string;
  password: string;
}
