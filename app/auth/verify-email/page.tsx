"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

import { verifyEmail } from "./actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing");
        return;
      }

      try {
        const result = await verifyEmail(token);

        if (result.success) {
          setStatus("success");
          setMessage(result.message || "Email verified successfully!");

          // Auto-redirect to login after 5 seconds
          setTimeout(() => {
            router.push("/auth/login?verified=true");
          }, 5000);
        } else {
          setStatus("error");
          setMessage(result.error || "Verification failed");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
        setMessage("An unexpected error occurred");
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Email Verification</h1>
      </div>

      {/* Status Content */}
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Verifying your email address...
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-4">
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              {message}
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You will be redirected to the login page in 5 seconds...
            </p>
            <Button asChild>
              <Link href="/auth/login">Go to Login</Link>
            </Button>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-4">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              The verification link may have expired or is invalid.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button asChild variant="outline">
                <Link href="/auth/register">Create New Account</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/login">Go to Login</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
