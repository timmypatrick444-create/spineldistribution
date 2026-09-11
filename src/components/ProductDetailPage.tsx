import React, { useState } from 'react';
import { 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Lock, 
  MapPin, 
  Check, 
  ChevronRight,
  Share2,
  Heart
} from 'lucide-react';
import { Product } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';

interface ProductDetailPageProps {
  product: Product;
  onSelectCategory: (categoryName: string, subcategoryName?: string) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onSelectCategory,
  onBuyNow
}) => {
  const { formatPrice, currency, exchangeRate } = useCurrency();
  const { addToCart } = useCart();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onBuyNow(product, quantity);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 flex-wrap">
        <span 
          onClick={() => onSelectCategory(product.category)}
          className="hover:underline cursor-pointer hover:text-blue-700"
        >
          {product.category}
        </span>
        <ChevronRight size={12} className="text-gray-400" />
        <span 
          onClick={() => onSelectCategory(product.category, product.subcategory)}
          className="hover:underline cursor-pointer hover:text-blue-700"
        >
          {product.subcategory}
        </span>
        <ChevronRight size={12} className="text-gray-400" />
        <span className="text-gray-900 font-medium truncate max-w-md">
          {product.sku}
        </span>
      </div>

      {/* Main PDP 3-Column Amazon Layout (Gallery | Details | Buy Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Interactive Image Gallery (Col 1-5) */}
        <div className="lg:col-span-5 flex flex-col-reverse sm:flex-row gap-4 sticky top-24">
          
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible shrink-0">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-14 h-14 rounded border p-1 bg-white cursor-pointer ${activeImageIndex === idx ? 'border-[#e77600] ring-2 ring-[#e77600]/30' : 'border-gray-200 hover:border-gray-400'}`}
              >
                <img src={img} alt="" className="w-full h-full object-contain" />
              </button>
            ))}
          </div>

          {/* Active Large Display */}
          <div className="flex-1 bg-white border border-gray-200 rounded p-6 flex items-center justify-center min-h-[380px] max-h-[480px]">
            <img 
              src={product.images[activeImageIndex] || product.images[0]} 
              alt={product.name}
              className="max-h-full max-w-full object-contain" 
            />
          </div>

        </div>

        {/* Center: Title, Brand, Specs & Features (Col 6-9) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Brand Link */}
          <div className="text-xs text-blue-700 font-medium hover:underline cursor-pointer">
            Brand: {product.brand}
          </div>

          {/* Product Title */}
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-snug">
            {product.name}
          </h1>

          {/* Amazon Choice & Reviews */}
          <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-gray-200 text-xs">
            {product.isChoice && (
              <span className="bg-[#131921] text-white font-bold px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                Spinel's <span className="text-[#febd69]">Choice</span>
              </span>
            )}

            <div className="flex items-center gap-1">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.floor(product.rating) ? 'fill-amber-500' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="font-bold text-gray-800">{product.rating}</span>
            </div>

            <span className="text-blue-700 hover:underline cursor-pointer">
              {product.reviewCount} customer ratings
            </span>
          </div>

          {/* Price Block */}
          <div className="space-y-1 pb-4 border-b border-gray-200">
            <div className="text-xs text-gray-500">List Price:</div>
            <div className="text-3xl font-bold text-[#b12704] flex items-baseline gap-2">
              <span>{formatPrice(product.priceUSD)}</span>
              {currency === 'USD' && (
                <span className="text-sm font-normal text-gray-600">
                  (Equivalent in NGN: <strong className="text-gray-900">₦{(product.priceUSD * exchangeRate).toLocaleString()}</strong>)
                </span>
              )}
            </div>

            {product.isPrime && (
              <div className="flex items-center gap-1.5 text-xs text-gray-700 pt-1">
                <span className="text-[#007185] font-black text-sm italic">✓prime</span>
                <span>FREE Returns &amp; International Delivery</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="text-sm text-gray-700 leading-relaxed">
            <p>{product.description}</p>
          </div>

          {/* Technical Specifications Table */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="border border-gray-200 rounded-md overflow-hidden text-xs">
              <div className="bg-gray-100 px-3 py-2 font-bold text-gray-800 border-b border-gray-200">
                Technical Specifications
              </div>
              <div className="divide-y divide-gray-100">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="grid grid-cols-3 px-3 py-2">
                    <span className="font-semibold text-gray-600">{key}</span>
                    <span className="col-span-2 text-gray-900">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About This Item Feature Bullets */}
          {product.features && product.features.length > 0 && (
            <div className="pt-2">
              <h3 className="font-bold text-sm text-gray-900 mb-2">About this item</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-700">
                {product.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Right: Amazon Buy Box (Col 10-12) */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm space-y-3.5 text-xs">
            
            {/* Price in Buy Box */}
            <div className="text-2xl font-bold text-[#b12704]">
              {formatPrice(product.priceUSD)}
            </div>

            {/* Delivery Info */}
            <div className="text-xs text-gray-700 space-y-1">
              <div>
                <span className="text-[#007185] font-bold italic">✓prime</span>{' '}
                <span className="font-bold">FREE Delivery</span> Tomorrow
              </div>
              <div className="flex items-center gap-1 text-gray-600 text-[11px]">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span>Enterprise Direct Dispatch</span>
              </div>
            </div>

            {/* Stock Availability */}
            <div>
              {product.stock > 10 ? (
                <div className="text-base font-bold text-green-700">In Stock</div>
              ) : product.stock > 0 ? (
                <div className="text-sm font-bold text-amber-700">
                  Only {product.stock} left in stock - order soon.
                </div>
              ) : (
                <div className="text-sm font-bold text-red-700">Temporarily out of stock</div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="qty" className="font-semibold text-gray-700">Quantity:</label>
              <select
                id="qty"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                className="bg-gray-50 border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-[#e77600] cursor-pointer"
              >
                {[...Array(Math.min(10, Math.max(1, product.stock)))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Add to Cart Yellow Amazon Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-gray-900 font-bold py-2.5 px-4 rounded-full border border-[#fcd200] shadow-sm cursor-pointer transition-colors text-xs"
            >
              Add to Cart
            </button>

            {/* Buy Now Orange Amazon Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full bg-[#ffa41c] hover:bg-[#fa8900] active:bg-[#ee7600] text-gray-900 font-bold py-2.5 px-4 rounded-full border border-[#ff8f00] shadow-sm cursor-pointer transition-colors text-xs"
            >
              Buy Now
            </button>

            {/* Added Toast Notification */}
            {addedToast && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-2 rounded flex items-center gap-2 text-xs animate-in fade-in">
                <Check size={14} className="text-green-600" />
                <span>Added to your Cart!</span>
              </div>
            )}

            {/* Buy Box Metadata Table */}
            <div className="border-t border-gray-200 pt-3 space-y-1.5 text-[11px] text-gray-600">
              <div className="flex justify-between">
                <span>Ships from</span>
                <span className="font-medium text-gray-900">Spinel Distribution</span>
              </div>
              <div className="flex justify-between">
                <span>Sold by</span>
                <span className="font-medium text-gray-900">Spinel Distribution Global</span>
              </div>
              <div className="flex justify-between">
                <span>Returns</span>
                <span className="font-medium text-blue-700 hover:underline cursor-pointer">
                  30-day refund/replacement
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment</span>
                <span className="font-medium text-green-700 flex items-center gap-1">
                  <Lock size={10} /> Secure Paystack Gateway
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
