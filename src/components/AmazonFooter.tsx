import React from 'react';
import { ShieldCheck, Zap, Globe, Lock } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

interface AmazonFooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AmazonFooter: React.FC<AmazonFooterProps> = ({ onNavigate }) => {
  const { currency, setCurrency, exchangeRate } = useCurrency();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-12 bg-[#232f3e] text-white font-sans">
      {/* Back to top banner */}
      <div 
        onClick={scrollToTop}
        className="bg-[#37475a] hover:bg-[#485769] text-center py-3.5 text-xs text-white font-medium cursor-pointer transition-colors"
      >
        Back to top
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 className="font-bold text-base mb-3 text-white">Get to Know Us</h4>
          <ul className="space-y-2 text-xs text-gray-300">
            <li className="hover:underline cursor-pointer">About Spinel Distribution</li>
            <li className="hover:underline cursor-pointer">Enterprise Security Solutions</li>
            <li className="hover:underline cursor-pointer">Renewable Solar &amp; Inverter Tech</li>
            <li className="hover:underline cursor-pointer">Corporate Compliance</li>
            <li className="hover:underline cursor-pointer">Spinel Science &amp; Engineering</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-base mb-3 text-white">Make Money with Us</h4>
          <ul className="space-y-2 text-xs text-gray-300">
            <li className="hover:underline cursor-pointer">Supply Equipment to Spinel</li>
            <li className="hover:underline cursor-pointer">Certified System Integrator Program</li>
            <li className="hover:underline cursor-pointer">OEM &amp; Brand Partnerships</li>
            <li className="hover:underline cursor-pointer">Bulk Procurement for Projects</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-base mb-3 text-white">Spinel Payment Products</h4>
          <ul className="space-y-2 text-xs text-gray-300">
            <li className="hover:underline cursor-pointer flex items-center gap-1">
              <Lock size={12} className="text-green-400" />
              Paystack Live Payment Gateway
            </li>
            <li className="hover:underline cursor-pointer">USD ($) &amp; NGN (₦) Billing</li>
            <li className="hover:underline cursor-pointer">Corporate Invoicing &amp; Wire Transfer</li>
            <li className="hover:underline cursor-pointer">Reload Your Enterprise Balance</li>
            <li className="text-gray-400">Current Rate: 1 USD = ₦{exchangeRate.toLocaleString()}</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-base mb-3 text-white">Let Us Help You</h4>
          <ul className="space-y-2 text-xs text-gray-300">
            <li 
              onClick={() => onNavigate('orders')}
              className="hover:underline cursor-pointer"
            >
              Your Account &amp; Orders
            </li>
            <li className="hover:underline cursor-pointer">Shipping Rates &amp; Policies</li>
            <li className="hover:underline cursor-pointer">3-Year Warranty Terms</li>
            <li className="hover:underline cursor-pointer">Download Tax Invoices (PDF)</li>
            <li className="hover:underline cursor-pointer">Technical Support Help Center</li>
          </ul>
        </div>
      </div>

      {/* Center Sub-bar with logo and currency indicator */}
      <div className="border-t border-[#3a4553] py-6 text-center flex flex-wrap items-center justify-center gap-6 text-xs text-gray-300">
        <div 
          onClick={() => onNavigate('home')}
          className="cursor-pointer flex items-center gap-2"
          title="Spinel Distribution"
        >
          <img 
            src="https://res.cloudinary.com/bmv4hvtk/image/upload/v1788619290/Spinel_Distribution.jpg"
            alt="Spinel Distribution"
            className="h-8 w-auto object-contain rounded bg-white p-0.5 shadow-sm"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex items-center gap-3 border border-gray-600 rounded px-3 py-1.5">
          <Globe size={14} />
          <span>English</span>
        </div>

        <div className="flex items-center gap-2 border border-gray-600 rounded px-3 py-1.5">
          <img 
            src={currency === 'USD' 
              ? "https://res.cloudinary.com/bmv4hvtk/image/upload/v1788620186/usa-flag.png" 
              : "https://res.cloudinary.com/bmv4hvtk/image/upload/v1788620186/nigeria-flag.png"}
            alt={currency}
            className="w-4 h-3 object-cover rounded-xs"
            referrerPolicy="no-referrer"
          />
          <span className="font-bold text-[#febd69]">{currency}</span>
          <span>- Active Currency</span>
        </div>

        <div className="flex items-center gap-2 border border-gray-600 rounded px-3 py-1.5">
          <span>Global Delivery (Nigeria &amp; International)</span>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="bg-[#131921] py-6 text-center text-xs text-gray-400 border-t border-gray-800">
        <div className="flex flex-wrap justify-center gap-6 mb-2">
          <span className="hover:underline cursor-pointer">Conditions of Use</span>
          <span className="hover:underline cursor-pointer">Privacy Notice</span>
          <span className="hover:underline cursor-pointer">Enterprise Security Statement</span>
          <span className="hover:underline cursor-pointer">Supply Chain Transparency</span>
        </div>
        <p className="text-[11px] text-gray-500">
          © 2026, SPINEL DISTRIBUTION Inc. or its affiliates. All hardware specs, certifications, and brand names belong to their respective manufacturers.
        </p>
      </div>
    </footer>
  );
};
