import React from 'react';

/**
 * WeatherIcon Component
 * Renders high-fidelity weather graphic images based on weather condition string or code.
 * Replaces material / font icons with rich vector SVG illustrations.
 */
export function WeatherIcon({ condition = 'sunny', weatherCode = null, size = 32, className = '', alt = '' }) {
  const norm = String(condition).toLowerCase().trim();
  const code = weatherCode !== null && weatherCode !== undefined ? Number(weatherCode) : null;

  let assetPath = '/assets/weather/sunny.svg';

  if (
    (code !== null && code >= 95) ||
    norm.includes('hujan lebat') ||
    norm.includes('petir') ||
    norm.includes('thunder') ||
    norm.includes('storm') ||
    norm.includes('badai')
  ) {
    assetPath = '/assets/weather/thunderstorm.svg';
  } else if (
    (code !== null && ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))) ||
    norm.includes('hujan') ||
    norm.includes('rain') ||
    norm.includes('gerimis') ||
    norm.includes('drizzle')
  ) {
    assetPath = '/assets/weather/rainy.svg';
  } else if (
    (code !== null && code === 2) ||
    norm.includes('sebagian') ||
    norm.includes('partly') ||
    norm.includes('cerah berawan') ||
    norm.includes('cloud-sun')
  ) {
    assetPath = '/assets/weather/partly-cloudy.svg';
  } else if (
    (code !== null && code === 3) ||
    norm.includes('awan') ||
    norm.includes('cloud') ||
    norm.includes('mendung') ||
    norm.includes('overcast') ||
    norm.includes('berawan')
  ) {
    assetPath = '/assets/weather/cloudy.svg';
  } else if (
    (code !== null && (code === 45 || code === 48)) ||
    norm.includes('kabut') ||
    norm.includes('fog') ||
    norm.includes('mist') ||
    norm.includes('asap')
  ) {
    assetPath = '/assets/weather/foggy.svg';
  } else {
    assetPath = '/assets/weather/sunny.svg';
  }

  const dimensionStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : {};

  return (
    <img
      src={assetPath}
      alt={alt || condition}
      style={dimensionStyle}
      className={`inline-block object-contain select-none pointer-events-none transition-transform duration-200 hover:scale-110 ${className}`}
      loading="lazy"
    />
  );
}

export default WeatherIcon;
