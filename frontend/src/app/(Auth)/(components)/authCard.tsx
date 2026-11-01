import Link from "next/link";
import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthCard({
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block mb-6">
          <span className="text-3xl font-bold tracking-tight text-primary">
            Acendra
          </span>
        </Link>

        <h1 className="text-2xl font-bold tracking-tight">
          {title}
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {children}
      </div>

      {footer && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  );
}