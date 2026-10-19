import React from 'react';

interface OneShotLogoProps {
  className?: string;
}

export const OneShotLogo: React.FC<OneShotLogoProps> = ({
  className = 'w-6 h-6',
}) => {
  return (
    <svg
      viewBox="0 0 144 144"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Geometric Delta Prism + Precision Reticle */}
      <path
        d="M72 14 L134 126 L10 126 Z M72 58 L46.5 104 L97.5 104 Z"
        fill="currentColor"
      />
      <circle cx="72" cy="87" r="9" fill="#526FFF" />
      <circle cx="72" cy="87" r="4" fill="#2CE59B" />
    </svg>
  );
};
