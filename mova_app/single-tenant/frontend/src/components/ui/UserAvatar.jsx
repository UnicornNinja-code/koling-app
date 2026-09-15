/*
 *   Copyright (c) 2026
 *   All rights reserved.
 *   UserAvatar.jsx — IBM Carbon Resilient User Avatar & Initials Fallback Component
 */

import React, { useState } from "react";
import { getInitials } from "../../types/api.js";

const sizeClasses = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-7 h-7 text-[11px]",
  md: "w-8 h-8 text-[12px]",
  lg: "w-10 h-10 text-[14px]",
  xl: "w-14 h-14 text-[18px]",
};

const roleColors = {
  SUPERADMIN: "bg-[var(--cds-interactive)] text-[var(--cds-text-on-color)] border-[var(--cds-interactive)]",
  MANAGEMENT: "bg-[#8a3ffc] text-[#ffffff] border-[#8a3ffc]",
  SUPERVISOR: "bg-[#0072c3] text-[#ffffff] border-[#0072c3]",
  RIDER: "bg-[#0e6027] text-[#ffffff] border-[#0e6027]",
  DEFAULT: "bg-[var(--cds-layer-03)] text-[var(--cds-text-primary)] border-[var(--cds-border-subtle)]",
};

/**
 * UserAvatar Component:
 * Renders user avatar image if available, with robust automatic fallback to initials.
 */
export function UserAvatar({
  name = "User",
  avatarUrl = null,
  role = "DEFAULT",
  size = "md",
  className = "",
  title,
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = getInitials(name);
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const colorClass = roleColors[String(role).toUpperCase()] || roleColors.DEFAULT;

  const showImage = Boolean(avatarUrl) && !imageFailed;

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center font-bold font-mono uppercase rounded-none border select-none transition-all ${sizeClass} ${colorClass} ${className}`}
      title={title || `${name} (${role})`}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="tracking-tighter leading-none">{initials}</span>
      )}
    </div>
  );
}

export default UserAvatar;
