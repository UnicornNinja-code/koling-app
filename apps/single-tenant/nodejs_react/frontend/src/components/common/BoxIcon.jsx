import React from "react";

/**
 * BoxIcon Component
 * Renders authentic Boxicons from the local boxicons-free asset package.
 * Supports names like "bx-map-pin", "bxs-dashboard", or clean names like "coffee", "map-pin".
 */
export function BoxIcon({ name, className = "", style, ...props }) {
  if (!name) return null;
  
  let formattedName = name;
  if (!formattedName.startsWith("bx-") && !formattedName.startsWith("bxs-") && !formattedName.startsWith("bxl-")) {
    formattedName = `bx-${formattedName}`;
  }

  return (
    <i
      className={`bx ${formattedName} ${className}`}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
}

export default BoxIcon;
