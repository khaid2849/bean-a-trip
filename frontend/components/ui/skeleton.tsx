import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded bg-washi-100 dark:bg-sumi-100", className)}
      {...props}
    />
  )
}

export { Skeleton }
