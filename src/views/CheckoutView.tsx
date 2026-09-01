import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import confetti from 'canvas-confetti';
import { 
  ShoppingBag, 
  Truck, 
  MapPin, 
  CreditCard, 
  Banknote, 
  Store, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { Order } from '../types';

export const CheckoutView: React.FC = () => {
  const { 
    cart, 
    cartCount, 
    cartSubtotal, 
    formatPrice, 
    createOrder, 
    navigateTo, 
    currentUser,
    clearCart,
    addToast,
  } = useStore();

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Tunis');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    const defaultAddress = currentUser.addresses?.find((entry) => entry.isDefault) || currentUser.addresses?.[0];
    setFirstName(currentUser.firstName || '');
    setLastName(currentUser.lastName || '');
    setEmail(currentUser.email || '');
    setPhone(currentUser.phone || '');
    setCity(defaultAddress?.city || currentUser.city || 'Tunis');
    setAddress(defaultAddress?.address || currentUser.address || '');
    setPostalCode(defaultAddress?.postalCode || currentUser.postalCode || '');
  }, [currentUser]);
  
  // Delivery & Payment
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'pickup'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Governorates in Tunisia
  const tunisianGovernorates = [
    'Tunis (Menzah, Manar, Ennasr, Centre-Ville...)',
    'Ariana',
    'Ben Arous',
    'Manouba',
    'Nabeul / Hammamet',
    'Bizerte',
    'Sousse',
    'Monastir',
    'Mahdia',
    'Sfax',
    'Kairouan',
    'Autre gouvernorat'
  ];

  const FREE_SHIPPING_THRESHOLD = 100.0;
  let shippingFee = 7.0;
  if (deliveryType === 'pickup' || cartSubtotal >= FREE_SHIPPING_THRESHOLD) shippingFee = 0;
  const total = cartSubtotal + shippingFee;

  const deliveryOptionClass = (kind: 'delivery' | 'pickup') => {
    let className = 'p-4 rounded-2xl border-2 cursor-pointer transition-all border-gray-100 hover:border-gray-200';
    if (deliveryType === kind && kind === 'delivery') {
      className = 'p-4 rounded-2xl border-2 cursor-pointer transition-all border-[#0B1833] bg-[#8FD8C3]/10';
    }
    if (deliveryType === kind && kind === 'pickup') {
      className = 'p-4 rounded-2xl border-2 cursor-pointer transition-all border-[#0B1833] bg-[#F4A9C8]/10';
    }
    return className;
  };

  const paymentOptionClass = (method: 'cod' | 'card') => {
    let className = 'p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all border-gray-100 hover:border-gray-200';
    if (paymentMethod === method && method === 'cod') {
      className = 'p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all border-[#0B1833] bg-[#8FD8C3]/10';
    }
    if (paymentMethod === method && method === 'card') {
      className = 'p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all border-[#0B1833] bg-[#F4A9C8]/10';
    }
    return className;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);

    try {
      const orderItems = cart.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        price: item.product.promoPrice || item.product.price,
        quantity: item.quantity,
        image: item.product.images[0] || '',
        brandName: item.product.brandId,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      }));

      let orderAddress = address;
      let orderPaymentMethod: 'cod' | 'card' | 'pickup' = paymentMethod;
      if (deliveryType === 'pickup') {
        orderAddress = 'Retrait boutique Espace Pastel Menzah 5';
        orderPaymentMethod = 'pickup';
      }

      const newOrder = await createOrder({
        customer: {
          firstName,
          lastName,
          email,
          phone,
          address: orderAddress,
          city,
          postalCode,
          notes
        },
        items: orderItems,
        subtotal: cartSubtotal,
        shippingFee,
        total,
        paymentMethod: orderPaymentMethod,
        status: 'pending'
      });

      setCompletedOrder(newOrder);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // silent
      }
    } catch (error) {
      let message = 'Erreur lors de la commande.';
      if (error instanceof Error) message = error.message;
      addToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order is completed, show order receipt confirmation
  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xl text-center space-y-8 animate-in zoom-in-95 duration-300">
          
          <div className="w-20 h-20 rounded-full bg-[#8FD8C3]/30 text-[#0B1833] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-[#0B1833]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#8FD8C3]">
              COMMANDE CONFIRMÉE
            </span>
            <h1 className="font-sans font-black text-2xl sm:text-4xl text-[#0B1833] tracking-tight">
              Merci pour votre commande, {completedOrder.customer?.firstName || ''} !
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
              Votre commande <strong className="text-[#0B1833]">#{completedOrder.orderNumber}</strong> a été transmise avec succès à notre boutique Espace Pastel.
            </p>
          </div>

          {/* Order Details Receipt Box */}
          <div className="bg-[#F7F7F8] p-6 rounded-2xl text-left space-y-4 text-xs text-[#0B1833]">
            <div className="flex justify-between pb-3 border-b border-gray-200">
              <span className="text-gray-500">Numéro de commande :</span>
              <span className="font-bold">{completedOrder.orderNumber}</span>
            </div>
            
            <div className="flex justify-between pb-3 border-b border-gray-200">
              <span className="text-gray-500">Statut initial :</span>
              <span className="font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                Nouvelle commande
              </span>
            </div>

            <div className="flex justify-between pb-3 border-b border-gray-200">
              <span className="text-gray-500">Mode de règlement :</span>
              <span className="font-bold">
                {completedOrder.paymentMethod === 'cod' && 'Espèces à la livraison'}
                {completedOrder.paymentMethod === 'card' && 'Carte bancaire en ligne'}
                {completedOrder.paymentMethod === 'pickup' && 'Règlement au retrait en boutique (Menzah 5)'}
              </span>
            </div>

            <div className="flex justify-between pb-3 border-b border-gray-200">
              <span className="text-gray-500">Destinataire :</span>
              <span className="font-semibold text-right">
                {completedOrder.customer?.firstName || ''} {completedOrder.customer?.lastName || ''} ({completedOrder.customer?.phone || ''})<br />
                {completedOrder.customer?.address || ''}, {completedOrder.customer?.city || ''}
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <span className="font-bold text-gray-500 block">Articles commandés :</span>
              {completedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <img src={item.image} alt={item.productName} className="w-8 h-8 rounded-lg object-cover" />
                    <span>{item.productName} <strong>×{item.quantity}</strong></span>
                  </div>
                  <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-300 flex justify-between font-sans font-black text-sm text-[#0B1833]">
              <span>Total Réglé :</span>
              <span>{formatPrice(completedOrder.total)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigateTo({ type: 'account', tab: 'orders' })}
              className="bg-[#0B1833] hover:bg-[#8FD8C3] hover:text-[#0B1833] text-white text-xs font-bold px-6 py-3 rounded-xl transition-all"
            >
              Suivre ma commande dans mon compte
            </button>

            <button
              onClick={() => navigateTo({ type: 'shop' })}
              className="bg-[#F7F7F8] hover:bg-gray-200 text-[#0B1833] text-xs font-bold px-6 py-3 rounded-xl transition-all"
            >
              Continuer mes achats
            </button>
          </div>

        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-sans font-bold text-2xl text-[#0B1833]">Votre panier est vide</h2>
        <p className="text-sm text-gray-500">Ajoutez des produits au panier pour passer une commande.</p>
        <button
          onClick={() => navigateTo({ type: 'shop' })}
          className="bg-[#0B1833] text-white px-6 py-2.5 rounded-full text-xs font-bold"
        >
          Découvrir la boutique
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h1 className="font-sans font-black text-2xl sm:text-3xl text-[#0B1833]">
            PASSER LA COMMANDE
          </h1>
          <p className="text-xs text-gray-500">
            Finalisez votre commande en toute sécurité chez Espace Pastel Tunis.
          </p>
        </div>

        <button
          onClick={() => navigateTo({ type: 'shop' })}
          className="text-xs font-bold text-[#0B1833] hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continuer mes achats</span>
        </button>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Customer info, Delivery & Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Customer details */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-sans font-bold text-base text-[#0B1833] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0B1833] text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Coordonnées de contact</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0B1833] mb-1">Prénom *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B1833]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0B1833] mb-1">Nom *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B1833]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0B1833] mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B1833]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0B1833] mb-1">Téléphone tunisien *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: 5554200"
                  className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B1833]"
                />
              </div>
            </div>
          </div>

          {/* 2. Mode de livraison */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-sans font-bold text-base text-[#0B1833] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0B1833] text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>Mode de livraison</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div 
                onClick={() => setDeliveryType('delivery')}
                className={deliveryOptionClass('delivery')}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#0B1833]">
                    <Truck className="w-4 h-4 text-[#8FD8C3]" />
                    <span>Livraison à domicile</span>
                  </div>
                  <span className="text-xs font-bold text-[#0B1833]">
                    {cartSubtotal >= FREE_SHIPPING_THRESHOLD && <strong className="text-emerald-700">GRATUIT</strong>}
                    {cartSubtotal < FREE_SHIPPING_THRESHOLD && '7,000 TND'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">Expédition 24h/48h partout en Tunisie.</p>
              </div>

              <div 
                onClick={() => setDeliveryType('pickup')}
                className={deliveryOptionClass('pickup')}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#0B1833]">
                    <Store className="w-4 h-4 text-[#F4A9C8]" />
                    <span>Click & Collect Menzah 5</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">GRATUIT</span>
                </div>
                <p className="text-[11px] text-gray-500">Retrait sous 2h au 23 Rue de la Liberté.</p>
              </div>
            </div>

            {/* Address fields if delivery */}
            {deliveryType === 'delivery' && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1833] mb-1">Gouvernorat *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B1833] cursor-pointer"
                  >
                    {tunisianGovernorates.map((gov, i) => (
                      <option key={i} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#0B1833] mb-1">Adresse exacte (Rue, Immeuble, Appt) *</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ex: 23 Rue de la Liberté, Résidence Les Fleurs"
                      className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B1833]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1833] mb-1">Code Postal</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B1833]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B1833] mb-1">Remarques ou instructions de livraison (Optionnel)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Appeler avant d'arriver, interphone 14..."
                    className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B1833]"
                  />
                </div>
              </div>
            )}
            {deliveryType !== 'delivery' && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <strong>Adresse de retrait :</strong>
                <p>ESPACE PASTEL — 23 Rue de la Liberté, Menzah 5, Tunis.</p>
                <p className="text-[11px] text-amber-700">Horaires d'ouverture : Du Lundi au Samedi de 08h30 à 19h30.</p>
              </div>
            )}
          </div>

          {/* 3. Mode de paiement */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-sans font-bold text-base text-[#0B1833] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0B1833] text-white text-xs flex items-center justify-center font-bold">3</span>
              <span>Mode de paiement</span>
            </h2>

            <div className="space-y-3">
              <label 
                className={paymentOptionClass('cod')}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-[#0B1833]"
                />
                <Banknote className="w-5 h-5 text-[#0B1833]" />
                <div className="flex-1">
                  <div className="font-bold text-xs text-[#0B1833]">Paiement en espèces à la livraison</div>
                  <div className="text-[11px] text-gray-500">Réglez directement le livreur lors de la réception du colis.</div>
                </div>
              </label>

              <label 
                className={paymentOptionClass('card')}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="accent-[#0B1833]"
                />
                <CreditCard className="w-5 h-5 text-[#0B1833]" />
                <div className="flex-1">
                  <div className="font-bold text-xs text-[#0B1833]">Carte bancaire tunisienne (GIM-TEL)</div>
                  <div className="text-[11px] text-gray-500">Paiement 100% sécurisé via passerelle bancaire tunisienne.</div>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Order Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 sticky top-24">
          <h2 className="font-sans font-bold text-base text-[#0B1833]">
            Récapitulatif de votre commande ({cartCount})
          </h2>

          {/* Cart items list */}
          <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1">
            {cart.map(item => {
              const unitPrice = item.product.promoPrice || item.product.price;
              return (
                <div key={item.productId + '-' + (item.selectedSize || 'no-size') + '-' + (item.selectedColor?.hex || 'no-color')} className="py-3 flex items-center gap-3">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-[#0B1833] truncate">
                      {item.product.name}
                    </h4>
                    {item.selectedSize && (
                      <div className="text-[11px] text-gray-500">Taille : {item.selectedSize}</div>
                    )}
                    {item.selectedColor && (
                      <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: item.selectedColor.hex }} />
                        Couleur : {item.selectedColor.name}
                      </div>
                    )}
                    <span className="text-[11px] text-gray-500">
                      {formatPrice(unitPrice)} × {item.quantity}
                    </span>
                  </div>
                  <span className="font-bold text-xs text-[#0B1833]">
                    {formatPrice(unitPrice * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Totals Calculation */}
          <div className="space-y-2 pt-4 border-t border-gray-100 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total articles</span>
              <span className="font-bold text-[#0B1833]">{formatPrice(cartSubtotal)}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Frais de livraison</span>
              <span className="font-bold text-[#0B1833]">
                {shippingFee === 0 && <strong className="text-emerald-700">GRATUIT</strong>}
                {shippingFee !== 0 && formatPrice(shippingFee)}
              </span>
            </div>

            <div className="flex justify-between text-base font-sans font-black text-[#0B1833] pt-3 border-t border-gray-200">
              <span>Total TTC</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-[#0B1833] hover:bg-[#8FD8C3] hover:text-[#0B1833] text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >            {isSubmitting && <span>Traitement en cours...</span>}
            {!isSubmitting && (
              <>
                <span>CONFIRMER LA COMMANDE ({formatPrice(total)})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck className="w-4 h-4 text-[#8FD8C3]" />
            <span>Garantie satisfaction & service client 5554200</span>
          </div>

        </div>

      </form>

    </div>
  );
};





