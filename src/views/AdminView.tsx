import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Brand, SubCategory, Order, Review } from '../types';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Layers, 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Eye, 
  ArrowLeft,
  X,
  Save,
  Tag
} from 'lucide-react';

const readImageFile = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

export const AdminView: React.FC = () => {
  const { 
    products, 
    brands, 
    subCategories, 
    orders, 
    reviews, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    addBrand,
    addSubCategory,
    updateOrderStatus, 
    formatPrice,
    navigateTo,
    addToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'brands' | 'reviews'>('dashboard');

  // Search & Filter in Admin
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Modals & Form States
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [isAddSubCategoryOpen, setIsAddSubCategoryOpen] = useState(false);
  const [selectedBrandForSubCat, setSelectedBrandForSubCat] = useState<string>(brands[0].id || '');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const tabClass = (tab: 'dashboard' | 'products' | 'orders' | 'brands' | 'reviews') => {
    if (activeTab === tab) return 'px-4 py-3 rounded-t-2xl flex items-center gap-2 transition-all bg-white border-t-2 border-[#0B1833] text-[#0B1833] shadow-sm';
    return 'px-4 py-3 rounded-t-2xl flex items-center gap-2 transition-all text-gray-500 hover:text-[#0B1833]';
  };

  const stockBadgeClass = (stock: number) => {
    if (stock <= 5) return 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800';
    return 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800';
  };

  const reviewBadgeClass = (status: Review['status']) => {
    if (status === 'approved') return 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800';
    if (status === 'rejected') return 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800';
    return 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800';
  };

  // New Product Form state
  const [pName, setPName] = useState('');
  const [pSku, setPSku] = useState('');
  const [pBrandId, setPBrandId] = useState(brands[0].id || '');
  const [pSubCatId, setPSubCatId] = useState(subCategories[0].id || '');
  const [pCategory, setPCategory] = useState('Papeterie');
  const [pPrice, setPPrice] = useState('12.500');
  const [pPromoPrice, setPPromoPrice] = useState('');
  const [pStock, setPStock] = useState('20');
  const [pImage, setPImage] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8cauto=format&fit=crop&w=600&q=80');
  const [pShortDesc, setPShortDesc] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pBadge, setPBadge] = useState<Product['badge']>('AUCUN');
  const [pIsNew, setPIsNew] = useState(true);

  // New Brand Form state
  const [bName, setBName] = useState('');
  const [bSlug, setBSlug] = useState('');
  const [bDesc, setBDesc] = useState('');
  const [bColor, setBColor] = useState('#8FD8C3');
  const [bLogo, setBLogo] = useState('');
  const [bBanner, setBBanner] = useState('https://images.unsplash.com/photo-1516962215378-7fa2e137ae93auto=format&fit=crop&w=800&q=80');

  // New SubCategory Form state
  const [scName, setScName] = useState('');
  const [scSlug, setScSlug] = useState('');
  const [scDesc, setScDesc] = useState('');
  const [scImage, setScImage] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8cauto=format&fit=crop&w=400&q=80');

  // Stats Calculations
  const totalRevenue = orders.reduce((sum, o) => {
    if (o.status !== 'cancelled') return sum + o.total;
    return sum;
  }, 0);
  const lowStockCount = products.filter(p => p.stock <= 5).length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const pendingReviewsCount = reviews.filter(r => r.status === 'pending').length;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pSku) return;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: pName,
        sku: pSku,
        brandId: pBrandId,
        subCategoryId: pSubCatId,
        category: pCategory,
        price: parseFloat(pPrice) || 0,
        promoPrice: (pPromoPrice && parseFloat(pPromoPrice)) || undefined,
        stock: parseInt(pStock) || 0,
        images: [pImage],
        shortDescription: pShortDesc || pName,
        description: pDesc || pShortDesc || pName,
        badge: pBadge,
        isNew: pIsNew,
        isPromo: Boolean(pPromoPrice)
      });
      addToast('Produit mis à jour avec succès !', 'success');
      setEditingProduct(null);
    } else {
      addProduct({
        name: pName,
        slug: pName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        sku: pSku,
        brandId: pBrandId,
        subCategoryId: pSubCatId,
        category: pCategory,
        price: parseFloat(pPrice) || 0,
        promoPrice: (pPromoPrice && parseFloat(pPromoPrice)) || undefined,
        stock: parseInt(pStock) || 0,
        images: [pImage],
        shortDescription: pShortDesc || pName,
        description: pDesc || pShortDesc || pName,
        features: ['Qualité certifiée Espace Pastel', 'Usage scolaire et professionnel'],
        rating: 5.0,
        reviewCount: 0,
        isNew: pIsNew,
        isBestSeller: false,
        isPromo: Boolean(pPromoPrice),
        badge: pBadge,
        status: 'published'
      });
      addToast('Nouveau produit ajouté au catalogue !', 'success');
    }

    setIsAddProductOpen(false);
    resetProductForm();
  };

  const resetProductForm = () => {
    setPName('');
    setPSku('');
    setPPrice('12.500');
    setPPromoPrice('');
    setPStock('20');
    setPShortDesc('');
    setPDesc('');
    setPBadge('AUCUN');
    setPIsNew(true);
    setEditingProduct(null);
  };

  const handleEditProductClick = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPSku(prod.sku);
    setPBrandId(prod.brandId);
    setPSubCatId(prod.subCategoryId);
    setPCategory(prod.category);
    setPPrice(prod.price.toString());
    if (prod.promoPrice) setPPromoPrice(prod.promoPrice.toString());
    else setPPromoPrice('');
    setPStock(prod.stock.toString());
    setPImage(prod.images[0] || '');
    setPShortDesc(prod.shortDescription);
    setPDesc(prod.description);
    setPBadge(prod.badge || 'AUCUN');
    setPIsNew(prod.isNew || false);
    setIsAddProductOpen(true);
  };

  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName) return;

    addBrand({
      name: bName,
      slug: bSlug || bName.toLowerCase().replace(/\s+/g, '-'),
      description: bDesc,
      accentColor: bColor,
      logoUrl: bLogo || bBanner,
      bannerUrl: bBanner
    });

    addToast(`Marque ${bName} créée avec succès !`, 'success');
    setIsAddBrandOpen(false);
    setBName('');
    setBSlug('');
    setBDesc('');
  };

  const handleCreateSubCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scName || !selectedBrandForSubCat) return;

    addSubCategory({
      brandId: selectedBrandForSubCat,
      name: scName,
      slug: scSlug || scName.toLowerCase().replace(/\s+/g, '-'),
      description: scDesc,
      imageUrl: scImage
    });

    addToast(`Sous-catégorie ${scName} ajoutée !`, 'success');
    setIsAddSubCategoryOpen(false);
    setScName('');
    setScSlug('');
    setScDesc('');
  };

  // Filtered Products
  const adminFilteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Filtered Orders
  const adminFilteredOrders = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customer.firstName.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customer.lastName.toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 19. ADMIN BACKOFFICE HEADER */}
      <div className="bg-[#0B1833] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#8FD8C3] text-xs font-bold uppercase tracking-wider">
            <span>Administration Espace Pastel</span>
          </div>
          <h1 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-white tracking-tight">
            PANNEAU DE GESTION & BACKOFFICE
          </h1>
          <p className="text-xs text-white/70">
            Gestion des stocks, commandes, marques, sous-catégories et modération des avis.
          </p>
        </div>

        <button
          onClick={() => navigateTo({ type: 'home' })}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voir la boutique publique</span>
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={tabClass('dashboard')}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Tableau de Bord</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={tabClass('products')}
        >
          <Package className="w-4 h-4" />
          <span>Catalogue Produits ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={tabClass('orders')}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Commandes ({orders.length})</span>
          {pendingOrdersCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('brands')}
          className={tabClass('brands')}
        >
          <Layers className="w-4 h-4" />
          <span>Marques & Sous-catégories</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={tabClass('reviews')}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Modération Avis ({reviews.length})</span>
          {pendingReviewsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500" />
          )}
        </button>
      </div>

      {/* 1. DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Key KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span>Chiffre d'Affaires</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-['Outfit'] font-black text-2xl text-[#0B1833]">
                {formatPrice(totalRevenue)}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">Toutes commandes confondues</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span>Commandes en attente</span>
                <ShoppingBag className="w-4 h-4 text-amber-500" />
              </div>
              <div className="font-['Outfit'] font-black text-2xl text-[#0B1833]">
                {pendingOrdersCount}
              </div>
              <span className="text-[11px] text-amber-600 font-semibold">À préparer rapidement</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span>Produits au catalogue</span>
                <Package className="w-4 h-4 text-[#8FD8C3]" />
              </div>
              <div className="font-['Outfit'] font-black text-2xl text-[#0B1833]">
                {products.length}
              </div>
              <span className="text-[11px] text-gray-500 font-semibold">Sur 4 marques principales</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span>Alertes Stock Faible</span>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div className="font-['Outfit'] font-black text-2xl text-[#0B1833]">
                {lowStockCount}
              </div>
              <span className="text-[11px] text-red-600 font-semibold">Stock ≤ 5 unités</span>
            </div>
          </div>

          {/* Quick Actions & Recent Orders Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h2 className="font-['Outfit'] font-bold text-base text-[#0B1833]">
                Dernières Commandes Reçues
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-semibold pb-2">
                      <th className="py-2">Commande</th>
                      <th className="py-2">Client</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Montant</th>
                      <th className="py-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id} className="hover:bg-gray-50/50">
                        <td className="py-3 font-bold text-[#0B1833]">#{o.orderNumber}</td>
                        <td className="py-3">{o.customer.firstName} {o.customer.lastName}</td>
                        <td className="py-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString('fr-TN')}</td>
                        <td className="py-3 font-bold">{formatPrice(o.total)}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800">
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h2 className="font-['Outfit'] font-bold text-base text-[#0B1833]">
                Raccourcis Rapides
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    resetProductForm();
                    setIsAddProductOpen(true);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#0B1833] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#8FD8C3] hover:text-[#0B1833] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un produit</span>
                </button>

                <button
                  onClick={() => setIsAddBrandOpen(true)}
                  className="w-full py-3 px-4 rounded-xl bg-[#F7F7F8] hover:bg-gray-200 text-[#0B1833] font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une marque</span>
                </button>

                <button
                  onClick={() => setIsAddSubCategoryOpen(true)}
                  className="w-full py-3 px-4 rounded-xl bg-[#F7F7F8] hover:bg-gray-200 text-[#0B1833] font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une sous-catégorie</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Rechercher par nom ou SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#0B1833]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <button
              onClick={() => {
                resetProductForm();
                setIsAddProductOpen(true);
              }}
              className="bg-[#0B1833] hover:bg-[#8FD8C3] hover:text-[#0B1833] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau produit</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                  <th className="py-3">Image</th>
                  <th className="py-3">SKU</th>
                  <th className="py-3">Nom du produit</th>
                  <th className="py-3">Marque</th>
                  <th className="py-3">Prix</th>
                  <th className="py-3">Stock</th>
                  <th className="py-3">Statut</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {adminFilteredProducts.map(p => {
                  const b = brands.find(x => x.id === p.brandId);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="py-3">
                        <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-gray-100" />
                      </td>
                      <td className="py-3 font-mono text-[11px] text-gray-500">{p.sku}</td>
                      <td className="py-3 font-bold text-[#0B1833] max-w-[200px] truncate">{p.name}</td>
                      <td className="py-3">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          {b.name || p.brandId}
                        </span>
                      </td>
                      <td className="py-3 font-bold">
                        {formatPrice(p.promoPrice || p.price)}
                        {p.promoPrice && <span className="block text-[10px] text-red-500 line-through">{formatPrice(p.price)}</span>}
                      </td>
                      <td className="py-3">
                        <span className={stockBadgeClass(p.stock)}>
                          {p.stock} un.
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditProductClick(p)}
                            className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg"
                            title="Modifier"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Supprimer ${p.name} `)) {
                                deleteProduct(p.id);
                                addToast('Produit supprimé', 'info');
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm w-full">
              <input
                type="text"
                placeholder="Rechercher numéro ou client..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#0B1833]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                  <th className="py-3">N° Commande</th>
                  <th className="py-3">Client</th>
                  <th className="py-3">Téléphone</th>
                  <th className="py-3">Ville</th>
                  <th className="py-3">Total</th>
                  <th className="py-3">Changer le statut</th>
                  <th className="py-3 text-right">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {adminFilteredOrders.map(ord => (
                  <tr key={ord.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-bold font-mono text-[#0B1833]">#{ord.orderNumber}</td>
                    <td className="py-3 font-semibold">{ord.customer.firstName} {ord.customer.lastName}</td>
                    <td className="py-3 text-gray-500">{ord.customer.phone}</td>
                    <td className="py-3">{ord.customer.city}</td>
                    <td className="py-3 font-bold">{formatPrice(ord.total)}</td>
                    <td className="py-3">
                      <select
                        value={ord.status}
                        onChange={(e) => {
                          updateOrderStatus(ord.id, e.target.value as any);
                          addToast(`Statut commande #${ord.orderNumber} mis à jour !`, 'success');
                        }}
                        className="bg-[#F7F7F8] border border-gray-200 text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none"
                      >
                        <option value="pending">En attente</option>
                        <option value="processing">En préparation</option>
                        <option value="shipped">En livraison</option>
                        <option value="delivered">Livrée</option>
                        <option value="cancelled">Annulée</option>
                      </select>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setViewingOrder(ord)}
                        className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. BRANDS & SUBCATEGORIES TAB */}
      {activeTab === 'brands' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Brands list (6 cols) */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="font-['Outfit'] font-bold text-base text-[#0B1833]">
                Marques Officielles ({brands.length})
              </h2>
              <button
                onClick={() => setIsAddBrandOpen(true)}
                className="bg-[#0B1833] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>

            <div className="space-y-3">
              {brands.map(b => {
                const bSubs = subCategories.filter(s => s.brandId === b.id);
                return (
                  <div key={b.id} className="p-4 rounded-2xl border border-gray-100 bg-[#F7F7F8]/50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: b.accentColor }} />
                        <h3 className="font-bold text-sm text-[#0B1833]">{b.name}</h3>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{b.description}</p>
                      <span className="text-[10px] text-gray-400">{bSubs.length} sous-catégories rattachées</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subcategories list (6 cols) */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="font-['Outfit'] font-bold text-base text-[#0B1833]">
                Sous-Catégories ({subCategories.length})
              </h2>
              <button
                onClick={() => setIsAddSubCategoryOpen(true)}
                className="bg-[#0B1833] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {subCategories.map(sc => {
                const b = brands.find(x => x.id === sc.brandId);
                return (
                  <div key={sc.id} className="p-3 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#0B1833]">{sc.name}</span>
                      <span className="text-[10px] text-gray-400 block">Marque : {b.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">/{sc.slug}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. REVIEWS MODERATION TAB */}
      {activeTab === 'reviews' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="pb-3 border-b border-gray-100">
            <h2 className="font-['Outfit'] font-bold text-base text-[#0B1833]">
              Modération des avis clients ({reviews.length})
            </h2>
            <p className="text-xs text-gray-500">
              Approuvez ou refusez les avis soumis par les visiteurs avant publication.
            </p>
          </div>

          <div className="space-y-4">
            {reviews.map(rev => {
              const p = products.find(x => x.id === rev.productId);
              return (
                <div key={rev.id} className="p-4 rounded-2xl border border-gray-100 bg-[#F7F7F8]/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#0B1833]">{rev.customerName}</span>
                        <span className="text-[10px] text-gray-400">({rev.customerEmail})</span>
                        <span className={reviewBadgeClass(rev.status)}>
                          {rev.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-500">
                        Produit : {p.name || 'Général'} • Note : {rev.rating}/5
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {rev.status !== 'approved' && (
                        <button
                          onClick={() => {
                            updateReviewStatus(rev.id, 'approved');
                            addToast('Avis approuvé !', 'success');
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approuver</span>
                        </button>
                      )}
                      {rev.status !== 'rejected' && (
                        <button
                          onClick={() => {
                            updateReviewStatus(rev.id, 'rejected');
                            addToast('Avis rejeté', 'info');
                          }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Refuser</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 italic bg-white p-3 rounded-xl border border-gray-100">
                    « {rev.comment} »
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#0B1833]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-['Outfit'] font-black text-lg text-[#0B1833]">
                {editingProduct && 'Modifier le produit'}{!editingProduct && 'Ajouter un nouveau produit'}
              </h3>
              <button onClick={() => setIsAddProductOpen(false)} className="p-1 text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nom du produit *</label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="Ex: Cahier Spirale BOMI Pastel A4"
                    className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Code Article (SKU) *</label>
                  <input
                    type="text"
                    required
                    value={pSku}
                    onChange={(e) => setPSku(e.target.value)}
                    placeholder="Ex: BM-CAH-01"
                    className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Marque *</label>
                  <select
                    value={pBrandId}
                    onChange={(e) => setPBrandId(e.target.value)}
                    className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sous-catégorie *</label>
                  <select
                    value={pSubCatId}
                    onChange={(e) => setPSubCatId(e.target.value)}
                    className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    {subCategories.filter(s => s.brandId === pBrandId).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Rayon *</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Papeterie">Papeterie</option>
                    <option value="Scolaire">Scolaire</option>
                    <option value="Arts & Peinture">Arts & Peinture</option>
                    <option value="Bureau & Organisation">Bureau & Organisation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Prix normal (TND) *</label>
                  <input
                    type="number"
                    step="0.100"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Prix Promo (Optionnel)</label>
                  <input
                    type="number"
                    step="0.100"
                    value={pPromoPrice}
                    onChange={(e) => setPPromoPrice(e.target.value)}
                    placeholder="Ex: 9.900"
                    className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantité en stock *</label>
                  <input
                    type="number"
                    required
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">URL de l'image principale *</label>
                <input
                  type="url"
                  required
                  value={pImage}
                  onChange={(e) => setPImage(e.target.value)}
                  className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description courte *</label>
                <textarea
                  rows={2}
                  required
                  value={pShortDesc}
                  onChange={(e) => setPShortDesc(e.target.value)}
                  placeholder="Résumé accrocheur..."
                  className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Badge marketing</label>
                  <select
                    value={pBadge}
                    onChange={(e) => setPBadge(e.target.value as any)}
                    className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="AUCUN">Aucun badge</option>
                    <option value="PROMOTION">PROMOTION</option>
                    <option value="BEST-SELLER">BEST-SELLER</option>
                    <option value="NOUVEAU">NOUVEAU</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pIsNew}
                      onChange={(e) => setPIsNew(e.target.checked)}
                      className="accent-[#0B1833]"
                    />
                    <span className="font-bold text-gray-700">Afficher dans "Nos Nouveautés"</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-[#0B1833] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#8FD8C3] hover:text-[#0B1833] transition-colors"
                >
                  {editingProduct && 'Enregistrer les modifications'}{!editingProduct && 'Creer le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Brand Modal */}
      {isAddBrandOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#0B1833]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-['Outfit'] font-black text-lg text-[#0B1833]">Ajouter une Marque</h3>
            <form onSubmit={handleCreateBrand} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nom de la marque *</label>
                <input
                  type="text"
                  required
                  value={bName}
                  onChange={(e) => setBName(e.target.value)}
                  placeholder="Ex: MILAN"
                  className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={bDesc}
                  onChange={(e) => setBDesc(e.target.value)}
                  placeholder="Gomme et papeterie créative..."
                  className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl p-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Logo de la marque</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => { const file = e.currentTarget.files && e.currentTarget.files[0]; if (file) setBLogo(await readImageFile(file)); }}
                  className="w-full text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Banniï¿½re / image marque</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => { const file = e.currentTarget.files && e.currentTarget.files[0]; if (file) setBBanner(await readImageFile(file)); }}
                  className="w-full text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Couleur d'accent (Hex)</label>
                <input
                  type="text"
                  value={bColor}
                  onChange={(e) => setBColor(e.target.value)}
                  className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddBrandOpen(false)} className="px-3 py-2 text-gray-500">Annuler</button>
                <button type="submit" className="bg-[#0B1833] text-white px-4 py-2 rounded-xl font-bold">Créer la marque</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add SubCategory Modal */}
      {isAddSubCategoryOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#0B1833]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-['Outfit'] font-black text-lg text-[#0B1833]">Ajouter une Sous-catégorie</h3>
            <form onSubmit={handleCreateSubCat} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Marque parente *</label>
                <select
                  value={selectedBrandForSubCat}
                  onChange={(e) => setSelectedBrandForSubCat(e.target.value)}
                  className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nom de la sous-catégorie *</label>
                <input
                  type="text"
                  required
                  value={scName}
                  onChange={(e) => setScName(e.target.value)}
                  placeholder="Ex: Stylos Gel"
                  className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={scDesc}
                  onChange={(e) => setScDesc(e.target.value)}
                  placeholder="Stylos gel pastel et pailletés..."
                  className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl p-2 text-xs focus:outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddSubCategoryOpen(false)} className="px-3 py-2 text-gray-500">Annuler</button>
                <button type="submit" className="bg-[#0B1833] text-white px-4 py-2 rounded-xl font-bold">Créer la sous-catégorie</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details View Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#0B1833]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-['Outfit'] font-black text-lg text-[#0B1833]">
                  Commande #{viewingOrder.orderNumber}
                </h3>
                <span className="text-xs text-gray-500">
                  {new Date(viewingOrder.createdAt).toLocaleString('fr-TN')}
                </span>
              </div>
              <button onClick={() => setViewingOrder(null)} className="p-1 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F7F7F8] p-4 rounded-2xl text-xs space-y-2 text-[#0B1833]">
              <div className="flex justify-between">
                <span className="text-gray-500">Client :</span>
                <span className="font-bold">{viewingOrder.customer.firstName} {viewingOrder.customer.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Téléphone :</span>
                <span className="font-bold">{viewingOrder.customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email :</span>
                <span>{viewingOrder.customer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Adresse :</span>
                <span>{viewingOrder.customer.address}, {viewingOrder.customer.city}</span>
              </div>
              {viewingOrder.customer.notes && (
                <div className="pt-2 border-t border-gray-200 text-gray-600 italic">
                  Note : {viewingOrder.customer.notes}
                </div>
              )}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {viewingOrder.items.map((it, i) => (
                <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <img src={it.image} alt={it.productName} className="w-8 h-8 rounded-lg object-cover" />
                    <span>{it.productName} × {it.quantity}</span>
                  </div>
                  <span className="font-bold">{formatPrice(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between font-['Outfit'] font-black text-base text-[#0B1833]">
              <span>Total Réglé :</span>
              <span>{formatPrice(viewingOrder.total)}</span>
            </div>

            <button
              onClick={() => setViewingOrder(null)}
              className="w-full py-2.5 bg-[#0B1833] text-white font-bold text-xs uppercase tracking-wider rounded-xl"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

    </div>
  );
};




