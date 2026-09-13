import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Package, 
  ArrowLeft, 
  Printer, 
  Clock, 
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import { Product } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface RequestQuotePageProps {
  initialProduct?: Product | null;
  onNavigate: (view: string, param?: string) => void;
  onSelectProduct?: (product: Product) => void;
}

interface SubmittedQuote {
  quoteId: string;
  date: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  location: string;
  currency: string;
  quantity: number;
  projectTimeline: string;
  notes: string;
  needsInstallation: boolean;
  needsPartnerDiscount: boolean;
  product?: {
    id: string;
    sku: string;
    name: string;
    brand: string;
    category: string;
    image: string;
  };
  status: string;
}

export const RequestQuotePage: React.FC<RequestQuotePageProps> = ({
  initialProduct,
  onNavigate,
  onSelectProduct
}) => {
  const { currency } = useCurrency();

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState(currency || 'USD');
  const [quantity, setQuantity] = useState(1);
  const [projectTimeline, setProjectTimeline] = useState('Immediate (Within 2 Weeks)');
  const [notes, setNotes] = useState('');
  const [needsInstallation, setNeedsInstallation] = useState(false);
  const [needsPartnerDiscount, setNeedsPartnerDiscount] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<SubmittedQuote | null>(null);
  const [recentQuotes, setRecentQuotes] = useState<SubmittedQuote[]>([]);
  const [showRecentTab, setShowRecentTab] = useState(false);

  // Load existing quote requests from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('spinel_submitted_quotes');
      if (stored) {
        setRecentQuotes(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactName || !email || !phone) {
      alert('Please fill out all required company and contact information fields.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const quoteId = `RFQ-2026-${randomNum}`;
      const newQuote: SubmittedQuote = {
        quoteId,
        date: new Date().toLocaleString(),
        companyName,
        contactName,
        email,
        phone,
        location: location || 'Not specified',
        currency: preferredCurrency,
        quantity,
        projectTimeline,
        notes,
        needsInstallation,
        needsPartnerDiscount,
        product: initialProduct ? {
          id: initialProduct.id,
          sku: initialProduct.sku,
          name: initialProduct.name,
          brand: initialProduct.brand,
          category: initialProduct.category,
          image: initialProduct.images[0] || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400'
        } : undefined,
        status: 'Under Review'
      };

      try {
        const updated = [newQuote, ...recentQuotes];
        setRecentQuotes(updated);
        localStorage.setItem('spinel_submitted_quotes', JSON.stringify(updated));
      } catch {
        // ignore
      }

      setSubmittedQuote(newQuote);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 900);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Breadcrumb / Back Navigation */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </button>

        {recentQuotes.length > 0 && !submittedQuote && (
          <button
            type="button"
            onClick={() => setShowRecentTab(!showRecentTab)}
            className="text-xs text-gray-700 hover:text-[#c45500] font-medium underline cursor-pointer flex items-center gap-1"
          >
            <Clock size={13} />
            <span>{showRecentTab ? 'Hide Submitted Quotes' : `View Submitted Quotes (${recentQuotes.length})`}</span>
          </button>
        )}
      </div>

      {/* Confirmation View */}
      {submittedQuote ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4 border-b border-gray-200 pb-5">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
              <CheckCircle2 size={32} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-800 text-[11px] font-bold px-2 py-0.5 rounded">
                  RFQ Received Successfully
                </span>
                <span className="text-xs text-gray-500">{submittedQuote.date}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">
                Official Quote Request Confirmed
              </h1>
              <p className="text-xs text-gray-600 mt-1">
                Reference ID: <strong className="text-gray-900 font-mono text-sm">{submittedQuote.quoteId}</strong>
              </p>
            </div>
            <div className="hidden sm:flex gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-semibold rounded hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
              >
                <Printer size={13} />
                <span>Print RFQ</span>
              </button>
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 rounded-md p-4 flex items-start gap-3 text-xs text-amber-900">
            <Info size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Next Steps &amp; Turnaround Time:</p>
              <p className="text-amber-800 mt-0.5">
                Our Enterprise Sales &amp; Technical Engineering team is reviewing your project requirements. An official proforma invoice and quotation in <strong>{submittedQuote.currency}</strong> will be sent to <strong>{submittedQuote.email}</strong> within <strong>2 to 4 business hours</strong>.
              </p>
            </div>
          </div>

          {/* Product Summary */}
          {submittedQuote.product && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                Requested Item
              </h3>
              <div className="flex items-center gap-4">
                <img 
                  src={submittedQuote.product.image} 
                  alt={submittedQuote.product.name} 
                  className="w-16 h-16 object-contain bg-white rounded border border-gray-200 p-1"
                />
                <div className="flex-1">
                  <div className="text-xs text-blue-700 font-semibold">{submittedQuote.product.brand}</div>
                  <h4 className="text-sm font-bold text-gray-900">{submittedQuote.product.name}</h4>
                  <div className="text-xs text-gray-500 mt-0.5">
                    SKU: <span className="font-mono">{submittedQuote.product.sku}</span> | Qty: <strong className="text-gray-900">{submittedQuote.quantity} units</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs border border-gray-200 rounded-lg p-4">
            <div>
              <span className="text-gray-500">Company / Organization:</span>
              <div className="font-semibold text-gray-900">{submittedQuote.companyName}</div>
            </div>
            <div>
              <span className="text-gray-500">Contact Person:</span>
              <div className="font-semibold text-gray-900">{submittedQuote.contactName}</div>
            </div>
            <div>
              <span className="text-gray-500">Business Email:</span>
              <div className="font-semibold text-gray-900">{submittedQuote.email}</div>
            </div>
            <div>
              <span className="text-gray-500">Phone / WhatsApp:</span>
              <div className="font-semibold text-gray-900">{submittedQuote.phone}</div>
            </div>
            <div>
              <span className="text-gray-500">Delivery Location:</span>
              <div className="font-semibold text-gray-900">{submittedQuote.location}</div>
            </div>
            <div>
              <span className="text-gray-500">Project Timeline:</span>
              <div className="font-semibold text-gray-900">{submittedQuote.projectTimeline}</div>
            </div>
            {submittedQuote.notes && (
              <div className="md:col-span-2 pt-2 border-t border-gray-100">
                <span className="text-gray-500">Project Notes / Specifications:</span>
                <p className="text-gray-800 mt-0.5 whitespace-pre-wrap">{submittedQuote.notes}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setSubmittedQuote(null);
                setNotes('');
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded cursor-pointer transition-colors"
            >
              Submit Another Quotation Request
            </button>
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold text-xs rounded-full border border-[#fcd200] shadow-sm cursor-pointer transition-colors"
            >
              Continue Browsing Hardware Catalog
            </button>
          </div>
        </div>
      ) : (
        /* Quotation Form */
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-[#131921] text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-[#febd69] text-[#131921] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                  Spinel Enterprise Procurement
                </span>
                <span className="text-xs text-gray-400">Direct Factory Channel</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Request an Enterprise Quotation (RFQ)
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">
                Get project pricing, customized volume rates, and proforma invoices in either <strong>USD ($)</strong> or <strong>NGN (₦)</strong> directly from Spinel Distribution.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2 text-xs bg-white/10 px-3.5 py-2 rounded-lg border border-white/10">
              <ShieldCheck size={20} className="text-[#febd69]" />
              <div className="text-left">
                <div className="font-bold text-white">Authorized Partner</div>
                <div className="text-[11px] text-gray-300">Fast 2-4 Hr Turnaround</div>
              </div>
            </div>
          </div>

          {/* Selected Product Card (if navigated from an unpriced or specific item) */}
          {initialProduct && (
            <div className="bg-amber-50/60 border-b border-amber-200 p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img 
                  src={initialProduct.images[0] || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400'} 
                  alt={initialProduct.name}
                  className="w-16 h-16 object-contain bg-white rounded border border-gray-200 p-1 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">
                      {initialProduct.brand}
                    </span>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-300">
                      Unpriced Hardware / RFQ Required
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mt-0.5 line-clamp-1">
                    {initialProduct.name}
                  </h3>
                  <div className="text-xs text-gray-600">
                    SKU: <span className="font-mono font-medium text-gray-800">{initialProduct.sku}</span> • {initialProduct.subcategory || initialProduct.category}
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('catalog')}
                  className="text-xs text-blue-700 hover:underline cursor-pointer"
                >
                  Change Product
                </button>
              </div>
            </div>
          )}

          {/* Recent Quotes Accordion if enabled */}
          {showRecentTab && recentQuotes.length > 0 && (
            <div className="p-4 sm:px-6 bg-gray-50 border-b border-gray-200 text-xs">
              <h3 className="font-bold text-gray-800 mb-2">Previously Submitted Quotation Requests:</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recentQuotes.map((q, i) => (
                  <div key={i} className="p-2.5 bg-white border border-gray-200 rounded flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-gray-900">{q.quoteId}</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="text-gray-700">{q.product ? q.product.name : 'General Project'}</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="text-gray-500">{q.date}</span>
                    </div>
                    <span className="bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                      {q.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* The RFQ Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            
            {/* 1. Contact & Company Details */}
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Building2 size={16} className="text-gray-500" />
                <span>Company &amp; Contact Information</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Company / Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Security Ltd, First Bank, Shell Nigeria..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Contact Person Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Engr. Patrick Adewale"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Official Business Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="procurement@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Phone / WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 802 000 0000 or +1 (555) 000-0000"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Procurement Specifications */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Package size={16} className="text-gray-500" />
                <span>Procurement &amp; Volume Specifications</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Estimated Quantity Required <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                  />
                  <div className="flex gap-1.5 mt-1.5">
                    {[1, 5, 10, 25, 50, 100].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setQuantity(n)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${quantity === n ? 'bg-[#ffd814] border-[#fcd200] text-black' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Preferred Quote Currency
                  </label>
                  <select
                    value={preferredCurrency}
                    onChange={(e) => setPreferredCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none bg-white cursor-pointer"
                  >
                    <option value="USD">USD ($) - US Dollars</option>
                    <option value="NGN">NGN (₦) - Nigerian Naira</option>
                  </select>
                  <span className="text-[11px] text-gray-500 mt-1 block">
                    Billed with verified live conversion rates
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Project Timeline
                  </label>
                  <select
                    value={projectTimeline}
                    onChange={(e) => setProjectTimeline(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none bg-white cursor-pointer"
                  >
                    <option value="Immediate (Within 2 Weeks)">Immediate (Within 2 Weeks)</option>
                    <option value="1 Month">1 Month</option>
                    <option value="Quarterly / Tender Bid">Quarterly / Tender Bid</option>
                    <option value="Budgeting & Planning">Budgeting &amp; Planning</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-gray-700 mb-1">
                    Delivery Destination / City / Port of Entry
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Victoria Island, Lagos / Abuja FCT / Port Harcourt / Air Freight Delivery"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Project Notes & Requirements */}
            <div className="border-t border-gray-200 pt-6">
              <label className="block font-semibold text-gray-700 mb-1 text-xs">
                Additional Technical Requirements / Project Scope / BOM Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Include details like camera resolution, lens sizes, installation environment, NVR storage capacities, solar inverter sizing, or custom mounting bracket needs..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none text-xs"
              />

              <div className="mt-4 space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={needsInstallation}
                    onChange={(e) => setNeedsInstallation(e.target.checked)}
                    className="rounded text-[#e77600] focus:ring-[#e77600]"
                  />
                  <span className="text-gray-800">
                    Include Certified Field Installation &amp; Commissioning Support
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={needsPartnerDiscount}
                    onChange={(e) => setNeedsPartnerDiscount(e.target.checked)}
                    className="rounded text-[#e77600] focus:ring-[#e77600]"
                  />
                  <span className="text-gray-800">
                    Apply Registered System Integrator / Authorized Dealer Tier Discount
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>Confidential business pricing. No spam guarantee.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-gray-900 font-bold text-sm rounded-full border border-[#fcd200] shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Generating Quotation Request...</span>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit Request for Quotation</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      )}

    </div>
  );
};
