import React, { useState, useMemo } from 'react';
import { 
  Star, 
  Check, 
  ChevronRight, 
  Filter, 
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES } from '../data/categories';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';

interface CatalogPageProps {
  products: Product[];
  selectedCategory?: string;
  selectedSubcategory?: string;
  searchQuery?: string;
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (categoryName?: string, subcategoryName?: string) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  products,
  selectedCategory,
  selectedSubcategory,
  searchQuery,
  onSelectProduct,
  onSelectCategory
}) => {
  const { formatPrice, currency, exchangeRate } = useCurrency();
  const { addToCart } = useCart();

  // Local Filter States
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyPrime, setOnlyPrime] = useState<boolean>(false);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Safe product list
  const safeProducts = useMemo(() => Array.isArray(products) ? products : [], [products]);

  // Derive unique brands
  const brands = useMemo(() => {
    const list = Array.from(new Set(safeProducts.map(p => p.brand).filter(Boolean)));
    return ['All', ...list];
  }, [safeProducts]);

  // Current active category definition
  const currentCategoryDef = useMemo(() => {
    if (!selectedCategory) return null;
    return CATEGORIES.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase());
  }, [selectedCategory]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return safeProducts.filter(p => {
      // Category
      if (selectedCategory && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Subcategory
      if (selectedSubcategory && p.subcategory.toLowerCase() !== selectedSubcategory.toLowerCase()) {
        return false;
      }
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = 
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q);
        if (!matches) return false;
      }
      // Brand
      if (selectedBrand !== 'All' && p.brand !== selectedBrand) {
        return false;
      }
      // Price
      const min = parseFloat(minPrice);
      if (!isNaN(min) && p.priceUSD < min) return false;

      const max = parseFloat(maxPrice);
      if (!isNaN(max) && p.priceUSD > max) return false;

      // Rating
      if (minRating > 0 && p.rating < minRating) return false;

      // Prime
      if (onlyPrime && !p.isPrime) return false;

      // In Stock
      if (inStockOnly && p.stock <= 0) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.priceUSD - b.priceUSD;
      if (sortBy === 'price_desc') return b.priceUSD - a.priceUSD;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [
    safeProducts, 
    selectedCategory, 
    selectedSubcategory, 
    searchQuery, 
    selectedBrand, 
    minPrice, 
    maxPrice, 
    minRating, 
    onlyPrime, 
    inStockOnly, 
    sortBy
  ]);

  const clearAllFilters = () => {
    setSelectedBrand('All');
    setMinPrice('');
    setMaxPrice('');
    setMinRating(0);
    setOnlyPrime(false);
    setInStockOnly(false);
    onSelectCategory(undefined, undefined);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      
      {/* Breadcrumbs & Results Top Bar */}
      <div className="bg-white p-3 rounded border border-gray-200 mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span 
            onClick={() => onSelectCategory(undefined, undefined)}
            className="text-blue-700 hover:underline cursor-pointer font-medium"
          >
            All Categories
          </span>
          {selectedCategory && (
            <>
              <ChevronRight size={12} className="text-gray-400" />
              <span 
                onClick={() => onSelectCategory(selectedCategory, undefined)}
                className={`cursor-pointer ${!selectedSubcategory ? 'font-bold text-gray-900' : 'text-blue-700 hover:underline'}`}
              >
                {selectedCategory}
              </span>
            </>
          )}
          {selectedSubcategory && (
            <>
              <ChevronRight size={12} className="text-gray-400" />
              <span className="font-bold text-gray-900">{selectedSubcategory}</span>
            </>
          )}
          {searchQuery && (
            <span className="ml-2 font-medium text-gray-900">
              for <span className="text-[#c45500]">"{searchQuery}"</span>
            </span>
          )}
          
          <span className="text-gray-400 ml-2">|</span>
          <span className="text-gray-700 font-semibold">
            {filteredProducts.length} results
          </span>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-gray-600">Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-800 font-medium outline-none focus:border-[#e77600] cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Avg. Customer Review</option>
            <option value="newest">Newest Arrivals</option>
          </select>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded border border-gray-300"
          >
            <Filter size={14} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        
        {/* AMAZON LEFT SIDEBAR FILTERS (Desktop) */}
        <aside className="hidden md:block w-64 shrink-0 space-y-6 text-sm">
          
          {/* Active Filter Clear */}
          {(selectedCategory || selectedSubcategory || selectedBrand !== 'All' || minRating > 0 || onlyPrime) && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded flex items-center justify-between text-xs">
              <span className="text-amber-900 font-medium">Filters Applied</span>
              <button
                onClick={clearAllFilters}
                className="text-blue-700 hover:underline font-bold"
              >
                Clear all
              </button>
            </div>
          )}

          {/* 1. Department / Category Filter */}
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-2">Department</h4>
            <div className="space-y-1 text-xs">
              <div 
                onClick={() => onSelectCategory(undefined, undefined)}
                className={`cursor-pointer hover:text-[#c45500] ${!selectedCategory ? 'font-bold text-[#c45500]' : 'text-gray-700'}`}
              >
                Any Category
              </div>

              {CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <div key={cat.id} className="pt-0.5">
                    <div
                      onClick={() => onSelectCategory(cat.name, undefined)}
                      className={`cursor-pointer hover:text-[#c45500] flex items-center justify-between ${isSelected ? 'font-bold text-gray-900' : 'text-gray-700'}`}
                    >
                      <span className="line-clamp-1">{cat.name}</span>
                    </div>

                    {/* Show subcategories when category is selected */}
                    {isSelected && (
                      <div className="ml-3 pl-2 border-l-2 border-gray-200 mt-1 space-y-1">
                        {cat.subcategories.map(sub => {
                          const isSubSelected = selectedSubcategory === sub;
                          return (
                            <div
                              key={sub}
                              onClick={() => onSelectCategory(cat.name, sub)}
                              className={`cursor-pointer text-[11px] hover:text-[#c45500] ${isSubSelected ? 'font-bold text-[#c45500]' : 'text-gray-600'}`}
                            >
                              {sub}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Customer Reviews Filter */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-bold text-gray-900 text-sm mb-2">Customer Reviews</h4>
            <div className="space-y-1.5 text-xs">
              {[4, 3, 2].map(stars => (
                <div
                  key={stars}
                  onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                  className={`flex items-center gap-1.5 cursor-pointer hover:text-[#c45500] ${minRating === stars ? 'font-bold text-gray-900' : 'text-gray-700'}`}
                >
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < stars ? 'fill-amber-500' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span>&amp; Up</span>
                  {minRating === stars && <span className="text-xs text-blue-700 ml-auto">✓</span>}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Spinel Prime Filter */}
          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyPrime}
                onChange={(e) => setOnlyPrime(e.target.checked)}
                className="rounded text-[#e77600] focus:ring-[#e77600]"
              />
              <span className="text-[#007185] font-extrabold text-sm italic">✓prime</span>
              <span className="text-xs text-gray-600">Eligible</span>
            </label>
          </div>

          {/* 4. Brands Filter */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-bold text-gray-900 text-sm mb-2">Brand</h4>
            <div className="space-y-1 text-xs max-h-40 overflow-y-auto">
              {brands.map(brand => (
                <label key={brand} className="flex items-center gap-2 cursor-pointer hover:text-gray-900 text-gray-700">
                  <input
                    type="radio"
                    name="brand-filter"
                    checked={selectedBrand === brand}
                    onChange={() => setSelectedBrand(brand)}
                    className="text-[#e77600] focus:ring-[#e77600]"
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 5. Price Filter */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-bold text-gray-900 text-sm mb-2">Price (USD)</h4>
            <div className="flex items-center gap-2 text-xs">
              <input
                type="number"
                placeholder="$ Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-20 border border-gray-300 rounded px-2 py-1 outline-none focus:border-[#e77600]"
              />
              <span className="text-gray-400">to</span>
              <input
                type="number"
                placeholder="$ Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-20 border border-gray-300 rounded px-2 py-1 outline-none focus:border-[#e77600]"
              />
            </div>
            {currency === 'NGN' && (
              <p className="text-[11px] text-gray-500 mt-1">
                Converted to ₦ in listings at rate 1 USD = ₦{exchangeRate.toLocaleString()}
              </p>
            )}
          </div>

          {/* 6. In Stock Filter */}
          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-[#e77600] focus:ring-[#e77600]"
              />
              <span>In Stock Only</span>
            </label>
          </div>

        </aside>

        {/* AMAZON PRODUCT LISTING GRID */}
        <main className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="bg-white p-12 text-center rounded border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                No matching hardware products found
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Try resetting your filters or search keywords.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="bg-[#ffd814] hover:bg-[#f7ca00] text-black font-semibold text-xs py-2 px-5 rounded-full border border-[#fcd200]"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((prod, idx) => (
                <div
                  key={`${prod.id || 'prod'}-${prod.sku || idx}-${idx}`}
                  className="bg-white border border-gray-200 rounded p-4 flex flex-col justify-between hover:shadow-lg transition-shadow"
                >
                  <div 
                    onClick={() => onSelectProduct(prod)}
                    className="cursor-pointer"
                  >
                    {/* Image */}
                    <div className="w-full h-52 bg-gray-50 rounded flex items-center justify-center p-3 mb-3">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="max-h-full max-w-full object-contain hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-1.5 mb-1.5 min-h-5">
                      {prod.isBestSeller && (
                        <span className="bg-[#e67a00] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                          #1 Best Seller
                        </span>
                      )}
                      {prod.isChoice && (
                        <span className="bg-[#131921] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                          Spinel's <span className="text-[#febd69]">Choice</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-medium text-gray-900 hover:text-[#c45500] line-clamp-2 leading-snug mb-1">
                      {prod.name}
                    </h3>

                    {/* Subcategory & Brand */}
                    <div className="text-[11px] text-gray-500 mb-1.5">
                      {prod.brand} • <span className="text-gray-700">{prod.subcategory}</span>
                    </div>

                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < Math.floor(prod.rating) ? 'fill-amber-500' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-blue-700 font-medium">
                        {prod.reviewCount}
                      </span>
                    </div>

                    {/* Pricing */}
                    <div className="mb-2">
                      <div className="text-xl font-bold text-gray-900 flex items-baseline gap-1.5">
                        <span>{formatPrice(prod.priceUSD)}</span>
                        {currency === 'USD' && (
                          <span className="text-xs font-normal text-gray-500">
                            (₦{(prod.priceUSD * exchangeRate).toLocaleString()})
                          </span>
                        )}
                      </div>

                      {prod.isPrime && (
                        <div className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                          <span className="text-[#007185] font-extrabold text-xs italic">✓prime</span>
                          <span>FREE delivery Tomorrow</span>
                        </div>
                      )}

                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {prod.stock > 10 ? (
                          <span className="text-green-700 font-medium">In Stock</span>
                        ) : prod.stock > 0 ? (
                          <span className="text-amber-700 font-medium">Only {prod.stock} left in stock - order soon.</span>
                        ) : (
                          <span className="text-red-700 font-medium">Temporarily out of stock.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={() => addToCart(prod, 1)}
                    className="w-full mt-3 bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-gray-900 font-semibold text-xs py-2 px-3 rounded-full border border-[#fcd200] shadow-sm cursor-pointer transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>

      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-bold text-base text-gray-900">Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)}><X size={20} /></button>
            </div>
            {/* Simple mobile filters */}
            <div>
              <h4 className="font-bold mb-2">Category</h4>
              {CATEGORIES.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => { onSelectCategory(c.name); setMobileFilterOpen(false); }}
                  className="py-1.5 text-blue-700"
                >
                  {c.name}
                </div>
              ))}
            </div>
            <button
              onClick={() => { clearAllFilters(); setMobileFilterOpen(false); }}
              className="w-full py-2 bg-gray-100 font-bold rounded"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
