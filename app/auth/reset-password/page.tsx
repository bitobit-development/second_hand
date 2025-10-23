"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

import {
  resetPasswordRequestSchema,
  type ResetPasswordRequestInput,
} from "@/lib/validations/auth";
import { sendResetEmail } from "./actions";

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

export default function ResetPasswordPage() {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ResetPasswordRequestInput>({
    resolver: zodResolver(resetPasswordRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetPasswordRequestInput) => {
    setError("");
    setIsLoading(true);

    try {
      const result = await sendResetEmail(data);

      if (!result.success) {
        setError(result.error || "Failed to send reset email");
        return;
      }

      setEmailSent(true);
      toast.success("Password reset email sent!");
    } catch (err) {
      console.error("Password reset request error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
        </div>

        {/* Success Message */}
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-600 dark:text-green-400">
            If an account exists with the email you provided, you will receive a
            password reset link shortly. The link will expire in 1 hour.
          </AlertDescription>
        </Alert>

        {/* Instructions */}
        <div className="space-y-4 text-center text-sm text-muted-foreground">
          <p>Please check your inbox and spam folder.</p>
          <p>If you don&apos;t receive an email, you can try again.</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setEmailSent(false);
              form.reset();
            }}
          >
            Try different email
          </Button>
          <Button asChild>
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
        <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your
          password
        </p>
      </div>

      {/* Error Alert */}
      <AuthError message={error} />

      {/* Reset Form */}
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

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending email...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send reset link
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
