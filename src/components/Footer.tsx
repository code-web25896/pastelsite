import React from 'react';
import { useStore } from '../context/StoreContext';
import { Logo } from './Logo';
import { 
  Phone, 
  MapPin, 
  Mail, 
  Clock, 
  Instagram, 
  Facebook, 
  Truck, 
  ShieldCheck, 
  RotateCcw,
  Headphones
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, brands } = useStore();

  return (
    <footer className="bg-[#0B1833] text-white pt-16 pb-12 border-t border-white/10 relative overflow-hidden">
      {/* Subtle background ambient pastel accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#8FD8C3]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F4A9C8]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Feature Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-white/10">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#8FD8C3] flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-sans">Livraison Rapide</h4>
              <p className="text-xs text-white/60 mt-0.5">Livraison gratuite a partir de 500 DT</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#F4A9C8] flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-sans">Produits Certifiés</h4>
              <p className="text-xs text-white/60 mt-0.5">Grandes marques originales</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#7DB9DD] flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-sans">Conseils d'Experts</h4>
              <p className="text-xs text-white/60 mt-0.5">Au 58 260 515 ou en magasin</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#F5E7A6] flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-sans">Paiement Flexible</h4>
              <p className="text-xs text-white/60 mt-0.5">À la livraison ou en boutique</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
          {/* Brand Presentation */}
          <div className="lg:col-span-2 space-y-4">
            <div onClick={() => navigateTo({ type: 'home' })}>
              <Logo colorMode="white" size="md" />
            </div>
            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              Espace Pastel est une librairie et papeterie dédiée à tous ceux qui aiment lire, apprendre, créer et partager. Retrouvez le meilleur du scolaire, du bureau et des beaux-arts.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8FD8C3] mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <button onClick={() => navigateTo({ type: 'home' })} className="hover:text-white transition-colors">
                  Accueil
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo({ type: 'shop' })} className="hover:text-white transition-colors">
                  Boutique en ligne
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo({ type: 'shop', promoOnly: true })} className="hover:text-white transition-colors text-[#F4A9C8]">
                  Offres & Promotions
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo({ type: 'about' })} className="hover:text-white transition-colors">
                  À propos d'Espace Pastel
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo({ type: 'contact' })} className="hover:text-white transition-colors">
                  Contact & Horaires
                </button>
              </li>
            </ul>
          </div>

          {/* Nos Marques */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#B58BC5] mb-4">
              Nos Marques
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              {brands.map(brand => (
                <li key={brand.id}>
                  <button 
                    onClick={() => navigateTo({ type: 'brand', brandSlug: brand.slug })}
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span>{brand.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Boutique */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5E7A6] mb-4">
              Boutique Menzah 5
            </h4>
            <div className="space-y-3 text-xs text-white/70">
              <a href="tel:58260515" className="flex items-center gap-2 hover:text-[#8FD8C3] transition-colors font-medium">
                <Phone className="w-4 h-4 text-[#8FD8C3] flex-shrink-0" />
                <span>58 260 515</span>
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F4A9C8] flex-shrink-0 mt-0.5" />
                <span>23 Rue de la Liberté, Menzah 5, Tunis</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#7DB9DD] flex-shrink-0" />
                <span>7/7 : 08h30 - 22h30</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#B58BC5] flex-shrink-0" />
                <span>contact@espacepastel.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} ESPACE PASTEL - Tous droits réservés. Boutique e-commerce tunisienne.</p>
          <div className="flex items-center gap-4">
            <span className="text-white/70 font-medium">Moyens de paiement acceptés :</span>
            <span className="px-2 py-0.5 bg-white/10 rounded text-[11px] text-white">Espèces à la livraison</span>
            <span className="px-2 py-0.5 bg-white/10 rounded text-[11px] text-white">Carte Bancaire (GIM-TEL)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

