"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

import { registerSchema, type RegisterInput, SA_PROVINCES } from "@/lib/validations/auth";
import { registerUser } from "./actions";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthError } from "@/components/auth/auth-error";
import { PasswordStrength } from "@/components/auth/password-strength";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "",
      province: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");

  const onSubmit = async (data: RegisterInput) => {
    setError("");
    setIsLoading(true);

    try {
      const result = await registerUser(data);

      if (!result.success) {
        setError(result.error || "Registration failed");
        return;
      }

      toast.success(result.message || "Account created successfully!");

      // Redirect to login page
      setTimeout(() => {
        router.push("/auth/login?registered=true");
      }, 2000);
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Join Second-Hand Marketplace to start buying and selling
        </p>
      </div>

      {/* Error Alert */}
      <AuthError message={error} />

      {/* Registration Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    autoComplete="name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          {/* Phone (Optional) */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Phone Number <span className="text-muted-foreground">(Optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="0821234567"
                    autoComplete="tel"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* City (Optional) */}
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  City <span className="text-muted-foreground">(Optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Johannesburg"
                    autoComplete="address-level2"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Province (Optional) */}
          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Province <span className="text-muted-foreground">(Optional)</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SA_PROVINCES.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <FormLabel>Password</FormLabel>
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
                <FormLabel>Confirm Password</FormLabel>
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
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Create account
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Footer Links */}
      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Terms Notice */}
      <p className="text-xs text-center text-muted-foreground">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="underline hover:text-primary">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-primary">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
