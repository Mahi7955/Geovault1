import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    const scorePercentage = (score / 5) * 100;
    
    if (score <= 2) return { score: scorePercentage, label: "Weak", color: "bg-destructive" };
    if (score <= 3) return { score: scorePercentage, label: "Fair", color: "bg-yellow-500" };
    if (score <= 4) return { score: scorePercentage, label: "Good", color: "bg-blue-500" };
    return { score: scorePercentage, label: "Strong", color: "bg-green-500" };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Password Strength:</span>
        <span className={`font-medium ${
          strength.label === "Weak" ? "text-destructive" : 
          strength.label === "Fair" ? "text-yellow-500" :
          strength.label === "Good" ? "text-blue-500" : "text-green-500"
        }`}>
          {strength.label}
        </span>
      </div>
      <Progress value={strength.score} className="h-2" />
      <p className="text-xs text-muted-foreground">
        Use 12+ characters with uppercase, lowercase, numbers, and symbols
      </p>
    </div>
  );
};
