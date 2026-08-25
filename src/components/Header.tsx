import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Logo } from './Logo';
import { 
  Search, 
  ShoppingBag, 
  User, 
  Heart, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight,
  Phone, 
  MapPin, 
  ShieldCheck, 
  SlidersHorizontal,
  ArrowRight,
  Home,
  Layers,
  Info,
  Mail,
  Sparkles,
  LogOut
} from 'lucide-react';
import { SubCategoryIcon } from './SubCategoryIcon';

export const Header: React.FC = () => {
  const { 
    currentView, 
    navigateTo, 
    brands, 
    subCategories, 
    products, 
    cartCount, 
    setIsCartDrawerOpen, 
    currentUser, 
    isAdmin,
    logout,
    wishlist,
    formatPrice
  } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBrandsDropdownOpen, setIsBrandsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filtered live search results
  const searchResults = headerSearchQuery.trim() === '' ? [] : products.filter(p => 
    p.name.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
    p.shortDescription.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(headerSearchQuery.toLowerCase())
  ).slice(0, 5);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchQuery.trim()) {
      navigateTo({ type: 'shop', searchQuery: headerSearchQuery });
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-200">
      {/* Top Utility Bar (Tunis Store Info & Phone) */}
      <div className="bg-[#0B1833] text-white text-xs py-1.5 px-4 border-b border-white/10 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a 
              href="tel:55542000" 
              className="flex items-center gap-1.5 text-white/90 hover:text-[#F4A9C8] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#8FD8C3]" />
              <span>55 542 000</span>
            </a>
            <span className="text-white/30">•</span>
            <div className="flex items-center gap-1.5 text-white/80">
              <MapPin className="w-3.5 h-3.5 text-[#F5E7A6]" />
              <span>23 Rue de la Liberté, Menzah 5, Tunis</span>
            </div>
            <span className="text-white/30">•</span>
            <span className="text-[#8FD8C3] font-medium">Livraison rapide sur toute la Tunisie</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-white/80 hidden sm:inline">
              Lun - Sam : <span className="text-[#8FD8C3] font-semibold">08h30 - 19h30</span>
            </span>
            <span className="text-white/30 hidden sm:inline">•</span>
            <button
              onClick={() => navigateTo({ type: 'contact' })}
              className="text-white/90 hover:text-[#8FD8C3] transition-colors font-medium"
            >
              Contact
            </button>
            {isAdmin && (
              <button
                onClick={() => navigateTo({ type: 'admin' })}
                className="flex items-center gap-1 text-[11px] bg-[#8FD8C3]/20 text-[#8FD8C3] border border-[#8FD8C3]/40 px-2.5 py-0.5 rounded-full hover:bg-[#8FD8C3] hover:text-[#0B1833] transition-all font-semibold"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Administration</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className={`bg-white transition-all duration-300 ${isScrolled ? 'shadow-md border-b border-gray-100 py-3' : 'border-b border-gray-100 py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* LEFT: Logo */}
          <div onClick={() => navigateTo({ type: 'home' })}>
            <Logo size={isScrolled ? 'sm' : 'md'} />
          </div>

          {/* CENTER: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#0B1833]">
            <button
              onClick={() => navigateTo({ type: 'home' })}
              className={`hover:text-[#0B1833] transition-colors relative py-1 ${currentView.type === 'home' ? 'text-[#0B1833] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#8FD8C3]' : 'text-[#0B1833]/80'}`}
            >
              Accueil
            </button>

            <button
              onClick={() => navigateTo({ type: 'shop' })}
              className={`hover:text-[#0B1833] transition-colors relative py-1 ${currentView.type === 'shop' && !(currentView as any).filterBrand ? 'text-[#0B1833] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#8FD8C3]' : 'text-[#0B1833]/80'}`}
            >
              Boutique
            </button>

            {/* Brands Mega-Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsBrandsDropdownOpen(true)}
              onMouseLeave={() => setIsBrandsDropdownOpen(false)}
              ref={dropdownRef}
            >
              <button
                onClick={() => navigateTo({ type: 'shop' })}
                className="flex items-center gap-1 text-[#0B1833]/80 hover:text-[#0B1833] transition-colors py-1 group"
              >
                <span>Nos marques</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isBrandsDropdownOpen ? 'rotate-180 text-[#8FD8C3]' : 'text-[#0B1833]/50'}`} />
              </button>

              {/* Brands Dropdown Content */}
              {isBrandsDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[640px] bg-white rounded-2xl shadow-xl border border-gray-100 p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0B1833]/50 mb-4 flex items-center justify-between">
                    <span>Explorez nos marques partenaires</span>
                    <button 
                      onClick={() => { setIsBrandsDropdownOpen(false); navigateTo({ type: 'shop' }); }}
                      className="text-[#0B1833] hover:text-[#B58BC5] font-semibold flex items-center gap-1 text-xs"
                    >
                      Voir tout le catalogue <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {brands.map(brand => {
                      const brandSubs = subCategories.filter(s => s.brandId === brand.id && s.status === 'active');
                      return (
                        <div 
                          key={brand.id}
                          className="p-3.5 rounded-xl hover:bg-[#F7F7F8] transition-all border border-gray-100/80 group/card cursor-pointer"
                          onClick={() => {
                            setIsBrandsDropdownOpen(false);
                            navigateTo({ type: 'brand', brandSlug: brand.slug });
                          }}
                        >
                          <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 p-0.5 flex items-center justify-center overflow-hidden flex-shrink-0">
                              <img
                                src={brand.logoUrl || brand.bannerUrl}
                                alt={brand.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex-1 flex items-center justify-between">
                              <span className="font-sans font-bold text-sm sm:text-base text-[#0B1833] group-hover/card:text-[#B58BC5] transition-colors">
                                {brand.name}
                              </span>
                              <span 
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: brand.accentColor ? `${brand.accentColor}30` : '#8FD8C330', color: '#0B1833' }}
                              >
                                {brandSubs.length} rayons
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-[#0B1833]/70 line-clamp-1 mb-2.5">
                            {brand.description}
                          </p>

                          <div className="space-y-1 bg-[#F7F7F8] rounded-lg p-1.5 border border-gray-100">
                            {brandSubs.slice(0, 3).map(sub => (
                              <div
                                key={sub.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsBrandsDropdownOpen(false);
                                  navigateTo({ type: 'subcategory', brandSlug: brand.slug, subCategorySlug: sub.slug });
                                }}
                                className="flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-medium text-[#0B1833]/80 hover:bg-white hover:text-[#0B1833] hover:shadow-xs transition-all group/item cursor-pointer"
                              >
                                <span className="flex items-center gap-2 truncate">
                                  <SubCategoryIcon 
                                    slug={sub.slug}
                                    name={sub.name}
                                    size="xs"
                                    className="text-[#0B1833]/70 group-hover/item:text-[#0B1833]"
                                  />
                                  <span className="truncate">{sub.name}</span>
                                </span>
                                <ChevronRight className="w-3 h-3 text-gray-400 group-hover/item:translate-x-0.5 transition-transform" />
                              </div>
                            ))}
                            {brandSubs.length > 3 && (
                              <div className="text-[10px] font-bold text-center text-[#0B1833]/60 hover:text-[#0B1833] pt-0.5">
                                + {brandSubs.length - 3} autres &rarr;
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => navigateTo({ type: 'about' })}
              className={`hover:text-[#0B1833] transition-colors relative py-1 ${currentView.type === 'about' ? 'text-[#0B1833] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#8FD8C3]' : 'text-[#0B1833]/80'}`}
            >
              À propos
            </button>

            <button
              onClick={() => navigateTo({ type: 'contact' })}
              className={`hover:text-[#0B1833] transition-colors relative py-1 ${currentView.type === 'contact' ? 'text-[#0B1833] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#8FD8C3]' : 'text-[#0B1833]/80'}`}
            >
              Contact
            </button>
          </nav>

          {/* RIGHT: Search, Wishlist, Account, Cart */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Button & Live Dropdown Bar */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
                className="p-2.5 rounded-full hover:bg-[#F7F7F8] text-[#0B1833]/80 hover:text-[#0B1833] transition-colors relative"
                aria-label="Recherche"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Search popup dropdown */}
              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <form onSubmit={handleSearchSubmit} className="relative mb-3">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Rechercher un livre, un stylo, un cahier..."
                      value={headerSearchQuery}
                      onChange={(e) => setHeaderSearchQuery(e.target.value)}
                      className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl pl-10 pr-8 py-2.5 text-sm focus:outline-none focus:border-[#0B1833] transition-colors"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    {headerSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setHeaderSearchQuery('')}
                        className="text-gray-400 hover:text-gray-600 absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </form>

                  {/* Search Results Preview */}
                  {headerSearchQuery.trim() !== '' && (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {searchResults.length > 0 ? (
                        <>
                          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                            Résultats ({searchResults.length})
                          </div>
                          {searchResults.map(prod => (
                            <div
                              key={prod.id}
                              onClick={() => {
                                setIsSearchOpen(false);
                                setHeaderSearchQuery('');
                                navigateTo({ type: 'product', productId: prod.id });
                              }}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F7F7F8] cursor-pointer transition-colors"
                            >
                              <img 
                                src={prod.images[0]} 
                                alt={prod.name} 
                                className="w-11 h-11 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-semibold text-[#0B1833] truncate">
                                  {prod.name}
                                </h4>
                                <span className="text-[11px] font-bold text-[#0B1833]">
                                  {formatPrice(prod.promoPrice ?? prod.price)}
                                </span>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              navigateTo({ type: 'shop', searchQuery: headerSearchQuery });
                              setIsSearchOpen(false);
                            }}
                            className="w-full text-center py-2 text-xs font-bold text-[#0B1833] hover:text-[#B58BC5] border-t border-gray-100 mt-2 block"
                          >
                            Voir tous les résultats pour "{headerSearchQuery}" →
                          </button>
                        </>
                      ) : (
                        <div className="text-center py-6 text-xs text-gray-500">
                          Aucun produit trouvé pour "{headerSearchQuery}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => navigateTo({ type: 'account', tab: 'profile' })}
              className="p-2.5 rounded-full hover:bg-[#F7F7F8] text-[#0B1833]/80 hover:text-[#0B1833] transition-colors relative hidden sm:flex"
              title="Mes favoris"
              aria-label="Favoris"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#F4A9C8] text-[#0B1833] font-bold text-[10px] rounded-full flex items-center justify-center border border-white">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Account & Logout Button */}
            {currentUser ? (
              <div className="flex items-center gap-1 bg-[#F7F7F8] p-1 rounded-full border border-gray-200 shadow-xs">
                <button
                  onClick={() => {
                    if (isAdmin) {
                      navigateTo({ type: 'admin' });
                    } else {
                      navigateTo({ type: 'account' });
                    }
                  }}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-full hover:bg-white text-[#0B1833] transition-colors"
                  title={isAdmin ? "Panneau Administration" : "Mon espace client"}
                >
                  <div className="w-6 h-6 rounded-full bg-[#8FD8C3]/30 text-[#0B1833] flex items-center justify-center font-bold text-xs">
                    {currentUser.firstName.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold hidden md:inline max-w-[90px] truncate">
                    {currentUser.firstName}
                  </span>
                </button>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Se déconnecter"
                  aria-label="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigateTo({ type: 'auth', mode: 'login' })}
                className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-full hover:bg-[#F7F7F8] text-[#0B1833] transition-colors"
                title="Se connecter"
                aria-label="Connexion"
              >
                <div className="w-8 h-8 rounded-full bg-[#8FD8C3]/30 text-[#0B1833] flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold hidden md:inline">
                  Connexion
                </span>
              </button>
            )}

            {/* Cart Button — caché sur mobile (géré par la bottom nav), visible md+ */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="hidden md:flex items-center gap-2 bg-[#0B1833] hover:bg-[#1a2d54] text-white px-3.5 py-2.5 rounded-full transition-all shadow-sm group"
              aria-label="Panier"
            >
              <ShoppingBag className="w-4 h-4 text-[#8FD8C3] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold font-sans">
                {cartCount}
              </span>
            </button>

            {/* Mobile Hamburger Button — visible md only (tablettes), caché sur mobile (bottom nav) et desktop */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-[#0B1833] hover:bg-[#F7F7F8] hidden md:block lg:hidden transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[60px] z-50 bg-[#0B1833]/40 backdrop-blur-sm lg:hidden animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Rechercher sur Espace Pastel..."
                  value={headerSearchQuery}
                  onChange={(e) => setHeaderSearchQuery(e.target.value)}
                  className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#0B1833]"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </form>

              {/* Navigation links */}
              <div className="space-y-1.5 font-medium text-[#0B1833]">
                <button
                  onClick={() => { setIsMobileMenuOpen(false); navigateTo({ type: 'home' }); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors ${currentView.type === 'home' ? 'bg-[#0B1833] text-white font-bold' : 'hover:bg-[#F7F7F8] text-[#0B1833]'}`}
                >
                  <Home className="w-4 h-4 text-[#8FD8C3]" />
                  <span>Accueil</span>
                </button>

                <button
                  onClick={() => { setIsMobileMenuOpen(false); navigateTo({ type: 'shop' }); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors ${currentView.type === 'shop' ? 'bg-[#0B1833] text-white font-bold' : 'hover:bg-[#F7F7F8] text-[#0B1833]'}`}
                >
                  <ShoppingBag className="w-4 h-4 text-[#8FD8C3]" />
                  <span>Boutique / Catalogue</span>
                </button>
                
                {/* Brands in Mobile */}
                <div className="py-2.5">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400 px-3 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#0B1833]" />
                      Nos Marques & Univers
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 px-1">
                    {brands.map(b => (
                      <button
                        key={b.id}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          navigateTo({ type: 'brand', brandSlug: b.slug });
                        }}
                        className="text-left p-2.5 rounded-xl bg-[#F7F7F8] hover:bg-[#8FD8C3]/20 border border-gray-100 transition-all flex items-center gap-2"
                      >
                        <div className="w-5 h-5 rounded-md bg-white p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                          <img src={b.logoUrl || b.bannerUrl} alt={b.name} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-xs font-bold text-[#0B1833] truncate">
                          {b.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => { setIsMobileMenuOpen(false); navigateTo({ type: 'about' }); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#F7F7F8] flex items-center gap-3 text-[#0B1833]"
                >
                  <Info className="w-4 h-4 text-[#8FD8C3]" />
                  <span>À propos</span>
                </button>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); navigateTo({ type: 'contact' }); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#F7F7F8] flex items-center gap-3 text-[#0B1833]"
                >
                  <Mail className="w-4 h-4 text-[#8FD8C3]" />
                  <span>Contact</span>
                </button>
                {currentUser ? (
                  <>
                    <button
                      onClick={() => { setIsMobileMenuOpen(false); navigateTo(isAdmin ? { type: 'admin' } : { type: 'account' }); }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#F7F7F8] text-[#0B1833] font-semibold flex items-center justify-between border-t border-gray-100 pt-3 mt-1"
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-[#B58BC5]" />
                        <span>{isAdmin ? 'Administration' : 'Mon Compte'} ({currentUser.firstName})</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 font-semibold flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Se déconnecter</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); navigateTo({ type: 'auth', mode: 'login' }); }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#F7F7F8] text-[#0B1833] font-semibold flex items-center justify-between border-t border-gray-100 pt-3 mt-1"
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-[#B58BC5]" />
                      <span>Connexion / Inscription</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Footer Info */}
            <div className="pt-6 border-t border-gray-100 space-y-3 text-xs text-[#0B1833]/70">
              <a href="tel:55542000" className="flex items-center gap-2 font-bold text-[#0B1833]">
                <Phone className="w-4 h-4 text-[#8FD8C3]" />
                <span>55 542 000</span>
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F4A9C8]" />
                <span>23 Rue de la Liberté, Menzah 5, Tunis</span>
              </div>
              <div className="text-[11px] text-gray-500 pt-1">
                Du Lundi au Samedi : 08h30 - 19h30
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

