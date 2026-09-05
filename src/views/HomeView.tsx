import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BrandCard } from '../components/BrandCard';
import { ProductCard } from '../components/ProductCard';
import { Logo } from '../components/Logo';
import { motion, AnimatePresence } from 'motion/react';
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
  Award,
  Sparkles,
  Clock,
  Send,
  HelpCircle,
  ChevronDown,
  ShoppingBag,
  Zap,
  Users,
  Gift,
  Check
} from 'lucide-react';

const coverHeaderImg = encodeURI('/cover sous header.png');

export const HomeView: React.FC = () => {
  const { navigateTo, brands, products, reviews, formatPrice, addToast } = useStore();

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // FAQ open index state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // New products and promotional products
  const newProducts = [...products]
    .filter(p => p?.id && p?.name && (!p.status || p.status === 'published'))
    .sort((a, b) => {
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 4);

  const promoProducts = [...products]
    .filter(p => p?.id && p?.name && (!p.status || p.status === 'published') && (p.promoPrice != null || p.isPromo || p.badge === 'PROMOTION'))
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 4);

  const approvedReviews = reviews.filter(r => r.status === 'approved').slice(0, 4);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      addToast('Veuillez saisir une adresse email valide.', 'warning');
      return;
    }
    setNewsletterSubscribed(true);
    addToast('Bienvenue dans le Club Privilège Espace Pastel !', 'success');
  };

  const faqItems = [
    {
      q: "Quels sont les délais et frais de livraison en Tunisie ?",
      a: "Nous livrons sur toute la Tunisie sous 24h à 48h ouvrées. Les frais de livraison sont de 7 TND, et la livraison est offerte dès 500 TND d'achats."
    },
    {
      q: "Comment fonctionne le retrait gratuit en boutique à Menzah 5 ?",
      a: "Sélectionnez l'option 'Retrait en boutique' lors du paiement. Votre commande est préparée sous 2h et vous pouvez la récupérer directement au 23 Rue de la Liberté, Menzah 5, ouvert 7j/7 de 09h00 à 23h30."
    },
    {
      q: "Puis-je commander des listes scolaires ou packs pour entreprises ?",
      a: "Oui ! Nous préparons les listes scolaires complètes de la maternelle au lycée ainsi que les fournitures de bureau pour professionnels. Vous pouvez nous joindre directement au 98 137 585 ou par WhatsApp."
    },
    {
      q: "Quels sont les modes de paiement acceptés ?",
      a: "Vous pouvez régler en espèces directement à la livraison ou lors du retrait en boutique, ainsi que par carte bancaire sécurisée."
    }
  ];

  const featuredCategories = [
    {
      title: 'Cartables & Bagagerie',
      desc: 'Ergonomie, légèreté et finitions durables pour la rentrée.',
      image: 'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=600&q=80',
      badge: 'Collection 2026',
      badgeColor: 'bg-[#F4A9C8] text-[#0B1833]',
      link: () => navigateTo({ type: 'brand', brandSlug: 'bomi' }),
      icon: BookOpen
    },
    {
      title: 'Écriture & Stylos Gel',
      desc: 'Glisse fluide, pointes fines et encres japonaises précises.',
      image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80',
      badge: 'WAMA Precision',
      badgeColor: 'bg-[#8FD8C3] text-[#0B1833]',
      link: () => navigateTo({ type: 'brand', brandSlug: 'wama' }),
      icon: PenTool
    },
    {
      title: 'Beaux-Arts & Peinture',
      desc: 'Aquarelles, gouaches, pinceaux d’art et toiles coton.',
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80',
      badge: 'Atelier Créatif',
      badgeColor: 'bg-[#B58BC5] text-white',
      link: () => navigateTo({ type: 'brand', brandSlug: 'arts-peinture' }),
      icon: Palette
    },
    {
      title: 'Papeterie de Luxe & Cahiers',
      desc: 'Papier vélin soyeux 90g et carnets de notes soft-touch.',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      badge: 'Premium Paper',
      badgeColor: 'bg-[#F5E7A6] text-[#0B1833]',
      link: () => navigateTo({ type: 'shop' }),
      icon: Bookmark
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-24 overflow-hidden">
      
      {/* 1. HERO COVER SOUS-HEADER (Plein Format avec animations professionnelles) */}
      <section className="relative pt-2 sm:pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full rounded-[28px] sm:rounded-[40px] overflow-hidden shadow-2xl border border-gray-200/90 bg-white group transition-all duration-500"
          >
            {/* Ambient Animated Pastel Orbs */}
            <motion.div 
              animate={{ 
                x: [0, 20, 0],
                y: [0, -15, 0],
                scale: [1, 1.08, 1],
                opacity: [0.35, 0.65, 0.35]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-20 -right-20 w-80 h-80 bg-[#8FD8C3]/30 rounded-full blur-3xl pointer-events-none z-0"
            />
            <motion.div 
              animate={{ 
                x: [0, -20, 0],
                y: [0, 20, 0],
                scale: [1.05, 1, 1.05],
                opacity: [0.25, 0.55, 0.25]
              }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#F4A9C8]/25 rounded-full blur-3xl pointer-events-none z-0"
            />
            
            {/* Image Container with smooth zoom on hover */}
            <div className="relative w-full aspect-[3/2] sm:aspect-[1536/1024] select-none z-10">
              <motion.img
                initial={{ scale: 1.06 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.4, ease: "easeOut" }}
                src={coverHeaderImg}
                alt="Espace Pastel - Couverture Officielle"
                className="w-full h-full object-contain sm:object-cover object-center transform group-hover:scale-[1.015] transition-transform duration-1000 pointer-events-none"
                loading="eager"
              />
              
              {/* Content positioned inside the central white frame */}
              <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4 pointer-events-none">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="w-[62%] sm:w-[52%] md:w-[48%] lg:w-[44%] text-center flex flex-col items-center justify-center gap-1.5 sm:gap-3.5 lg:gap-4 p-2 sm:p-4 md:p-6 pointer-events-auto"
                >
                  
                  {/* Eyebrow Badge */}
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B1833]/5 border border-[#0B1833]/15 text-[#0B1833] text-[9px] sm:text-[11px] md:text-xs font-black tracking-wider uppercase backdrop-blur-md shadow-xs"
                  >
                    <motion.div
                      animate={{ rotate: [0, -12, 12, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <Sparkles className="w-3 h-3 text-[#0B1833]" />
                    </motion.div>
                    <span>Librairie &bull; Papeterie &bull; Beaux-Arts</span>
                  </motion.div>

                  {/* Main Title */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.55 }}
                    className="space-y-1"
                  >
                    <h1 className="font-sans font-black text-lg sm:text-2xl md:text-3xl lg:text-4xl text-[#0B1833] tracking-tight leading-tight">
                      ESPACE PASTEL
                    </h1>
                    <p className="font-sans text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium max-w-xs sm:max-w-sm mx-auto leading-snug hidden xs:block">
                      L'excellence de la papeterie, des livres et de la création artistique à Tunis.
                    </p>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.65 }}
                    className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1 w-full"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(11, 24, 51, 0.3)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigateTo({ type: 'shop' })}
                      className="bg-[#0B1833] hover:bg-[#8FD8C3] text-white hover:text-[#0B1833] font-black text-[9px] sm:text-xs md:text-sm uppercase tracking-wider px-3.5 sm:px-6 py-2 sm:py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer group/btn"
                    >
                      <span>Explorer la Boutique</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        const el = document.getElementById('section-marques');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="bg-white/90 hover:bg-white text-[#0B1833] border border-gray-300 font-bold text-[9px] sm:text-xs md:text-sm uppercase tracking-wider px-3 sm:px-5 py-2 sm:py-3 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer hidden sm:inline-flex"
                    >
                      Nos Univers
                    </motion.button>
                  </motion.div>

                  {/* Live Status Pill */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.75 }}
                    className="hidden md:flex items-center gap-2 text-[10px] text-gray-500 font-semibold"
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span>Boutique Menzah 5 &bull; Ouvert 7j/7 de 09h00 à 23h30</span>
                  </motion.div>

                </motion.div>
              </div>

            </div>

          </motion.div>
        </div>
      </section>


      {/* 2. RUBAN DÉFILANT CONTINU (MARQUEE TICKER PRO) */}
      <section className="bg-[#0B1833] text-white py-3.5 overflow-hidden shadow-sm relative select-none">
        <div className="flex whitespace-nowrap">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="flex items-center gap-8 text-xs sm:text-sm font-bold tracking-wider uppercase text-white/90"
          >
            <span>✦ LIVRAISON EXPRESS EN TUNISIE (OFFERTE DÈS 500 DT)</span>
            <span className="text-[#8FD8C3]">✦ 100% PRODUITS CERTIFIÉS & GRANDES MARQUES</span>
            <span>✦ BOUTIQUE MENZAH 5 OUVERTE 7/7 DE 09H00 À 23H30</span>
            <span className="text-[#F4A9C8]">✦ PAPETERIE SCOLAIRE, LIVRES & BEAUX-ARTS</span>
            <span>✦ RETRAIT GRATUIT EN BOUTIQUE SOUS 2H</span>
            <span className="text-[#F5E7A6]">✦ SERVICE CLIENT DÉDIÉ : 98 137 585</span>
            {/* Duplication for seamless loop */}
            <span>✦ LIVRAISON EXPRESS EN TUNISIE (OFFERTE DÈS 500 DT)</span>
            <span className="text-[#8FD8C3]">✦ 100% PRODUITS CERTIFIÉS & GRANDES MARQUES</span>
            <span>✦ BOUTIQUE MENZAH 5 OUVERTE 7/7 DE 09H00 À 23H30</span>
            <span className="text-[#F4A9C8]">✦ PAPETERIE SCOLAIRE, LIVRES & BEAUX-ARTS</span>
            <span>✦ RETRAIT GRATUIT EN BOUTIQUE SOUS 2H</span>
          </motion.div>
        </div>
      </section>


      {/* 3. BARRE DE CONFIANCE (TRUST BAR) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#8FD8C3]/20 flex items-center justify-center text-[#0B1833] flex-shrink-0 shadow-xs">
              <Truck className="w-6 h-6 text-[#0B1833]" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-sm sm:text-base text-[#0B1833]">Livraison Rapide</h3>
              <p className="text-xs text-[#0B1833]/60 mt-0.5">Expédition 24/48h sur toute la Tunisie</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F4A9C8]/20 flex items-center justify-center text-[#0B1833] flex-shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6 text-[#0B1833]" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-sm sm:text-base text-[#0B1833]">Sélection Certifiée</h3>
              <p className="text-xs text-[#0B1833]/60 mt-0.5">Grandes marques originales garanties</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7DB9DD]/20 flex items-center justify-center text-[#0B1833] flex-shrink-0 shadow-xs">
              <Headphones className="w-6 h-6 text-[#0B1833]" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-sm sm:text-base text-[#0B1833]">Conseil & Écoute</h3>
              <p className="text-xs text-[#0B1833]/60 mt-0.5">Assistance directe au 98 137 585</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F5E7A6]/30 flex items-center justify-center text-[#0B1833] flex-shrink-0 shadow-xs">
              <CreditCard className="w-6 h-6 text-[#0B1833]" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-sm sm:text-base text-[#0B1833]">Paiement Flexible</h3>
              <p className="text-xs text-[#0B1833]/60 mt-0.5">À la livraison ou retrait en magasin</p>
            </div>
          </motion.div>

        </motion.div>
      </section>


      {/* 5. NOS MARQUES (BRAND SHOWCASE) */}
      <section id="section-marques" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-[#B58BC5] mb-1">
              Univers & Partenaires
            </div>
            <h2 className="font-sans font-black text-2xl sm:text-4xl text-[#0B1833] tracking-tight">
              NOS MARQUES OFFICIELLES
            </h2>
            <p className="text-sm text-[#0B1833]/70 mt-1">
              Des labels réputés pour leur durabilité, leur ergonomie et leur esthétique raffinée.
            </p>
          </div>

          <button
            onClick={() => navigateTo({ type: 'shop' })}
            className="text-xs font-bold text-[#0B1833] hover:text-[#B58BC5] flex items-center gap-1.5 transition-colors self-start md:self-auto group cursor-pointer"
          >
            <span>Voir tout le catalogue</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Dynamic Brands Grid: BOMI, WAMA, FOURNITURE, ARTS & PEINTURE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {brands.map(brand => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      </section>


      {/* 6. NOUVEAUTÉS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-[#8FD8C3] mb-1">
              Arrivages Récents
            </div>
            <h2 className="font-sans font-black text-2xl sm:text-4xl text-[#0B1833] tracking-tight">
              NOS NOUVEAUTÉS
            </h2>
            <p className="text-sm text-[#0B1833]/70 mt-1">
              Les derniers produits arrivés chez Espace Pastel à Menzah 5.
            </p>
          </div>

          <button
            onClick={() => navigateTo({ type: 'shop', isNewOnly: true })}
            className="text-xs font-bold text-[#0B1833] hover:text-[#8FD8C3] flex items-center gap-1.5 transition-colors self-start md:self-auto group cursor-pointer"
          >
            <span>VOIR TOUTES LES NOUVEAUTÉS</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 4-Columns Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>


      {/* 7. NOUVELLE SECTION PRO : CHIFFRES CLÉS & ENGAGEMENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-[#0B1833] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-white/10"
        >
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8FD8C3]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F4A9C8]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="px-3 py-1 rounded-full bg-[#8FD8C3]/20 text-[#8FD8C3] text-xs font-black uppercase tracking-wider inline-block">
                Pourquoi Nous Faire Confiance ?
              </span>
              <h2 className="font-sans font-black text-2xl sm:text-4xl text-white tracking-tight">
                L'ENGAGEMENT ESPACE PASTEL
              </h2>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Une librairie-papeterie moderne alliant proximité locale, conseils d'experts et service e-commerce irréprochable.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center space-y-2 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#8FD8C3]/20 text-[#8FD8C3] flex items-center justify-center mx-auto">
                  <Users className="w-5 h-5" />
                </div>
                <div className="font-sans font-black text-3xl sm:text-4xl text-white">
                  +15K
                </div>
                <div className="text-xs font-bold text-white/90">Clients Satisfaits</div>
                <p className="text-[11px] text-white/60">Élèves, étudiants et professionnels fidèles</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center space-y-2 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#F4A9C8]/20 text-[#F4A9C8] flex items-center justify-center mx-auto">
                  <Award className="w-5 h-5" />
                </div>
                <div className="font-sans font-black text-3xl sm:text-4xl text-[#F4A9C8]">
                  100%
                </div>
                <div className="text-xs font-bold text-white/90">Articles Authentiques</div>
                <p className="text-[11px] text-white/60">Grandes marques certifiées sans compromis</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center space-y-2 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#7DB9DD]/20 text-[#7DB9DD] flex items-center justify-center mx-auto">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="font-sans font-black text-3xl sm:text-4xl text-[#7DB9DD]">
                  24-48h
                </div>
                <div className="text-xs font-bold text-white/90">Livraison Express</div>
                <p className="text-[11px] text-white/60">Expédition rapide sur toute la Tunisie</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center space-y-2 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#F5E7A6]/20 text-[#F5E7A6] flex items-center justify-center mx-auto">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="font-sans font-black text-3xl sm:text-4xl text-[#F5E7A6]">
                  7/7
                </div>
                <div className="text-xs font-bold text-white/90">09h00 - 23h30</div>
                <p className="text-[11px] text-white/60">Ouvert toute la semaine à Menzah 5</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>


      {/* 8. CREATIVE SPOTLIGHT BANNER (BEAUX-ARTS & PAPETERIE FINE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-[#0B1833] via-[#152a54] to-[#1e3c78] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-white/10"
        >
          <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-[#B58BC5]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-[#8FD8C3]/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="px-3 py-1 rounded-full bg-[#B58BC5] text-white text-[10px] font-black uppercase tracking-wider inline-block shadow-sm">
              Atelier Créatif & Beaux-Arts
            </span>
            
            <h2 className="font-sans font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
              Exprimez votre créativité avec nos fournitures d'art
            </h2>
            
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Aquarelles fines, pinceaux de maître, carnets de croquis 200g et toiles 100% coton pour donner vie à toutes vos inspirations artistiques.
            </p>

            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigateTo({ type: 'brand', brandSlug: 'arts-peinture' })}
                className="bg-[#B58BC5] hover:bg-white text-[#0B1833] font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all inline-flex items-center gap-2 shadow-md cursor-pointer"
              >
                <span>Explorer l'univers Arts & Peinture</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>


      {/* 9. OFFRES DU MOMENT (PROMOTIONS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-[#F4A9C8] mb-1">
              Bons Plans
            </div>
            <h2 className="font-sans font-black text-2xl sm:text-4xl text-[#0B1833] tracking-tight">
              NOS OFFRES DU MOMENT
            </h2>
            <p className="text-sm text-[#0B1833]/70 mt-1">
              Profitez de réductions exclusives sur les indispensables de la papeterie et des fournitures.
            </p>
          </div>

          <button
            onClick={() => navigateTo({ type: 'shop', promoOnly: true })}
            className="text-xs font-bold text-[#0B1833] hover:text-[#F4A9C8] flex items-center gap-1.5 transition-colors self-start md:self-auto group cursor-pointer"
          >
            <span>VOIR TOUTES LES OFFRES</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 4-Columns Promo Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {promoProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>


      {/* 10. NOUVELLE SECTION PRO : SERVICES SCOLAIRES & ENTREPRISES (B2B / PACKS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/90 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8FD8C3]/20 text-[#0B1833] text-xs font-bold">
              <Gift className="w-3.5 h-3.5" />
              <span>Service Listes Scolaires & Fournitures Entreprises</span>
            </div>
            
            <h2 className="font-sans font-black text-2xl sm:text-3xl text-[#0B1833] tracking-tight">
              Gagnez du temps : Confiez-nous votre liste complète
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Parents d'élèves, écoles ou comités d'entreprises : envoyez-nous votre liste de fournitures et nous la préparons minutieusement avec les meilleures références, prête à être récupérée ou livrée chez vous.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-bold text-[#0B1833]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Devis personnalisé sous 2 heures</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Conditionnement soigné par élève</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Remises pour commandes groupées</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Facturation pro disponible</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#F7F7F8] p-6 rounded-2xl border border-gray-200 space-y-4 text-center">
            <h3 className="font-sans font-black text-lg text-[#0B1833]">
              Transmettez votre liste dès aujourd'hui
            </h3>
            <p className="text-xs text-gray-500">
              Contactez directement notre responsable papeterie par WhatsApp ou téléphone.
            </p>

            <div className="space-y-2.5">
              <a
                href="https://wa.me/21698137585?text=Bonjour%20Espace%20Pastel,%20je%20souhaite%20un%20devis%20pour%20une%20liste%20scolaire%20ou%20fournitures."
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <span>Envoyer ma liste sur WhatsApp</span>
              </a>

              <a
                href="tel:98137585"
                className="w-full py-3 px-4 rounded-xl bg-[#0B1833] hover:bg-[#8FD8C3] hover:text-[#0B1833] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Appeler le 98 137 585</span>
              </a>
            </div>
          </div>
        </motion.div>
      </section>


      {/* 11. TÉMOIGNAGES & AVIS CLIENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="text-xs font-extrabold uppercase tracking-widest text-[#8FD8C3] mb-1">
            Témoignages Vérifiés
          </div>
          <h2 className="font-sans font-black text-2xl sm:text-3xl text-[#0B1833] tracking-tight">
            ILS PARLENT DE NOUS
          </h2>
          <p className="text-xs sm:text-sm text-[#0B1833]/70 mt-1">
            Découvrez les retours de nos clients passionnés de lecture, d'écriture et de création à Tunis.
          </p>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {approvedReviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
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
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#8FD8C3]/30 flex items-center justify-center text-[10px] font-bold text-[#0B1833]">
                    {review.customerName.charAt(0)}
                  </div>
                  <span className="font-sans font-bold text-xs text-[#0B1833]">
                    {review.customerName}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  ✓ Vérifié
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>


      {/* 12. NOUVELLE SECTION PRO : QUESTIONS FRÉQUENTES (FAQ ACCORDION) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#B58BC5]">
            Besoin d'aide ?
          </span>
          <h2 className="font-sans font-black text-2xl sm:text-3xl text-[#0B1833] tracking-tight">
            QUESTIONS FRÉQUENTES
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Toutes les réponses à vos questions concernant nos produits, commandes et livraisons.
          </p>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-sans font-bold text-sm text-[#0B1833] hover:text-[#B58BC5] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-[#8FD8C3] flex-shrink-0" />
                    <span>{item.q}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-[#0B1833]' : ''}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>


      {/* 13. NOUVELLE SECTION PRO : CLUB PRIVILÈGE & NEWSLETTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#8FD8C3]/20 via-white to-[#F4A9C8]/20 rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-sm text-center max-w-3xl mx-auto space-y-6"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#0B1833] text-[#8FD8C3] flex items-center justify-center mx-auto shadow-md">
            <Send className="w-5 h-5" />
          </div>

          <div className="space-y-2">
            <h2 className="font-sans font-black text-2xl sm:text-3xl text-[#0B1833] tracking-tight">
              Rejoignez le Club Privilège Espace Pastel
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
              Recevez en avant-première nos offres exclusives, nouveautés rentrée et conseils artistiques.
            </p>
          </div>

          {newsletterSubscribed ? (
            <div className="p-4 bg-emerald-100 text-emerald-800 rounded-2xl text-xs font-bold inline-flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Merci pour votre inscription ! Vos avantages sont activés.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Votre adresse email..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#0B1833] shadow-xs"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#0B1833] hover:bg-[#8FD8C3] hover:text-[#0B1833] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
              >
                S'inscrire
              </button>
            </form>
          )}

          <p className="text-[11px] text-gray-400">
            🔒 Pas de spam. Désinscription possible à tout moment.
          </p>
        </motion.div>
      </section>


      {/* 14. STORE LOCATION TEASER (MENZAH 5, TUNIS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8"
        >
          <div className="space-y-3 max-w-lg">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B1833] bg-[#8FD8C3]/30 px-3 py-1 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-[#0B1833]" />
              <span>Boutique Physique à Tunis</span>
            </div>
            
            <h3 className="font-sans font-black text-2xl text-[#0B1833] tracking-tight">
              Venez nous rendre visite à Menzah 5
            </h3>
            
            <p className="text-xs text-[#0B1833]/70 leading-relaxed">
              Retrouvez l'expérience Espace Pastel au <strong>23 Rue de la Liberté, Menzah 5, Tunis</strong>. Notre équipe vous accueille 7j/7 de 09h00 à 23h30 pour vous conseiller sur vos fournitures et projets créatifs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="tel:98137585"
              className="bg-[#0B1833] hover:bg-[#8FD8C3] hover:text-[#0B1833] text-white text-xs font-bold px-6 py-3.5 rounded-xl transition-all inline-flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Appeler le 98 137 585</span>
            </a>

            <button
              onClick={() => navigateTo({ type: 'contact' })}
              className="bg-[#F7F7F8] hover:bg-gray-200 text-[#0B1833] text-xs font-bold px-6 py-3.5 rounded-xl transition-all cursor-pointer"
            >
              Voir le plan d'accès & horaires
            </button>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

