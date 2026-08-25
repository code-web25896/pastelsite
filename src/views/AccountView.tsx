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
  Edit3
} from 'lucide-react';
import { Order } from '../types';

interface AccountViewProps {
  initialTab?: 'orders' | 'wishlist' | 'profile';
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
    addToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile'>(initialTab);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Profile Edit State
  const [firstName, setFirstName] = useState(currentUser?.firstName || 'Amira');
  const [lastName, setLastName] = useState(currentUser?.lastName || 'Ben Salem');
  const [phone, setPhone] = useState(currentUser?.phone || '55 542 000');
  const [address, setAddress] = useState(currentUser?.address || '23 Rue de la Liberté, Menzah 5');
  const [city, setCity] = useState(currentUser?.city || 'Tunis');

  // Wishlist products
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  // User's orders (or all demo orders if logged in)
  const userOrders = currentUser 
    ? orders.filter(o => o.customer.email.toLowerCase() === currentUser.email.toLowerCase() || currentUser.role === 'admin')
    : orders;

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
                <span>Enregistrer les modifications</span>
              </button>
            </form>
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
                      <div className="text-[11px] text-gray-500">{formatPrice(item.price)} × {item.quantity}</div>
                    </div>
                  </div>
                  <span className="font-bold text-[#0B1833]">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-gray-100 flex justify-between font-sans font-black text-base text-[#0B1833]">
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

