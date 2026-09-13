import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { AmazonHeader } from './components/AmazonHeader';
import { AmazonDrawer } from './components/AmazonDrawer';
import { AmazonFooter } from './components/AmazonFooter';
import { HomePage } from './components/HomePage';
import { CatalogPage } from './components/CatalogPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { OrdersPage } from './components/OrdersPage';
import { AuthPage } from './components/AuthPage';
import { RequestQuotePage } from './components/RequestQuotePage';
import { InvoicePage } from './components/InvoicePage';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { Product, Order } from './types';

function MainApp() {
  const { isAdmin } = useAuth();

  // Navigation / View State
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quoteInitialProduct, setQuoteInitialProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [currentInvoiceOrder, setCurrentInvoiceOrder] = useState<Order | null>(() => {
    try {
      const saved = sessionStorage.getItem('spinel_current_invoice_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Global Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogLoading, setCatalogLoading] = useState<boolean>(true);

  // Fetch products from server
  const loadProducts = async () => {
    try {
      setCatalogLoading(true);
      const res = await fetch('/api/products?limit=5000');
      if (res.ok) {
        const data = await res.json();
        const productList: Product[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
          ? data.products
          : [];
        setProducts(productList);
      }
    } catch (err) {
      console.error('Failed to load products', err);
      setProducts([]);
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Sync with browser URL path (e.g. /admin, /admin/dashboard)
  useEffect(() => {
    const handleLocation = () => {
      const path = window.location.pathname;
      if (path === '/admin/dashboard' || path === '/admin') {
        setCurrentView(isAdmin ? 'admin-dashboard' : 'admin-login');
      } else if (path === '/orders') {
        setCurrentView('orders');
      } else if (path === '/cart') {
        setCurrentView('cart');
      } else if (path === '/checkout') {
        setCurrentView('checkout');
      } else if (path === '/invoice') {
        setCurrentView('invoice');
      } else if (path === '/catalog') {
        setCurrentView('catalog');
      } else if (path === '/quote') {
        setCurrentView('quote');
      }
    };

    handleLocation();
    window.addEventListener('popstate', handleLocation);
    return () => window.removeEventListener('popstate', handleLocation);
  }, []);

  // Update browser URL on navigation
  const navigateTo = (view: string, param?: string) => {
    if (view === 'category' && param) {
      handleSelectCategory(param);
      return;
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let targetPath = '/';
    if (view === 'admin-login') targetPath = '/admin';
    else if (view === 'admin-dashboard') targetPath = '/admin/dashboard';
    else if (view === 'cart') targetPath = '/cart';
    else if (view === 'checkout') targetPath = '/checkout';
    else if (view === 'invoice') targetPath = '/invoice';
    else if (view === 'orders') targetPath = '/orders';
    else if (view === 'catalog') targetPath = '/catalog';
    else if (view === 'auth') targetPath = '/auth';
    else if (view === 'quote') targetPath = '/quote';

    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  const handleViewInvoice = (order: Order) => {
    setCurrentInvoiceOrder(order);
    try {
      sessionStorage.setItem('spinel_current_invoice_order', JSON.stringify(order));
    } catch {}
    navigateTo('invoice');
  };

  // Category selection handler
  const handleSelectCategory = (catName?: string, subcatName?: string) => {
    setSelectedCategory(catName);
    setSelectedSubcategory(subcatName);
    setSearchQuery('');
    navigateTo('catalog');
  };

  // Search keyword submission
  const handleSearchSubmit = (query: string, categoryFilter?: string) => {
    setSearchQuery(query);
    setSelectedCategory(categoryFilter === 'All' ? undefined : categoryFilter);
    setSelectedSubcategory(undefined);
    navigateTo('catalog');
  };

  // Product Selection handler
  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    navigateTo('product');
  };

  const handleSelectProductById = (productId: string) => {
    const list = Array.isArray(products) ? products : [];
    const found = list.find(p => p.id === productId);
    if (found) {
      handleSelectProduct(found);
    } else {
      navigateTo('catalog');
    }
  };

  // Request Quote handler
  const handleRequestQuote = (prod?: Product) => {
    setQuoteInitialProduct(prod || null);
    navigateTo('quote');
  };

  // Buy Now immediate navigation - redirects to Request Quote if product has no price
  const handleBuyNow = (product: Product, quantity: number) => {
    if (!product.priceUSD || product.priceUSD <= 0) {
      handleRequestQuote(product);
      return;
    }
    navigateTo('checkout');
  };

  const isAdminView = currentView === 'admin-dashboard';

  return (
    <div className={`min-h-screen flex flex-col ${isAdminView ? 'bg-[#0f172a]' : 'bg-[#eaeded]'} text-[#0F1111] font-sans antialiased w-full max-w-full overflow-x-hidden`}>
      {/* 1. Amazon Main Header */}
      <AmazonHeader
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onSearch={handleSearchSubmit}
        onSearchSubmit={handleSearchSubmit}
        onSelectCategory={handleSelectCategory}
        onNavigate={navigateTo}
        currentCategory={selectedCategory}
      />

      {/* 2. Amazon Slide-Out Drawer */}
      <AmazonDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectCategory={handleSelectCategory}
        onNavigate={navigateTo}
      />

      {/* 3. Main Body Views */}
      <main className={`flex-1 ${isAdminView ? 'bg-[#0f172a]' : ''}`}>
        {catalogLoading && products.length === 0 ? (
          <div className="min-h-[400px] flex items-center justify-center text-sm text-gray-600 font-medium">
            Loading Spinel Distribution Enterprise Hardware Catalog...
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <HomePage
                products={products}
                onSelectProduct={handleSelectProduct}
                onSelectCategory={handleSelectCategory}
                onNavigate={navigateTo}
                onRequestQuote={handleRequestQuote}
              />
            )}

            {currentView === 'catalog' && (
              <CatalogPage
                products={products}
                selectedCategory={selectedCategory}
                selectedSubcategory={selectedSubcategory}
                searchQuery={searchQuery}
                onSelectProduct={handleSelectProduct}
                onSelectCategory={handleSelectCategory}
                onRequestQuote={handleRequestQuote}
              />
            )}

            {currentView === 'product' && selectedProduct && (
              <ProductDetailPage
                product={selectedProduct}
                allProducts={products}
                onSelectProduct={handleSelectProduct}
                onSelectCategory={handleSelectCategory}
                onBuyNow={handleBuyNow}
                onRequestQuote={handleRequestQuote}
              />
            )}

            {currentView === 'quote' && (
              <RequestQuotePage
                initialProduct={quoteInitialProduct}
                onNavigate={navigateTo}
                onSelectProduct={handleSelectProduct}
              />
            )}

            {currentView === 'cart' && (
              <CartPage
                products={products}
                onProceedToCheckout={() => navigateTo('checkout')}
                onContinueShopping={() => navigateTo('catalog')}
                onSelectProduct={handleSelectProduct}
                onRequestQuote={handleRequestQuote}
              />
            )}

            {currentView === 'checkout' && (
              <CheckoutPage
                onBackToCart={() => navigateTo('cart')}
                onOrderCompleted={(order) => {
                  handleViewInvoice(order);
                }}
              />
            )}

            {currentView === 'invoice' && (
              currentInvoiceOrder ? (
                <InvoicePage
                  order={currentInvoiceOrder}
                  onNavigate={navigateTo}
                  onOrderUpdated={(updated) => {
                    setCurrentInvoiceOrder(updated);
                    try {
                      sessionStorage.setItem('spinel_current_invoice_order', JSON.stringify(updated));
                    } catch {}
                  }}
                />
              ) : (
                <div className="max-w-2xl mx-auto px-4 py-16 text-center font-sans">
                  <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">No active invoice found</h2>
                    <p className="text-xs text-gray-500">
                      You do not have an active invoice loaded in this session. You can view past orders or explore our catalog.
                    </p>
                    <div className="flex justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => navigateTo('orders')}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg text-xs cursor-pointer"
                      >
                        View Order History
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateTo('catalog')}
                        className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs cursor-pointer"
                      >
                        Explore Catalog
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}

            {currentView === 'orders' && (
              <OrdersPage
                onSelectProductById={handleSelectProductById}
                onContinueShopping={() => navigateTo('catalog')}
                onViewInvoice={handleViewInvoice}
              />
            )}

            {currentView === 'auth' && (
              <AuthPage
                onSuccess={() => navigateTo('home')}
                onNavigateHome={() => navigateTo('home')}
              />
            )}

            {currentView === 'admin-login' && (
              <AdminLogin
                onSuccess={() => navigateTo('admin-dashboard')}
                onNavigateHome={() => navigateTo('home')}
              />
            )}

            {currentView === 'admin-dashboard' && (
              !isAdmin ? (
                <AdminLogin
                  onSuccess={() => navigateTo('admin-dashboard')}
                  onNavigateHome={() => navigateTo('home')}
                />
              ) : (
                <AdminDashboard
                  onNavigateHome={() => navigateTo('home')}
                  onRefreshCatalog={loadProducts}
                />
              )
            )}
          </>
        )}
      </main>

      {/* 4. Amazon Footer */}
      <AmazonFooter 
        onNavigate={navigateTo} 
        noMarginTop={isAdminView}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
