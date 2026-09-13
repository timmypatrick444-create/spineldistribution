import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Package, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  RefreshCw, 
  LogOut, 
  ShieldCheck, 
  Layers, 
  FileText,
  Clock,
  Truck,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { Product, Order } from '../types';
import { CATEGORIES } from '../data/categories';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { parseProductsFile, parseProductsCSVString, downloadSampleCSVFile } from '../utils/csvParser';
import { downloadInvoicePDF } from '../utils/pdfGenerator';

interface AdminDashboardProps {
  onNavigateHome: () => void;
  onRefreshCatalog: () => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateHome,
  onRefreshCatalog
}) => {
  const { adminLogout, adminToken } = useAuth();
  const { exchangeRate } = useCurrency();

  const [activeTab, setActiveTab] = useState<'inventory' | 'upload' | 'orders' | 'categories'>('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Bulk Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    added: number;
    updated: number;
    total: number;
    message: string;
  } | null>(null);
  const [pastedCSV, setPastedCSV] = useState('');

  // Fetch all admin data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, orderRes] = await Promise.all([
        fetch('/api/products?limit=5000'),
        fetch('/api/orders')
      ]);

      if (prodRes.ok) {
        const pData = await prodRes.json();
        const productList: Product[] = Array.isArray(pData)
          ? pData
          : Array.isArray(pData?.products)
          ? pData.products
          : [];
        setProducts(productList);
      }
      if (orderRes.ok) {
        const oData = await orderRes.json();
        const orderList: Order[] = Array.isArray(oData)
          ? oData
          : Array.isArray(oData?.orders)
          ? oData.orders
          : [];
        setOrders(orderList);
      }
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute metrics
  const totalProductsCount = products.length;
  const totalStockQuantity = products.reduce((acc, p) => acc + p.stock, 0);
  const totalOrdersCount = orders.length;
  const totalRevenueUSD = orders.reduce((acc, o) => acc + (o.paymentStatus === 'paid' ? o.totalUSD : 0), 0);
  const totalRevenueNGN = orders.reduce((acc, o) => acc + (o.paymentStatus === 'paid' ? o.totalNGN : 0), 0);

  // Bulk Ingestion Handlers
  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(20);
      setUploadResult(null);

      // Parse with PapaParse or SheetJS
      const parsedProducts = await parseProductsFile(file);
      setUploadProgress(60);

      if (parsedProducts.length === 0) {
        throw new Error('No valid product rows found in the uploaded file.');
      }

      // Send to server batch endpoint in chunks of 500 to guarantee zero memory or network hiccups
      const chunkSize = 500;
      let totalAdded = 0;
      let totalUpdated = 0;

      for (let i = 0; i < parsedProducts.length; i += chunkSize) {
        const chunk = parsedProducts.slice(i, i + chunkSize);
        const res = await fetch('/api/products/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ products: chunk })
        });

        if (!res.ok) {
          throw new Error('Batch ingestion server failed');
        }

        const data = await res.json();
        totalAdded += data.added || 0;
        totalUpdated += data.updated || 0;

        const currentProg = 60 + Math.round(((i + chunk.length) / parsedProducts.length) * 35);
        setUploadProgress(currentProg);
      }

      setUploadProgress(100);
      setUploadResult({
        success: true,
        added: totalAdded,
        updated: totalUpdated,
        total: totalAdded + totalUpdated,
        message: `Successfully ingested ${totalAdded + totalUpdated} enterprise products (${totalAdded} new, ${totalUpdated} updated) into Spinel Distribution catalog.`
      });

      await fetchData();
      await onRefreshCatalog();
    } catch (err: any) {
      setUploadResult({
        success: false,
        added: 0,
        updated: 0,
        total: 0,
        message: `Upload Failed: ${err.message || 'File processing error'}`
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePastedCSVUpload = async () => {
    if (!pastedCSV.trim()) return;
    try {
      setIsUploading(true);
      setUploadProgress(30);
      const parsedProducts = parseProductsCSVString(pastedCSV);
      setUploadProgress(70);

      const res = await fetch('/api/products/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ products: parsedProducts })
      });

      if (!res.ok) throw new Error('Failed to process pasted CSV batch');
      const data = await res.json();

      setUploadProgress(100);
      setUploadResult({
        success: true,
        added: data.added,
        updated: data.updated,
        total: data.added + data.updated,
        message: `Successfully ingested ${data.added + data.updated} products from text/CSV data.`
      });
      setPastedCSV('');
      await fetchData();
      await onRefreshCatalog();
    } catch (err: any) {
      setUploadResult({
        success: false,
        added: 0,
        updated: 0,
        total: 0,
        message: err.message
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Stress-Test: Generate and upload 1,000+ products on demand
  const handleGenerate1000Products = async () => {
    try {
      setIsUploading(true);
      setUploadProgress(20);
      
      const sampleBatch: Partial<Product>[] = [];
      const timestamp = Date.now();

      for (let i = 1; i <= 1000; i++) {
        const cat = CATEGORIES[i % CATEGORIES.length];
        const sub = cat.subcategories[i % cat.subcategories.length];
        const price = Math.round((45 + (i * 7.3) % 4500) * 100) / 100;

        sampleBatch.push({
          id: `prod-auto-${cat.slug.slice(0, 3).toLowerCase()}-${String(i).padStart(4, '0')}-${timestamp}`,
          sku: `SPN-AUTO-${cat.slug.slice(0, 3).toUpperCase()}-${String(i).padStart(4, '0')}`,
          name: `${cat.name.split('&')[0].trim()} Hardware Unit #${i} [${sub}]`,
          category: cat.name,
          subcategory: sub,
          priceUSD: i % 2 === 0 ? price : 0, // Alternate between priced and quote-required items
          stock: 25 + (i % 80),
          rating: 4.5 + (i % 5) * 0.1,
          reviewCount: 12 + (i % 150),
          description: `Enterprise-grade ${sub} industrial equipment manufactured for high-reliability operations. Rigorously tested for 24/7 mission-critical workloads.`,
          images: [cat.image],
          features: [
            'Multi-layer industrial surge protection',
            'Compliant with international CE & FCC standards',
            'Direct 3-year replacement warranty coverage'
          ]
        });
      }

      setUploadProgress(50);
      // Ingest in chunks
      const chunkSize = 500;
      let totalAdded = 0;
      let totalUpdated = 0;

      for (let i = 0; i < sampleBatch.length; i += chunkSize) {
        const chunk = sampleBatch.slice(i, i + chunkSize);
        const res = await fetch('/api/products/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ products: chunk })
        });
        const data = await res.json();
        totalAdded += data.added || 0;
        totalUpdated += data.updated || 0;
      }

      setUploadProgress(100);
      setUploadResult({
        success: true,
        added: totalAdded,
        updated: totalUpdated,
        total: totalAdded + totalUpdated,
        message: `High-Throughput Benchmark Completed! Generated and uploaded ${totalAdded + totalUpdated} enterprise products across all 16 categories without limit or error.`
      });

      await fetchData();
      await onRefreshCatalog();
    } catch (err: any) {
      alert(`Benchmark error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Product Delete
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product from the master catalog?')) return;
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        await onRefreshCatalog();
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  // Clear All Products
  const handleClearAllProducts = async () => {
    if (!window.confirm('Are you sure you want to completely clear ALL products from the catalog? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/products/clear', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setProducts([]);
        await onRefreshCatalog();
        alert('All products have been cleared successfully.');
      }
    } catch (err) {
      alert('Failed to clear products');
    }
  };

  // Filtered inventory list
  const filteredProducts = products.filter(p => {
    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans pb-16">
      
      {/* Top Admin Navigation Header */}
      <header className="bg-[#1e293b] border-b border-slate-700/80 px-6 py-3.5 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center font-black text-slate-950 text-base">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-tight">
                SPINEL DISTRIBUTION
              </span>
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                OPS CONSOLE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Master Admin Control • URL: /admin/dashboard
            </p>
          </div>
        </div>

        {/* Global Admin Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-1.5 px-3 rounded-lg border border-slate-700 transition-colors"
          >
            <ArrowLeft size={14} /> Storefront
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-1.5 px-3 rounded-lg border border-slate-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={adminLogout}
            className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs py-1.5 px-3 rounded-lg border border-red-500/30 transition-colors"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* Admin Stat Metric Cards */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Master Products Card (HIDDEN FROM PUBLIC, VISIBLE HERE) */}
          <div className="bg-[#1e293b] border border-slate-700/80 rounded-xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Catalog Products
              </span>
              <Package size={18} className="text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {totalProductsCount.toLocaleString()}
            </div>
            <p className="text-[11px] text-amber-400/90 mt-1 flex items-center gap-1">
              <ShieldCheck size={12} /> Confidential Admin Metric (Hidden from Public)
            </p>
          </div>

          {/* Units in Stock */}
          <div className="bg-[#1e293b] border border-slate-700/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Available Inventory Units
              </span>
              <Layers size={18} className="text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {totalStockQuantity.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Across all 16 distribution warehouses
            </p>
          </div>

          {/* Total Orders */}
          <div className="bg-[#1e293b] border border-slate-700/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Orders Recorded
              </span>
              <ShoppingCart size={18} className="text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {totalOrdersCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              All tracked with PDF invoices
            </p>
          </div>

          {/* Total Revenue */}
          <div className="bg-[#1e293b] border border-slate-700/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Paid Revenue (USD / NGN)
              </span>
              <DollarSign size={18} className="text-green-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">
              ${totalRevenueUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-green-400 font-mono mt-1">
              ₦{totalRevenueNGN.toLocaleString()} (Rate: ₦{exchangeRate})
            </p>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 border-b border-slate-700/80 text-xs">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'inventory' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Package size={15} /> Master Inventory ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'upload' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Upload size={15} /> Bulk Upload (CSV / Excel)
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'orders' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <FileText size={15} /> Customer Orders &amp; Invoices ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'categories' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Layers size={15} /> Categories Breakdown (16)
          </button>
        </div>

        {/* TAB 1: INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="mt-6 space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1e293b] p-4 rounded-xl border border-slate-700/80 text-xs">
              <div className="flex items-center gap-3 flex-1 min-w-[260px]">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search by SKU, Product Name, Brand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <Search size={15} className="absolute left-3 top-2.5 text-slate-500" />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-[#0f172a] border border-slate-700 rounded-lg py-2 px-3 text-slate-200 outline-none focus:border-amber-500"
                >
                  <option value="All">All 16 Categories</option>
                  {CATEGORIES.map(c => (
                    <option key={`admin-cat-filter-${c.id ?? c.slug ?? c.name}`} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                {products.length > 0 && (
                  <button
                    onClick={handleClearAllProducts}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Remove all products from master catalog"
                  >
                    <Trash2 size={14} /> Clear All ({products.length})
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('upload')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={15} /> Upload Products
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-[#1e293b] rounded-xl border border-slate-700/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0f172a] text-slate-400 font-semibold border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Image</th>
                      <th className="py-3 px-4">SKU / ID</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Category / Subcategory</th>
                      <th className="py-3 px-4">Price (USD / NGN)</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredProducts.slice(0, 100).map((prod, idx) => (
                      <tr key={`${prod.id || 'prod'}-${prod.sku || idx}-${idx}`} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-4">
                          <img 
                            src={prod.images[0]} 
                            alt="" 
                            className="w-10 h-10 object-contain rounded bg-slate-900 border border-slate-700 p-0.5" 
                          />
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-400">{prod.sku}</td>
                        <td className="py-2.5 px-4 font-medium text-white max-w-xs truncate">
                          {prod.name}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="text-slate-200">{prod.category}</div>
                          <div className="text-[10px] text-slate-400">{prod.subcategory}</div>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-amber-400">
                          ${prod.priceUSD.toFixed(2)}
                          <div className="text-[10px] text-slate-400 font-normal">
                            ₦{Math.round(prod.priceUSD * exchangeRate).toLocaleString()}
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${prod.stock > 10 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {prod.stock} units
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10"
                            title="Delete product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <Package size={32} className="mx-auto mb-2 text-slate-600" />
                          <p className="font-semibold text-slate-300">Catalog is currently empty</p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            All products have been removed. Use the Bulk Upload tab to upload new CSV or Excel products.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredProducts.length > 100 && (
                <div className="p-3 bg-[#0f172a] text-center text-xs text-slate-400 border-t border-slate-800">
                  Showing first 100 of {filteredProducts.length} filtered products for peak performance.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BULK INGESTION (CSV & EXCEL) */}
        {activeTab === 'upload' && (
          <div className="mt-6 space-y-6">
            
            {/* Top Info Banner */}
            <div className="bg-gradient-to-r from-amber-500/10 via-slate-800 to-slate-800 border border-amber-500/30 p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                  Zero-Hinderance Enterprise Ingestion Engine
                </span>
                <h3 className="text-base font-bold text-white">
                  Bulk Product Ingestion (Thousands of Products Supported)
                </h3>
                <p className="text-slate-300 max-w-2xl">
                  Upload CSV or Excel files with hundreds or thousands of rows. The engine maps categories, handles deduplication by SKU, updates existing records, and computes USD/NGN pricing in real-time.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={downloadSampleCSVFile}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Download size={14} /> Download Sample CSV
                </button>
                <button
                  onClick={handleGenerate1000Products}
                  disabled={isUploading}
                  className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:bg-slate-700 text-slate-950 font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-colors shadow"
                >
                  <Zap size={14} /> Benchmark 1,000 Products
                </button>
              </div>
            </div>

            {/* Ingestion Status Alert */}
            {uploadResult && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${uploadResult.success ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                {uploadResult.success ? <CheckCircle2 size={18} className="text-green-400 mt-0.5 shrink-0" /> : <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />}
                <div className="space-y-1">
                  <div className="font-bold">{uploadResult.success ? 'Upload Succeeded!' : 'Upload Error'}</div>
                  <div>{uploadResult.message}</div>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {isUploading && (
              <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="font-semibold">Processing and Ingesting Products...</span>
                  <span className="font-mono">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Options Grid: File Dropzone & Paste Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Option A: Drag-and-Drop File Upload */}
              <div className="bg-[#1e293b] border border-slate-700/80 rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                    <FileSpreadsheet size={18} className="text-amber-400" />
                    Option 1: Upload Excel (.xlsx) or CSV File
                  </h4>
                  <p className="text-slate-400 text-xs mb-4">
                    Select or drag any spreadsheet file containing product details.
                  </p>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragActive ? 'border-amber-400 bg-amber-500/5' : 'border-slate-700 hover:border-slate-500 bg-slate-900/40'}`}
                  >
                    <Upload size={32} className="mx-auto text-slate-400 mb-3" />
                    <span className="text-xs font-semibold text-slate-200 block mb-1">
                      Click to choose file or drag and drop here
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Supports .csv, .xlsx, and .xls (No limit on row count)
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Option B: Direct CSV / Chatbox Paste */}
              <div className="bg-[#1e293b] border border-slate-700/80 rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                    <FileText size={18} className="text-amber-400" />
                    Option 2: Paste Raw CSV Text
                  </h4>
                  <p className="text-slate-400 text-xs mb-2">
                    Copy and paste thousands of lines directly from chat or spreadsheet.
                  </p>

                  <textarea
                    rows={6}
                    value={pastedCSV}
                    onChange={(e) => setPastedCSV(e.target.value)}
                    placeholder="sku,name,category,subcategory,priceUSD,stock,description&#10;SPN-CAM-001,Axis 4K AI Dome Camera,Video Surveillance & Cameras,Dome Cameras,249.99,50,Industrial camera...&#10;SPN-NVR-002,Hikvision 64-Ch Enterprise NVR,Video Management & Recording,NVRs,,25,Leave price blank for Quote Request..."
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={handlePastedCSVUpload}
                  disabled={!pastedCSV.trim() || isUploading}
                  className="mt-3 w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-slate-200 font-semibold py-2 px-4 rounded-lg text-xs transition-colors border border-slate-700"
                >
                  Ingest Pasted CSV Text
                </button>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: CUSTOMER ORDERS & INVOICES */}
        {activeTab === 'orders' && (
          <div className="mt-6 space-y-4">
            <div className="bg-[#1e293b] rounded-xl border border-slate-700/80 overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center text-xs">
                <span className="font-bold text-white text-sm">All Customer Hardware Orders</span>
                <span className="text-slate-400">Total: {orders.length} orders recorded</span>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No orders recorded yet. As customers place orders via Paystack, they appear here in real-time.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0f172a] text-slate-400 font-semibold border-b border-slate-700">
                      <tr>
                        <th className="py-3 px-4">Order #</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Items</th>
                        <th className="py-3 px-4">Total (USD / NGN)</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Fulfillment Status</th>
                        <th className="py-3 px-4">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {orders.map((order, idx) => (
                        <tr key={order.id || order.orderNumber || `admin-order-${idx}`} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-white">
                            {order.orderNumber}
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-200">{order.customerName}</div>
                            <div className="text-[11px] text-slate-400">{order.customerEmail}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {order.items.length} items
                          </td>
                          <td className="py-3 px-4 font-bold text-amber-400">
                            ${order.totalUSD.toFixed(2)}
                            <div className="text-[10px] text-slate-400 font-normal">
                              ₦{order.totalNGN.toLocaleString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                              className="bg-[#0f172a] border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs outline-none focus:border-amber-500 cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => downloadInvoicePDF(order)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-1.5 rounded flex items-center gap-1 text-[11px] transition-colors"
                              title="Download PDF Invoice"
                            >
                              <Download size={13} className="text-amber-400" /> PDF
                            </button>
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

        {/* TAB 4: CATEGORIES BREAKDOWN */}
        {activeTab === 'categories' && (
          <div className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CATEGORIES.map((cat, idx) => {
                const count = products.filter(p => (p.category || '').toLowerCase() === cat.name.toLowerCase()).length;
                return (
                  <div key={cat.id ?? cat.slug ?? `cat-overview-${idx}`} className="bg-[#1e293b] border border-slate-700/80 rounded-xl p-4 text-xs space-y-2">
                    <div className="flex items-center gap-3">
                      <img src={cat.image} alt="" className="w-10 h-10 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate">{cat.name}</h4>
                        <span className="text-amber-400 font-mono font-bold text-sm">
                          {count} Products
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                      {cat.subcategories.length} subcategories:
                      <div className="text-slate-500 truncate mt-0.5">
                        {cat.subcategories.slice(0, 3).join(', ')}...
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
