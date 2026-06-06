"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      richColors={false}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-matcha" />,
        info: <InfoIcon className="size-4 text-asagi" />,
        warning: <TriangleAlertIcon className="size-4 text-kincha" />,
        error: <OctagonXIcon className="size-4 text-terracotta" />,
        loading: <Loader2Icon className="size-4 animate-spin text-[var(--text-tertiary)]" />,
      }}
      style={
        {
          "--normal-bg": "var(--bg-surface)",
          "--normal-text": "var(--text-primary)",
          "--normal-border": "var(--border-default)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "!bg-white dark:!bg-sumi-100 !border !border-[var(--border-default)] !text-[var(--text-primary)] !shadow-sm",
          title: "!text-[var(--text-primary)] !font-medium !text-sm",
          description: "!text-[var(--text-secondary)] !text-xs",
          success: "!border-l-4 !border-matcha",
          error: "!border-l-4 !border-terracotta",
          warning: "!border-l-4 !border-kincha",
          info: "!border-l-4 !border-asagi",
          closeButton:
            "!text-[var(--text-tertiary)] hover:!text-[var(--text-primary)] !bg-washi-100 dark:!bg-sumi-100",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
