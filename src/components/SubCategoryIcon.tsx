import React from 'react';
import { 
  BookOpen, 
  PenTool, 
  Pencil, 
  Backpack, 
  Scissors, 
  Paperclip, 
  FileText, 
  Briefcase, 
  Palette, 
  Brush, 
  Compass, 
  Frame, 
  Highlighter, 
  Layers, 
  Package, 
  Sparkles,
  Folder,
  Crown,
  Boxes,
  UtensilsCrossed,
  ShieldCheck,
  Anchor,
  Sailboat,
  Feather,
  Maximize2,
  Luggage,
  Award
} from 'lucide-react';

interface SubCategoryIconProps {
  slug?: string;
  name?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'badge' | 'card';
  accentColor?: string;
}

export const getSubCategoryIconComponent = (slug?: string, name?: string) => {
  const s = (slug || '').toLowerCase();
  const n = (name || '').toLowerCase();

  // BOMI SPECIFIC SUBCATEGORIES
  if (s.includes('piece') || s.includes('rare') || n.includes('rare') || n.includes('pièce') || n.includes('pieces')) {
    return Crown;
  }
  if (s.includes('collection-2026') || n.includes('collection 2026') || s.includes('col2026')) {
    return Sparkles;
  }
  if (s.includes('xl') || n.includes('xl')) {
    return Maximize2;
  }
  if (s.includes('pack') || n.includes('pack')) {
    return Boxes;
  }
  if (s.includes('lunch') || n.includes('lunch') || s.includes('gouter') || n.includes('repas')) {
    return UtensilsCrossed;
  }
  if (s.includes('trousse') || s.includes('panier') || s.includes('chariot') || s.includes('protection') || s.includes('accessoire') || n.includes('accessoire')) {
    return Luggage;
  }

  // WAMA SPECIFIC SUBCATEGORIES
  if (s.includes('yachtliner') || n.includes('yachtliner')) {
    return Anchor;
  }
  if (s.includes('nautica') || n.includes('nautica')) {
    return Sailboat;
  }
  if (s.includes('naviglio') || s.includes('naniglio') || n.includes('naviglio') || n.includes('naniglio')) {
    return Feather;
  }

  // OTHER GENERAL CATEGORIES
  if (s.includes('cahier') || n.includes('cahier') || s.includes('carnet') || n.includes('carnet')) {
    return BookOpen;
  }
  if (s.includes('stylo') || n.includes('stylo')) {
    return PenTool;
  }
  if (s.includes('crayon') || n.includes('crayon')) {
    return Pencil;
  }
  if (s.includes('sac') || n.includes('sac') || s.includes('cartable') || n.includes('cartable')) {
    return Backpack;
  }
  if (s.includes('peinture') || n.includes('peinture')) {
    return Palette;
  }
  if (s.includes('pinceau') || n.includes('pinceau') || s.includes('brosse')) {
    return Brush;
  }
  if (s.includes('dessin') || n.includes('dessin') || s.includes('croquis')) {
    return Compass;
  }
  if (s.includes('toile') || n.includes('toile') || s.includes('chassis')) {
    return Frame;
  }
  if (s.includes('feutre') || n.includes('feutre') || s.includes('marqueur') || n.includes('marqueur')) {
    return Highlighter;
  }
  if (s.includes('papeterie') || n.includes('papeterie') || s.includes('feuille')) {
    return FileText;
  }
  if (s.includes('bureau') || n.includes('bureau') || s.includes('classeur')) {
    return Briefcase;
  }
  if (s.includes('fourniture') || n.includes('fourniture')) {
    return Layers;
  }
  return Folder;
};

export const SubCategoryIcon: React.FC<SubCategoryIconProps> = ({
  slug,
  name,
  className = '',
  size = 'md',
  variant = 'icon',
  accentColor
}) => {
  const IconComponent = getSubCategoryIconComponent(slug, name);

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const containerSizes = {
    xs: 'w-6 h-6 rounded-md',
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-8 h-8 rounded-xl',
    lg: 'w-10 h-10 rounded-2xl'
  };

  if (variant === 'badge') {
    return (
      <div 
        className={`flex items-center justify-center flex-shrink-0 transition-transform ${containerSizes[size]} ${className}`}
        style={{
          backgroundColor: accentColor ? `${accentColor}25` : '#8FD8C325',
          color: '#0B1833'
        }}
      >
        <IconComponent className={sizeClasses[size]} />
      </div>
    );
  }

  return <IconComponent className={`${sizeClasses[size]} ${className}`} />;
};

