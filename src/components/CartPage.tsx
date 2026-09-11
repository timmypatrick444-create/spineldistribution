import React from 'react';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

interface CartPageProps {
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
  onSelectProduct: (product: any) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  onProceedToCheckout,
  onContinueShopping,
  onSelectProduct
}) => {
  const { cart, removeFromCart, updateQuantity, clearCart, totalItemsCount, subtotalUSD, subtotalNGN } = useCart();
  const { formatPrice, currency, exchangeRate } = useCurrency();

  const isFreeDelivery = subtotalUSD > 500;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Cart Items List (Col 1-8) */}
        <div className="lg:col-span-8 bg-white p-6 rounded border border-gray-200 shadow-sm">
          
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Spinel Distribution Enterprise Equipment Orders
              </p>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-blue-700 hover:underline hover:text-[#c45500]"
              >
                Deselect / Clear all items
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <h3 className="text-lg font-bold text-gray-800">Your Spinel Cart is empty</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Explore our catalog of 4K IP cameras, enterprise NVRs, biometric access systems, and renewable solar inverters.
              </p>
              <button
                type="button"
                onClick={onContinueShopping}
                className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold py-2 px-6 rounded-full border border-[#fcd200] text-xs cursor-pointer shadow-sm"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {cart.map((item, idx) => (
                <div key={`${item.product.id || 'cart-item'}-${idx}`} className="py-5 flex flex-col sm:flex-row gap-5 items-start">
                  
                  {/* Item Image */}
                  <div 
                    onClick={() => onSelectProduct(item.product)}
                    className="w-28 h-28 bg-gray-50 rounded border border-gray-200 p-2 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 space-y-1">
                    <h3 
                      onClick={() => onSelectProduct(item.product)}
                      className="text-sm font-semibold text-gray-900 hover:text-[#c45500] cursor-pointer line-clamp-2 leading-snug"
                    >
                      {item.product.name}
                    </h3>
                    <div className="text-xs text-gray-500">
                      SKU: <span className="font-mono text-gray-700">{item.product.sku}</span> | Brand: {item.product.brand}
                    </div>
                    <div className="text-xs text-green-700 font-semibold">
                      In Stock
                    </div>
                    {item.product.isPrime && (
                      <div className="text-xs text-gray-600 flex items-center gap-1">
                        <span className="text-[#007185] font-extrabold italic">✓prime</span>
                        <span>FREE Shipping</span>
                      </div>
                    )}

                    {/* Quantity and Remove controls */}
                    <div className="flex items-center gap-4 pt-3 text-xs">
                      <div className="flex items-center border border-gray-300 rounded bg-gray-50">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-gray-200 text-gray-700 font-bold"
                          title="Decrease"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-gray-200 text-gray-700 font-bold"
                          title="Increase"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-blue-700 hover:underline flex items-center gap-1 text-xs"
                      >
                        <Trash2 size={13} className="text-gray-400" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Item Price */}
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-[#b12704]">
                      {formatPrice(item.product.priceUSD * item.quantity)}
                    </div>
                    {item.quantity > 1 && (
                      <div className="text-[11px] text-gray-500">
                        ({formatPrice(item.product.priceUSD)} each)
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div className="pt-4 border-t border-gray-200 text-right text-base">
              Subtotal ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}):{' '}
              <strong className="text-xl font-bold text-gray-900">
                {formatPrice(subtotalUSD)}
              </strong>
              {currency === 'USD' && (
                <div className="text-xs text-gray-500 mt-0.5">
                  (Equivalent in NGN: <strong>₦{subtotalNGN.toLocaleString()}</strong>)
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right: Amazon Order Summary (Col 9-12) */}
        {cart.length > 0 && (
          <div className="lg:col-span-4 bg-white p-5 rounded border border-gray-200 shadow-sm space-y-4 text-xs">
            
            {/* Free Shipping Progress banner */}
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded flex items-start gap-2">
              <ShieldCheck size={16} className="text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Spinel Prime Delivery Guarantee</span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  {isFreeDelivery 
                    ? 'Your order qualifies for FREE Express Enterprise Delivery!' 
                    : `Add $${(500 - subtotalUSD).toFixed(2)} more of eligible items to get FREE Delivery.`}
                </p>
              </div>
            </div>

            {/* Subtotal */}
            <div>
              <div className="text-sm font-normal text-gray-700">
                Subtotal ({totalItemsCount} items):
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(subtotalUSD)}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                1 USD = ₦{exchangeRate.toLocaleString()} (Exchange rate parsed from server)
              </div>
            </div>

            {/* Checkout Button */}
            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-gray-900 font-bold py-2.5 px-4 rounded-full border border-[#fcd200] shadow-sm cursor-pointer transition-colors text-xs flex items-center justify-center gap-2"
            >
              <span>Proceed to checkout</span>
              <ArrowRight size={14} />
            </button>

            {/* Additional info */}
            <div className="border-t border-gray-200 pt-3 space-y-2 text-[11px] text-gray-500">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-gray-400" />
                <span>3-Year Direct Replacement Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-gray-400" />
                <span>Direct Dispatch from Lagos &amp; Global Hubs</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
