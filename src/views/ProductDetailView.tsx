import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  Truck, 
  ShieldCheck, 
  MapPin, 
  RotateCcw, 
  Plus, 
  Minus, 
  ChevronRight, 
  CheckCircle2, 
  Send,
  MessageSquare,
  ArrowRight
} from 'lucide-react';

interface ProductDetailViewProps {
  productId: string;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ productId }) => {
  const { 
    getProductById, 
    getBrandById, 
    getProductReviews, 
    addToCart, 
    formatPrice, 
    navigateTo, 
    toggleWishlist, 
    isInWishlist, 
    addReview,
    products,
    currentUser
  } = useStore();

  const product = getProductById(productId);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'features' | 'reviews'>('description');

  // Review Form State
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newName, setNewName] = useState(currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : '');
  const [newEmail, setNewEmail] = useState(currentUser ? currentUser.email : '');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-['Outfit'] font-bold text-2xl text-[#0B1833]">Produit introuvable</h2>
        <p className="text-sm text-gray-500">Ce produit n'existe plus ou a été retiré du catalogue.</p>
        <button
          onClick={() => navigateTo({ type: 'shop' })}
          className="bg-[#0B1833] text-white px-6 py-2.5 rounded-full text-xs font-bold"
        >
          Retour à la boutique
        </button>
      </div>
    );
  }

  const brand = getBrandById(product.brandId);
  const isFavorited = isInWishlist(product.id);
  const approvedReviews = getProductReviews(product.id, true);

  const discountPercent = product.promoPrice && product.price > 0
    ? Math.round(((product.price - product.promoPrice) / product.price) * 100)
    : 0;

  const currentPrice = product.promoPrice ?? product.price;
  const isOutOfStock = product.stock <= 0;

  // Similar Products
  const similarProducts = products
    .filter(p => p.id !== product.id && (p.brandId === product.brandId || p.category === product.category))
    .slice(0, 4);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) return;

    addReview(product.id, newName, newEmail, newRating, newComment);
    setReviewSubmitted(true);
    setNewComment('');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigateTo({ type: 'checkout' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <button onClick={() => navigateTo({ type: 'home' })} className="hover:text-[#0B1833] transition-colors">
          Accueil
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => navigateTo({ type: 'shop' })} className="hover:text-[#0B1833] transition-colors">
          Boutique
        </button>
        {brand && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <button 
              onClick={() => navigateTo({ type: 'brand', brandSlug: brand.slug })}
              className="hover:text-[#0B1833] transition-colors"
            >
              {brand.name}
            </button>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#0B1833] font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* 13. PAGE PRODUIT PRINCIPALE (GRID 2 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        
        {/* GAUCHE: Galerie d'images (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-[4/3] sm:aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm group">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
            />

            {/* Badges on main image */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {product.badge === 'PROMOTION' && discountPercent > 0 && (
                <span className="bg-[#F4A9C8] text-[#0B1833] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  PROMOTION -{discountPercent}%
                </span>
              )}
              {product.badge === 'BEST-SELLER' && (
                <span className="bg-[#F5E7A6] text-[#0B1833] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  BEST-SELLER
                </span>
              )}
              {product.badge === 'NOUVEAU' && (
                <span className="bg-[#8FD8C3] text-[#0B1833] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  NOUVEAUTÉ
                </span>
              )}
            </div>

            {/* Wishlist floating toggle */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all shadow-md ${isFavorited ? 'bg-[#F4A9C8] text-[#0B1833]' : 'bg-white/90 text-[#0B1833] hover:bg-white'}`}
              aria-label="Favoris"
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnails Gallery */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${selectedImageIndex === idx ? 'border-[#0B1833] ring-2 ring-[#0B1833]/20' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Aperçu ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DROITE: Informations & Achat (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Brand & Category pill */}
          <div className="flex items-center justify-between">
            {brand && (
              <button
                onClick={() => navigateTo({ type: 'brand', brandSlug: brand.slug })}
                className="text-xs font-bold uppercase tracking-widest text-[#B58BC5] hover:underline"
              >
                {brand.name}
              </button>
            )}
            <span className="text-xs font-semibold text-gray-400">
              Réf : {product.sku}
            </span>
          </div>

          {/* Product Name */}
          <h1 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[#0B1833] tracking-tight leading-tight">
            {product.name}
          </h1>

          {/* Star Rating & Review count with jump to reviews */}
          <div className="flex items-center gap-3">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-[#0B1833]">
              {product.rating.toFixed(1)} / 5
            </span>
            <button
              onClick={() => {
                setActiveTab('reviews');
                document.getElementById('tabs-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs text-gray-500 hover:text-[#0B1833] underline"
            >
              ({approvedReviews.length} avis clients)
            </button>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-white border border-gray-100 flex items-center justify-between">
            <div>
              <div className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[#0B1833]">
                {formatPrice(currentPrice)}
              </div>
              {product.promoPrice && (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Économisez {formatPrice(product.price - product.promoPrice)}
                  </span>
                </div>
              )}
            </div>

            {/* Stock status pill */}
            <div>
              {isOutOfStock ? (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                  Rupture de stock
                </span>
              ) : (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  En stock ({product.stock} disponibles)
                </span>
              )}
            </div>
          </div>

          {/* Short description */}
          <p className="text-xs sm:text-sm text-[#0B1833]/80 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Quantity & Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-[#0B1833]">Quantité :</span>
              <div className="flex items-center border border-gray-200 rounded-xl bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2.5 hover:bg-[#F7F7F8] text-gray-600 disabled:opacity-40 transition-colors rounded-l-xl"
                  aria-label="Diminuer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-[#0B1833] min-w-[36px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="p-2.5 hover:bg-[#F7F7F8] text-gray-600 disabled:opacity-40 transition-colors rounded-r-xl"
                  aria-label="Augmenter"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => addToCart(product, quantity)}
                disabled={isOutOfStock}
                className={`py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#0B1833] hover:bg-[#8FD8C3] hover:text-[#0B1833] text-white active:scale-98'}`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>AJOUTER AU PANIER</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all ${isOutOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#8FD8C3] hover:bg-[#7bc7b2] text-[#0B1833] active:scale-98'}`}
              >
                ACHETER MAINTENANT
              </button>
            </div>
          </div>

          {/* Reassurance Grid */}
          <div className="p-4 rounded-2xl bg-white border border-gray-100 space-y-2.5 text-xs text-[#0B1833]/80">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#8FD8C3] flex-shrink-0" />
              <span>Livraison express en 24h/48h sur toute la Tunisie (7 TND ou offert dès 100 TND)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#F4A9C8] flex-shrink-0" />
              <span>Retrait gratuit sous 2h à la boutique <strong>Menzah 5, Tunis</strong></span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#B58BC5] flex-shrink-0" />
              <span>Paiement sécurisé à la livraison ou en magasin</span>
            </div>
          </div>

        </div>
      </div>

      {/* 13. TABS: DESCRIPTION, CARACTÉRISTIQUES, AVIS CLIENTS */}
      <section id="tabs-section" className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-8">
        
        {/* Tabs selector */}
        <div className="flex border-b border-gray-100 gap-8 text-sm font-bold">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-4 relative transition-colors ${activeTab === 'description' ? 'text-[#0B1833] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0B1833]' : 'text-gray-400 hover:text-[#0B1833]'}`}
          >
            Description complète
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`pb-4 relative transition-colors ${activeTab === 'features' ? 'text-[#0B1833] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0B1833]' : 'text-gray-400 hover:text-[#0B1833]'}`}
          >
            Caractéristiques techniques
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 relative transition-colors flex items-center gap-2 ${activeTab === 'reviews' ? 'text-[#0B1833] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0B1833]' : 'text-gray-400 hover:text-[#0B1833]'}`}
          >
            <span>Avis clients</span>
            <span className="bg-[#8FD8C3]/30 text-[#0B1833] text-xs px-2 py-0.5 rounded-full">
              {approvedReviews.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'description' && (
          <div className="space-y-4 max-w-3xl text-sm text-[#0B1833]/80 leading-relaxed">
            <p>{product.description}</p>
            <p>
              Sélectionné rigoureusement par <strong>Espace Pastel</strong> pour répondre aux exigences des étudiants, des professionnels et des amateurs de belle papeterie et de dessin à Tunis.
            </p>
          </div>
        )}

        {/* Tab 2: Features */}
        {activeTab === 'features' && (
          <div className="max-w-2xl">
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#0B1833]">
              {product.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#8FD8C3] flex-shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tab 3: Reviews (14. SYSTÈME D'AVIS) */}
        {activeTab === 'reviews' && (
          <div className="space-y-10">
            {/* Reviews Summary Header */}
            <div className="bg-[#F7F7F8] p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="font-['Outfit'] font-black text-4xl text-[#0B1833]">
                  {product.rating.toFixed(1)}
                </div>
                <div>
                  <div className="flex text-amber-400 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    Basé sur {approvedReviews.length} avis vérifié{approvedReviews.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div className="text-xs text-[#0B1833]/70 max-w-sm">
                Tous nos avis sont vérifiés et modérés par notre équipe pour garantir une transparence totale.
              </div>
            </div>

            {/* Approved Reviews List */}
            <div className="space-y-4">
              <h3 className="font-['Outfit'] font-bold text-base text-[#0B1833]">
                Commentaires des clients ({approvedReviews.length})
              </h3>

              {approvedReviews.length > 0 ? (
                <div className="space-y-3">
                  {approvedReviews.map(review => (
                    <div key={review.id} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#0B1833]">{review.customerName}</span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Achat vérifié</span>
                        </div>
                        <span className="text-[11px] text-gray-400">{review.date}</span>
                      </div>

                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-[#0B1833]/80 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">Aucun avis validé pour ce produit pour l'instant. Soyez le premier à donner votre avis !</p>
              )}
            </div>

            {/* Leave a Review Form */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="font-['Outfit'] font-bold text-base text-[#0B1833] mb-4">
                Laisser un avis sur ce produit
              </h3>

              {reviewSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-800 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>Merci pour votre retour ! Votre avis a été enregistré et sera publié après validation par notre administrateur.</span>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4 max-w-xl bg-[#F7F7F8] p-6 rounded-2xl">
                  {/* Rating Selector */}
                  <div>
                    <label className="block text-xs font-bold text-[#0B1833] mb-1.5">
                      Votre note globale :
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-6 h-6 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-[#0B1833] ml-2">{newRating} / 5</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#0B1833] mb-1">
                        Votre nom ou prénom *
                      </label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Ex: Sarah M."
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0B1833]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0B1833] mb-1">
                        Votre email (ne sera pas publié) *
                      </label>
                      <input
                        type="email"
                        required
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Ex: sarah@gmail.com"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0B1833]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0B1833] mb-1">
                      Votre commentaire détaillé *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Partagez vos impressions sur la qualité du produit, sa texture, son utilisation..."
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-[#0B1833]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#0B1833] hover:bg-[#8FD8C3] hover:text-[#0B1833] text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer mon avis</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </section>

      {/* 13. PRODUITS SIMILAIRES */}
      {similarProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-['Outfit'] font-black text-2xl text-[#0B1833]">
              PRODUITS SIMILAIRES
            </h2>
            <button
              onClick={() => navigateTo({ type: 'shop' })}
              className="text-xs font-bold text-[#0B1833] hover:underline flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {similarProducts.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
