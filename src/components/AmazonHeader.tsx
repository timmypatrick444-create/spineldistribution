import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  ChevronDown, 
  Menu, 
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
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

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

  const handleCategorySelectFromDropdown = (catName: string) => {
    setSelectedCategory(catName);
    setCategoryDropdownOpen(false);
    if (catName === 'All') {
      if (onSelectCategory) onSelectCategory('');
      onNavigate('catalog');
    } else {
      if (onSelectCategory) onSelectCategory(catName);
      onNavigate('category', catName);
    }
  };

  // Reusable action cluster
  const renderActionItems = (isMobile = false) => (
    <div className={`flex items-center ${isMobile ? 'gap-1.5 sm:gap-2.5' : 'gap-2.5 sm:gap-3'} shrink-0`}>
      
      {/* 1-CURRENCY CONVERTER: BACKGROUND #232F3E, UNTOUCHED DROPDOWN */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setCurrencyMenuOpen(!currencyMenuOpen)}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 bg-[#232F3E] hover:bg-[#2c3b4e] border border-[#3a4756] rounded-md cursor-pointer transition-colors shadow-xs"
          title="Select Currency"
        >
          <img
            src={currency === 'USD' 
              ? "https://res.cloudinary.com/bmv4hvtk/image/upload/v1788620186/usa-flag.png" 
              : "https://res.cloudinary.com/bmv4hvtk/image/upload/v1788620186/nigeria-flag.png"}
            alt={currency === 'USD' ? "USA Flag" : "Nigeria Flag"}
            className="w-4 h-3 sm:w-5 sm:h-3.5 object-cover rounded-xs border border-white/30 shadow-xs"
            referrerPolicy="no-referrer"
          />
          <span className="text-[11px] sm:text-xs md:text-sm font-bold text-white uppercase tracking-wider">
            {currency}
          </span>
          <ChevronDown size={12} className="text-gray-300" />
        </button>

        {currencyMenuOpen && (
          <div 
            className="absolute right-0 mt-1 w-52 bg-white text-gray-800 rounded-md shadow-2xl border border-gray-200 py-2 z-50 text-xs sm:text-sm"
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

      {/* 2-REQUEST QUOTE NAV BUTTON: BACKGROUND #FEBD69 */}
      <button
        type="button"
        onClick={() => onNavigate('quote')}
        className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-[#FEBD69] hover:bg-[#f3a847] active:bg-[#e29b3c] text-[#111] font-extrabold text-[11px] sm:text-xs md:text-sm rounded border border-[#df9b3e] shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap"
        title="Request Enterprise Quotation (RFQ)"
      >
        <FileText size={15} className="stroke-[2.5]" />
        <span className={isMobile ? "hidden sm:inline" : "inline"}>Request Quote</span>
      </button>

      {/* 3-ACCOUNTS: HOVER BORDER #6b7280 */}
      <div className="relative">
        <div
          onClick={() => setAccountMenuOpen(!accountMenuOpen)}
          className="p-1 sm:p-1.5 rounded cursor-pointer leading-tight border border-transparent hover:border-[#6b7280] transition-colors"
        >
          <div className="text-[10px] sm:text-xs text-gray-300 truncate max-w-[100px] sm:max-w-[120px]">
            {user ? `Hello, ${user.fullName.split(' ')[0]}` : 'Hello, sign in'}
          </div>
          <div className="text-[11px] sm:text-xs md:text-sm font-bold text-white flex items-center gap-0.5">
            <span>Accounts</span>
            <ChevronDown size={12} className="text-gray-400" />
          </div>
        </div>

        {accountMenuOpen && (
          <div 
            className="absolute right-0 mt-1 w-64 bg-white text-gray-800 rounded-md shadow-2xl border border-gray-200 py-3 z-50 text-sm"
            onMouseLeave={() => setAccountMenuOpen(false)}
          >
            {!user ? (
              <div className="px-4 pb-3 border-b border-gray-200 text-center">
                <button
                  type="button"
                  onClick={() => { setAccountMenuOpen(false); onNavigate('auth'); }}
                  className="w-full bg-[#f0c14b] hover:bg-[#e2b33c] text-black font-semibold py-2 px-4 rounded border border-[#a88734] shadow-sm text-xs sm:text-sm cursor-pointer"
                >
                  Sign in to your account
                </button>
                <p className="text-xs text-gray-600 mt-2">
                  New customer?{' '}
                  <span 
                    onClick={() => { setAccountMenuOpen(false); onNavigate('auth'); }}
                    className="text-blue-600 hover:underline cursor-pointer font-medium"
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

            <div className="py-2 px-3 text-xs sm:text-sm space-y-1">
              <div className="font-bold text-gray-700 text-[11px] uppercase tracking-wider mb-1">
                Your Account
              </div>
              <button
                type="button"
                onClick={() => { setAccountMenuOpen(false); onNavigate('orders'); }}
                className="w-full text-left px-2 py-1.5 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
              >
                <FileText size={15} className="text-gray-500" />
                Your Orders &amp; Invoices
              </button>
              <button
                type="button"
                onClick={() => { setAccountMenuOpen(false); onNavigate('quote'); }}
                className="w-full text-left px-2 py-1.5 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
              >
                <FileText size={15} className="text-gray-500" />
                Request Quote / RFQ
              </button>

              {user && (
                <button
                  type="button"
                  onClick={() => { customerLogout(); setAccountMenuOpen(false); }}
                  className="w-full text-left px-2 py-1.5 hover:bg-red-50 text-red-600 rounded flex items-center gap-2 mt-1 border-t border-gray-100"
                >
                  <LogOut size={15} />
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
        className="flex items-center p-1 sm:p-1.5 rounded cursor-pointer relative border border-transparent hover:border-[#6b7280] transition-colors"
        title="Shopping Cart"
      >
        <div className="relative">
          <ShoppingCart size={26} className="text-white" />
          <span className="absolute -top-1.5 left-3 bg-[#f08804] text-black font-black text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-slow-blink ring-1 ring-black/20">
            {totalItemsCount}
          </span>
        </div>
        <span className="hidden md:inline font-bold text-sm sm:text-base text-white ml-1.5 mt-2">
          Cart
        </span>
      </div>

    </div>
  );

  // Reusable search form
  const renderSearchForm = (className = "") => (
    <form 
      onSubmit={handleSearchSubmit} 
      className={`relative flex items-center h-10 sm:h-11 rounded-md bg-white text-black min-w-0 ${className}`}
    >
      {/* Category Dropdown inside Search - Styled cleanly with 'All' */}
      <div className="relative h-full flex items-center shrink-0">
        <button
          type="button"
          onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
          className="h-full bg-gray-100 hover:bg-gray-200 border-r border-gray-300 flex items-center gap-1.5 px-2.5 sm:px-3 cursor-pointer transition-colors text-xs sm:text-sm font-bold text-gray-800 rounded-l-md shrink-0"
        >
          <span className="max-w-[70px] sm:max-w-[120px] truncate">
            {selectedCategory === 'All' ? 'All' : selectedCategory}
          </span>
          <ChevronDown size={13} className="text-gray-600 shrink-0" />
        </button>

        {/* Custom Category Dropdown */}
        {categoryDropdownOpen && (
          <div 
            className="absolute left-0 top-full mt-1.5 w-64 sm:w-80 bg-white text-gray-900 rounded-lg shadow-2xl border border-gray-300 z-50 max-h-96 overflow-y-auto py-1.5 text-xs sm:text-sm"
            onMouseLeave={() => setCategoryDropdownOpen(false)}
          >
            <div className="px-3.5 py-1.5 font-bold text-gray-500 border-b border-gray-100 uppercase tracking-wider text-[11px]">
              Filter by Category
            </div>

            {/* All Option */}
            <button
              type="button"
              onClick={() => handleCategorySelectFromDropdown('All')}
              className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-gray-100 transition-colors ${selectedCategory === 'All' ? 'font-bold text-[#b12704] bg-amber-50' : 'text-gray-800'}`}
            >
              <span className="font-semibold">All Categories &amp; Products</span>
              {selectedCategory === 'All' && <span className="text-[#b12704] font-bold">✓</span>}
            </button>

            {/* 16 Distribution Categories */}
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelectFromDropdown(cat.name)}
                className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-gray-100 transition-colors ${selectedCategory === cat.name ? 'font-bold text-[#b12704] bg-amber-50' : 'text-gray-700'}`}
              >
                <span className="truncate pr-2">{cat.name}</span>
                {selectedCategory === cat.name && <span className="text-[#b12704] font-bold">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Input */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search cameras, NVRs, solar inverters, access control..."
        className="flex-1 min-w-0 h-full px-2.5 sm:px-3.5 text-xs sm:text-sm text-gray-900 outline-none bg-white placeholder-gray-500"
      />

      {/* Submit Yellow Button */}
      <button
        type="submit"
        aria-label="Search"
        onClick={handleSearchSubmit}
        className="bg-[#febd69] hover:bg-[#f3a847] h-full px-4 sm:px-5 flex items-center justify-center transition-colors cursor-pointer text-[#131921] rounded-r-md shrink-0"
      >
        <Search size={19} className="stroke-[2.5]" />
      </button>
    </form>
  );

  return (
    <header className="sticky top-0 z-40 w-full max-w-full flex flex-col font-sans select-none shadow-md">
      
      {/* Top Primary Amazon Navbar with consistent gutter: w-full px-4 sm:px-6 lg:px-8 */}
      <div className="bg-[#131921] text-white w-full px-4 sm:px-6 lg:px-8 py-2">
        
        {/* DESKTOP LAYOUT (lg and up): Brand on Left, Search in Middle, Actions on Right */}
        <div className="hidden lg:flex items-center justify-between gap-4 w-full">
          {/* Brand Logo - Official SPINEL DISTRIBUITION */}
          <div 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 p-1 rounded cursor-pointer shrink-0 transition-opacity"
            title="SPINEL DISTRIBUITION - Homepage"
          >
            <img 
              src="https://res.cloudinary.com/bmv4hvtk/image/upload/v1788619290/Spinel_Distribution.jpg"
              alt="SPINEL DISTRIBUITION"
              className="h-11 w-auto min-w-[48px] object-contain rounded bg-white p-1 shadow-md"
              referrerPolicy="no-referrer"
            />
            <span className="font-extrabold tracking-tight text-white text-base xl:text-lg leading-tight uppercase font-sans whitespace-nowrap">
              SPINEL DISTRIBUITION
            </span>
          </div>

          {/* Search bar in center */}
          <div className="flex-1 max-w-2xl xl:max-w-3xl mx-2 min-w-0">
            {renderSearchForm("w-full shadow-xs")}
          </div>

          {/* Right Action Items */}
          {renderActionItems(false)}
        </div>

        {/* MOBILE & TABLET LAYOUT (< lg): Prevents any horizontal overflow */}
        <div className="flex lg:hidden flex-col gap-2 w-full">
          {/* Row 1: Logo on Left, Action Items on Right */}
          <div className="flex items-center justify-between gap-2 w-full">
            <div 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 p-0.5 rounded cursor-pointer shrink-0"
              title="SPINEL DISTRIBUITION - Homepage"
            >
              <img 
                src="https://res.cloudinary.com/bmv4hvtk/image/upload/v1788619290/Spinel_Distribution.jpg"
                alt="SPINEL DISTRIBUITION"
                className="h-9 w-auto min-w-[38px] object-contain rounded bg-white p-1 shadow-md"
                referrerPolicy="no-referrer"
              />
              <span className="font-extrabold tracking-tight text-white text-xs sm:text-sm md:text-base uppercase font-sans whitespace-nowrap">
                SPINEL DISTRIBUITION
              </span>
            </div>

            {/* Action buttons on mobile/tablet */}
            {renderActionItems(true)}
          </div>

          {/* Row 2: Full-width responsive search bar */}
          <div className="w-full">
            {renderSearchForm("w-full shadow-sm")}
          </div>
        </div>

      </div>

      {/* Sub Navbar (Amazon Dark Slate #232f3e) with exact matching gutter: w-full px-4 sm:px-6 lg:px-8 */}
      <div className="bg-[#232f3e] text-white w-full px-4 sm:px-6 lg:px-8 py-1 flex items-center gap-4 text-xs font-medium overflow-x-auto whitespace-nowrap scrollbar-none shadow-sm">
        
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
