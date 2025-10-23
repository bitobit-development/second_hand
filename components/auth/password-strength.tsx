"use client";

import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";

type PasswordStrengthProps = {
  password: string;
};

const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;

  let strength = 0;

  // Length check
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 15;

  // Uppercase check
  if (/[A-Z]/.test(password)) strength += 20;

  // Lowercase check
  if (/[a-z]/.test(password)) strength += 20;

  // Number check
  if (/\d/.test(password)) strength += 20;

  // Special character check
  if (/[^A-Za-z0-9]/.test(password)) strength += 20;

  return Math.min(strength, 100);
};

const getStrengthLabel = (strength: number): string => {
  if (strength === 0) return "";
  if (strength < 40) return "Weak";
  if (strength < 70) return "Medium";
  return "Strong";
};

const getStrengthColor = (
  strength: number
): "bg-red-500" | "bg-yellow-500" | "bg-green-500" | "" => {
  if (strength === 0) return "";
  if (strength < 40) return "bg-red-500";
  if (strength < 70) return "bg-yellow-500";
  return "bg-green-500";
};

export const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const strength = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  );
  const label = useMemo(() => getStrengthLabel(strength), [strength]);
  const color = useMemo(() => getStrengthColor(strength), [strength]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Password strength:</span>
        <span
          className={`font-medium ${
            strength < 40
              ? "text-red-500"
              : strength < 70
              ? "text-yellow-500"
              : "text-green-500"
          }`}
        >
          {label}
        </span>
      </div>
      <Progress
        value={strength}
        className="h-2"
        indicatorClassName={color}
      />
    </div>
  );
};
