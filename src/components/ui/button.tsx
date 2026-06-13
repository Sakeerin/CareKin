import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "ghost";
type ButtonSize = "default" | "sm" | "lg" | "elder";

const variantStyles: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
  outline: "border-2 border-border bg-card hover:bg-muted",
  success: "bg-success text-success-foreground hover:opacity-90",
  warning: "bg-warning text-warning-foreground hover:opacity-90",
  destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
  ghost: "hover:bg-muted",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-11 px-4 py-2 text-base touch-standard",
  sm: "h-9 px-3 text-sm",
  lg: "h-12 px-6 text-lg",
  elder: "h-14 min-h-[3.5rem] px-6 text-elder-lg font-semibold touch-elder",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
}

export function ElderButton({
  className,
  variant = "default",
  ...props
}: ButtonProps) {
  return <Button variant={variant} size="elder" className={cn("w-full", className)} {...props} />;
}
