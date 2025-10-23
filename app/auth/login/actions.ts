"use server";

import { z } from "zod";
import { signIn } from "@/auth";
import { loginSchema } from "@/lib/validations/auth";
import { AuthError } from "next-auth";

type LoginResponse = {
  success: boolean;
  error?: string;
  errorType?: string;
  redirectTo?: string;
};

export const loginUser = async (
  data: z.infer<typeof loginSchema>,
  callbackUrl?: string
): Promise<LoginResponse> => {
  try {
    // Validate input
    const validatedData = loginSchema.parse(data);

    // Attempt sign in
    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return {
      success: true,
      redirectTo: callbackUrl || "/dashboard",
    };
  } catch (error) {
    console.error("Login error:", error);

    // Handle NextAuth errors
    if (error instanceof AuthError) {
      // Parse error message for specific cases
      const errorMessage = error.message || "";

      if (errorMessage.includes("Account locked")) {
        // Extract remaining minutes from error message
        const minutesMatch = errorMessage.match(/(\d+) minutes/);
        const minutes = minutesMatch ? minutesMatch[1] : "15";
        return {
          success: false,
          error: `Your account is locked due to multiple failed login attempts. Please try again in ${minutes} minutes.`,
          errorType: "account_locked",
        };
      }

      if (errorMessage.includes("verify your email")) {
        return {
          success: false,
          error:
            "Please verify your email address before logging in. Check your inbox for the verification link.",
          errorType: "email_not_verified",
        };
      }

      if (errorMessage.includes("Invalid credentials")) {
        return {
          success: false,
          error: "Invalid email or password. Please try again.",
          errorType: "invalid_credentials",
        };
      }

      return {
        success: false,
        error: "Authentication failed. Please try again.",
        errorType: "auth_error",
      };
    }

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Validation error",
        errorType: "validation_error",
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
      errorType: "unknown_error",
    };
  }
};
