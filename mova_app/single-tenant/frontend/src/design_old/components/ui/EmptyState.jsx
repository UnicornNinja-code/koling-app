import React from "react";
import { Inbox } from "lucide-react";
import { Button } from "./Button.jsx";

/**
 * MOVA Design System v3.0 EmptyState Component
 */
export function EmptyState({
  icon: Icon = Inbox,
  title = "Tidak Ada Data Ditemukan",
  description = "Belum ada data atau catatan yang sesuai dengan filter yang dipilih saat ini.",
  actionText,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-[12px] ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3.5">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-['Inter'] mb-1">
        {title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-['Inter'] max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
