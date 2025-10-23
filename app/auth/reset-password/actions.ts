"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import {
  resetPasswordRequestSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import {
  createPasswordResetToken,
  verifyPasswordResetToken,
  deletePasswordResetToken,
} from "@/lib/tokens";
import { sendEmail, getPasswordResetEmailHtml } from "@/lib/email";

type ActionResponse = {
  success: boolean;
  error?: string;
  message?: string;
};

/**
 * Send password reset email
 */
export const sendResetEmail = async (
  data: z.infer<typeof resetPasswordRequestSchema>
): Promise<ActionResponse> => {
  try {
    // Validate input
    const validatedData = resetPasswordRequestSchema.parse(data);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return {
        success: true,
        message:
          "If an account exists with this email, you will receive a password reset link shortly.",
      };
    }

    // Generate reset token
    const token = await createPasswordResetToken(user.id);

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${token}`;

    // Send reset email
    try {
      await sendEmail({
        to: user.email,
        subject: "Reset Your Password - Second-Hand Marketplace",
        html: getPasswordResetEmailHtml(resetUrl, user.name),
      });
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError);
      return {
        success: false,
        error: "Failed to send reset email. Please try again later.",
      };
    }

    return {
      success: true,
      message:
        "If an account exists with this email, you will receive a password reset link shortly.",
    };
  } catch (error) {
    console.error("Password reset request error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation error",
      };
    }

    return {
      success: false,
      error: "An error occurred. Please try again.",
    };
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (
  data: z.infer<typeof resetPasswordSchema>
): Promise<ActionResponse> => {
  try {
    // Validate input
    const validatedData = resetPasswordSchema.parse(data);

    // Verify token
    const tokenResult = await verifyPasswordResetToken(validatedData.token);

    if (!tokenResult.success || !tokenResult.token || !tokenResult.user) {
      return {
        success: false,
        error: tokenResult.error || "Invalid or expired reset token",
      };
    }

    // Hash new password
    const hashedPassword = await hashPassword(validatedData.password);

    // Update user password
    await prisma.user.update({
      where: { id: tokenResult.user.id },
      data: { password: hashedPassword },
    });

    // Delete the used token
    await deletePasswordResetToken(tokenResult.token.id);

    return {
      success: true,
      message:
        "Your password has been reset successfully! You can now log in with your new password.",
    };
  } catch (error) {
    console.error("Password reset error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation error",
      };
    }

    return {
      success: false,
      error: "An error occurred while resetting your password. Please try again.",
    };
  }
};
