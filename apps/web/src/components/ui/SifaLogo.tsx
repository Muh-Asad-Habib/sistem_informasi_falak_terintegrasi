import React from 'react';

interface SifaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function SifaLogo({ size = 'md', showText = true, className = '' }: SifaLogoProps) {
  const iconSizes = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-12 h-12 rounded-xl',
    lg: 'w-16 h-16 rounded-2xl',
  };

  const ringRounding = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const subTextSizes = {
    sm: 'text-[9px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* Icon Emblem: Ka'bah Cube + Crescent */}
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-sifa-green-900 to-sifa-green-800 shadow-md shadow-sifa-green-900/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-sifa-green-900/40 group-hover:shadow-lg ${iconSizes[size]}`}>
        {/* Decorative Gold Ring */}
        <div className={`absolute inset-0 border border-sifa-gold-500/30 group-hover:border-sifa-gold-500/60 transition-colors duration-300 ${ringRounding[size]}`} />
        
        {/* Custom SVG Icon combining Ka'bah Cube & Crescent Moon */}
        <svg className="w-[70%] h-[70%]" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ka'bah cube */}
          {/* Top face (diamond/rhombus) */}
          <path d="M16 4L26 9.5V15L16 20.5L6 15V9.5L16 4Z" fill="#C9A227" fillOpacity="0.15" stroke="#C9A227" strokeWidth="1.5" strokeLinejoin="round"/>
          {/* Front face */}
          <path d="M6 15V23L16 28.5V20.5L6 15Z" fill="#C9A227" fillOpacity="0.25" stroke="#C9A227" strokeWidth="1.5" strokeLinejoin="round"/>
          {/* Right face */}
          <path d="M26 15V23L16 28.5V20.5L26 15Z" fill="#C9A227" fillOpacity="0.1" stroke="#C9A227" strokeWidth="1.5" strokeLinejoin="round"/>
          {/* Crescent + star top-right */}
          <path d="M24 3.5C24 5.7 22.4 7.5 20.3 7.9C21.2 6.7 21.7 5.2 21.7 3.5C21.7 1.8 21.2 0.3 20.3-0.9C22.4-0.5 24 1.3 24 3.5Z" fill="#C9A227"/>
          <circle cx="23.5" cy="1" r="0.7" fill="#C9A227"/>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-heading font-extrabold tracking-tight text-sifa-green-900 dark:text-sifa-green-100 leading-none ${textSizes[size]}`}>
            SIFA
          </span>
          <span className={`text-sifa-gold-600 dark:text-sifa-gold-500 font-bold tracking-wider uppercase mt-0.5 ${subTextSizes[size]}`}>
            Info Falak Terintegrasi
          </span>
        </div>
      )}
    </div>
  );
}
