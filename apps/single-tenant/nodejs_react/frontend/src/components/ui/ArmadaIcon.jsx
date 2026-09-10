import React from 'react';

/**
 * ArmadaIcon / CartIcon Component
 * Renders high-fidelity Indonesian mobile coffee cart (gerobak) SVG graphic.
 */
export function ArmadaIcon({
  variant = 'default',
  size = 48,
  status = 'AVAILABLE',
  className = '',
  alt = 'MOVA Coffee Cart',
}) {
  const assetPath = '/assets/armada/gerobak-default.svg';

  const dimensionStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size * 0.8}px` } : {};

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src={assetPath}
        alt={alt}
        style={dimensionStyle}
        className="object-contain select-none transition-transform duration-200 hover:scale-105"
        loading="lazy"
      />
    </div>
  );
}

export default ArmadaIcon;
