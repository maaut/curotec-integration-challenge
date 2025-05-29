import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: "Title is required",
        invalid_type_error: "Title must be a string",
      })
      .min(1, { message: "Title cannot be empty" }),
    description: z
      .string({
        invalid_type_error: "Description must be a string",
      })
      .optional(),
    completed: z
      .boolean({
        invalid_type_error: "Completed must be a boolean",
      })
      .optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Task ID is required in params" }),
  }),
  body: z
    .object({
      title: z
        .string({
          invalid_type_error: "Title must be a string",
        })
        .min(1, { message: "Title cannot be empty" })
        .optional(),
      description: z
        .string({
          invalid_type_error: "Description must be a string",
        })
        .optional(),
      completed: z
        .boolean({
          invalid_type_error: "Completed must be a boolean",
        })
        .optional(),
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const taskIdSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Task ID is required in params" }),
  }),
});
