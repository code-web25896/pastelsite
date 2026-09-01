import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Star, ShoppingBag, Heart, Eye, Phone, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  showBrand?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  showBrand = true 
}) => {
  const { 
    navigateTo, 
    addToCart, 
    formatPrice, 
    brands, 
    isInWishlist, 
    toggleWishlist 
  } = useStore();

  const brand = brands.find(b => b.id === product.brandId);
  const isFavorited = isInWishlist(product.id);

  // Discount percentage calculation
  const discountPercent = product.promoPrice && product.price > 0
    ? Math.round(((product.price - product.promoPrice) / product.price) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isRare = product.actionType === 'rare_call' || product.actionType === 'rare_chat' || product.actionType === 'rare_both' || product.badge === 'PIÈCE RARE';
  const customPhone = product.customPhone || '98 137 585';

  const currentPrice = product.promoPrice ?? product.price;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group bg-white rounded-2xl border border-gray-100/90 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:border-gray-200/80 relative"
      id={`product-card-${product.id}`}
    >
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] sm:aspect-square bg-[#F7F7F8] overflow-hidden cursor-pointer"
        onClick={() => navigateTo({ type: 'product', productId: product.id })}
      >
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges on Top-Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {(product.badge === 'PIÈCE RARE' || isRare) && (
            <span className="bg-amber-400 text-[#0B1833] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              PIÈCE RARE
            </span>
          )}
          {product.badge === 'PROMOTION' && discountPercent > 0 && (
            <span className="bg-[#F4A9C8] text-[#0B1833] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.badge === 'NOUVEAU' && (
            <span className="bg-[#8FD8C3] text-[#0B1833] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              NOUVEAU
            </span>
          )}
          {product.badge === 'BEST-SELLER' && (
            <span className="bg-[#F5E7A6] text-[#0B1833] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              BEST-SELLER
            </span>
          )}
          {product.badge === 'COUP DE CŒUR' && (
            <span className="bg-[#B58BC5] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              COUP DE CŒUR
            </span>
          )}
        </div>

        {/* Wishlist Button on Top-Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            isFavorited 
              ? 'bg-[#F4A9C8] text-[#0B1833]' 
              : 'bg-white/80 text-[#0B1833]/70 hover:bg-white hover:text-[#0B1833]'
          }`}
          aria-label="Ajouter aux favoris"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Overlay on Desktop Hover */}
        <div className="absolute inset-0 bg-[#0B1833]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm text-[#0B1833] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <Eye className="w-3.5 h-3.5" />
            <span>Voir détails</span>
          </div>
        </div>
      </div>

      {/* Product Information Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Stock Header */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            {showBrand && brand && (
              <span 
                onClick={() => navigateTo({ type: 'brand', brandSlug: brand.slug })}
                className="text-[11px] font-bold text-[#0B1833]/60 hover:text-[#B58BC5] cursor-pointer transition-colors uppercase tracking-wider"
              >
                {brand.name}
              </span>
            )}

            {/* Stock pill */}
            {isOutOfStock ? (
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                Rupture
              </span>
            ) : isLowStock ? (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                Plus que {product.stock}
              </span>
            ) : (
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                En stock
              </span>
            )}
          </div>

          {/* Title */}
          <h3 
            onClick={() => navigateTo({ type: 'product', productId: product.id })}
            className="font-sans font-bold text-sm text-[#0B1833] group-hover:text-[#B58BC5] transition-colors line-clamp-2 cursor-pointer mb-2"
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-[#0B1833]">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-[11px] text-gray-400">
              ({product.reviewCount})
            </span>
          </div>
        </div>

        {/* Pricing & Action Button Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="font-sans font-extrabold text-base text-[#0B1833]">
              {formatPrice(currentPrice)}
            </div>
            {product.promoPrice && (
              <div className="text-[11px] text-gray-400 line-through">
                {formatPrice(product.price)}
              </div>
            )}
          </div>

          {/* Action Button: Appeler for Rare Pieces or Ajouter au panier */}
          {isRare ? (
            <a
              href={`tel:${customPhone.replace(/\s+/g, '')}`}
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-2 rounded-xl flex items-center gap-1.5 bg-[#0B1833] hover:bg-[#1a2d54] text-white font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
              title={`Appeler pour commander : ${customPhone}`}
            >
              <Phone className="w-3.5 h-3.5 text-[#8FD8C3]" />
              <span>Appeler</span>
            </a>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if ((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) {
                  navigateTo({ type: 'product', productId: product.id });
                } else {
                  addToCart(product, 1);
                }
              }}
              disabled={isOutOfStock}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#0B1833] text-white hover:bg-[#8FD8C3] hover:text-[#0B1833] shadow-sm active:scale-95 cursor-pointer'
              }`}
              title={((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) ? 'Choisir les options (Taille / Couleur)' : 'Ajouter au panier'}
              aria-label="Ajouter au panier"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

