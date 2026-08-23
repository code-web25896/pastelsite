import React from 'react';
import { useStore } from '../context/StoreContext';
import { BrandCard } from '../components/BrandCard';
import { ProductCard } from '../components/ProductCard';
import { Logo } from '../components/Logo';
import coverHeaderImg from '../assets/cover-header.png';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  Headphones, 
  CreditCard, 
  Star, 
  MapPin, 
  Phone, 
  Palette, 
  BookOpen, 
  PenTool, 
  Bookmark,
  CheckCircle2,
  Award
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { navigateTo, brands, products, reviews, formatPrice } = useStore();

  // New products and promotional products
  const newProducts = products.filter(p => p.isNew || p.status === 'published').slice(0, 4);
  const promoProducts = products.filter(p => p.promoPrice || p.isPromo).slice(0, 4);
  const approvedReviews = reviews.filter(r => r.status === 'approved').slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* REAL COVER SOUS-HEADER (Plein Format & Contenu animé dans le cadre central) */}
      <section className="relative pt-2 sm:pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full rounded-[24px] sm:rounded-[36px] overflow-hidden shadow-xl border border-gray-200/80 bg-white group transition-all duration-500 hover:shadow-2xl"
          >
            {/* Subtle animated ambient light gradient behind/around */}
            <motion.div 
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-24 -right-24 w-72 h-72 bg-[#8FD8C3]/30 rounded-full blur-3xl pointer-events-none z-0"
            />
            <motion.div 
              animate={{ 
                opacity: [0.2, 0.5, 0.2],
                scale: [1.05, 1, 1.05]
              }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#F4A9C8]/25 rounded-full blur-3xl pointer-events-none z-0"
            />
            
            {/* Full uncropped image container preserving natural aspect ratio */}
            <div className="relative w-full aspect-[3/2] sm:aspect-[1536/1024] select-none z-10">
              <motion.img
                initial={{ scale: 1.04 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                src={coverHeaderImg}
                alt="Espace Pastel - Couverture Officielle"
                className="w-full h-full object-contain sm:object-cover object-center transform group-hover:scale-[1.012] transition-transform duration-700 pointer-events-none"
                loading="eager"
              />
              
              {/* Content positioned precisely INSIDE the central white frame ("le carreau") */}
              <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4 pointer-events-none">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.92, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="w-[58%] sm:w-[50%] md:w-[46%] lg:w-[42%] text-center flex flex-col items-center justify-center gap-1.5 sm:gap-3 lg:gap-4 p-2 sm:p-4 md:p-6 pointer-events-auto"
                >
                  
                  {/* Eyebrow Badge with animated shine */}
                  <motion.div 
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-[#0B1833]/5 border border-[#0B1833]/10 text-[#0B1833] text-[9px] sm:text-[11px] md:text-xs font-black tracking-wider uppercase backdrop-blur-sm shadow-xs"
                  >
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <BookOpen className="w-2.5 h-2.5 sm:w-3.5 h-3.5 text-[#0B1833]" />
                    </motion.div>
                    <span className="truncate">Librairie &bull; Papeterie &bull; Arts</span>
                  </motion.div>

                  {/* Main Title inside the frame with stagger */}
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="space-y-0.5 sm:space-y-1"
                  >
                    <h1 className="font-['Outfit'] font-extrabold text-base sm:text-2xl md:text-3xl lg:text-4xl text-[#0B1833] tracking-tight leading-tight drop-shadow-xs">
                      ESPACE PASTEL
                    </h1>
                    <p className="font-['Outfit'] text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium max-w-xs sm:max-w-sm mx-auto leading-tight hidden xs:block">
                      Tout pour lire, apprendre et créer au quotidien.
                    </p>
                  </motion.div>

                  {/* Action Buttons inside the frame with motion hover */}
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 md:gap-3 pt-0.5 sm:pt-1 w-full"
                  >
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigateTo({ type: 'shop' })}
                      className="bg-[#0B1833] hover:bg-[#8FD8C3] text-white hover:text-[#0B1833] font-black text-[9px] sm:text-xs md:text-sm uppercase tracking-wider px-3 sm:px-5 md:px-6 py-1.5 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-colors flex items-center gap-1.5 active:scale-95 cursor-pointer relative overflow-hidden group/btn"
                    >
                      <span>Boutique</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        const el = document.getElementById('section-marques');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="bg-white/90 hover:bg-white text-[#0B1833] border border-gray-300 font-bold text-[9px] sm:text-xs md:text-sm uppercase tracking-wider px-2.5 sm:px-4 md:px-5 py-1.5 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl shadow-sm hover:shadow transition-all cursor-pointer hidden sm:inline-flex"
                    >
                      Nos marques
                    </motion.button>
                  </motion.div>

                  {/* Micro trust info with live pulse */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="hidden md:flex items-center gap-2 text-[10px] text-gray-500 font-medium"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8FD8C3] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8FD8C3]"></span>
                    </span>
                    <span>Menzah 5 &bull; Livraison partout en Tunisie</span>
                  </motion.div>

                </motion.div>
              </div>

            </div>

          </motion.div>
        </div>
      </section>


      {/* 6. BARRE DE CONFIANCE (TRUST BAR) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100/90 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#8FD8C3]/20 flex items-center justify-center text-[#0B1833] flex-shrink-0">
              <Truck className="w-6 h-6 text-[#0B1833]" />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-bold text-sm sm:text-base text-[#0B1833]">Livraison rapide</h3>
              <p className="text-xs text-[#0B1833]/60 mt-0.5">Expédition soignée sur tout le territoire tunisien</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F4A9C8]/20 flex items-center justify-center text-[#0B1833] flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#0B1833]" />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-bold text-sm sm:text-base text-[#0B1833]">Sélection avec soin</h3>
              <p className="text-xs text-[#0B1833]/60 mt-0.5">Papeterie d'excellence et articles testés</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7DB9DD]/20 flex items-center justify-center text-[#0B1833] flex-shrink-0">
              <Headphones className="w-6 h-6 text-[#0B1833]" />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-bold text-sm sm:text-base text-[#0B1833]">Service client disponible</h3>
              <p className="text-xs text-[#0B1833]/60 mt-0.5">À votre écoute au 55 542 000</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F5E7A6]/30 flex items-center justify-center text-[#0B1833] flex-shrink-0">
              <CreditCard className="w-6 h-6 text-[#0B1833]" />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-bold text-sm sm:text-base text-[#0B1833]">Paiement sécurisé</h3>
              <p className="text-xs text-[#0B1833]/60 mt-0.5">Paiement à la livraison ou retrait en magasin</p>
            </div>
          </div>

        </div>
      </section>


      {/* 7. NOS MARQUES (BRAND SHOWCASE) */}
      <section id="section-marques" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-[#B58BC5] mb-1">
              Univers & Partenaires
            </div>
            <h2 className="font-['Outfit'] font-black text-2xl sm:text-4xl text-[#0B1833] tracking-tight">
              NOS MARQUES
            </h2>
            <p className="text-sm text-[#0B1833]/70 mt-1">
              Découvrez nos marques et explorez leurs collections.
            </p>
          </div>

          <button
            onClick={() => navigateTo({ type: 'shop' })}
            className="text-xs font-bold text-[#0B1833] hover:text-[#B58BC5] flex items-center gap-1 transition-colors self-start md:self-auto"
          >
            <span>Voir tout le catalogue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic Brands Grid: BOMI, WAMA, FOURNITURE, ARTS & PEINTURE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {brands.map(brand => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      </section>


      {/* 25. HOMEPAGE — NOUVEAUTÉS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-[#8FD8C3] mb-1">
              Arrivages Récents
            </div>
            <h2 className="font-['Outfit'] font-black text-2xl sm:text-4xl text-[#0B1833] tracking-tight">
              NOS NOUVEAUTÉS
            </h2>
            <p className="text-sm text-[#0B1833]/70 mt-1">
              Les derniers produits arrivés chez Espace Pastel.
            </p>
          </div>

          <button
            onClick={() => navigateTo({ type: 'shop', isNewOnly: true })}
            className="text-xs font-bold text-[#0B1833] hover:text-[#8FD8C3] flex items-center gap-1 transition-colors self-start md:self-auto"
          >
            <span>VOIR TOUTES LES NOUVEAUTÉS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4-Columns Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>


      {/* CREATIVE SPOTLIGHT BANNER (BEAUX-ARTS & PAPETERIE FINE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0B1833] to-[#16274e] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-white/10">
          <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-[#B58BC5]/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="px-3 py-1 rounded-full bg-[#B58BC5] text-white text-[10px] font-black uppercase tracking-wider inline-block">
              Atelier Créatif & Beaux-Arts
            </span>
            
            <h2 className="font-['Outfit'] font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
              Exprimez votre talent avec notre sélection Beaux-Arts
            </h2>
            
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Aquarelles fines, pinceaux de maître, carnets de croquis 200g et toiles 100% coton pour donner vie à toutes vos inspirations artistiques.
            </p>

            <div className="pt-2">
              <button
                onClick={() => navigateTo({ type: 'brand', brandSlug: 'arts-peinture' })}
                className="bg-[#B58BC5] hover:bg-white text-[#0B1833] font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all inline-flex items-center gap-2"
              >
                <span>Explorer l'univers Arts & Peinture</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* 26. HOMEPAGE — PROMOTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-[#F4A9C8] mb-1">
              Bons Plans
            </div>
            <h2 className="font-['Outfit'] font-black text-2xl sm:text-4xl text-[#0B1833] tracking-tight">
              NOS OFFRES DU MOMENT
            </h2>
            <p className="text-sm text-[#0B1833]/70 mt-1">
              Profitez de réductions exclusives sur les indispensables de la papeterie et des fournitures.
            </p>
          </div>

          <button
            onClick={() => navigateTo({ type: 'shop', promoOnly: true })}
            className="text-xs font-bold text-[#0B1833] hover:text-[#F4A9C8] flex items-center gap-1 transition-colors self-start md:self-auto"
          >
            <span>VOIR TOUTES LES OFFRES</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4-Columns Promo Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {promoProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>


      {/* 27. HOMEPAGE — AVIS CLIENTS (ILS PARLENT DE NOUS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="text-xs font-extrabold uppercase tracking-widest text-[#8FD8C3] mb-1">
            Témoignages
          </div>
          <h2 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[#0B1833] tracking-tight">
            ILS PARLENT DE NOUS
          </h2>
          <p className="text-xs sm:text-sm text-[#0B1833]/70 mt-1">
            Découvrez les retours de nos clients passionnés de lecture, d'écriture et de création à Tunis.
          </p>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {approvedReviews.map(review => (
            <div
              key={review.id}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* 5-Star Rating */}
                <div className="flex text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`}
                    />
                  ))}
                </div>

                {/* Comment quote */}
                <p className="text-xs text-[#0B1833]/80 leading-relaxed italic mb-4">
                  « {review.comment} »
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="font-['Outfit'] font-bold text-xs text-[#0B1833]">
                  — {review.customerName}
                </span>
                <span className="text-[10px] text-gray-400">
                  {review.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* STORE LOCATION TEASER (MENZAH 5, TUNIS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-lg">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B1833] bg-[#8FD8C3]/30 px-3 py-1 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-[#0B1833]" />
              <span>Boutique Physique à Tunis</span>
            </div>
            
            <h3 className="font-['Outfit'] font-black text-2xl text-[#0B1833] tracking-tight">
              Venez nous rendre visite à Menzah 5
            </h3>
            
            <p className="text-xs text-[#0B1833]/70 leading-relaxed">
              Retrouvez l'expérience Espace Pastel au <strong>23 Rue de la Liberté, Menzah 5, Tunis</strong>. Notre équipe vous accueille du lundi au samedi pour vous conseiller sur vos fournitures et projets créatifs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="tel:55542000"
              className="bg-[#0B1833] hover:bg-[#8FD8C3] hover:text-[#0B1833] text-white text-xs font-bold px-6 py-3.5 rounded-xl transition-all inline-flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Appeler le 55 542 000</span>
            </a>

            <button
              onClick={() => navigateTo({ type: 'contact' })}
              className="bg-[#F7F7F8] hover:bg-gray-200 text-[#0B1833] text-xs font-bold px-6 py-3.5 rounded-xl transition-all"
            >
              Voir le plan d'accès & horaires
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
