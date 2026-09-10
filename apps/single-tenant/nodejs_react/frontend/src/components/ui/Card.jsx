import React from "react";
import { cn } from "../../lib/utils.js";

/**
 * MOVA Card Component — Design System v3.0 SSOT
 * Border-first (1px solid var(--border)), radius 12px (rounded-lg), subtle shadow
 */
export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-lg border border-border transition-colors overflow-hidden shadow-xs",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "px-5 py-4 flex flex-col space-y-1 border-b border-border bg-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn(
        "font-heading font-bold text-sm md:text-base text-foreground leading-tight tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p
      className={cn("text-xs text-muted-foreground font-normal leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "px-5 py-3.5 bg-muted/20 border-t border-border flex items-center justify-between gap-3 text-xs text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
