import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle, 
  ShoppingBag, 
  ArrowRight,
  Shield,
  Phone,
  Mail,
  Edit3,
  Award,
  Gift,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  Trophy
} from 'lucide-react';
import { Order } from '../types';

interface AccountViewProps {
  initialTab?: 'orders' | 'wishlist' | 'profile' | 'points';
}

export const AccountView: React.FC<AccountViewProps> = ({ initialTab = 'orders' }) => {
  const { 
    currentUser, 
    setCurrentUser, 
    orders, 
    wishlist, 
    products, 
    formatPrice, 
    navigateTo,
    logout,
    addToast,
    updateClientPassword
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile' | 'points'>(initialTab);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Profile Edit State
  const [firstName, setFirstName] = useState(currentUser?.firstName || 'Amira');
  const [lastName, setLastName] = useState(currentUser?.lastName || 'Ben Salem');
  const [phone, setPhone] = useState(currentUser?.phone || '+216 58 260 515');
  const [address, setAddress] = useState(currentUser?.address || '23 Rue de la Liberté, Menzah 5');
  const [city, setCity] = useState(currentUser?.city || 'Tunis');

  // Wishlist products
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  // User's orders (or all demo orders if logged in)
  const userOrders = currentUser 
    ? orders.filter(o => o.customer.email.toLowerCase() === currentUser.email.toLowerCase() || currentUser.role === 'admin')
    : orders;

  // Calcul du programme de fidélité (10 pts par commande livrée)
  const deliveredOrders = userOrders.filter(o => o.status === 'delivered');
  const totalPoints = deliveredOrders.length * 10;
  const currentCyclePoints = totalPoints % 100;
  const giftsUnlocked = Math.floor(totalPoints / 100);
  const pointsToNextGift = currentCyclePoints === 0 && totalPoints > 0 ? 0 : 100 - currentCyclePoints;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      addToast('Veuillez saisir votre nouveau mot de passe.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      addToast('Le mot de passe doit contenir au moins 8 caractères.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Les mots de passe ne correspondent pas.', 'error');
      return;
    }
    setPasswordLoading(true);
    try {
      await updateClientPassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      // Toast géré dans updateClientPassword
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        firstName,
        lastName,
        phone,
        address,
        city
      });
      addToast('Profil mis à jour avec succès !', 'success');
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> En attente</span>;
      case 'processing':
      case 'preparing':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Package className="w-3 h-3" /> En préparation</span>;
      case 'shipped':
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Truck className="w-3 h-3" /> En cours de livraison</span>;
      case 'delivered':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Livrée</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" /> Annulée</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* 17. COMPTE CLIENT HEADER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0B1833] text-white flex items-center justify-center font-sans font-black text-2xl shadow-md">
            {currentUser ? currentUser.firstName.charAt(0) : 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-sans font-black text-xl sm:text-2xl text-[#0B1833]">
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Espace Client Pastel'}
              </h1>
              {currentUser?.role === 'admin' && (
                <span className="bg-[#8FD8C3] text-[#0B1833] text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {currentUser ? currentUser.email : 'amira.b@outlook.com'} • Membre Espace Pastel
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => navigateTo({ type: 'admin' })}
              className="bg-[#8FD8C3] hover:bg-[#7bc7b2] text-[#0B1833] font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs"
            >
              Panneau d'administration
            </button>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all border border-red-200 shadow-xs cursor-pointer"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>

      {/* Grid Tabs layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar (3 cols) */}
        <aside className="lg:col-span-3 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${activeTab === 'orders' ? 'bg-[#0B1833] text-white' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4" />
              <span>Mes Commandes</span>
            </div>
            <span className="text-[11px] opacity-70">({userOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${activeTab === 'wishlist' ? 'bg-[#0B1833] text-white' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-[#F4A9C8]" />
              <span>Mes Favoris</span>
            </div>
            <span className="text-[11px] opacity-70">({wishlist.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('points')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${activeTab === 'points' ? 'bg-[#0B1833] text-white shadow-sm' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-[#8FD8C3]" />
              <span>Mes Points Fidélité</span>
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-colors ${activeTab === 'points' ? 'bg-[#8FD8C3] text-[#0B1833]' : 'bg-[#8FD8C3]/20 text-emerald-800'}`}>
              ${totalPoints} pts
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${activeTab === 'profile' ? 'bg-[#0B1833] text-white' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4" />
              <span>Mes Coordonnées</span>
            </div>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Déconnexion</span>
          </button>
        </aside>

        {/* Main Tab Panel (9 cols) */}
        <div className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
          
          {/* 1. ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h2 className="font-sans font-black text-xl text-[#0B1833]">
                  Historique de vos commandes
                </h2>
                <span className="text-xs text-gray-500">{userOrders.length} commande{userOrders.length > 1 ? 's' : ''}</span>
              </div>

              {userOrders.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Package className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-500">Vous n'avez pas encore passé de commande.</p>
                  <button
                    onClick={() => navigateTo({ type: 'shop' })}
                    className="bg-[#0B1833] text-white text-xs font-bold px-5 py-2.5 rounded-full"
                  >
                    Découvrir la boutique
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map(order => (
                    <div 
                      key={order.id}
                      className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-[#F7F7F8]/50 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200/60">
                        <div>
                          <span className="font-sans font-black text-sm text-[#0B1833] block">
                            Commande #{order.orderNumber}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            Passée le {new Date(order.createdAt).toLocaleDateString('fr-TN')}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(order.status)}
                          <span className="font-sans font-black text-sm text-[#0B1833]">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>

                      {/* Items thumbnails */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-x-auto py-1">
                          {order.items.map((item, idx) => (
                            <img
                              key={idx}
                              src={item.image}
                              alt={item.productName}
                              title={`${item.productName} (×${item.quantity})`}
                              className="w-12 h-12 object-cover rounded-xl border border-gray-200 bg-white"
                            />
                          ))}
                        </div>

                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-xs font-bold text-[#0B1833] hover:text-[#B58BC5] flex items-center gap-1 ml-4 whitespace-nowrap"
                        >
                          <span>Détails</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h2 className="font-sans font-black text-xl text-[#0B1833]">
                  Mes Coups de CCœur & Favoris
                </h2>
                <span className="text-xs text-gray-500">{wishlistProducts.length} article{wishlistProducts.length > 1 ? 's' : ''}</span>
              </div>

              {wishlistProducts.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-500">Aucun produit dans vos favoris pour le moment.</p>
                  <button
                    onClick={() => navigateTo({ type: 'shop' })}
                    className="bg-[#0B1833] text-white text-xs font-bold px-5 py-2.5 rounded-full"
                  >
                    Explorer la boutique
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                  {wishlistProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
              <div className="pb-4 border-b border-gray-100">
                <h2 className="font-sans font-black text-xl text-[#0B1833]">
                  Mes informations personnelles
                </h2>
                <p className="text-xs text-gray-500">
                  Gérez vos adresses de livraison par défaut en Tunisie.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1833] mb-1">Prénom</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0B1833]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1833] mb-1">Nom</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0B1833]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1833] mb-1">Téléphone de contact</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0B1833]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1833] mb-1">Adresse de livraison</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0B1833]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1833] mb-1">Ville / Région</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0B1833]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-[#0B1833] hover:bg-[#8FD8C3] hover:text-[#0B1833] text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all flex items-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Enregistrer les coordonnées</span>
              </button>
            </form>

            {/* Section Modification de mot de passe */}
            <div className="pt-8 border-t border-gray-100 max-w-xl">
              <form onSubmit={handlePasswordChange} className="space-y-4 bg-[#F7F7F8] p-5 sm:p-6 rounded-2xl border border-gray-200/80">
                <div className="flex items-center gap-2.5 text-[#0B1833]">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-xs border border-gray-200/60">
                    <KeyRound className="w-4 h-4 text-[#0B1833]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-sm text-[#0B1833]">Modifier mon mot de passe</h3>
                    <p className="text-[11px] text-gray-500">Saisissez votre nouveau mot de passe (8 caractères minimum).</p>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1833] mb-1">Nouveau mot de passe</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        minLength={8}
                        required
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 pr-10 text-xs focus:outline-none focus:border-[#0B1833]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        title={showPassword ? 'Masquer' : 'Afficher'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0B1833] mb-1">Confirmer le nouveau mot de passe</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={8}
                      required
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0B1833]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-[#0B1833] hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{passwordLoading ? 'Mise à jour en cours...' : 'Changer mon mot de passe'}</span>
                </button>
              </form>
            </div>
            </div>
          )}

          {/* 4. FIDELITY POINTS TAB */}
          {activeTab === 'points' && (
            <div className="space-y-8">
              <div className="pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-sans font-black text-xl text-[#0B1833]">
                      Mon Programme Fidélité
                    </h2>
                    <span className="bg-[#8FD8C3] text-[#0B1833] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                      Pastel Club
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Gagnez 10 points par commande livrée. Tous les 100 points = un cadeau surprise joint à votre commande !
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-2xl text-xs font-bold text-amber-900">
                  <Gift className="w-4 h-4 text-amber-600" />
                  <span>{giftsUnlocked} cadeau{giftsUnlocked > 1 ? 'x' : ''} débloqué{giftsUnlocked > 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Main Gauge & Overview Card */}
              <div className="bg-gradient-to-br from-[#0B1833] to-[#162a52] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#8FD8C3]/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#F4A9C8]/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  
                  {/* Circular Points Wheel (5 cols) */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center">
                    <div className="relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 200 200">
                        <defs>
                          <linearGradient id="pointsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8FD8C3" />
                            <stop offset="35%" stopColor="#F5E7A6" />
                            <stop offset="70%" stopColor="#F4A9C8" />
                            <stop offset="100%" stopColor="#B58BC5" />
                          </linearGradient>
                        </defs>
                        {/* Background track circle */}
                        <circle
                          cx="100"
                          cy="100"
                          r="82"
                          stroke="rgba(255, 255, 255, 0.12)"
                          strokeWidth="14"
                          fill="transparent"
                        />
                        {/* Animated gradient progress circle */}
                        <circle
                          cx="100"
                          cy="100"
                          r="82"
                          stroke="url(#pointsGradient)"
                          strokeWidth="14"
                          strokeDasharray={515.22}
                          strokeDashoffset={515.22 - (515.22 * (currentCyclePoints || 0)) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                        />
                      </svg>

                      {/* Center Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                        <Trophy className="w-5 h-5 text-[#F5E7A6] mb-1" />
                        <div className="font-sans font-black text-3xl sm:text-4xl tracking-tight text-white">
                          {currentCyclePoints}
                        </div>
                        <div className="text-[11px] font-bold uppercase tracking-widest text-[#8FD8C3]">
                          / 100 pts
                        </div>
                        <span className="text-[10px] text-gray-300 mt-0.5">
                          Roue du palier
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8FD8C3] bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                        <Sparkles className="w-3 h-3 text-[#F5E7A6]" />
                        {totalPoints} points cumulés au total
                      </span>
                    </div>
                  </div>

                  {/* Information & Next Gift Milestone (7 cols) */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-[#8FD8C3] uppercase tracking-wider">
                        Palier cadeau en cours
                      </span>
                      <h3 className="font-sans font-black text-2xl text-white">
                        {currentCyclePoints >= 100 || (giftsUnlocked > 0 && currentCyclePoints === 0)
                          ? '🎉 Palier de 100 points atteint !'
                          : `Plus que ${pointsToNextGift} points pour votre cadeau`}
                      </h3>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        Chaque commande livrée vous crédite de <strong>+10 points</strong>. Dès que votre roue atteint <strong>100 points</strong>, un cadeau exclusif Espace Pastel est automatiquement joint à votre prochaine commande.
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-300">Progression vers le cadeau</span>
                        <span className="text-[#8FD8C3]">{currentCyclePoints} / 100 pts</span>
                      </div>
                      <div className="w-full bg-white/15 h-3 rounded-full overflow-hidden p-0.5">
                        <div
                          className="bg-gradient-to-r from-[#8FD8C3] via-[#F5E7A6] to-[#F4A9C8] h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, Math.max(5, currentCyclePoints))}%` }}
                        />
                      </div>
                    </div>

                    {/* Cadeau status pill */}
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm flex items-start gap-3">
                      <Gift className="w-5 h-5 text-[#F4A9C8] flex-shrink-0 mt-0.5" />
                      <div className="text-xs space-y-0.5">
                        <div className="font-bold text-white">
                          {giftsUnlocked > 0
                            ? `${giftsUnlocked} cadeau(x) débloqué(s) avec vos commandes !`
                            : 'Aucun cadeau débloqué pour le moment.'}
                        </div>
                        <div className="text-[11px] text-gray-300">
                          {giftsUnlocked > 0
                            ? 'Votre cadeau surprise sera glissé dans le colis de votre prochaine commande Espace Pastel.'
                            : `Il vous reste ${Math.ceil(pointsToNextGift / 10)} commande(s) livrée(s) pour décrocher les 100 points.`}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* 3 Step Explanation Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#F7F7F8] p-5 rounded-2xl border border-gray-100 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                    10
                  </div>
                  <h4 className="font-sans font-bold text-xs text-[#0B1833] uppercase tracking-wide">
                    +10 Pts par commande
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Dès qu'une commande est marquée comme <strong>Livrée</strong>, vos points sont automatiquement crédités sur votre compte.
                  </p>
                </div>

                <div className="bg-[#F7F7F8] p-5 rounded-2xl border border-gray-100 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-sm">
                    100
                  </div>
                  <h4 className="font-sans font-bold text-xs text-[#0B1833] uppercase tracking-wide">
                    Roue de 0 à 100
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    La roue tourne de 0 à 100. Chaque palier de 100 points franchi valide un nouveau cadeau fidélité.
                  </p>
                </div>

                <div className="bg-[#F7F7F8] p-5 rounded-2xl border border-gray-100 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-black text-sm">
                    🎁
                  </div>
                  <h4 className="font-sans font-bold text-xs text-[#0B1833] uppercase tracking-wide">
                    Cadeau dans votre colis
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Un cadeau physique surprise (trousse, carnet d'art ou fourniture Pastel) est glissé avec votre commande.
                  </p>
                </div>
              </div>

              {/* Points History Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans font-bold text-sm text-[#0B1833]">
                    Historique des commandes créditées
                  </h3>
                  <span className="text-xs text-gray-500">
                    {deliveredOrders.length} commande{deliveredOrders.length > 1 ? 's' : ''} livrée{deliveredOrders.length > 1 ? 's' : ''}
                  </span>
                </div>

                {deliveredOrders.length === 0 ? (
                  <div className="bg-[#F7F7F8] p-8 rounded-2xl text-center space-y-2 border border-gray-100">
                    <Package className="w-8 h-8 text-gray-300 mx-auto" />
                    <p className="text-xs text-gray-600 font-semibold">
                      Vous n'avez pas encore de commande livrée.
                    </p>
                    <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                      Dès qu'une commande sera livrée à votre adresse, elle apparaîtra ici avec +10 points crédités !
                    </p>
                  </div>
                ) : (
                  <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F7F7F8] border-b border-gray-100 text-gray-500 font-bold">
                        <tr>
                          <th className="py-3 px-4">Commande</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Montant</th>
                          <th className="py-3 px-4 text-right">Points gagnés</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {deliveredOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="py-3 px-4 font-bold text-[#0B1833]">
                              #{o.orderNumber}
                            </td>
                            <td className="py-3 px-4 text-gray-500">
                              {new Date(o.createdAt).toLocaleDateString('fr-TN')}
                            </td>
                            <td className="py-3 px-4 font-semibold text-[#0B1833]">
                              {formatPrice(o.total)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="inline-flex items-center gap-1 font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-[11px]">
                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                +10 pts
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#0B1833]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-sans font-black text-lg text-[#0B1833]">
                  Commande #{selectedOrder.orderNumber}
                </h3>
                <span className="text-xs text-gray-500">
                  {new Date(selectedOrder.createdAt).toLocaleDateString('fr-TN')}
                </span>
              </div>
              {getStatusBadge(selectedOrder.status)}
            </div>

            {/* Customer & Address */}
            <div className="bg-[#F7F7F8] p-4 rounded-2xl text-xs space-y-1.5 text-[#0B1833]">
              <strong>Destinataire :</strong>
              <p>{selectedOrder.customer.firstName} {selectedOrder.customer.lastName} ({selectedOrder.customer.phone})</p>
              <p className="text-gray-500">{selectedOrder.customer.address}, {selectedOrder.customer.city}</p>
            </div>

            {/* Items */}
            <div className="space-y-3 max-h-56 overflow-y-auto">
              {selectedOrder.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-none">
                  <div className="flex items-center gap-2.5">
                    <img src={item.image} alt={item.productName} className="w-10 h-10 object-cover rounded-lg" />
                    <div>
                      <div className="font-bold text-[#0B1833] truncate max-w-[200px]">{item.productName}</div>
                      {item.selectedSize && (
                        <div className="text-[11px] text-gray-500">Taille : {item.selectedSize}</div>
                      )}
                      {item.selectedColor && (
                        <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: item.selectedColor.hex }} />
                          Couleur : {item.selectedColor.name}
                        </div>
                      )}
                      <div className="text-[11px] text-gray-500">{formatPrice(item.price)} × {item.quantity}</div>
                    </div>
                  </div>
                  <span className="font-bold text-[#0B1833]">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            {(selectedOrder.discountAmount || 0) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Code promo{selectedOrder.promoCode ? ` (${selectedOrder.promoCode})` : ''} :</span>
                <span className="font-bold">-{formatPrice(selectedOrder.discountAmount || 0)}</span>
              </div>
            )}            <div className="pt-3 border-t border-gray-100 flex justify-between font-sans font-black text-base text-[#0B1833]">
              <span>Total Réglé :</span>
              <span>{formatPrice(selectedOrder.total)}</span>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-3 bg-[#0B1833] text-white font-bold text-xs uppercase tracking-wider rounded-xl"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

