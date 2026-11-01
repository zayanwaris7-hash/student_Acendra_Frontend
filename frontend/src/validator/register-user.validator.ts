import { z } from "zod";

export const userRegisterSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters"),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address")
      .max(254, "Email cannot exceed 254 characters"),

    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username cannot exceed 30 characters")
      .regex(
        /^[a-z0-9_]+$/,
        "Username may contain only lowercase letters, numbers, and underscores",
      )
      .optional()
      .or(z.literal("")),

    password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .max(72, "Password cannot exceed 72 characters")
      .superRefine((val, ctx) => {
        if (!/[A-Z]/.test(val)) {
          ctx.addIssue({
            code: "custom",
            message: "Password must contain at least one uppercase letter",
          });
        }

        if (!/[a-z]/.test(val)) {
          ctx.addIssue({
            code: "custom",
            message: "Password must contain at least one lowercase letter",
          });
        }

        if (!/[0-9]/.test(val)) {
          ctx.addIssue({
            code: "custom",
            message: "Password must contain at least one number",
          });
        }

        if (!/[^A-Za-z0-9]/.test(val)) {
          ctx.addIssue({
            code: "custom",
            message: "Password must contain at least one special character",
          });
        }
      }),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type UserRegisterFormData = z.infer<typeof userRegisterSchema>;