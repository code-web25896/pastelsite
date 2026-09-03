import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { 
  ChevronRight, 
  ArrowRight, 
  Layers, 
  ArrowLeft,
  SlidersHorizontal,
  Bookmark,
  Folder
} from 'lucide-react';
import { motion } from 'motion/react';
import { SubCategoryIcon } from '../components/SubCategoryIcon';

const resolveImageUrl = (url?: string | null) => {
  if (!url) return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')) return url;
  const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${apiUrl}${cleanPath}`;
};

interface BrandViewProps {
  brandSlug: string;
}

export const BrandView: React.FC<BrandViewProps> = ({ brandSlug }) => {
  const { 
    getBrandBySlug, 
    getSubCategoriesByBrandId, 
    getProductsByBrand, 
    navigateTo 
  } = useStore();

  const brand = getBrandBySlug(brandSlug);
  const [selectedSubCatFilter, setSelectedSubCatFilter] = useState<string>('all');

  if (!brand) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-sans font-bold text-2xl text-[#0B1833]">Marque introuvable</h2>
        <p className="text-sm text-gray-500">La marque demandée n'existe pas ou a été déplacée.</p>
        <button
          onClick={() => navigateTo({ type: 'shop' })}
          className="bg-[#0B1833] text-white px-6 py-2.5 rounded-full text-xs font-bold"
        >
          Retour à la boutique
        </button>
      </div>
    );
  }

  const subCategories = getSubCategoriesByBrandId(brand.id);
  const allBrandProducts = getProductsByBrand(brand.id);

  const displayedProducts = selectedSubCatFilter === 'all'
    ? allBrandProducts
    : allBrandProducts.filter(p => {
        if (p.subCategoryId === selectedSubCatFilter) return true;
        const targetSub = subCategories.find(s => s.id === selectedSubCatFilter || s.slug === selectedSubCatFilter);
        return targetSub && (p.subCategoryId === targetSub.id || p.subCategoryId === targetSub.slug);
      });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <button onClick={() => navigateTo({ type: 'home' })} className="hover:text-[#0B1833] transition-colors">
          Accueil
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => navigateTo({ type: 'shop' })} className="hover:text-[#0B1833] transition-colors">
          Marques
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#0B1833] font-bold">{brand.name}</span>
      </nav>

      {/* 9. PAGE MARQUE HERO BANNER */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0B1833] text-white shadow-xl border border-white/10 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl space-y-3">
          <span 
            className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-block shadow-sm"
            style={{ backgroundColor: brand.accentColor || '#8FD8C3', color: '#0B1833' }}
          >
            UNIVERS OFFICIEL {brand.name}
          </span>
          <h1 className="font-sans font-black text-3xl sm:text-5xl text-white tracking-tight">
            {brand.name}
          </h1>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            {brand.description}
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs text-white/60">
            <span>{subCategories.length} sous-catégories</span>
            <span>•</span>
            <span>{allBrandProducts.length} produits disponibles</span>
          </div>
        </div>

        {/* Official Brand Visual Emblem */}
        <div className="relative z-10 w-32 h-32 sm:w-44 sm:h-44 rounded-2xl overflow-hidden bg-white p-2 flex items-center justify-center shadow-2xl flex-shrink-0 border-2 border-white/20">
          <img
            src={brand.logoUrl || brand.bannerUrl}
            alt={brand.name}
            className="w-full h-full object-contain rounded-xl"
          />
        </div>
      </div>

      {/* 9. NOS CATÉGORIES [BRAND] */}
      {subCategories.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#B58BC5]">
                Rayons dédiés
              </div>
              <h2 className="font-sans font-black text-2xl text-[#0B1833]">
                NOS CATÉGORIES {brand.name}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {subCategories.map(sub => {
              const count = allBrandProducts.filter(p => p.subCategoryId === sub.id || p.subCategoryId === sub.slug).length;
              return (
                <motion.div
                  key={sub.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  onClick={() => navigateTo({ type: 'subcategory', brandSlug: brand.slug, subCategorySlug: sub.slug })}
                  className="group bg-white rounded-2xl p-4 border border-gray-100/90 shadow-sm hover:shadow-xl hover:border-[#0B1833]/20 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F7F7F8] mb-3">
                    <img
                      src={resolveImageUrl(sub.imageUrl)}
                      alt={sub.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2">
                      <SubCategoryIcon 
                        slug={sub.slug}
                        name={sub.name}
                        variant="badge"
                        size="xs"
                        accentColor={brand.accentColor}
                        className="shadow-xs backdrop-blur-md bg-white/90"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-sans font-bold text-sm text-[#0B1833] group-hover:text-[#B58BC5] transition-colors truncate">
                      {sub.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                      {sub.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-[#0B1833]">
                    <span>{count} produit{count > 1 ? 's' : ''}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#8FD8C3]" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* 9. PRODUITS [BRAND] */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="font-sans font-black text-2xl text-[#0B1833]">
              PRODUITS {brand.name}
            </h2>
            <p className="text-xs text-gray-500">
              Affichage de {displayedProducts.length} article{displayedProducts.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Subcategory quick filter pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedSubCatFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${selectedSubCatFilter === 'all' ? 'bg-[#0B1833] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              Tous ({allBrandProducts.length})
            </button>
            {subCategories.map(sub => {
              const count = allBrandProducts.filter(p => p.subCategoryId === sub.id || p.subCategoryId === sub.slug).length;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubCatFilter(sub.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${selectedSubCatFilter === sub.id ? 'bg-[#0B1833] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  {sub.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedProducts.map(product => (
              <ProductCard key={product.id} product={product} showBrand={false} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-xs text-gray-500">Aucun produit dans cette sous-catégorie pour le moment.</p>
          </div>
        )}
      </section>

    </div>
  );
};

