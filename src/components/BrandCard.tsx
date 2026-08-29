import React from 'react';
import { Brand } from '../types';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Layers, ChevronRight, Folder } from 'lucide-react';
import { motion } from 'motion/react';
import { SubCategoryIcon } from './SubCategoryIcon';

interface BrandCardProps {
  brand: Brand;
}

export const BrandCard: React.FC<BrandCardProps> = ({ brand }) => {
  const { navigateTo, getSubCategoriesByBrandId, getProductsByBrand } = useStore();
  const subCategories = getSubCategoriesByBrandId(brand.id);
  const products = getProductsByBrand(brand.id);

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={() => navigateTo({ type: 'brand', brandSlug: brand.slug })}
      className="group bg-white rounded-3xl border border-gray-100/90 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
      id={`brand-card-${brand.slug}`}
    >
      {/* Banner / Image Header */}
      <div className="relative h-44 sm:h-52 overflow-hidden bg-white flex items-center justify-center p-4 border-b border-gray-100">
        <img
          src={brand.logoUrl || brand.bannerUrl}
          alt={brand.name}
          className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Brand Accent Tag */}
        <div 
          className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm"
          style={{ backgroundColor: brand.accentColor || '#8FD8C3', color: '#0B1833' }}
        >
          {brand.name}
        </div>

        {/* Product Count Pill */}
        <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-[#0B1833] shadow-sm border border-gray-100 flex items-center gap-1">
          <Layers className="w-3 h-3 text-[#B58BC5]" />
          <span>{products.length} articles</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <p className="text-xs text-[#0B1833]/70 leading-relaxed line-clamp-2 mb-4">
            {brand.description}
          </p>

          {/* Structured Subcategories Directory List */}
          {subCategories.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-[#0B1833]/60" />
                  Rayons & Spécialités
                </span>
                <span className="text-[10px] font-semibold text-[#0B1833]/60">
                  {subCategories.length} cat.
                </span>
              </div>

              <div className="space-y-1.5 bg-[#F7F7F8] rounded-2xl p-2 border border-gray-100/90">
                {subCategories.slice(0, 3).map(sub => {
                  const subProductsCount = products.filter(p => p.subCategoryId === sub.id || p.subCategoryId === sub.slug).length;
                  return (
                    <div
                      key={sub.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateTo({ type: 'subcategory', brandSlug: brand.slug, subCategorySlug: sub.slug });
                      }}
                      className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-[#8FD8C3]/20 border border-gray-100 hover:border-[#8FD8C3]/50 transition-all group/sub cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <SubCategoryIcon 
                          slug={sub.slug}
                          name={sub.name}
                          variant="badge"
                          size="xs"
                          accentColor={brand.accentColor}
                        />
                        <span className="text-xs font-semibold text-[#0B1833] group-hover/sub:text-[#0B1833] truncate">
                          {sub.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 flex-shrink-0 text-gray-400 group-hover/sub:text-[#0B1833]">
                        <span className="text-[10px] font-medium">
                          {subProductsCount} art.
                        </span>
                        <ChevronRight className="w-3 h-3 group-hover/sub:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}

                {subCategories.length > 3 && (
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateTo({ type: 'brand', brandSlug: brand.slug });
                    }}
                    className="text-center py-1 text-[11px] font-bold text-[#0B1833]/80 hover:text-[#0B1833] transition-colors cursor-pointer"
                  >
                    + {subCategories.length - 3} autres rayons &rarr;
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigateTo({ type: 'brand', brandSlug: brand.slug });
          }}
          className="w-full py-3 px-4 rounded-xl bg-[#F7F7F8] group-hover:bg-[#0B1833] text-[#0B1833] group-hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 shadow-sm"
        >
          <span>EXPLORER {brand.name}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};


