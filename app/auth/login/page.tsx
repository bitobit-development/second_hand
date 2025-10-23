"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, LogIn, CheckCircle2 } from "lucide-react";

import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginUser } from "./actions";

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
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisteredMessage, setShowRegisteredMessage] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl");
  const registered = searchParams.get("registered");

  useEffect(() => {
    if (registered === "true") {
      setShowRegisteredMessage(true);
      // Remove the query param
      const url = new URL(window.location.href);
      url.searchParams.delete("registered");
      window.history.replaceState({}, "", url.toString());
    }
  }, [registered]);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setError("");
    setIsLoading(true);

    try {
      const result = await loginUser(data, callbackUrl || undefined);

      if (!result.success) {
        setError(result.error || "Login failed");

        // Show specific toast messages for certain error types
        if (result.errorType === "email_not_verified") {
          toast.error("Email not verified", {
            description: "Please check your inbox for the verification link.",
          });
        } else if (result.errorType === "account_locked") {
          toast.error("Account locked", {
            description: result.error,
          });
        }
        return;
      }

      toast.success("Welcome back!");

      // Redirect to callback URL or dashboard
      router.push(result.redirectTo || "/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      {/* Registration Success Message */}
      {showRegisteredMessage && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-600 dark:text-green-400">
            Account created successfully! Please check your email to verify your account before logging in.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      <AuthError message={error} />

      {/* Login Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/auth/reset-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Footer Links */}
      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-primary hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
