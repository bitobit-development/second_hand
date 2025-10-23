"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle, Key } from "lucide-react";

import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { resetPassword } from "../actions";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuthError } from "@/components/auth/auth-error";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");

  const onSubmit = async (data: ResetPasswordInput) => {
    setError("");
    setIsLoading(true);

    try {
      const result = await resetPassword({
        ...data,
        token,
      });

      if (!result.success) {
        setError(result.error || "Password reset failed");
        return;
      }

      setIsSuccess(true);
      toast.success("Password reset successful!");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/auth/login?reset=true");
      }, 3000);
    } catch (err) {
      console.error("Password reset error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Password reset successful
          </h1>
        </div>

        {/* Success Message */}
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-600 dark:text-green-400">
            Your password has been reset successfully! You can now log in with
            your new password.
          </AlertDescription>
        </Alert>

        {/* Redirect Info */}
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            You will be redirected to the login page in 3 seconds...
          </p>
          <Button asChild>
            <Link href="/auth/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Invalid Link</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            This password reset link is invalid. Please request a new password
            reset link.
          </AlertDescription>
        </Alert>
        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/auth/reset-password">Request new link</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/login">Back to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Set new password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      {/* Error Alert */}
      <AuthError message={error} />

      {/* Reset Password Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <PasswordStrength password={password} />
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting password...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                Reset password
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Footer Links */}
      <div className="text-center text-sm">
        <Link
          href="/auth/login"
          className="text-muted-foreground hover:text-primary hover:underline"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
