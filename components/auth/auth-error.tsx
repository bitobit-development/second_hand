import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type AuthErrorProps = {
  message?: string;
  className?: string;
};

export const AuthError = ({ message, className }: AuthErrorProps) => {
  if (!message) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
