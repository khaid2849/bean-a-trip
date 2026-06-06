import { cn } from "@/lib/utils";

type BentoSize = "sm" | "md" | "lg" | "full";

const sizeClasses: Record<BentoSize, string> = {
  sm: "col-span-1",
  md: "col-span-1 sm:col-span-2",
  lg: "col-span-1 sm:col-span-2 lg:col-span-3",
  full: "col-span-1 sm:col-span-2 lg:col-span-4",
};

interface BentoCardProps {
  children: React.ReactNode;
  size?: BentoSize;
  className?: string;
  title?: string;
  description?: string;
}

export function BentoCard({ children, size = "sm", className, title, description }: BentoCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-white dark:bg-sumi-100 p-5 transition-colors hover:border-[var(--border-hover)]",
        sizeClasses[size],
        className
      )}
    >
      {(title || description) && (
        <div>
          {title && (
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              {title}
            </p>
          )}
          {description && (
            <p className="mb-2 text-xs text-[var(--text-tertiary)]">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
