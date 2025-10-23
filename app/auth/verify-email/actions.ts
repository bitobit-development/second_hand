"use server";

import { verifyEmailToken } from "@/lib/tokens";

type VerifyEmailResponse = {
  success: boolean;
  error?: string;
  message?: string;
};

export const verifyEmail = async (
  token: string
): Promise<VerifyEmailResponse> => {
  try {
    if (!token) {
      return {
        success: false,
        error: "Verification token is missing",
      };
    }

    const result = await verifyEmailToken(token);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      message:
        "Your email has been verified successfully! You can now log in to your account.",
    };
  } catch (error) {
    console.error("Email verification error:", error);
    return {
      success: false,
      error: "An error occurred during email verification. Please try again.",
    };
  }
};
