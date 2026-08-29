import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Truck, 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  BookOpen, 
  Palette, 
  Heart,
  Store,
  Award
} from 'lucide-react';

interface StaticPagesViewProps {
  page: 'about' | 'contact' | 'shipping' | 'legal';
}

export const StaticPagesView: React.FC<StaticPagesViewProps> = ({ page }) => {
  const { addToast, navigateTo } = useStore();

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSubject, setContactSubject] = useState('Renseignements généraux');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    addToast('Votre message a bien été envoyé ! Nous vous répondrons sous 24h.', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      
      {/* 28. PAGE À PROPOS */}
      {page === 'about' && (
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3.5 py-1.5 rounded-full bg-[#8FD8C3]/20 text-[#0B1833] text-xs font-black uppercase tracking-widest inline-block">
              NOTRE HISTOIRE
            </span>
            <h1 className="font-sans font-black text-3xl sm:text-5xl text-[#0B1833] tracking-tight">
              Bienvenue chez Espace Pastel
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              La référence tunisienne pour les passionnés de belle papeterie, de littérature, de fournitures scolaires d'excellence et de création artistique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="rounded-3xl overflow-hidden shadow-xl aspect-[4/3] bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=1000&q=80"
                alt="Boutique Espace Pastel"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#0B1833]/80 leading-relaxed">
              <h2 className="font-sans font-black text-2xl text-[#0B1833]">
                Notre Vision & Notre Engagement
              </h2>
              <p>
                Installé au cœur de Tunis au <strong>23 Rue de la Liberté, Menzah 5</strong>, <strong>Espace Pastel</strong> est né de la volonté d'offrir aux élèves, étudiants, artistes et professionnels des outils de qualité supérieure qui stimulent l'apprentissage et la créativité.
              </p>
              <p>
                Nous sélectionnons avec une rigueur absolue des marques de renommée internationale telles que <strong>BOMI</strong> pour nos cahiers et carnets premium, <strong>WAMA</strong> pour une écriture fluide et élégante, des fournitures scolaires ergonomiques et un rayon dédié aux <strong>Arts & Beaux-Arts</strong>.
              </p>
              <div className="pt-2 grid grid-cols-2 gap-4 text-xs font-bold text-[#0B1833]">
                <div className="p-3.5 rounded-2xl bg-[#F7F7F8] flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#F4A9C8]" />
                  <span>Passion du détail</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F7F7F8] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#8FD8C3]" />
                  <span>Produits certifiés</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 29. PAGE CONTACT */}
      {page === 'contact' && (
        <div className="space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#B58BC5]">
              NOUS CONTACTER
            </span>
            <h1 className="font-sans font-black text-3xl sm:text-4xl text-[#0B1833]">
              Une question ? Notre équipe est à votre écoute
            </h1>
            <p className="text-xs text-gray-500">
              N'hésitez pas à nous appeler directement ou à nous envoyer un message via le formulaire.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Contact Coordinates (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <h2 className="font-sans font-bold text-lg text-[#0B1833]">
                Coordonnées de la boutique
              </h2>

              <div className="space-y-4 text-xs text-[#0B1833]">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#8FD8C3]/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-[#0B1833]" />
                  </div>
                  <div>
                    <strong className="block text-sm">Adresse Physique</strong>
                    <span className="text-gray-600">23 Rue de la Liberté, Menzah 5, Tunis, Tunisie</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F4A9C8]/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-[#0B1833]" />
                  </div>
                  <div>
                    <strong className="block text-sm">Téléphone & WhatsApp</strong>
                    <div className="mt-1 space-y-1 text-[#0B1833] font-bold">
                      <a href="tel:98137585" className="block hover:underline">Pastel - 98 137 585</a>
                      <a href="tel:58260515" className="block hover:underline">Ines Pastel - 58 260 515</a>
                      <a href="tel:29299185" className="block hover:underline">29 299 185</a>
                      <a href="tel:5554200" className="block hover:underline">5554200</a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#7DB9DD]/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-[#0B1833]" />
                  </div>
                  <div>
                    <strong className="block text-sm">Email</strong>
                    <span className="text-gray-600">contact@espacepastel.com</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F5E7A6]/30 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-[#0B1833]" />
                  </div>
                  <div>
                    <strong className="block text-sm">Horaires d'ouverture</strong>
                    <p className="text-gray-600">7/7 : 08h30 - 22h30</p>
                    <p className="text-gray-600">Dimanche : 09h00 - 14h00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form (7 cols) */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h2 className="font-sans font-bold text-lg text-[#0B1833]">
                Envoyez-nous un message
              </h2>

              {contactSent ? (
                <div className="p-6 rounded-2xl bg-emerald-50 text-emerald-800 text-xs flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm font-bold block mb-1">Message transmis avec succès !</strong>
                    <span>Nous avons bien reçu votre demande et notre conseiller vous contactera au numéro <strong>{contactPhone || contactEmail}</strong> dans les plus brefs délais.</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Nom complet *</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Ex: Yassine K."
                        className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B1833]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="Ex: yassine@gmail.com"
                        className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B1833]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Téléphone tunisien</label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="98 137 585"
                        className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B1833]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Sujet de votre demande</label>
                      <select
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B1833]"
                      >
                        <option value="Renseignements généraux">Renseignements généraux</option>
                        <option value="Suivi de commande">Suivi de commande</option>
                        <option value="Disponibilité article">Disponibilité d'un article</option>
                        <option value="Devis fournitures scolaires">Devis fournitures scolaires</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Votre message *</label>
                    <textarea
                      rows={4}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Comment pouvons-nous vous aider ?"
                      className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-[#0B1833]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#0B1833] hover:bg-[#8FD8C3] hover:text-[#0B1833] text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer le message</span>
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 30. PAGE LIVRAISON & EXPÉDITIONS */}
      {page === 'shipping' && (
        <div className="space-y-8 bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-sm">
          <div className="space-y-2 pb-6 border-b border-gray-100">
            <span className="text-xs font-black uppercase tracking-widest text-[#8FD8C3]">
              POLITIQUE DE LIVRAISON
            </span>
            <h1 className="font-sans font-black text-2xl sm:text-3xl text-[#0B1833]">
              Livraisons et Délais en Tunisie
            </h1>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-[#0B1833]/80 leading-relaxed">
            <div>
              <h2 className="font-sans font-bold text-base text-[#0B1833] mb-2">
                1. Tarifs et Délais d'expédition
              </h2>
              <p>
                Nous expédions vos commandes sur l'ensemble du territoire tunisien grâce à nos partenaires de livraison rapide :
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Grand Tunis (Tunis, Ariana, Ben Arous, Manouba) :</strong> Livraison en 24h ouvrées. Tarif : 7,000 TND (Offert dès 500 DT d'achat).</li>
                <li><strong>Autres Gouvernorats (Sousse, Sfax, Nabeul, Bizerte, Monastir, Gabès...) :</strong> Livraison sous 24h à 48h. Tarif : 7,000 TND.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-sans font-bold text-base text-[#0B1833] mb-2">
                2. Retrait Gratuit en Magasin (Click & Collect)
              </h2>
              <p>
                Commandez en ligne et venez récupérer votre colis sans aucun frais supplémentaire à notre boutique située au <strong>23 Rue de la Liberté, Menzah 5, Tunis</strong>. Votre commande est préparée en moins de 2 heures.
              </p>
            </div>

            <div>
              <h2 className="font-sans font-bold text-base text-[#0B1833] mb-2">
                3. Suivi de votre colis
              </h2>
              <p>
                Dès l'expédition de votre commande, vous recevrez une notification par SMS ou appel téléphonique de notre livreur pour convenir de l'horaire précis de passage.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 31. MENTIONS LÉGALES & CONFIDENTIALITÉ */}
      {page === 'legal' && (
        <div className="space-y-8 bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-sm">
          <div className="space-y-2 pb-6 border-b border-gray-100">
            <span className="text-xs font-black uppercase tracking-widest text-[#B58BC5]">
              INFORMATIONS JURIDIQUES
            </span>
            <h1 className="font-sans font-black text-2xl sm:text-3xl text-[#0B1833]">
              Mentions Légales & Confidentialité
            </h1>
          </div>

          <div className="space-y-4 text-xs text-[#0B1833]/80 leading-relaxed">
            <p><strong>Éditeur du site :</strong> Librairie & Papeterie ESPACE PASTEL</p>
            <p><strong>Siège social :</strong> 23 Rue de la Liberté, Menzah 5, Tunis, Tunisie</p>
            <p><strong>Téléphone :</strong> +216 98 137 585</p>
            <p><strong>Directeur de la publication :</strong> Direction Espace Pastel</p>
            <p>
              Les données personnelles collectées lors de la commande ou de l'inscription sont strictement réservées au traitement de vos commandes et ne sont en aucun cas transmises à des tiers sans votre accord explicite.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

