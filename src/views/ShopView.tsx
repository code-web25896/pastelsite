import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Check, 
  ChevronDown, 
  ArrowUpDown, 
  Tag, 
  Layers,
  Star
} from 'lucide-react';
import { SubCategoryIcon } from '../components/SubCategoryIcon';

interface ShopViewProps {
  initialBrandId?: string;
  initialSubCategoryId?: string;
  initialCategory?: string;
  initialSearchQuery?: string;
  initialPromoOnly?: boolean;
  initialIsNewOnly?: boolean;
}

export const ShopView: React.FC<ShopViewProps> = ({
  initialBrandId,
  initialSubCategoryId,
  initialCategory,
  initialSearchQuery = '',
  initialPromoOnly = false,
  initialIsNewOnly = false
}) => {
  const { products, brands, subCategories, formatPrice, navigateTo } = useStore();

  // Filter States
  const [search, setSearch] = useState(initialSearchQuery);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrandId || 'all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(initialSubCategoryId || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [promoOnly, setPromoOnly] = useState<boolean>(initialPromoOnly);
  const [isNewOnly, setIsNewOnly] = useState<boolean>(initialIsNewOnly);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100);

  // Sorting
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'price-asc' | 'price-desc' | 'bestseller' | 'rating'>('relevance');

  // Mobile Filter Drawer
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Synchronize when initial props change
  useEffect(() => {
    if (initialBrandId) setSelectedBrand(initialBrandId);
    if (initialSubCategoryId) setSelectedSubCategory(initialSubCategoryId);
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialSearchQuery) setSearch(initialSearchQuery);
    if (initialPromoOnly) setPromoOnly(true);
    if (initialIsNewOnly) setIsNewOnly(true);
  }, [initialBrandId, initialSubCategoryId, initialCategory, initialSearchQuery, initialPromoOnly, initialIsNewOnly]);

  // Main Categories list
  const categoriesList = ['Papeterie', 'Scolaire', 'Arts & Peinture', 'Bureau & Organisation'];

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesDesc = p.shortDescription.toLowerCase().includes(query);
        const matchesSku = p.sku.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesSku) return false;
      }

      // Brand
      if (selectedBrand !== 'all') {
        const brandObj = brands.find(b => b.id === selectedBrand || b.slug === selectedBrand);
        const matchIds = brandObj ? [brandObj.id, brandObj.slug] : [selectedBrand];
        if (!matchIds.includes(p.brandId)) return false;
      }

      // SubCategory
      if (selectedSubCategory !== 'all') {
        const subObj = subCategories.find(s => s.id === selectedSubCategory || s.slug === selectedSubCategory);
        const matchIds = subObj ? [subObj.id, subObj.slug] : [selectedSubCategory];
        if (!matchIds.includes(p.subCategoryId)) return false;
      }

      // Category
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Promo Only
      if (promoOnly && !p.promoPrice && !p.isPromo) {
        return false;
      }

      // New Only
      if (isNewOnly && !p.isNew) {
        return false;
      }

      // In stock
      if (inStockOnly && p.stock <= 0) {
        return false;
      }

      // Rating
      if (minRating > 0 && p.rating < minRating) {
        return false;
      }

      // Max price
      const effectivePrice = p.promoPrice ?? p.price;
      if (effectivePrice > maxPrice) {
        return false;
      }

      return true;
    });
  }, [products, search, selectedBrand, selectedSubCategory, selectedCategory, promoOnly, isNewOnly, inStockOnly, minRating, maxPrice]);

  // Sort Logic
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'newest':
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'price-asc':
        return list.sort((a, b) => (a.promoPrice ?? a.price) - (b.promoPrice ?? b.price));
      case 'price-desc':
        return list.sort((a, b) => (b.promoPrice ?? b.price) - (a.promoPrice ?? a.price));
      case 'bestseller':
        return list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating);
      case 'relevance':
      default:
        return list;
    }
  }, [filteredProducts, sortBy]);

  // Reset Filters
  const resetFilters = () => {
    setSearch('');
    setSelectedBrand('all');
    setSelectedSubCategory('all');
    setSelectedCategory('all');
    setPromoOnly(false);
    setIsNewOnly(false);
    setInStockOnly(false);
    setMinRating(0);
    setMaxPrice(100);
    setSortBy('relevance');
  };

  const activeFiltersCount = 
    (selectedBrand !== 'all' ? 1 : 0) +
    (selectedSubCategory !== 'all' ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (promoOnly ? 1 : 0) +
    (isNewOnly ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (maxPrice < 100 ? 1 : 0) +
    (search.trim() ? 1 : 0);

  // Subcategories available for selected brand
  const availableSubCategories = selectedBrand === 'all'
    ? subCategories
    : subCategories.filter(s => s.brandId === selectedBrand);

  const FilterContent = (
    <div className="space-y-6 text-xs text-[#0B1833]">
      {/* Search Filter */}
      <div>
        <label className="font-bold text-xs uppercase tracking-wider block mb-2 text-[#0B1833]/80">
          Recherche
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Mot-clé, référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#0B1833]"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Brands Filter */}
      <div>
        <label className="font-bold text-xs uppercase tracking-wider block mb-2 text-[#0B1833]/80">
          Marques
        </label>
        <div className="space-y-1">
          <button
            onClick={() => {
              setSelectedBrand('all');
              setSelectedSubCategory('all');
            }}
            className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${selectedBrand === 'all' ? 'bg-[#0B1833] text-white font-bold' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <span>Toutes les marques</span>
            <span className="text-[11px] opacity-70">({products.length})</span>
          </button>
          {brands.map(b => {
            const count = products.filter(p => p.brandId === b.id).length;
            const isSelected = selectedBrand === b.id;
            return (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBrand(b.id);
                  setSelectedSubCategory('all');
                }}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${isSelected ? 'bg-[#0B1833] text-white font-bold' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <span>{b.name}</span>
                <span className="text-[11px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategories Filter */}
      {availableSubCategories.length > 0 && (
        <div>
          <label className="font-bold text-xs uppercase tracking-wider block mb-2 text-[#0B1833]/80">
            Sous-catégories {selectedBrand !== 'all' && `(${brands.find(b => b.id === selectedBrand)?.name})`}
          </label>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => setSelectedSubCategory('all')}
              className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between ${selectedSubCategory === 'all' ? 'text-[#0B1833] font-bold bg-[#8FD8C3]/20' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <span>Toutes les sous-catégories</span>
            </button>
            {availableSubCategories.map(sub => {
              const count = products.filter(p => p.subCategoryId === sub.id).length;
              const isSelected = selectedSubCategory === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubCategory(sub.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-all ${isSelected ? 'text-[#0B1833] font-bold bg-[#8FD8C3]/30 shadow-xs' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <SubCategoryIcon 
                      slug={sub.slug} 
                      name={sub.name} 
                      size="xs" 
                      className={isSelected ? 'text-[#0B1833]' : 'text-gray-400'} 
                    />
                    <span className="truncate text-xs">{sub.name}</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories Filter */}
      <div>
        <label className="font-bold text-xs uppercase tracking-wider block mb-2 text-[#0B1833]/80">
          Rayons / Univers
        </label>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full text-left px-3 py-1.5 rounded-lg ${selectedCategory === 'all' ? 'font-bold text-[#0B1833] bg-[#8FD8C3]/20' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Tous les rayons
          </button>
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left px-3 py-1.5 rounded-lg ${selectedCategory === cat ? 'font-bold text-[#0B1833] bg-[#8FD8C3]/20' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="font-bold text-xs uppercase tracking-wider text-[#0B1833]/80">
            Prix Max
          </label>
          <span className="font-bold text-xs text-[#0B1833] font-sans">
            {formatPrice(maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min="5"
          max="100"
          step="5"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#0B1833] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>0 TND</span>
          <span>100 TND</span>
        </div>
      </div>

      {/* Toggles (Promotions, Nouveautés, En stock) */}
      <div className="space-y-2.5 pt-2 border-t border-gray-100">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={promoOnly}
            onChange={(e) => setPromoOnly(e.target.checked)}
            className="w-4 h-4 rounded text-[#0B1833] accent-[#0B1833] cursor-pointer"
          />
          <span className="font-semibold text-[#0B1833]">En promotion uniquement</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isNewOnly}
            onChange={(e) => setIsNewOnly(e.target.checked)}
            className="w-4 h-4 rounded text-[#0B1833] accent-[#0B1833] cursor-pointer"
          />
          <span className="font-semibold text-[#0B1833]">Nouveautés uniquement</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded text-[#0B1833] accent-[#0B1833] cursor-pointer"
          />
          <span className="font-semibold text-[#0B1833]">En stock disponible</span>
        </label>
      </div>

      {/* Reset Button */}
      {activeFiltersCount > 0 && (
        <button
          onClick={resetFilters}
          className="w-full py-2.5 px-3 rounded-xl border border-gray-200 hover:border-red-400 hover:text-red-600 text-gray-600 font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          <span>Réinitialiser les filtres ({activeFiltersCount})</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* 11. PAGE BOUTIQUE HEADER */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="text-xs font-bold uppercase tracking-widest text-[#8FD8C3]">
            Catalogue Espace Pastel
          </div>
          <h1 className="font-sans font-black text-2xl sm:text-4xl text-[#0B1833] tracking-tight">
            NOTRE BOUTIQUE
          </h1>
          <p className="text-xs sm:text-sm text-[#0B1833]/70 max-w-xl">
            Découvrez notre sélection de produits pour lire, apprendre, travailler et créer.
          </p>
        </div>

        {/* Brand shortcuts */}
        <div className="flex flex-wrap gap-2">
          {brands.map(b => (
            <button
              key={b.id}
              onClick={() => {
                setSelectedBrand(b.id);
                setSelectedSubCategory('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedBrand === b.id ? 'bg-[#0B1833] text-white shadow-sm' : 'bg-[#F7F7F8] hover:bg-[#EBECEF] text-[#0B1833]'}`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Desktop Sidebar (3 cols) */}
        <aside className="hidden lg:block lg:col-span-3 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
            <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-[#0B1833] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#8FD8C3]" />
              <span>Filtres</span>
            </h2>
            {activeFiltersCount > 0 && (
              <span className="text-[10px] font-bold bg-[#8FD8C3]/30 text-[#0B1833] px-2 py-0.5 rounded-full">
                {activeFiltersCount} actif{activeFiltersCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {FilterContent}
        </aside>

        {/* Product Grid Area (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Top Bar: Controls & Sorting */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-[#0B1833] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#8FD8C3]" />
                <span>FILTRES {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
              </button>

              <span className="text-xs font-semibold text-[#0B1833]">
                <strong>{sortedProducts.length}</strong> produit{sortedProducts.length > 1 ? 's' : ''} trouvé{sortedProducts.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-gray-500 whitespace-nowrap hidden sm:inline">Trier par :</span>
              <div className="relative w-full sm:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full sm:w-auto appearance-none bg-[#F7F7F8] border border-gray-200 rounded-xl px-4 py-2 pr-8 text-xs font-bold text-[#0B1833] focus:outline-none focus:border-[#0B1833] cursor-pointer"
                >
                  <option value="relevance">Pertinence</option>
                  <option value="newest">Nouveautés</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="bestseller">Meilleures ventes</option>
                  <option value="rating">Mieux notés</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Active Filters Badges Bar */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Filtres actifs :</span>
              {selectedBrand !== 'all' && (
                <span className="bg-white border border-gray-200 text-xs text-[#0B1833] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  Marque : {brands.find(b => b.id === selectedBrand)?.name}
                  <button onClick={() => setSelectedBrand('all')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedSubCategory !== 'all' && (
                <span className="bg-white border border-gray-200 text-xs text-[#0B1833] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  Sous-catégorie : {subCategories.find(s => s.id === selectedSubCategory)?.name}
                  <button onClick={() => setSelectedSubCategory('all')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                </span>
              )}
              {promoOnly && (
                <span className="bg-[#F4A9C8]/30 border border-[#F4A9C8] text-xs text-[#0B1833] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  Promotions
                  <button onClick={() => setPromoOnly(false)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                </span>
              )}
              {search && (
                <span className="bg-white border border-gray-200 text-xs text-[#0B1833] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  « {search} »
                  <button onClick={() => setSearch('')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-xs text-red-500 hover:underline font-semibold ml-2"
              >
                Effacer tout
              </button>
            </div>
          )}

          {/* 12. CARTES PRODUITS (RESPONSIVE GRID) */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F7F7F8] flex items-center justify-center mx-auto text-gray-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-sans font-bold text-lg text-[#0B1833]">
                Aucun produit ne correspond à vos critères
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Essayez d'ajuster vos filtres de prix, de catégorie ou de réinitialiser la recherche.
              </p>
              <button
                onClick={resetFilters}
                className="bg-[#0B1833] hover:bg-[#8FD8C3] hover:text-[#0B1833] text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all"
              >
                Réinitialiser tous les filtres
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Filter Drawer Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div 
            onClick={() => setIsMobileFilterOpen(false)}
            className="absolute inset-0 bg-[#0B1833]/50 backdrop-blur-sm"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white shadow-2xl flex flex-col p-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <h3 className="font-sans font-bold text-base text-[#0B1833]">Filtres</h3>
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-full text-gray-500 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {FilterContent}
              <div className="pt-6 mt-6 border-t border-gray-100">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 bg-[#0B1833] text-white rounded-xl font-bold text-xs uppercase tracking-wider"
                >
                  Voir les {sortedProducts.length} résultats
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

