import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Brand, SubCategory, Order, Review, ProductActionType } from '../types';
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
  Tag,
  LogOut,
  Upload,
  Pencil
} from 'lucide-react';

const readImageFile = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const src = String(reader.result || '');
    const img = new Image();
    img.onload = () => {
      const maxSize = 1200;
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(src);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => resolve(src);
    img.src = src;
  };
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
    updateBrand,
    deleteBrand,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
    updateOrderStatus, 
    formatPrice,
    navigateTo,
    logout,
    addToast,
    updateReviewStatus,
    refreshOrders
  } = useStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'brands' | 'reviews'>('dashboard');

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'orders') void refreshOrders();
  }, [activeTab, refreshOrders]);

  // Search & Filter in Admin
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Modals & Form States
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isAddSubCategoryOpen, setIsAddSubCategoryOpen] = useState(false);
  const [editingSubCat, setEditingSubCat] = useState<SubCategory | null>(null);
  const [selectedBrandForSubCat, setSelectedBrandForSubCat] = useState<string>(brands[0]?.id || '');
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
  const [pBrandId, setPBrandId] = useState(brands[0]?.id || '');
  const [pSubCatId, setPSubCatId] = useState(subCategories[0]?.id || '');
  const [pCategory, setPCategory] = useState('Papeterie');
  const [pPrice, setPPrice] = useState('12.500');
  const [pPromoPrice, setPPromoPrice] = useState('');
  const [pStock, setPStock] = useState('20');
  const [pImage, setPImage] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80');
  const [imageUploadMode, setImageUploadMode] = useState<'upload' | 'url'>('upload');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [pShortDesc, setPShortDesc] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pBadge, setPBadge] = useState<Product['badge']>('AUCUN');
  const [pActionType, setPActionType] = useState<ProductActionType>('buy_online');
  const [pCustomPhone, setPCustomPhone] = useState('55 542 000');
  const [pIsNew, setPIsNew] = useState(true);

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      addToast('L\'image ne doit pas dépasser 8 Mo.', 'error');
      return;
    }
    setIsUploadingImage(true);
    try {
      const dataUrl = await readImageFile(file);
      setPImage(dataUrl);
      addToast('Image importée depuis votre appareil !', 'success');
    } catch {
      addToast('Erreur lors de la lecture du fichier image.', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  React.useEffect(() => {
    if (!selectedBrandForSubCat && brands.length > 0) setSelectedBrandForSubCat(brands[0].id);
    if (!pBrandId && brands.length > 0) setPBrandId(brands[0].id);
    if (!pSubCatId && subCategories.length > 0) setPSubCatId(subCategories[0].id);
  }, [brands, subCategories]);

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

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pSku) return;
    if (!pBrandId || !pSubCatId) {
      addToast('Choisissez une marque et une sous-catégorie.', 'error');
      return;
    }
    if (!pImage) {
      addToast('Ajoutez une photo du produit.', 'error');
      return;
    }

    const payload = {
      name: pName,
      sku: pSku,
      brandId: pBrandId,
      subCategoryId: pSubCatId,
      category: pCategory as Product['category'],
      price: parseFloat(pPrice) || 0,
      promoPrice: (pPromoPrice && parseFloat(pPromoPrice)) || undefined,
      stock: parseInt(pStock, 10) || 0,
      images: [pImage],
      shortDescription: pShortDesc || pName,
      description: pDesc || pShortDesc || pName,
      features: ['Qualité certifiée Espace Pastel', 'Usage scolaire et professionnel'],
      sizes: [] as string[],
      colors: [] as Product['colors'],
      dimensions: '',
      weight: '',
      material: '',
      customWhatsapp: '',
      rareNote: '',
      badge: pBadge === 'AUCUN' ? null : pBadge,
      actionType: pActionType,
      customPhone: pCustomPhone || '55 542 000',
      isNew: pIsNew,
      isBestSeller: pBadge === 'BEST-SELLER',
      isPromo: Boolean(pPromoPrice),
      status: 'published' as const
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, payload);
      setEditingProduct(null);
    } else {
      await addProduct(payload);
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
    setPActionType('buy_online');
    setPCustomPhone('55 542 000');
    setPIsNew(true);
    if (brands.length > 0) {
      setPBrandId(brands[0].id);
      const matchingSubs = subCategories.filter(s => s.brandId === brands[0].id);
      if (matchingSubs.length > 0) setPSubCatId(matchingSubs[0].id);
    }
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
    setPActionType(prod.actionType || (prod.badge === 'PIÈCE RARE' ? 'rare_call' : 'buy_online'));
    setPCustomPhone(prod.customPhone || '55 542 000');
    setPIsNew(prod.isNew || false);
    setIsAddProductOpen(true);
  };

  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName) return;

    if (editingBrand) {
      updateBrand(editingBrand.id, {
        name: bName,
        description: bDesc,
        accentColor: bColor,
        logoUrl: bLogo || editingBrand.logoUrl,
        bannerUrl: bBanner || editingBrand.bannerUrl
      });
      addToast(`Marque "${bName}" mise à jour !`, 'success');
      setEditingBrand(null);
    } else {
      addBrand({
        name: bName,
        slug: bSlug || bName.toLowerCase().replace(/\s+/g, '-'),
        description: bDesc,
        accentColor: bColor,
        logoUrl: bLogo || bBanner,
        bannerUrl: bBanner
      });
      addToast(`Marque "${bName}" créée avec succès !`, 'success');
    }

    setIsAddBrandOpen(false);
    setBName('');
    setBSlug('');
    setBDesc('');
    setBColor('#8FD8C3');
    setBLogo('');
  };

  const handleEditBrandClick = (b: Brand) => {
    setEditingBrand(b);
    setBName(b.name);
    setBSlug(b.slug);
    setBDesc(b.description);
    setBColor(b.accentColor || '#8FD8C3');
    setBLogo(b.logoUrl || '');
    setBBanner(b.bannerUrl || '');
    setIsAddBrandOpen(true);
  };

  const handleDeleteBrand = (id: string, name: string) => {
    if (window.confirm(`Supprimer la marque "${name}" ? Les produits associés resteront mais sans marque.`)) {
      deleteBrand(id);
    }
  };

  const handleCreateSubCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scName || !selectedBrandForSubCat) return;

    if (editingSubCat) {
      updateSubCategory(editingSubCat.id, {
        brandId: selectedBrandForSubCat,
        name: scName,
        slug: scSlug || scName.toLowerCase().replace(/\s+/g, '-'),
        description: scDesc,
        imageUrl: scImage || editingSubCat.imageUrl
      });
      addToast(`Sous-catégorie "${scName}" mise à jour !`, 'success');
      setEditingSubCat(null);
    } else {
      addSubCategory({
        brandId: selectedBrandForSubCat,
        name: scName,
        slug: scSlug || scName.toLowerCase().replace(/\s+/g, '-'),
        description: scDesc,
        imageUrl: scImage
      });
      addToast(`Sous-catégorie "${scName}" ajoutée !`, 'success');
    }

    setIsAddSubCategoryOpen(false);
    setScName('');
    setScSlug('');
    setScDesc('');
  };

  const handleEditSubCatClick = (sc: SubCategory) => {
    setEditingSubCat(sc);
    setScName(sc.name);
    setScSlug(sc.slug);
    setScDesc(sc.description);
    setScImage(sc.imageUrl || '');
    setSelectedBrandForSubCat(sc.brandId);
    setIsAddSubCategoryOpen(true);
  };

  const handleDeleteSubCat = (id: string, name: string) => {
    if (window.confirm(`Supprimer la sous-catégorie "${name}" ?`)) {
      deleteSubCategory(id);
    }
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
          <h1 className="font-sans font-black text-2xl sm:text-3xl text-white tracking-tight">
            PANNEAU DE GESTION & BACKOFFICE
          </h1>
          <p className="text-xs text-white/70">
            Gestion des stocks, commandes, marques, sous-catégories et modération des avis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => navigateTo({ type: 'home' })}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voir la boutique publique</span>
          </button>
          <button
            onClick={logout}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white border border-red-400/30 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
            title="Se déconnecter de l'administration"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
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
              <div className="font-sans font-black text-2xl text-[#0B1833]">
                {formatPrice(totalRevenue)}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">Toutes commandes confondues</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span>Commandes en attente</span>
                <ShoppingBag className="w-4 h-4 text-amber-500" />
              </div>
              <div className="font-sans font-black text-2xl text-[#0B1833]">
                {pendingOrdersCount}
              </div>
              <span className="text-[11px] text-amber-600 font-semibold">À préparer rapidement</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span>Produits au catalogue</span>
                <Package className="w-4 h-4 text-[#8FD8C3]" />
              </div>
              <div className="font-sans font-black text-2xl text-[#0B1833]">
                {products.length}
              </div>
              <span className="text-[11px] text-gray-500 font-semibold">Sur 4 marques principales</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span>Alertes Stock Faible</span>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div className="font-sans font-black text-2xl text-[#0B1833]">
                {lowStockCount}
              </div>
              <span className="text-[11px] text-red-600 font-semibold">Stock ≤ 5 unités</span>
            </div>
          </div>

          {/* Quick Actions & Recent Orders Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h2 className="font-sans font-bold text-base text-[#0B1833]">
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
              <h2 className="font-sans font-bold text-base text-[#0B1833]">
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
                          {b?.name || p.brandId}
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
                              if (confirm(`Supprimer « ${p.name} » de la boutique ?`)) {
                                void deleteProduct(p.id);
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
              <h2 className="font-sans font-bold text-base text-[#0B1833]">
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

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {brands.map(b => {
                const bSubs = subCategories.filter(s => s.brandId === b.id);
                return (
                  <div key={b.id} className="p-4 rounded-2xl border border-gray-100 bg-[#F7F7F8]/50 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: b.accentColor }} />
                        <h3 className="font-bold text-sm text-[#0B1833] truncate">{b.name}</h3>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{b.description}</p>
                      <span className="text-[10px] text-gray-400">{bSubs.length} sous-catégorie{bSubs.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleEditBrandClick(b)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-[#0B1833] hover:text-white transition-colors cursor-pointer"
                        title="Modifier"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBrand(b.id, b.name)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subcategories list (6 cols) */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="font-sans font-bold text-base text-[#0B1833]">
                Sous-Catégories ({subCategories.length})
              </h2>
              <button
                onClick={() => { setEditingSubCat(null); setScName(''); setScSlug(''); setScDesc(''); setIsAddSubCategoryOpen(true); }}
                className="bg-[#0B1833] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {subCategories.map(sc => {
                const b = brands.find(x => x.id === sc.brandId);
                return (
                  <div key={sc.id} className="p-3 rounded-xl border border-gray-100 flex items-center justify-between text-xs gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-[#0B1833] block truncate">{sc.name}</span>
                      <span className="text-[10px] text-gray-400">Marque : {b?.name || '—'} • /{sc.slug}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleEditSubCatClick(sc)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-[#0B1833] hover:text-white transition-colors cursor-pointer"
                        title="Modifier"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubCat(sc.id, sc.name)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
            <h2 className="font-sans font-bold text-base text-[#0B1833]">
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
                        Produit : {p?.name || 'Général'} • Note : {rev.rating}/5
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
              <h3 className="font-sans font-black text-lg text-[#0B1833]">
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
                    onChange={(e) => {
                      const newBrandId = e.target.value;
                      setPBrandId(newBrandId);
                      const matchingSubs = subCategories.filter(s => s.brandId === newBrandId);
                      if (matchingSubs.length > 0) {
                        setPSubCatId(matchingSubs[0].id);
                      } else {
                        setPSubCatId('');
                      }
                    }}
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-gray-700 text-xs">Image principale du produit *</label>
                  <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('upload')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${imageUploadMode === 'upload' ? 'bg-white text-[#0B1833] shadow-xs' : 'text-gray-500 hover:text-[#0B1833]'}`}
                    >
                      Depuis l'appareil
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('url')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${imageUploadMode === 'url' ? 'bg-white text-[#0B1833] shadow-xs' : 'text-gray-500 hover:text-[#0B1833]'}`}
                    >
                      Lien URL
                    </button>
                  </div>
                </div>

                {imageUploadMode === 'upload' ? (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#0B1833] bg-[#F7F7F8] hover:bg-gray-50 rounded-2xl p-4 cursor-pointer transition-all">
                      <Upload className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs font-bold text-[#0B1833]">
                        {isUploadingImage ? 'Chargement en cours...' : 'Cliquez pour choisir une photo depuis votre appareil'}
                      </span>
                      <span className="text-[10px] text-gray-500 mt-0.5">PNG, JPG, WebP jusqu'à 8 Mo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <input
                    type="url"
                    value={pImage}
                    onChange={(e) => setPImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                )}

                {/* Preview Thumbnail */}
                {pImage && (
                  <div className="mt-2.5 flex items-center gap-3 bg-[#F7F7F8] p-2.5 rounded-xl border border-gray-200">
                    <img
                      src={pImage}
                      alt="Aperçu produit"
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200 bg-white"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[11px] font-bold text-emerald-700 truncate">Image prête pour le catalogue</span>
                      <span className="block text-[10px] text-gray-500 truncate">{pImage.startsWith('data:') ? 'Fichier importé depuis votre appareil' : pImage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPImage('')}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Supprimer l'image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
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
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setPBadge(val);
                      if (val === 'PIÈCE RARE') {
                        setPActionType('rare_call');
                      }
                    }}
                    className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="AUCUN">Aucun badge</option>
                    <option value="PIÈCE RARE">💎 PIÈCE RARE (Commander par téléphone)</option>
                    <option value="PROMOTION">PROMOTION</option>
                    <option value="BEST-SELLER">BEST-SELLER</option>
                    <option value="NOUVEAU">NOUVEAU</option>
                    <option value="COUP DE CŒUR">COUP DE CŒUR</option>
                    <option value="ÉDITION LIMITÉE">ÉDITION LIMITÉE</option>
                    <option value="COLLECTION 2026">COLLECTION 2026</option>
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

              {/* Mode de Vente: En ligne ou Pièce Rare */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
                <span className="block text-xs font-black text-amber-950">Mode de commande client :</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${pActionType === 'buy_online' ? 'bg-white border-[#0B1833] font-bold text-[#0B1833] shadow-xs' : 'bg-transparent border-amber-200/60 text-gray-700'}`}>
                    <input
                      type="radio"
                      name="adminProductActionType"
                      value="buy_online"
                      checked={pActionType === 'buy_online'}
                      onChange={() => setPActionType('buy_online')}
                      className="accent-[#0B1833]"
                    />
                    <span>Achat en ligne (Ajouter au panier)</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${pActionType === 'rare_call' ? 'bg-white border-amber-600 font-bold text-amber-900 shadow-xs' : 'bg-transparent border-amber-200/60 text-gray-700'}`}>
                    <input
                      type="radio"
                      name="adminProductActionType"
                      value="rare_call"
                      checked={pActionType === 'rare_call'}
                      onChange={() => {
                        setPActionType('rare_call');
                        if (pBadge === 'AUCUN') setPBadge('PIÈCE RARE');
                      }}
                      className="accent-amber-600"
                    />
                    <span>Pièce rare (Bouton "Appeler")</span>
                  </label>
                </div>

                {pActionType === 'rare_call' && (
                  <div className="pt-1">
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      Numéro de téléphone pour la commande :
                    </label>
                    <input
                      type="text"
                      value={pCustomPhone}
                      onChange={(e) => setPCustomPhone(e.target.value)}
                      placeholder="55 542 000"
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-[#0B1833] font-bold focus:outline-none"
                    />
                  </div>
                )}
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

      {/* Add / Edit Brand Modal */}
      {isAddBrandOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#0B1833]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-black text-lg text-[#0B1833]">
                {editingBrand ? `Modifier "${editingBrand.name}"` : 'Ajouter une Marque'}
              </h3>
              <button
                type="button"
                onClick={() => { setIsAddBrandOpen(false); setEditingBrand(null); }}
                className="p-1 text-gray-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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
                {editingBrand?.logoUrl && (
                  <img src={editingBrand.logoUrl} alt="Logo actuel" className="w-12 h-12 rounded-lg object-cover mb-1 border border-gray-200" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => { const file = e.currentTarget.files && e.currentTarget.files[0]; if (file) setBLogo(await readImageFile(file)); }}
                  className="w-full text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Bannière / image marque</label>
                {editingBrand?.bannerUrl && (
                  <img src={editingBrand.bannerUrl} alt="Bannière actuelle" className="w-full h-16 rounded-lg object-cover mb-1 border border-gray-200" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => { const file = e.currentTarget.files && e.currentTarget.files[0]; if (file) setBBanner(await readImageFile(file)); }}
                  className="w-full text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Couleur d'accent (Hex)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bColor}
                    onChange={(e) => setBColor(e.target.value)}
                    className="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={bColor}
                    onChange={(e) => setBColor(e.target.value)}
                    className="flex-1 bg-[#F7F7F8] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    placeholder="#8FD8C3"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => { setIsAddBrandOpen(false); setEditingBrand(null); }} className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-xl cursor-pointer">Annuler</button>
                <button type="submit" className="bg-[#0B1833] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#8FD8C3] hover:text-[#0B1833] transition-colors cursor-pointer">
                  {editingBrand ? 'Enregistrer les modifications' : 'Créer la marque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit SubCategory Modal */}
      {isAddSubCategoryOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#0B1833]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-black text-lg text-[#0B1833]">
                {editingSubCat ? `Modifier "${editingSubCat.name}"` : 'Ajouter une Sous-catégorie'}
              </h3>
              <button
                type="button"
                onClick={() => { setIsAddSubCategoryOpen(false); setEditingSubCat(null); }}
                className="p-1 text-gray-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={scDesc}
                  onChange={(e) => setScDesc(e.target.value)}
                  placeholder="Stylos gel pastel et pailletés..."
                  className="w-full bg-[#F7F7F8] border border-gray-200 rounded-xl p-2 text-xs focus:outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => { setIsAddSubCategoryOpen(false); setEditingSubCat(null); }} className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-xl cursor-pointer">Annuler</button>
                <button type="submit" className="bg-[#0B1833] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#8FD8C3] hover:text-[#0B1833] transition-colors cursor-pointer">
                  {editingSubCat ? 'Enregistrer les modifications' : 'Créer la sous-catégorie'}
                </button>
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
                <h3 className="font-sans font-black text-lg text-[#0B1833]">
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

            <div className="pt-2 flex justify-between font-sans font-black text-base text-[#0B1833]">
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





