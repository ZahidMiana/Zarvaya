import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
};

export default function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <header className={cn("space-y-4 border-b border-stone-200 pb-8", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="font-playfair text-3xl text-charcoal md:text-4xl">{title}</h1>
          {subtitle ? <p className="max-w-2xl text-sm text-charcoal/70 md:text-base">{subtitle}</p> : null}
        </div>
        {action}
      </div>
    </header>
  );
}
