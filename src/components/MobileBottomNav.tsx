import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Home, 
  ShoppingBag, 
  Layers, 
  Heart, 
  User, 
  ShieldCheck, 
  X, 
  ChevronRight, 
  Search,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SubCategoryIcon } from './SubCategoryIcon';

export const MobileBottomNav: React.FC = () => {
  const { 
    currentView, 
    navigateTo, 
    cartCount, 
    setIsCartDrawerOpen, 
    wishlist, 
    isAdmin, 
    brands, 
    subCategories, 
    products 
  } = useStore();

  const [isRayonsDrawerOpen, setIsRayonsDrawerOpen] = useState(false);
  const [selectedBrandTab, setSelectedBrandTab] = useState<string>(brands[0]?.id || 'brand-bomi');

  const activeBrand = brands.find(b => b.id === selectedBrandTab) || brands[0];
  const activeBrandSubs = activeBrand ? subCategories.filter(s => s.brandId === activeBrand.id) : [];

  // Determine active item
  const isHomeActive = currentView.type === 'home';
  const isShopActive = currentView.type === 'shop' || currentView.type === 'subcategory' || currentView.type === 'brand';
  const isWishlistActive = currentView.type === 'account' && (currentView as any).tab === 'wishlist';
  const isAccountActive = currentView.type === 'account' || currentView.type === 'admin';

  return (
    <>
      {/* 1. FIXED FULL-WIDTH BOTTOM NAV BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(11,24,51,0.08)]">
        <nav
          aria-label="Navigation mobile principale"
          className="flex items-center w-full px-1 py-1"
        >
          {/* Accueil */}
          <button
            onClick={() => { setIsRayonsDrawerOpen(false); navigateTo({ type: 'home' }); }}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 gap-0.5 transition-all ${
              isHomeActive && !isRayonsDrawerOpen ? 'text-[#0B1833]' : 'text-gray-400'
            }`}
          >
            <Home className={`w-5 h-5 ${isHomeActive && !isRayonsDrawerOpen ? 'text-[#0B1833]' : ''}`} />
            <span className={`text-[10px] font-medium ${isHomeActive && !isRayonsDrawerOpen ? 'font-bold' : ''}`}>Accueil</span>
            {isHomeActive && !isRayonsDrawerOpen && (
              <motion.span layoutId="mobileNavActiveDot" className="w-1 h-1 rounded-full bg-[#8FD8C3]" />
            )}
          </button>

          {/* Boutique */}
          <button
            onClick={() => { setIsRayonsDrawerOpen(false); navigateTo({ type: 'shop' }); }}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 gap-0.5 transition-all ${
              isShopActive && !isRayonsDrawerOpen ? 'text-[#0B1833]' : 'text-gray-400'
            }`}
          >
            <ShoppingBag className={`w-5 h-5 ${isShopActive && !isRayonsDrawerOpen ? 'text-[#0B1833]' : ''}`} />
            <span className={`text-[10px] font-medium ${isShopActive && !isRayonsDrawerOpen ? 'font-bold' : ''}`}>Boutique</span>
            {isShopActive && !isRayonsDrawerOpen && (
              <motion.span layoutId="mobileNavActiveDot" className="w-1 h-1 rounded-full bg-[#8FD8C3]" />
            )}
          </button>

          {/* Rayons — bouton central mis en avant */}
          <button
            onClick={() => setIsRayonsDrawerOpen(!isRayonsDrawerOpen)}
            className="flex-1 flex flex-col items-center justify-center py-1 gap-0.5"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isRayonsDrawerOpen
                ? 'bg-[#0B1833] ring-4 ring-[#8FD8C3]/30'
                : 'bg-[#0B1833]'
            }`}>
              <Layers className="w-5 h-5 text-[#8FD8C3]" />
            </div>
            <span className="text-[9px] font-bold text-[#0B1833]">Rayons</span>
          </button>

          {/* Favoris */}
          <button
            onClick={() => { setIsRayonsDrawerOpen(false); navigateTo({ type: 'account', tab: 'wishlist' }); }}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 gap-0.5 transition-all relative ${
              isWishlistActive && !isRayonsDrawerOpen ? 'text-[#0B1833]' : 'text-gray-400'
            }`}
          >
            <div className="relative">
              <Heart className={`w-5 h-5 ${isWishlistActive && !isRayonsDrawerOpen ? 'text-[#F4A9C8] fill-[#F4A9C8]' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#F4A9C8] text-[#0B1833] font-black text-[9px] rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-medium ${isWishlistActive && !isRayonsDrawerOpen ? 'font-bold' : ''}`}>Favoris</span>
            {isWishlistActive && !isRayonsDrawerOpen && (
              <motion.span layoutId="mobileNavActiveDot" className="w-1 h-1 rounded-full bg-[#8FD8C3]" />
            )}
          </button>

          {/* Panier */}
          <button
            onClick={() => { setIsRayonsDrawerOpen(false); setIsCartDrawerOpen(true); }}
            className="flex-1 flex flex-col items-center justify-center py-1.5 gap-0.5 text-gray-400 transition-all"
          >
            <div className="relative">
              <div className="w-7 h-7 rounded-lg bg-[#0B1833] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[#8FD8C3]" />
              </div>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 text-white font-black text-[9px] rounded-full flex items-center justify-center px-0.5 border border-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold text-[#0B1833]">Panier</span>
          </button>

          {/* Compte / Admin */}
          <button
            onClick={() => {
              setIsRayonsDrawerOpen(false);
              if (isAdmin) {
                navigateTo({ type: 'admin' });
              } else {
                navigateTo(currentUser ? { type: 'account' } : { type: 'auth', mode: 'login' });
              }
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 gap-0.5 transition-all ${
              isAccountActive && !isRayonsDrawerOpen ? 'text-[#0B1833]' : 'text-gray-400'
            }`}
          >
            {isAdmin ? (
              <ShieldCheck className={`w-5 h-5 text-[#8FD8C3]`} />
            ) : (
              <User className={`w-5 h-5 ${isAccountActive && !isRayonsDrawerOpen ? 'text-[#0B1833]' : ''}`} />
            )}
            <span className={`text-[10px] font-medium ${isAccountActive && !isRayonsDrawerOpen ? 'font-bold' : ''}`}>
              {isAdmin ? 'Admin' : 'Compte'}
            </span>
            {isAccountActive && !isRayonsDrawerOpen && (
              <motion.span layoutId="mobileNavActiveDot" className="w-1 h-1 rounded-full bg-[#8FD8C3]" />
            )}
          </button>
        </nav>
      </div>


      {/* 2. MODERN RAYONS & SOUS-CATÉGORIES DRAWER (Mobile Bottom Sheet) */}
      <AnimatePresence>
        {isRayonsDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRayonsDrawerOpen(false)}
              className="fixed inset-0 bg-[#0B1833]/60 backdrop-blur-xs z-50 md:hidden"
            />

            {/* Bottom Sheet Modal */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col md:hidden overflow-hidden border-t border-gray-200"
            >
              {/* Sheet Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-[#F7F7F8]/80">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#0B1833] text-white flex items-center justify-center shadow-xs">
                    <Layers className="w-4 h-4 text-[#8FD8C3]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-base text-[#0B1833]">
                      Nos Marques & Rayons
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Explorez par univers de produits
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsRayonsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#0B1833] shadow-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Brands Selector Tabs (Horizontal Scroll) */}
              <div className="p-2.5 bg-white border-b border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
                {brands.map(brand => {
                  const isSelected = selectedBrandTab === brand.id;
                  return (
                    <button
                      key={brand.id}
                      onClick={() => setSelectedBrandTab(brand.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-2xl whitespace-nowrap text-xs font-bold transition-all flex-shrink-0 ${
                        isSelected 
                          ? 'bg-[#0B1833] text-white shadow-md scale-102' 
                          : 'bg-[#F7F7F8] text-[#0B1833] hover:bg-gray-200 border border-gray-200/60'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-md bg-white p-0.5 flex items-center justify-center overflow-hidden">
                        <img 
                          src={brand.logoUrl || brand.bannerUrl} 
                          alt={brand.name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span>{brand.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Subcategories List for Selected Brand */}
              <div className="p-4 overflow-y-auto flex-1 space-y-3 pb-8">
                {activeBrand && (
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Rayons {activeBrand.name} ({activeBrandSubs.length})
                    </span>
                    <button
                      onClick={() => {
                        setIsRayonsDrawerOpen(false);
                        navigateTo({ type: 'brand', brandSlug: activeBrand.slug });
                      }}
                      className="text-xs font-bold text-[#0B1833] hover:underline flex items-center gap-1"
                    >
                      <span>Voir toute la marque</span>
                      <ArrowRight className="w-3 h-3 text-[#8FD8C3]" />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2">
                  {activeBrandSubs.map(sub => {
                    const count = products.filter(p => p.subCategoryId === sub.id).length;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => {
                          setIsRayonsDrawerOpen(false);
                          if (activeBrand) {
                            navigateTo({ 
                              type: 'subcategory', 
                              brandSlug: activeBrand.slug, 
                              subCategorySlug: sub.slug 
                            });
                          }
                        }}
                        className="p-3 rounded-2xl bg-[#F7F7F8] hover:bg-[#8FD8C3]/20 border border-gray-200/70 hover:border-[#8FD8C3]/60 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <SubCategoryIcon 
                            slug={sub.slug} 
                            name={sub.name} 
                            variant="badge" 
                            size="md" 
                            accentColor={activeBrand?.accentColor}
                          />
                          <div>
                            <div className="text-xs font-bold text-[#0B1833] group-hover:text-[#0B1833]">
                              {sub.name}
                            </div>
                            <div className="text-[11px] text-gray-500 line-clamp-1">
                              {sub.description}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-[#0B1833]">
                          <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-gray-200">
                            {count} art.
                          </span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Direct link to all shop */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsRayonsDrawerOpen(false);
                      navigateTo({ type: 'shop' });
                    }}
                    className="w-full py-3 rounded-2xl bg-[#0B1833] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>Voir tout le catalogue ({products.length} articles)</span>
                    <ArrowRight className="w-4 h-4 text-[#8FD8C3]" />
                  </button>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

