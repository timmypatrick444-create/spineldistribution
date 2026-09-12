import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  ChevronDown, 
  Menu, 
  User, 
  FileText,
  LogOut
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../data/categories';

interface AmazonHeaderProps {
  onOpenDrawer: () => void;
  onSearch?: (query: string, category?: string) => void;
  onSearchSubmit?: (query: string, category?: string) => void;
  onSelectCategory?: (category: string) => void;
  currentCategory?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const AmazonHeader: React.FC<AmazonHeaderProps> = ({
  onOpenDrawer,
  onSearch,
  onSearchSubmit,
  onSelectCategory,
  currentCategory,
  onNavigate
}) => {
  const { currency, setCurrency } = useCurrency();
  const { totalItemsCount } = useCart();
  const { user, customerLogout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(currentCategory || 'All');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);

  // Sync category state with prop changes
  useEffect(() => {
    if (currentCategory) {
      setSelectedCategory(currentCategory);
    } else {
      setSelectedCategory('All');
    }
  }, [currentCategory]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const searchFn = onSearchSubmit || onSearch;
    if (typeof searchFn === 'function') {
      searchFn(searchQuery.trim(), selectedCategory === 'All' ? undefined : selectedCategory);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex flex-col font-sans select-none shadow-md">
      {/* Top Primary Amazon Navbar */}
      <div className="bg-[#131921] text-white px-3 py-1.5 flex items-center justify-between gap-3 text-sm">
        
        {/* Brand Logo - Official SPINEL DISTRIBUITION */}
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 p-1 hover:outline hover:outline-1 hover:outline-white rounded cursor-pointer shrink-0 transition-opacity"
          title="SPINEL DISTRIBUITION - Homepage"
        >
          <img 
            src="https://res.cloudinary.com/bmv4hvtk/image/upload/v1788619290/Spinel_Distribution.jpg"
            alt="SPINEL DISTRIBUITION"
            className="h-9 sm:h-10 w-auto object-contain rounded bg-white p-0.5 shadow-sm"
            referrerPolicy="no-referrer"
          />
          <span className="font-extrabold tracking-tight text-white text-sm sm:text-base md:text-lg leading-tight uppercase font-sans whitespace-nowrap">
            SPINEL DISTRIBUITION
          </span>
        </div>

        {/* Amazon Global Search Bar */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="flex-1 max-w-3xl flex items-center h-10 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-[#f3a847] bg-white text-black"
        >
          {/* Category Dropdown inside Search - Styled cleanly with 'All' */}
          <div className="relative bg-gray-100 hover:bg-gray-200/90 border-r border-gray-300 h-full flex items-center px-2.5 cursor-pointer shrink-0 transition-colors">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs text-gray-800 font-semibold pr-3 outline-none cursor-pointer appearance-none max-w-[130px] truncate py-1"
            >
              <option value="All">All</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="text-gray-600 pointer-events-none -ml-2 shrink-0" />
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cameras, NVRs, solar inverters, access control, PoE switches..."
            className="flex-1 h-full px-3 text-sm text-gray-900 outline-none bg-white placeholder-gray-500 min-w-[100px]"
          />

          {/* Submit Yellow Button */}
          <button
            type="submit"
            aria-label="Search"
            onClick={handleSearchSubmit}
            className="bg-[#febd69] hover:bg-[#f3a847] h-full px-4.5 flex items-center justify-center transition-colors cursor-pointer text-[#131921]"
          >
            <Search size={20} className="stroke-[2.5]" />
          </button>
        </form>

        {/* Right Action Items */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* 1-DROPDOWN FOR CURRENCY: WITH SOFT BACKGROUND */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCurrencyMenuOpen(!currencyMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-md cursor-pointer transition-colors shadow-xs"
              title="Select Currency"
            >
              <img
                src={currency === 'USD' 
                  ? "https://res.cloudinary.com/bmv4hvtk/image/upload/v1788620186/usa-flag.png" 
                  : "https://res.cloudinary.com/bmv4hvtk/image/upload/v1788620186/nigeria-flag.png"}
                alt={currency === 'USD' ? "USA Flag" : "Nigeria Flag"}
                className="w-5 h-3.5 object-cover rounded-xs border border-white/30 shadow-xs"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {currency}
              </span>
              <ChevronDown size={12} className="text-gray-300" />
            </button>

            {currencyMenuOpen && (
              <div 
                className="absolute right-0 mt-1 w-52 bg-white text-gray-800 rounded shadow-xl border border-gray-200 py-2 z-50 text-xs"
                onMouseLeave={() => setCurrencyMenuOpen(false)}
              >
                <div className="px-3 py-1 font-semibold text-gray-500 border-b border-gray-100 uppercase tracking-wider text-[10px]">
                  Select Currency
                </div>
                <button
                  type="button"
                  onClick={() => { setCurrency('USD'); setCurrencyMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-100 transition-colors ${currency === 'USD' ? 'font-bold text-[#b12704] bg-amber-50/60' : ''}`}
                >
                  <span className="flex items-center gap-2.5">
                    <img 
                      src="https://res.cloudinary.com/bmv4hvtk/image/upload/v1788620186/usa-flag.png" 
                      alt="USA Flag" 
                      className="w-5 h-3.5 object-cover rounded-xs border border-gray-300 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <span>USD (US Dollar)</span>
                  </span>
                  {currency === 'USD' && <span>✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => { setCurrency('NGN'); setCurrencyMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-100 transition-colors ${currency === 'NGN' ? 'font-bold text-[#b12704] bg-amber-50/60' : ''}`}
                >
                  <span className="flex items-center gap-2.5">
                    <img 
                      src="https://res.cloudinary.com/bmv4hvtk/image/upload/v1788620186/nigeria-flag.png" 
                      alt="Nigeria Flag" 
                      className="w-5 h-3.5 object-cover rounded-xs border border-gray-300 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <span>NGN (Nigerian Naira)</span>
                  </span>
                  {currency === 'NGN' && <span>✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* 2-REQUEST QUOTE NAV BUTTON BESIDE CURRENCY */}
          <button
            type="button"
            onClick={() => onNavigate('quote')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f0c14b] hover:bg-[#e2b33c] active:bg-[#d8a32a] text-[#111] font-bold text-xs rounded border border-[#a88734] shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap"
            title="Request Enterprise Quotation (RFQ)"
          >
            <FileText size={14} className="stroke-[2.5]" />
            <span className="hidden xs:inline sm:inline">Request Quote</span>
          </button>

          {/* Accounts (previously Account & Lists) */}
          <div className="relative">
            <div
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="p-1.5 hover:outline hover:outline-1 hover:outline-white rounded cursor-pointer leading-tight"
            >
              <div className="text-xs text-gray-300 truncate max-w-[110px]">
                {user ? `Hello, ${user.fullName.split(' ')[0]}` : 'Hello, sign in'}
              </div>
              <div className="text-xs font-bold text-white flex items-center gap-0.5">
                <span>Accounts</span>
                <ChevronDown size={12} className="text-gray-400" />
              </div>
            </div>

            {accountMenuOpen && (
              <div 
                className="absolute right-0 mt-1 w-60 bg-white text-gray-800 rounded shadow-2xl border border-gray-200 py-3 z-50 text-sm"
                onMouseLeave={() => setAccountMenuOpen(false)}
              >
                {!user ? (
                  <div className="px-4 pb-3 border-b border-gray-200 text-center">
                    <button
                      type="button"
                      onClick={() => { setAccountMenuOpen(false); onNavigate('auth'); }}
                      className="w-full bg-[#f0c14b] hover:bg-[#e2b33c] text-black font-semibold py-1.5 px-4 rounded border border-[#a88734] shadow-sm text-xs cursor-pointer"
                    >
                      Sign in to your account
                    </button>
                    <p className="text-[11px] text-gray-600 mt-2">
                      New customer?{' '}
                      <span 
                        onClick={() => { setAccountMenuOpen(false); onNavigate('auth'); }}
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        Start here.
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="px-4 pb-2 border-b border-gray-200">
                    <div className="text-xs text-gray-500">Signed in as:</div>
                    <div className="font-bold text-gray-900 truncate">{user.email}</div>
                  </div>
                )}

                <div className="py-2 px-3 text-xs space-y-1">
                  <div className="font-bold text-gray-700 text-[11px] uppercase tracking-wider mb-1">
                    Your Account
                  </div>
                  <button
                    type="button"
                    onClick={() => { setAccountMenuOpen(false); onNavigate('orders'); }}
                    className="w-full text-left px-2 py-1.5 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                  >
                    <FileText size={14} className="text-gray-500" />
                    Your Orders &amp; Invoices
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAccountMenuOpen(false); onNavigate('quote'); }}
                    className="w-full text-left px-2 py-1.5 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                  >
                    <FileText size={14} className="text-gray-500" />
                    Request Quote / RFQ
                  </button>

                  {user && (
                    <button
                      type="button"
                      onClick={() => { customerLogout(); setAccountMenuOpen(false); }}
                      className="w-full text-left px-2 py-1.5 hover:bg-red-50 text-red-600 rounded flex items-center gap-2 mt-1 border-t border-gray-100"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Amazon Cart with Circular, Slowly Blinking Count Badge */}
          <div 
            onClick={() => onNavigate('cart')}
            className="flex items-center p-1.5 hover:outline hover:outline-1 hover:outline-white rounded cursor-pointer relative"
            title="Shopping Cart"
          >
            <div className="relative">
              <ShoppingCart size={28} className="text-white" />
              {/* Circular count badge with rounded corners & slow attention-grabbing blink */}
              <span className="absolute -top-1.5 left-3 bg-[#f08804] text-black font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-slow-blink ring-1 ring-black/20">
                {totalItemsCount}
              </span>
            </div>
            <span className="hidden sm:inline font-bold text-sm text-white ml-1.5 mt-2">
              Cart
            </span>
          </div>

        </div>

      </div>

      {/* Sub Navbar (Amazon Dark Slate #232f3e) */}
      <div className="bg-[#232f3e] text-white px-3 py-1 flex items-center gap-4 text-xs font-medium overflow-x-auto whitespace-nowrap scrollbar-none shadow-sm">
        
        {/* All Products Drawer Toggle */}
        <button
          type="button"
          onClick={onOpenDrawer}
          className="flex items-center gap-1.5 py-1 px-2 hover:outline hover:outline-1 hover:outline-white rounded cursor-pointer font-bold text-sm text-white shrink-0"
        >
          <Menu size={18} />
          <span>All Products</span>
        </button>

        {/* Direct category shortcuts */}
        <button
          type="button"
          onClick={() => onNavigate('category', 'Video Surveillance & Cameras')}
          className="py-1 px-2 hover:outline hover:outline-1 hover:outline-white rounded cursor-pointer text-gray-200 hover:text-white"
        >
          Video Surveillance
        </button>

        <button
          type="button"
          onClick={() => onNavigate('category', 'Video Management & Recording')}
          className="py-1 px-2 hover:outline hover:outline-1 hover:outline-white rounded cursor-pointer text-gray-200 hover:text-white"
        >
          NVR &amp; AI Analytics
        </button>

        <button
          type="button"
          onClick={() => onNavigate('category', 'Access Control & Door Security')}
          className="py-1 px-2 hover:outline hover:outline-1 hover:outline-white rounded cursor-pointer text-gray-200 hover:text-white"
        >
          Access Control
        </button>

        <button
          type="button"
          onClick={() => onNavigate('category', 'Networking & Connectivity')}
          className="py-1 px-2 hover:outline hover:outline-1 hover:outline-white rounded cursor-pointer text-gray-200 hover:text-white"
        >
          Networking &amp; PoE
        </button>

        <button
          type="button"
          onClick={() => onNavigate('category', 'Renewable Energy')}
          className="py-1 px-2 hover:outline hover:outline-1 hover:outline-white rounded cursor-pointer text-[#febd69] font-bold hover:text-white flex items-center gap-1"
        >
          <span>Renewable Solar &amp; Inverters</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('category', 'Storage & Data Infrastructure')}
          className="py-1 px-2 hover:outline hover:outline-1 hover:outline-white rounded cursor-pointer text-gray-200 hover:text-white"
        >
          Surveillance Hard Drives
        </button>

      </div>
    </header>
  );
};

