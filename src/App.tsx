import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ToastContainer } from './components/Toast';
import { MobileBottomNav } from './components/MobileBottomNav';
import { motion, AnimatePresence } from 'motion/react';

// Views
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { BrandView } from './views/BrandView';
import { SubCategoryView } from './views/SubCategoryView';
import { ProductDetailView } from './views/ProductDetailView';
import { CheckoutView } from './views/CheckoutView';
import { AccountView } from './views/AccountView';
import { AdminView } from './views/AdminView';
import { StaticPagesView } from './views/StaticPagesView';
import { AuthView } from './views/AuthView';

const MainContent: React.FC = () => {
  const { currentView, currentUser, isAdmin } = useStore();

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  const viewKey = `${currentView.type}-${(currentView as any).brandSlug || ''}-${(currentView as any).subCategorySlug || ''}-${(currentView as any).productId || ''}-${(currentView as any).tab || ''}`;

  return (
    <main className="flex-1 overflow-x-hidden pb-24 md:pb-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={viewKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {currentView.type === 'auth' && <AuthView initialMode={currentView.mode} />}

          {currentView.type === 'home' && <HomeView />}

          {currentView.type === 'shop' && (
            <ShopView
              initialBrandId={currentView.brandId}
              initialSubCategoryId={currentView.subCategoryId}
              initialCategory={currentView.category}
              initialSearchQuery={currentView.searchQuery}
              initialPromoOnly={currentView.promoOnly}
              initialIsNewOnly={currentView.isNewOnly}
            />
          )}

          {currentView.type === 'brand' && (
            <BrandView brandSlug={currentView.brandSlug} />
          )}

          {currentView.type === 'subcategory' && (
            <SubCategoryView
              brandSlug={currentView.brandSlug}
              subCategorySlug={currentView.subCategorySlug}
            />
          )}

          {currentView.type === 'product' && (
            <ProductDetailView productId={currentView.productId} />
          )}

          {currentView.type === 'checkout' && <CheckoutView />}

          {currentView.type === 'account' && (currentUser ? <AccountView initialTab={currentView.tab} /> : <AuthView initialMode="login" />)}

          {currentView.type === 'admin' && (isAdmin ? <AdminView /> : <AuthView initialMode="login" />)}

          {['about', 'contact', 'shipping', 'legal'].includes(currentView.type) && (
            <StaticPagesView page={currentView.type as any} />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <div className="min-h-screen bg-[#F7F7F8] text-[#0B1833] font-sans flex flex-col selection:bg-[#8FD8C3] selection:text-[#0B1833]">
        <Header />
        <MainContent />
        <Footer />
        <MobileBottomNav />
        <CartDrawer />
        <ToastContainer />
      </div>
    </StoreProvider>
  );
}

