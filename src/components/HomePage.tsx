import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Check, 
  ShieldCheck, 
  Zap, 
  Truck, 
  Flame,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Product } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { CATEGORIES } from '../data/categories';

interface HomePageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (categoryName: string, subcategoryName?: string) => void;
  onNavigate: (view: string, param?: string) => void;
  onRequestQuote?: (product: Product) => void;
}

const HERO_SLIDES = [
  {
    id: 1,
    title: 'Enterprise 4K AI Video Surveillance',
    subtitle: 'Ultra low-light Starlight sensors, vehicle classification & facial recognition',
    ctaText: 'Explore Cameras & NVRs',
    category: 'Video Surveillance & Cameras',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1600&q=85',
    accentColor: 'from-blue-900/90'
  },
  {
    id: 2,
    title: 'Smart Hybrid Solar Inverters & LiFePO4 PowerVaults',
    subtitle: '10kW 3-Phase Pure Sine Wave Inverters with 5.12kWh 6,000-Cycle Lithium Batteries',
    ctaText: 'Shop Renewable Energy',
    category: 'Renewable Energy',
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1600&q=85',
    accentColor: 'from-amber-900/90'
  },
  {
    id: 3,
    title: 'Mission-Critical Access Control & Industrial PoE',
    subtitle: 'Touchless multi-biometric terminals & 24-Port 400W Managed PoE+ switches',
    ctaText: 'View Network Security',
    category: 'Networking & Connectivity',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1600&q=85',
    accentColor: 'from-emerald-900/90'
  }
];

