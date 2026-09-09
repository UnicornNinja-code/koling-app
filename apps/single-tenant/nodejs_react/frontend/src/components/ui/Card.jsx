import React from "react";
import { cn } from "../../lib/utils.js";

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "bg-white rounded-[6px] border border-[#E5E5E5] transition-all overflow-hidden",
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
      className={cn("px-3.5 py-3 md:px-4 md:py-3.5 flex flex-col space-y-0.5 border-b border-[#E5E5E5]", className)}
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
        "font-heading font-bold text-sm md:text-base text-[#111111] leading-tight tracking-tight",
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
      className={cn("text-xs text-[#737373] font-normal leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("p-4 md:p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "p-3.5 md:p-4 bg-[#F5F5F5] border-t border-[#E5E5E5] flex items-center justify-between gap-3 text-xs",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

