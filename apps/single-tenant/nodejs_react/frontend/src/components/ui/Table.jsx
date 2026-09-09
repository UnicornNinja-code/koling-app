import React from "react";
import { cn } from "../../lib/utils.js";

export function TableContainer({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-[8px] border border-[#24242A] bg-[#121215]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Table({ className, children, ...props }) {
  return (
    <table
      className={cn("w-full text-left border-collapse text-xs", className)}
      {...props}
    >
      {children}
    </table>
  );
}

export function TableHeader({ className, children, ...props }) {
  return (
    <thead
      className={cn(
        "bg-[#18181B] border-b border-[#24242A] text-[#A1A1AA] font-semibold uppercase text-[10px] tracking-wider",
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }) {
  return (
    <tbody
      className={cn("divide-y divide-[#24242A] font-normal text-[#FAFAFA]", className)}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableRow({ className, children, ...props }) {
  return (
    <tr
      className={cn("hover:bg-[#18181B] transition-colors", className)}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }) {
  return (
    <th
      className={cn("px-3 py-2.5 font-semibold text-[#A1A1AA] select-none text-[10px]", className)}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }) {
  return (
    <td
      className={cn("px-3 py-2.5 text-[#FAFAFA] align-middle text-xs", className)}
      {...props}
    >
      {children}
    </td>
  );
}

export function TableEmpty({ colSpan = 1, message = "Tidak ada data yang tersedia.", className = "" }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={cn("p-6 text-center text-[#71717A] text-xs italic", className)}
      >
        {message}
      </td>
    </tr>
  );
}

