import React from 'react';

/**
 * Avatar Component
 * Renders user avatar using high-quality SVG illustrations (admin, rider, manager, operator),
 * custom image URLs, or initials fallback, with optional online/status badge.
 */
export function Avatar({
  src,
  role = 'admin',
  name = '',
  size = 'md',
  status,
  className = '',
  alt = '',
}) {
  const sizeMap = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const statusSizeMap = {
    xs: 'w-1.5 h-1.5 ring-1',
    sm: 'w-2 h-2 ring-1',
    md: 'w-2.5 h-2.5 ring-2',
    lg: 'w-3 h-3 ring-2',
    xl: 'w-4 h-4 ring-2',
  };

  const statusColorMap = {
    online: 'bg-emerald-500',
    busy: 'bg-amber-500',
    offline: 'bg-slate-400',
    active: 'bg-blue-500',
  };

  // Determine image source
  let resolvedSrc = src;
  if (!resolvedSrc) {
    const normRole = String(role).toLowerCase();
    if (normRole.includes('rider')) {
      resolvedSrc = '/assets/avatars/rider.svg';
    } else if (normRole.includes('manager') || normRole.includes('area')) {
      resolvedSrc = '/assets/avatars/admin.svg';
    } else {
      resolvedSrc = '/assets/avatars/admin.svg';
    }
  }

  const dimensionClass = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${dimensionClass} ${className}`}>
      <img
        src={resolvedSrc}
        alt={alt || name || 'User Avatar'}
        className="w-full h-full rounded-full object-cover shadow-sm select-none"
        onError={(e) => {
          // Fallback if image fails
          e.currentTarget.src = '/assets/avatars/admin.svg';
        }}
      />
      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-white dark:ring-slate-900 ${
            statusColorMap[status] || 'bg-emerald-500'
          } ${statusSizeMap[size] || statusSizeMap.md}`}
        />
      )}
    </div>
  );
}

export default Avatar;
