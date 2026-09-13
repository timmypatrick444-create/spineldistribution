import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  ExternalLink,
  ChevronRight,
  Search
} from 'lucide-react';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { downloadInvoicePDF } from '../utils/pdfGenerator';

interface OrdersPageProps {
  onSelectProductById: (productId: string) => void;
  onContinueShopping: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  onSelectProductById,
  onContinueShopping
}) => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchOrder, setSearchOrder] = useState<string>('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const emailQuery = user ? `?email=${encodeURIComponent(user.email)}` : '';
      const res = await fetch(`/api/orders${emailQuery}`);
      if (res.ok) {
        const data: Order[] = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.warn('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const filteredOrders = orders.filter(order => {
    if (filterStatus !== 'all' && order.status !== filterStatus) return false;
    if (searchOrder) {
      const q = searchOrder.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchItem = order.items.some(i => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));
      if (!matchNum && !matchItem) return false;
    }
    return true;
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle size={12} /> Delivered</span>;
      case 'shipped':
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1"><Truck size={12} /> Shipped / In Transit</span>;
      case 'processing':
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1"><Clock size={12} /> Processing</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1"><Clock size={12} /> Pending</span>;
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Orders &amp; Tax Invoices</h1>
          <p className="text-xs text-gray-500 mt-1">
            Track hardware dispatches, view shipment stages, and download official PDF tax invoices.
          </p>
        </div>

        {/* Filter and search */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search all orders..."
              value={searchOrder}
              onChange={(e) => setSearchOrder(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 pl-8 outline-none focus:border-[#e77600] w-52"
            />
            <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-[#e77600] bg-white cursor-pointer"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500">
          Loading your order history...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded border border-gray-200 space-y-4">
          <Package size={40} className="mx-auto text-gray-400" />
          <h3 className="text-base font-bold text-gray-800">No orders found</h3>
          <p className="text-xs text-gray-500">
            {searchOrder || filterStatus !== 'all' 
              ? 'Try changing your search keywords or filter.'
              : 'You have not placed any hardware orders yet.'}
          </p>
          <button
            type="button"
            onClick={onContinueShopping}
            className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold py-2 px-6 rounded-full border border-[#fcd200] text-xs cursor-pointer shadow-sm"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order, idx) => (
            <div 
              key={order.id || order.orderNumber || `order-card-${idx}`}
              className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden text-xs"
            >
              {/* Order Header Bar (Amazon Grey) */}
              <div className="bg-gray-100 p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 text-gray-600">
                <div className="flex flex-wrap items-center gap-6 sm:gap-10">
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-gray-500">Order Placed</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-gray-500">Total</span>
                    <span className="font-bold text-gray-900">
                      ${order.totalUSD.toFixed(2)}{' '}
                      <span className="text-gray-500 font-normal">(₦{order.totalNGN.toLocaleString()})</span>
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-gray-500">Ship To</span>
                    <span className="font-semibold text-gray-900">
                      {order.shippingAddress.fullName}
                    </span>
                  </div>
                </div>

                {/* Right Header: Order # & Download PDF */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="block text-[11px] text-gray-500">Order # {order.orderNumber}</span>
                    <span className="text-[10px] text-gray-400 font-mono">Ref: {order.paymentReference || 'N/A'}</span>
                  </div>

                  {/* PDF Download Button */}
                  <button
                    type="button"
                    onClick={() => downloadInvoicePDF(order)}
                    className="bg-white hover:bg-gray-50 text-gray-800 font-bold py-1.5 px-3 rounded border border-gray-300 shadow-sm flex items-center gap-1.5 cursor-pointer text-xs transition-colors"
                  >
                    <Download size={13} className="text-[#c45500]" />
                    <span>Download Invoice (PDF)</span>
                  </button>
                </div>
              </div>

              {/* Order Body */}
              <div className="p-5 space-y-4">
                
                {/* Status line */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    <span className="text-gray-600 text-xs">
                      Estimated Delivery:{' '}
                      <strong className="text-gray-900">
                        {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </strong>
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-500">
                    Payment: <strong className="text-green-700 capitalize">{order.paymentStatus}</strong> via {order.paymentMethod}
                  </div>
                </div>

                {/* Products list */}
                <div className="divide-y divide-gray-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 object-contain rounded border border-gray-200 p-1 shrink-0" 
                        />
                        <div>
                          <h4 
                            onClick={() => onSelectProductById(item.productId)}
                            className="font-medium text-gray-900 hover:text-[#c45500] cursor-pointer line-clamp-1"
                          >
                            {item.name}
                          </h4>
                          <p className="text-gray-500 text-[11px]">
                            SKU: <span className="font-mono">{item.sku}</span> | Qty: <strong className="text-gray-800">{item.quantity}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-bold text-gray-900">
                          ${(item.priceUSD * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          ₦{(item.priceNGN * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};
