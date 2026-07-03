import React from "react";

interface LogoProps {
  className?: string;
  size?: number | string;
}

export default function Logo({ className = "", size = 44 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
    >
      {/* Green Circular Background */}
      <circle cx="50" cy="50" r="50" fill="#3D7C47" />

      {/* Center White Medical Cross */}
      {/* Horizontal Bar */}
      <rect x="26" y="42" width="48" height="16" rx="2" fill="white" />
      {/* Vertical Bar */}
      <rect x="42" y="26" width="16" height="48" rx="2" fill="white" />

      {/* Sweeping Crescent Swoosh */}
      <path
        d="M 22 68 Q 48 82 81 28 Q 52 70 22 68 Z"
        fill="white"
      />
    </svg>
  );
}
