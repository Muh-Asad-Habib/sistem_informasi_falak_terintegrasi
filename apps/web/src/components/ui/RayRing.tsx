import React from 'react';

interface RayRingProps {
  percentage?: number; // Nilai 0 - 100 untuk progress ring
  size?: number;       // Diameter ring dalam px
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

export function RayRing({
  percentage = 100,
  size = 200,
  strokeWidth = 6,
  className = '',
  children,
}: RayRingProps) {
  const radius = (size - strokeWidth * 4) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Garis sinar radial (36 garis, setiap 10 derajat)
  const raysCount = 36;
  const rayLines = Array.from({ length: raysCount }).map((_, i) => {
    const angle = (i * 360) / raysCount;
    // Jarak sinar dari pusat lingkaran
    const innerRadius = radius + strokeWidth + 2;
    const outerRadius = radius + strokeWidth + 8;
    const angleRad = (angle * Math.PI) / 180;

    const x1 = size / 2 + innerRadius * Math.cos(angleRad);
    const y1 = size / 2 + innerRadius * Math.sin(angleRad);
    const x2 = size / 2 + outerRadius * Math.cos(angleRad);
    const y2 = size / 2 + outerRadius * Math.sin(angleRad);

    // Sorot beberapa garis sinar (misalnya 4 arah mata angin)
    const isMajor = angle % 90 === 0;

    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        className={`transition-all duration-300 ${
          isMajor
            ? 'stroke-sifa-gold-500 stroke-[1.5px] opacity-80'
            : 'stroke-card-border stroke-[1px] opacity-40 dark:stroke-sifa-green-800'
        }`}
      />
    );
  });

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 select-none">
        {/* Ray Lines Ornaments */}
        {rayLines}

        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          className="stroke-card-border dark:stroke-sifa-green-900/50"
          strokeWidth={strokeWidth}
        />

        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          className="stroke-sifa-green-600 dark:stroke-sifa-green-500 transition-all duration-500 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      {/* Center Content */}
      <div className="z-10 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
