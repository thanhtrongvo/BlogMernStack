import { AlertCircle } from "lucide-react";
import type { FieldError } from "react-hook-form";

interface FormErrorProps {
  error?: FieldError;
}

export function FormError({ error }: FormErrorProps) {
  if (!error) return null;

  return (
    <div className="text-sm text-destructive flex items-center gap-1 mt-1">
      <AlertCircle className="h-4 w-4" />
      <span>{error.message}</span>
    </div>
  );
}
