import React from 'react';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Lock, 
  FileText, 
  Star, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

interface CartPageProps {
  products?: Product[];
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
  onSelectProduct: (product: Product) => void;
  onRequestQuote?: (product: Product) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  products = [],
  onProceedToCheckout,
  onContinueShopping,
  onSelectProduct,
  onRequestQuote
}) => {
  const { cart, removeFromCart, updateQuantity, clearCart, addToCart, totalItemsCount, subtotalUSD, subtotalNGN } = useCart();
  const { formatPrice, currency, exchangeRate } = useCurrency();

  const isFreeDelivery = subtotalUSD > 500;

  // Filter recommendations from products that are not currently in the cart
  const cartProductIds = new Set(cart.map(i => i.product.id));
  const recommendations = (products || [])
    .filter(p => !cartProductIds.has(p.id))
    .slice(0, 6);

  // Check if any cart item is unpriced
  const hasUnpricedCartItems = cart.some(item => !item.product.priceUSD || item.product.priceUSD <= 0);

  return (
    <div className="w-full px-[20px] py-8 font-sans">
      <div className={`grid grid-cols-1 ${cart.length > 0 ? 'lg:grid-cols-12' : ''} gap-8 items-start`}>
        
        {/* Left: Cart Items List (Full width when empty, Col 1-8 / Col 1-9 on XL when items present) */}
        <div className={`${cart.length > 0 ? 'lg:col-span-8 xl:col-span-9' : 'w-full'} bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-xs`}>
          
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 flex-wrap gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Shopping Cart</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Spinel Distribution Enterprise Equipment Orders
              </p>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs sm:text-sm text-blue-700 hover:underline hover:text-[#c45500] font-medium"
              >
                Clear all items
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="py-14 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Your Spinel Cart is empty</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                Explore our catalog of 4K IP cameras, enterprise NVRs, biometric access systems, and renewable solar power systems.
              </p>
              <button
                type="button"
                onClick={onContinueShopping}
                className="bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-gray-900 font-bold py-2.5 px-6 rounded-full border border-[#fcd200] text-sm cursor-pointer shadow-sm transition-all"
              >
                Explore Hardware Catalog
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {cart.map((item, idx) => {
                const itemHasPrice = !!(item.product.priceUSD && item.product.priceUSD > 0);
                return (
                  <div key={`${item.product.id || 'cart-item'}-${idx}`} className="py-6 flex flex-col sm:flex-row gap-6 items-start">
                    
                    {/* Item Image */}
                    <div 
                      onClick={() => onSelectProduct(item.product)}
                      className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 border border-gray-200 rounded-lg shrink-0 p-2 flex items-center justify-center cursor-pointer hover:opacity-90"
                    >
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.name}
                        className="max-h-full max-w-full object-contain" 
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 space-y-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {item.product.brand} • SKU: {item.product.sku}
                      </div>

                      <h2 
                        onClick={() => onSelectProduct(item.product)}
                        className="text-base sm:text-lg font-bold text-gray-900 hover:text-[#c45500] cursor-pointer leading-snug line-clamp-2"
                      >
                        {item.product.name}
                      </h2>

                      {/* Stock status */}
                      <div className="text-xs sm:text-sm">
                        {item.product.stock > 0 ? (
                          <span className="text-emerald-700 font-semibold">In Stock • Ready for dispatch</span>
                        ) : (
                          <span className="text-amber-700 font-semibold">Backorder / Lead Time 3-5 Days</span>
                        )}
                      </div>

                      {/* Quantity & Delete Controls */}
                      <div className="flex items-center gap-4 pt-1 flex-wrap">
                        <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="px-3 py-1.5 hover:bg-gray-200 text-gray-700 font-bold transition-colors cursor-pointer"
                            title="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-4 font-bold text-gray-900 text-sm">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="px-3 py-1.5 hover:bg-gray-200 text-gray-700 font-bold transition-colors cursor-pointer"
                            title="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-blue-700 hover:underline hover:text-red-700 flex items-center gap-1 text-xs sm:text-sm font-medium cursor-pointer"
                        >
                          <Trash2 size={15} className="text-gray-400" />
                          Delete
                        </button>

                        {!itemHasPrice && (
                          <button
                            type="button"
                            onClick={() => {
                              if (onRequestQuote) {
                                onRequestQuote(item.product);
                              }
                            }}
                            className="text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                          >
                            <FileText size={13} />
                            <span>Request Quote for this</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Item Price */}
                    <div className="text-right shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      {itemHasPrice ? (
                        <>
                          <div className="text-xl sm:text-2xl font-extrabold text-[#b12704]">
                            {formatPrice(item.product.priceUSD * item.quantity)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              ({formatPrice(item.product.priceUSD)} each)
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-right">
                          <span className="inline-block bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded border border-amber-300">
                            Price on Request
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {cart.length > 0 && (
            <div className="pt-6 border-t border-gray-200 text-right text-base sm:text-lg">
              Subtotal ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}):{' '}
              <strong className="text-2xl font-extrabold text-gray-900">
                {formatPrice(subtotalUSD)}
              </strong>
              {currency === 'USD' && (
                <div className="text-xs sm:text-sm text-gray-600 mt-1">
                  (Equivalent in NGN: <strong className="text-gray-900">₦{subtotalNGN.toLocaleString()}</strong>)
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right: Order Summary (Col 9-12 / Col 10-12 on XL) */}
        {cart.length > 0 && (
          <div className="lg:col-span-4 xl:col-span-3 bg-white p-6 sm:p-7 rounded-xl border border-gray-200 shadow-xs space-y-5">
            
            {/* Enterprise Delivery Banner */}
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-lg flex items-start gap-3">
              <ShieldCheck size={20} className="text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-sm">Spinel Enterprise Delivery Guarantee</span>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  {isFreeDelivery 
                    ? 'Your order qualifies for FREE Expedited Enterprise Dispatch!' 
                    : `Add $${(500 - subtotalUSD).toFixed(2)} more of eligible hardware to unlock FREE Delivery.`}
                </p>
              </div>
            </div>

            {/* Subtotal */}
            <div>
              <div className="text-sm font-medium text-gray-600">
                Subtotal ({totalItemsCount} items):
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-0.5">
                {formatPrice(subtotalUSD)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Exchange rate: 1 USD = ₦{exchangeRate.toLocaleString()}
              </div>
            </div>

            {/* Notice if unpriced items in cart */}
            {hasUnpricedCartItems ? (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-950 space-y-2">
                <p className="font-semibold">
                  Notice: Your cart contains items marked "Price on Request".
                </p>
                <p>
                  Products without fixed pricing require an official quote. Please request a quote to receive exact pricing.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const firstUnpriced = cart.find(i => !i.product.priceUSD || i.product.priceUSD <= 0)?.product;
                    if (onRequestQuote && firstUnpriced) {
                      onRequestQuote(firstUnpriced);
                    }
                  }}
                  className="w-full bg-[#FEBD69] hover:bg-[#f3a847] text-[#131921] font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText size={15} />
                  <span>Request Quote for Items</span>
                </button>
              </div>
            ) : null}

            {/* Proceed to Checkout Button */}
            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-gray-900 font-bold py-3 px-5 rounded-full border border-[#fcd200] shadow-sm cursor-pointer transition-all text-sm flex items-center justify-center gap-2"
            >
              <span>Proceed to checkout</span>
              <ArrowRight size={16} />
            </button>

            {/* Trust and warranty badges */}
            <div className="border-t border-gray-200 pt-4 space-y-2.5 text-xs text-gray-600">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={16} className="text-blue-700 shrink-0" />
                <span>3-Year Direct Manufacturer Replacement Warranty</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck size={16} className="text-emerald-700 shrink-0" />
                <span>Direct Dispatch from Lagos Hub &amp; Global Depots</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Lock size={16} className="text-gray-700 shrink-0" />
                <span>Encrypted Paystack Enterprise Checkout</span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Multiple Recommendations Section on Cart Page */}
      {recommendations.length > 0 && (
        <div className="mt-16 pt-10 border-t border-gray-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles size={22} className="text-amber-500" />
                Frequently Added with Items in Your Cart
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Top rated enterprise equipment commonly bundled for security and renewable energy deployments
              </p>
            </div>
            <button
              type="button"
              onClick={onContinueShopping}
              className="text-xs sm:text-sm text-blue-700 hover:text-[#c45500] hover:underline font-semibold flex items-center gap-1"
            >
              <span>View catalog</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recommendations.map((rec) => {
              const recHasPrice = !!(rec.priceUSD && rec.priceUSD > 0);
              return (
                <div
                  key={rec.id}
                  className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-3.5 flex flex-col justify-between transition-all hover:shadow-md group"
                >
                  <div 
                    onClick={() => onSelectProduct(rec)}
                    className="cursor-pointer"
                  >
                    <div className="w-full h-32 bg-gray-50 rounded-lg flex items-center justify-center p-2 mb-2.5 overflow-hidden">
                      <img 
                        src={rec.images[0]} 
                        alt={rec.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 line-clamp-1">
                      {rec.brand}
                    </div>

                    <h3 className="text-xs font-semibold text-gray-900 group-hover:text-[#c45500] line-clamp-2 leading-snug mb-1.5">
                      {rec.name}
                    </h3>

                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={11} 
                            className={i < Math.floor(rec.rating) ? 'fill-amber-500 text-amber-500' : 'text-gray-300'} 
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-gray-500">({rec.reviewCount})</span>
                    </div>

                    <div className="mb-2.5">
                      {recHasPrice ? (
                        <div className="text-sm font-bold text-gray-900">
                          {formatPrice(rec.priceUSD)}
                        </div>
                      ) : (
                        <span className="inline-block bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Price on Request
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    {recHasPrice ? (
                      <button
                        type="button"
                        onClick={() => addToCart(rec, 1)}
                        className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold text-xs py-1.5 px-2 rounded-full border border-[#fcd200] shadow-xs cursor-pointer transition-colors"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (onRequestQuote) {
                            onRequestQuote(rec);
                          }
                        }}
                        className="w-full bg-[#FEBD69] hover:bg-[#f3a847] text-[#131921] font-bold text-xs py-1.5 px-2 rounded-full border border-[#df9b3e] shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-1"
                      >
                        <FileText size={12} />
                        <span>Quote</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
