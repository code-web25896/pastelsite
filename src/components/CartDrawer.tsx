import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  Tag,
  CheckCircle2
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    isCartDrawerOpen, 
    setIsCartDrawerOpen, 
    cart, 
    cartCount, 
    cartSubtotal, 
    updateCartQuantity, 
    removeFromCart, 
    formatPrice, 
    navigateTo,
    addToast
  } = useStore();

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  if (!isCartDrawerOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 500.0;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
  const freeShippingProgress = Math.min(100, (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const shippingFee = cartSubtotal >= FREE_SHIPPING_THRESHOLD || cartSubtotal === 0 ? 0 : 7.0;
  const discountAmount = (cartSubtotal * discountPercent) / 100;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'PASTEL10') {
      setDiscountPercent(10);
      setAppliedPromo('PASTEL10 (-10%)');
      addToast('Code promo PASTEL10 appliqué (-10%) !', 'success');
    } else if (promoCode.trim().toUpperCase() === 'BIENVENUE') {
      setDiscountPercent(15);
      setAppliedPromo('BIENVENUE (-15%)');
      addToast('Code promo BIENVENUE appliqué (-15%) !', 'success');
    } else {
      addToast('Code promo invalide. Essayez "PASTEL10" ou "BIENVENUE"', 'warning');
    }
    setPromoCode('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartDrawerOpen(false)}
        className="absolute inset-0 bg-[#0B1833]/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#F7F7F8]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#0B1833]" />
              <h2 className="font-sans font-bold text-lg text-[#0B1833]">
                Mon Panier ({cartCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-white text-gray-500 hover:text-[#0B1833] transition-colors"
              aria-label="Fermer le panier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="p-4 bg-[#8FD8C3]/10 border-b border-[#8FD8C3]/20">
            <div className="flex items-center justify-between text-xs font-semibold text-[#0B1833] mb-1.5">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#0B1833]" />
                {remainingForFreeShipping > 0 ? (
                  <span>Plus que <strong className="text-[#0B1833]">{formatPrice(remainingForFreeShipping)}</strong> pour la livraison offerte a partir de 500 DT !</span>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Félicitations ! Livraison offerte !
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-500">Dès 500 DT</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#8FD8C3] transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Drawer Body (Items List or Empty State) */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-gray-100">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F7F7F8] flex items-center justify-center mx-auto text-gray-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-sans font-bold text-base text-[#0B1833]">
                    Votre panier est vide
                  </h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    Découvrez nos cahiers de luxe, nos stylos, et nos fournitures scolaires et artistiques.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigateTo({ type: 'shop' });
                  }}
                  className="inline-flex items-center gap-2 bg-[#0B1833] hover:bg-[#8FD8C3] hover:text-[#0B1833] text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all"
                >
                  <span>Explorer la boutique</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              cart.map(item => {
                const unitPrice = item.product.promoPrice ?? item.product.price;
                const lineTotal = unitPrice * item.quantity;

                return (
                  <div key={item.productId} className="py-4 flex gap-3 first:pt-0 last:pb-0">
                    <img
                      src={item.product.images[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-xl border border-gray-100 flex-shrink-0 cursor-pointer"
                      onClick={() => {
                        setIsCartDrawerOpen(false);
                        navigateTo({ type: 'product', productId: item.productId });
                      }}
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 
                          onClick={() => {
                            setIsCartDrawerOpen(false);
                            navigateTo({ type: 'product', productId: item.productId });
                          }}
                          className="text-xs font-bold text-[#0B1833] hover:text-[#B58BC5] cursor-pointer line-clamp-1"
                        >
                          {item.product.name}
                        </h4>
                        <div className="text-[11px] font-semibold text-[#0B1833] mt-0.5">
                          {formatPrice(unitPrice)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-gray-200 rounded-lg bg-[#F7F7F8] overflow-hidden">
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                            className="p-1 hover:bg-white text-gray-600 transition-colors"
                            aria-label="Diminuer quantité"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-[#0B1833] min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            className="p-1 hover:bg-white text-gray-600 transition-colors"
                            aria-label="Augmenter quantité"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Line Total & Remove */}
                        <div className="flex items-center gap-3">
                          <span className="font-sans font-bold text-xs text-[#0B1833]">
                            {formatPrice(lineTotal)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Supprimer"
                            aria-label="Supprimer l'article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer (Summary & Checkout CTA) */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-[#F7F7F8] space-y-4">
              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Code promo (ex: PASTEL10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs uppercase font-medium focus:outline-none focus:border-[#0B1833]"
                />
                <button
                  type="submit"
                  className="bg-white border border-[#0B1833] text-[#0B1833] hover:bg-[#0B1833] hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Appliquer
                </button>
              </form>

              {appliedPromo && (
                <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> {appliedPromo}
                  </span>
                  <button 
                    onClick={() => { setDiscountPercent(0); setAppliedPromo(null); }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Retirer
                  </button>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span className="font-semibold text-[#0B1833]">{formatPrice(cartSubtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Remise promo</span>
                    <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Frais de livraison</span>
                  <span className="font-semibold text-[#0B1833]">
                    {shippingFee === 0 ? <strong className="text-emerald-700">GRATUIT</strong> : formatPrice(shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-sans font-extrabold text-[#0B1833] pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigateTo({ type: 'checkout' });
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#0B1833] hover:bg-[#8FD8C3] hover:text-[#0B1833] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                >
                  <span>PASSER LA COMMANDE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full py-2.5 px-4 text-center text-xs font-semibold text-[#0B1833]/70 hover:text-[#0B1833] transition-colors"
                >
                  Continuer mes achats
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