export const HomePage: React.FC<HomePageProps> = ({
  products,
  onSelectProduct,
  onSelectCategory,
  onNavigate,
  onRequestQuote
}) => {
  const safeProducts = Array.isArray(products) ? products : [];
  const { formatPrice, currency, exchangeRate } = useCurrency();
  const { addToCart } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance hero slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-[#eaeded] pb-12 font-sans">
      
      {/* 1. AMAZON HERO BANNER WITH GRADIENT OVERLAY */}
      <div className="relative h-[320px] sm:h-[420px] md:h-[500px] w-full overflow-hidden bg-black select-none">
        
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out transform scale-105"
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          {/* Gradient Tint */}
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.accentColor} via-black/50 to-transparent`} />
        </div>

        {/* Hero Slide Content */}
        <div className="relative max-w-7xl mx-auto h-full px-6 sm:px-12 flex flex-col justify-center text-white z-10">
          <div className="max-w-xl space-y-4">
            <span className="inline-block bg-[#febd69] text-black text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded">
              Spinel Distribution Enterprise Exclusive
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
              {slide.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-200 line-clamp-2 drop-shadow">
              {slide.subtitle}
            </p>
            <div>
              <button
                type="button"
                onClick={() => onSelectCategory(slide.category)}
                className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold px-6 py-2.5 rounded shadow-lg text-sm transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                {slide.ctaText}
              </button>
            </div>
          </div>
        </div>

        {/* Hero Slider Nav Arrows */}
        <button
          onClick={() => setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 text-white/80 hover:text-white bg-black/30 hover:bg-black/60 rounded-r transition-colors"
          aria-label="Previous Slide"
        >
          <ChevronLeft size={32} />
        </button>
        <button
          onClick={() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 text-white/80 hover:text-white bg-black/30 hover:bg-black/60 rounded-l transition-colors"
          aria-label="Next Slide"
        >
          <ChevronRight size={32} />
        </button>

        {/* Amazon Bottom Gradient Fade into Gray Background */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#eaeded] via-[#eaeded]/70 to-transparent pointer-events-none" />
      </div>

      {/* 2. OVERLAPPING AMAZON 4-ITEM / FEATURED BENTO CARDS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative -mt-24 sm:-mt-36 z-20">
        
        {/* Amazon 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Box 1: Video Surveillance */}
          <div className="bg-white p-4.5 rounded shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug">
                Video Surveillance &amp; Cameras
              </h3>
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div 
                  onClick={() => onSelectCategory('Video Surveillance & Cameras', 'Bullet Cameras')}
                  className="cursor-pointer group"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=300&q=80" 
                    alt="Bullet Cameras"
                    className="w-full h-24 object-cover rounded group-hover:opacity-90" 
                  />
                  <span className="text-[11px] font-medium text-gray-800 line-clamp-1 mt-1 group-hover:text-blue-700">
                    Bullet Cameras
                  </span>
                </div>
                <div 
                  onClick={() => onSelectCategory('Video Surveillance & Cameras', 'PTZ Cameras')}
                  className="cursor-pointer group"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1549109926-58f039549485?auto=format&fit=crop&w=300&q=80" 
                    alt="PTZ Cameras"
                    className="w-full h-24 object-cover rounded group-hover:opacity-90" 
                  />
                  <span className="text-[11px] font-medium text-gray-800 line-clamp-1 mt-1 group-hover:text-blue-700">
                    PTZ Cameras
                  </span>
                </div>
                <div 
                  onClick={() => onSelectCategory('Video Surveillance & Cameras', 'Dome Cameras')}
                  className="cursor-pointer group"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&q=80" 
                    alt="Dome Cameras"
                    className="w-full h-24 object-cover rounded group-hover:opacity-90" 
                  />
                  <span className="text-[11px] font-medium text-gray-800 line-clamp-1 mt-1 group-hover:text-blue-700">
                    Dome Cameras
                  </span>
                </div>
                <div 
                  onClick={() => onSelectCategory('Video Surveillance & Cameras', 'Thermal Cameras')}
                  className="cursor-pointer group"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=300&q=80" 
                    alt="Thermal Cameras"
                    className="w-full h-24 object-cover rounded group-hover:opacity-90" 
                  />
                  <span className="text-[11px] font-medium text-gray-800 line-clamp-1 mt-1 group-hover:text-blue-700">
                    Thermal Cameras
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onSelectCategory('Video Surveillance & Cameras')}
              className="text-xs text-blue-700 hover:text-[#c45500] hover:underline font-semibold text-left"
            >
              See all 12 camera categories
            </button>
          </div>

          {/* Box 2: Renewable Energy & Power */}
          <div className="bg-white p-4.5 rounded shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900 leading-snug">
                  Renewable Energy Systems
                </h3>
                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  NEW
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div 
                  onClick={() => onSelectCategory('Renewable Energy', 'Smart Hybrid Inverters')}
                  className="cursor-pointer group"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=300&q=80" 
                    alt="Smart Hybrid Inverters"
                    className="w-full h-24 object-cover rounded group-hover:opacity-90" 
                  />
                  <span className="text-[11px] font-medium text-gray-800 line-clamp-1 mt-1 group-hover:text-blue-700">
                    Hybrid Inverters
                  </span>
                </div>
                <div 
                  onClick={() => onSelectCategory('Renewable Energy', 'Lithium LiFePO4 Batteries')}
                  className="cursor-pointer group"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=300&q=80" 
                    alt="Lithium LiFePO4 Batteries"
                    className="w-full h-24 object-cover rounded group-hover:opacity-90" 
                  />
                  <span className="text-[11px] font-medium text-gray-800 line-clamp-1 mt-1 group-hover:text-blue-700">
                    LiFePO4 Batteries
                  </span>
                </div>
                <div 
                  onClick={() => onSelectCategory('Renewable Energy', 'Industrial Solar Panels')}
                  className="cursor-pointer group"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=300&q=80" 
                    alt="Industrial Solar Panels"
                    className="w-full h-24 object-cover rounded group-hover:opacity-90" 
                  />
                  <span className="text-[11px] font-medium text-gray-800 line-clamp-1 mt-1 group-hover:text-blue-700">
                    Tier-1 Solar Panels
                  </span>
                </div>
                <div 
                  onClick={() => onSelectCategory('Power & Electrical Systems', 'UPS Systems')}
                  className="cursor-pointer group"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=300&q=80" 
                    alt="UPS Systems"
                    className="w-full h-24 object-cover rounded group-hover:opacity-90" 
                  />
                  <span className="text-[11px] font-medium text-gray-800 line-clamp-1 mt-1 group-hover:text-blue-700">
                    Online Rack UPS
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onSelectCategory('Renewable Energy')}
              className="text-xs text-blue-700 hover:text-[#c45500] hover:underline font-semibold text-left"
            >
              Shop Inverters &amp; Batteries
            </button>
          </div>

          {/* Box 3: Networking & Industrial PoE */}
          <div className="bg-white p-4.5 rounded shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug">
                Networking &amp; Connectivity
              </h3>
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div 
                  onClick={() => onSelectCategory('Networking & Connectivity', 'PoE Switches')}
                  className="cursor-pointer group"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=300&q=80" 
                    alt="PoE Switches"
                    className="w-full h-24 object-cover rounded group-hover:opacity-90" 
                  />
                  <span className="text-[11px] font-medium text-gray-800 line-clamp-1 mt-1 group-hover:text-blue-700">
                    PoE Switches
                  </span>
                </div>
                <div 
                  onClick={() => onSelectCategory('Networking & Connectivity', 'Industrial Switches')}
                  className="cursor-pointer group"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=300&q=80" 
                    alt="Industrial Switches"
                    className="w-full h-24 object-cover rounded group-hover:opacity-90" 
                  />
                  <span className="text-[11px] font-medium text-gray-800 line-clamp-1 mt-1 group-hover:text-blue-700">
                    DIN-Rail Industrial
                  </span>
                </div>
                <div 
                  onClick={() => onSelectCategory('Networking & Connectivity', 'Wireless Access Points')}
                  className="cursor-pointer group"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80" 
                    alt="Wireless Access Points"
                    className="w-full h-24 object-cover rounded group-hover:opacity-90" 
                  />
                  <span className="text-[11px] font-medium text-gray-800 line-clamp-1 mt-1 group-hover:text-blue-700">
                    Wi-Fi 6 APs
                  </span>
                </div>
                <div 
                  onClick={() => onSelectCategory('Telecommunication & Communication Equipment', 'Microwave Radio')}
                  className="cursor-pointer group"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80" 
                    alt="Microwave Radio"
                    className="w-full h-24 object-cover rounded group-hover:opacity-90" 
                  />
                  <span className="text-[11px] font-medium text-gray-800 line-clamp-1 mt-1 group-hover:text-blue-700">
                    Wireless Bridges
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onSelectCategory('Networking & Connectivity')}
              className="text-xs text-blue-700 hover:text-[#c45500] hover:underline font-semibold text-left"
            >
              Explore all enterprise networking
            </button>
          </div>

          {/* Box 4: Access Control & Biometrics */}
          <div className="bg-white p-4.5 rounded shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug">
                Access Control &amp; Biometrics
              </h3>
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div 
                  onClick={() => onSelectCategory('Access Control & Door Security', 'Biometric Readers')}
                  className="cursor-pointer group"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=300&q=80" 
                    alt="Biometric Readers"
                    className="w-full h-24 object-cover rounded group-hover:opacity-90" 
                  />
                  <span className="text-[11px] font-medium text-gray-800 line-clamp-1 mt-1 group-hover:text-blue-700">
                    Facial Terminals
                  </span>
                </div>
                <div 
                  onClick={() => onSelectCategory('Access Control & Door Security', 'Electronic Locks')}
                  className="cursor-pointer group"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=300&q=80" 
                    alt="Electronic Locks"
                    className="w-full h-24 object-cover rounded group-hover:opacity-90" 
                  />
                  <span className="text-[11px] font-medium text-gray-800 line-clamp-1 mt-1 group-hover:text-blue-700">
                    Magnetic Locks
                  </span>
                </div>
                <div 
                  onClick={() => onSelectCategory('Intercom & IP Communication', 'Door Stations')}
                  className="cursor-pointer group"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80" 
                    alt="Door Stations"
                    className="w-full h-24 object-cover rounded group-hover:opacity-90" 
                  />
                  <span className="text-[11px] font-medium text-gray-800 line-clamp-1 mt-1 group-hover:text-blue-700">
                    Video Intercoms
                  </span>
                </div>
                <div 
                  onClick={() => onSelectCategory('Security Software & Licenses', 'Access Control Software')}
                  className="cursor-pointer group"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=300&q=80" 
                    alt="Software"
                    className="w-full h-24 object-cover rounded group-hover:opacity-90" 
                  />
                  <span className="text-[11px] font-medium text-gray-800 line-clamp-1 mt-1 group-hover:text-blue-700">
                    Software Licenses
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onSelectCategory('Access Control & Door Security')}
              className="text-xs text-blue-700 hover:text-[#c45500] hover:underline font-semibold text-left"
            >
              Shop Access Control &amp; Gates
            </button>
          </div>

        </div>

      </div>

      {/* 3. HORIZONTAL PRODUCT CAROUSEL ROW (Amazon "Best Sellers & Featured Hardware") */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        {safeProducts.length > 0 ? (
          <div className="bg-white p-5 rounded shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame size={20} className="text-[#c45500]" />
                <h2 className="text-xl font-bold text-gray-900">
                  Today's Featured Enterprise Hardware
                </h2>
              </div>
              <button
                onClick={() => onNavigate('catalog')}
                className="text-xs font-semibold text-blue-700 hover:text-[#c45500] hover:underline flex items-center gap-1"
              >
                See all products <ArrowRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {safeProducts.slice(0, 8).map((prod, idx) => (
                <div 
                  key={`${prod.id || 'prod'}-${prod.sku || idx}-${idx}`}
                  className="group flex flex-col justify-between bg-white border border-gray-100 hover:border-gray-300 p-3.5 rounded transition-all hover:shadow-md"
                >
                  <div 
                    onClick={() => onSelectProduct(prod)}
                    className="cursor-pointer"
                  >
                    {/* Image container */}
                    <div className="w-full h-44 bg-gray-50 rounded flex items-center justify-center overflow-hidden mb-3">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-1.5 mb-1.5">
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
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#c45500] leading-snug mb-1">
                      {prod.name}
                    </h4>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={13} 
                            className={i < Math.floor(prod.rating) ? 'fill-amber-500' : 'text-gray-300'} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-blue-700">{prod.reviewCount}</span>
                    </div>

                    {/* Price */}
                    <div className="mb-2">
                      {prod.priceUSD && prod.priceUSD > 0 ? (
                        <>
                          <div className="text-lg font-bold text-gray-900 flex items-baseline gap-1">
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
                              <span>FREE Delivery by Spinel</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="mt-1">
                          <span className="inline-block bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded border border-amber-300">
                            Price on Request
                          </span>
                          <p className="text-[11px] text-gray-500 mt-0.5">Contact for RFQ / Project rates</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart or Request Quote Button */}
                  {prod.priceUSD && prod.priceUSD > 0 ? (
                    <button
                      type="button"
                      onClick={() => addToCart(prod, 1)}
                      className="w-full mt-2 bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-gray-900 font-semibold text-xs py-2 px-3 rounded-full border border-[#fcd200] shadow-sm cursor-pointer transition-colors"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (onRequestQuote) {
                          onRequestQuote(prod);
                        } else {
                          onNavigate('quote');
                        }
                      }}
                      className="w-full mt-2 bg-[#f0c14b] hover:bg-[#e2b33c] active:bg-[#d8a32a] text-gray-950 font-bold text-xs py-2 px-3 rounded-full border border-[#a88734] shadow-sm cursor-pointer transition-colors"
                    >
                      Request Quote
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded shadow-sm border border-gray-200 text-center">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Catalog Currently Empty
            </h3>
            <p className="text-xs text-gray-500 mb-4 max-w-md mx-auto">
              All previous products have been removed. You can bulk upload CSV product spreadsheets anytime via the Admin Portal.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('admin-login')}
              className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-semibold text-xs py-2 px-5 rounded-full border border-[#fcd200] cursor-pointer"
            >
              Open Admin Upload Portal
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
