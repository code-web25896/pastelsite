import React from 'react';
import officialLogoImg from '../assets/logo.webp';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  variant?: 'full' | 'horizontal' | 'emblem' | 'text' | 'image-only';
  colorMode?: 'default' | 'white' | 'dark' | 'monochrome';
  className?: string;
  onClick?: () => void;
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'horizontal',
  colorMode = 'default',
  className = '',
  onClick,
  showSubtitle = false // Default to false to remove slogan/subtitles
}) => {
  const isWhite = colorMode === 'white';

  // Dimension scaling mappings
  const dimensions = {
    xs: { emblem: 28, text: 'text-sm', sub: 'text-[8px]', gap: 'gap-2' },
    sm: { emblem: 38, text: 'text-base', sub: 'text-[9px]', gap: 'gap-2.5' },
    md: { emblem: 50, text: 'text-xl', sub: 'text-[10px]', gap: 'gap-3' },
    lg: { emblem: 68, text: 'text-2xl', sub: 'text-xs', gap: 'gap-3.5' },
    xl: { emblem: 96, text: 'text-3xl', sub: 'text-sm', gap: 'gap-4' },
    '2xl': { emblem: 140, text: 'text-4xl', sub: 'text-base', gap: 'gap-5' },
    hero: { emblem: 240, text: 'text-6xl', sub: 'text-xl', gap: 'gap-6' },
  }[size];

  // Official Uploaded Logo Image
  const renderLogoImage = (width: number, height: number, additionalClass = '') => {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-full overflow-hidden transition-transform duration-300 ${
          isWhite ? 'bg-white/10 p-0.5' : 'bg-transparent'
        } ${additionalClass}`}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <img
          src={officialLogoImg}
          alt="Espace Pastel Logo"
          className="w-full h-full object-contain select-none"
          loading="eager"
        />
      </div>
    );
  };

  // Image-only layout
  if (variant === 'image-only') {
    return (
      <div 
        onClick={onClick} 
        className={`inline-flex items-center justify-center ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''} ${className}`}
      >
        {renderLogoImage(dimensions.emblem, dimensions.emblem)}
      </div>
    );
  }

  // Full circular standalone logo (Emblem)
  if (variant === 'full' || variant === 'emblem') {
    return (
      <div 
        onClick={onClick} 
        className={`inline-flex flex-col items-center justify-center ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''} ${className}`}
      >
        {renderLogoImage(dimensions.emblem, dimensions.emblem, 'drop-shadow-md')}
      </div>
    );
  }

  // Text-only layout
  if (variant === 'text') {
    return (
      <div 
        onClick={onClick}
        className={`flex flex-col leading-none select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <div className="flex items-center gap-1.5">
          <span className={`font-['Outfit'] font-black tracking-tight ${dimensions.text} ${isWhite ? 'text-white' : 'text-[#0B1833]'}`}>
            ESPACE
          </span>
          <span className={`font-['Great_Vibes'] text-2xl sm:text-3xl font-normal ${isWhite ? 'text-[#F4A9C8]' : 'text-[#0B1833]'}`}>
            Pastel
          </span>
        </div>
      </div>
    );
  }

  // Default: Horizontal Layout (Emblem image + Wordmark, sans slogan)
  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center ${dimensions.gap} select-none group ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Official Emblem Image */}
      <div className="transition-transform duration-300 group-hover:scale-105 flex-shrink-0">
        {renderLogoImage(dimensions.emblem, dimensions.emblem)}
      </div>

      {/* Brand Wordmark (Clean without slogan) */}
      <div className="flex flex-col leading-tight">
        <div className="flex items-baseline gap-1.5">
          <span className={`font-['Outfit'] font-extrabold tracking-tight ${dimensions.text} ${isWhite ? 'text-white' : 'text-[#0B1833]'}`}>
            ESPACE
          </span>
          <span className={`font-['Great_Vibes'] font-normal text-2xl sm:text-3xl ${isWhite ? 'text-[#F4A9C8]' : 'text-[#0B1833]'}`}>
            Pastel
          </span>
        </div>
        {showSubtitle && (
          <span className={`font-bold tracking-[0.18em] uppercase ${dimensions.sub} ${isWhite ? 'text-gray-300' : 'text-gray-500'}`}>
            Tunis
          </span>
        )}
      </div>
    </div>
  );
};
