import { cn } from "@/lib/utils"

export function LoginForm({
  className,
  title,
  subtitle,
  footer,
  onSubmit,
  children,
  ...props
}: React.ComponentProps<"form"> & {
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  children?: React.ReactNode;
}) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={onSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground text-sm text-balance">{subtitle}</p>
        )}
      </div>
      <div className="grid gap-6">
        {children}
      </div>
      {footer && <div className="text-center text-sm">{footer}</div>}
    </form>
  )
}
