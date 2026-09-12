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
    else if (view === 'orders') targetPath = '/orders';
    else if (view === 'catalog') targetPath = '/catalog';
    else if (view === 'auth') targetPath = '/auth';
    else if (view === 'quote') targetPath = '/quote';

    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
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

  // If viewing Admin Login
  if (currentView === 'admin-login') {
    return (
      <AdminLogin
        onSuccess={() => navigateTo('admin-dashboard')}
        onNavigateHome={() => navigateTo('home')}
      />
    );
  }

  // If viewing Admin Dashboard
  if (currentView === 'admin-dashboard') {
    // If not authenticated as admin, prompt login
    if (!isAdmin) {
      return (
        <AdminLogin
          onSuccess={() => navigateTo('admin-dashboard')}
          onNavigateHome={() => navigateTo('home')}
        />
      );
    }
    return (
      <AdminDashboard
        onNavigateHome={() => navigateTo('home')}
        onRefreshCatalog={loadProducts}
      />
    );
  }

  // If viewing Customer Auth
  if (currentView === 'auth') {
    return (
      <AuthPage
        onSuccess={() => navigateTo('home')}
        onNavigateHome={() => navigateTo('home')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#eaeded] text-[#0F1111] font-sans antialiased">
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
      <main className="flex-1">
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
                onProceedToCheckout={() => navigateTo('checkout')}
                onContinueShopping={() => navigateTo('catalog')}
                onSelectProduct={handleSelectProduct}
              />
            )}

            {currentView === 'checkout' && (
              <CheckoutPage
                onBackToCart={() => navigateTo('cart')}
                onOrderCompleted={(order) => {
                  console.log('Order registered successfully', order);
                }}
              />
            )}

            {currentView === 'orders' && (
              <OrdersPage
                onSelectProductById={handleSelectProductById}
                onContinueShopping={() => navigateTo('catalog')}
              />
            )}
          </>
        )}
      </main>

      {/* 4. Amazon Footer */}
      <AmazonFooter onNavigate={navigateTo} />
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
