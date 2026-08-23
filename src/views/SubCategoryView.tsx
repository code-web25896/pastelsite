import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { ChevronRight, ArrowLeft, ArrowUpDown, ChevronDown } from 'lucide-react';
import { SubCategoryIcon } from '../components/SubCategoryIcon';

interface SubCategoryViewProps {
  brandSlug: string;
  subCategorySlug: string;
}

export const SubCategoryView: React.FC<SubCategoryViewProps> = ({ 
  brandSlug, 
  subCategorySlug 
}) => {
  const { 
    getBrandBySlug, 
    getSubCategoryBySlug, 
    getProductsBySubCategory, 
    getSubCategoriesByBrandId,
    navigateTo 
  } = useStore();

  const brand = getBrandBySlug(brandSlug);
  const subCategory = brand ? getSubCategoryBySlug(brand.id, subCategorySlug) : undefined;
  const otherSubCategories = brand ? getSubCategoriesByBrandId(brand.id) : [];

  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'rating'>('relevance');

  if (!brand || !subCategory) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-['Outfit'] font-bold text-2xl text-[#0B1833]">Catégorie introuvable</h2>
        <p className="text-sm text-gray-500">Cette sous-catégorie n'existe pas pour cette marque.</p>
        <button
          onClick={() => navigateTo({ type: 'shop' })}
          className="bg-[#0B1833] text-white px-6 py-2.5 rounded-full text-xs font-bold"
        >
          Retour à la boutique
        </button>
      </div>
    );
  }

  const rawProducts = getProductsBySubCategory(subCategory.id);
  
  const sortedProducts = [...rawProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return (a.promoPrice ?? a.price) - (b.promoPrice ?? b.price);
    if (sortBy === 'price-desc') return (b.promoPrice ?? b.price) - (a.promoPrice ?? a.price);
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 10. BREADCRUMBS */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <button onClick={() => navigateTo({ type: 'home' })} className="hover:text-[#0B1833] transition-colors">
          Accueil
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => navigateTo({ type: 'brand', brandSlug: brand.slug })} className="hover:text-[#0B1833] transition-colors">
          {brand.name}
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#0B1833] font-bold">{subCategory.name}</span>
      </nav>

      {/* 10. PAGE SOUS-CATÉGORIE HEADER */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2">
            <span 
              className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
              style={{ backgroundColor: brand.accentColor ? `${brand.accentColor}30` : '#8FD8C330', color: '#0B1833' }}
            >
              {brand.name}
            </span>
            <span className="text-xs text-gray-400">• {rawProducts.length} articles</span>
          </div>

          <div className="flex items-center gap-3">
            <SubCategoryIcon
              slug={subCategory.slug}
              name={subCategory.name}
              variant="badge"
              size="lg"
              accentColor={brand.accentColor}
              className="shadow-xs"
            />
            <h1 className="font-['Outfit'] font-black text-2xl sm:text-4xl text-[#0B1833] tracking-tight">
              {brand.name} — {subCategory.name}
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-[#0B1833]/70 leading-relaxed">
            {subCategory.description}
          </p>
        </div>

        {/* Other sibling subcategories */}
        <div className="flex flex-wrap gap-2 md:max-w-md justify-start md:justify-end">
          {otherSubCategories.map(other => (
            <button
              key={other.id}
              onClick={() => navigateTo({ type: 'subcategory', brandSlug: brand.slug, subCategorySlug: other.slug })}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                other.id === subCategory.id 
                  ? 'bg-[#0B1833] text-white shadow-md' 
                  : 'bg-[#F7F7F8] hover:bg-gray-200 text-[#0B1833] border border-gray-200/60'
              }`}
            >
              <SubCategoryIcon 
                slug={other.slug} 
                name={other.name} 
                size="xs" 
                className={other.id === subCategory.id ? 'text-[#8FD8C3]' : 'text-gray-500'} 
              />
              <span>{other.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Top filter / sort bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <span className="text-xs font-bold text-[#0B1833]">
          {sortedProducts.length} produit{sortedProducts.length > 1 ? 's' : ''} disponible{sortedProducts.length > 1 ? 's' : ''}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 hidden sm:inline">Trier par :</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-[#F7F7F8] border border-gray-200 rounded-xl px-4 py-2 pr-8 text-xs font-bold text-[#0B1833] focus:outline-none cursor-pointer"
            >
              <option value="relevance">Pertinence</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="rating">Mieux notés</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {sortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
          <p className="text-xs text-gray-500">Aucun produit trouvé dans cette sous-catégorie pour le moment.</p>
          <button
            onClick={() => navigateTo({ type: 'brand', brandSlug: brand.slug })}
            className="text-xs font-bold text-[#0B1833] hover:underline"
          >
            ← Retourner aux autres catégories {brand.name}
          </button>
        </div>
      )}

    </div>
  );
};
