import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import MiddleSection from './components/MiddleSection';
import MenuSection from './components/MenuSection';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import AIStudioPlayground from './components/AIStudioPlayground';
import ChefPortal from './components/ChefPortal';
import AdminPortal from './components/AdminPortal';
import MyOrdersPage from './components/MyOrdersPage';
import ReviewsSection from './components/ReviewsSection';
import { MenuItem, CartItem } from './types';
import { useRestaurant } from './context/RestaurantContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, 
  Flame, 
  Gift, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Star, 
  ShoppingBag,
  Wifi,
  MapPin,
  Compass,
  AlertCircle,
  X,
  HelpCircle
} from 'lucide-react';

export default function App() {
  const { 
    products, 
    tableSession, 
    verifyTableToken, 
    clearTableSession
  } = useRestaurant();

  const [activePage, setActivePage] = useState('home');
  const [isPlaygroundActive, setIsPlaygroundActive] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Multi-portal role selection state: customer vs chef vs admin
  const [portalRole, setPortalRole] = useState<'customer' | 'chef' | 'admin'>('customer');

  // Parse URL QR tokens on boot
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get('token');
    if (token) {
      verifyTableToken(token).then((success) => {
        if (success) {
          triggerToast("Table session successfully initialized!");
          setActivePage('menu');
          // Strip token from the browser search URL to secure table ownership
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          triggerToast("Invalid, broken, or expired table QR token.");
        }
      });
    }
  }, []);

  // Global resizable UI scaling state
  const [globalScale, setGlobalScale] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tomato_global_scale');
      return saved ? parseFloat(saved) : 1.0;
    } catch {
      return 1.0;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tomato_global_scale', globalScale.toString());
    } catch (e) {
      // Ignore
    }
    document.documentElement.style.setProperty('--global-scale-multiplier', globalScale.toString());
  }, [globalScale]);

  // Trigger brief animated toast
  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleAddToCart = (itemToAdd: Omit<CartItem, 'id'>) => {
    setCartItems((prevItems) => {
      // Collision and deduplication logic based on same configuration
      const existingItem = prevItems.find((item) => {
        const sameProduct = item.productId === itemToAdd.productId;
        const sameSize = item.selectedSize.toLowerCase() === itemToAdd.selectedSize.toLowerCase();
        const sameInstructions = (item.specialInstructions || '').trim().toLowerCase() === (itemToAdd.specialInstructions || '').trim().toLowerCase();
        
        const sameToppings = item.selectedToppings.length === itemToAdd.selectedToppings.length &&
          item.selectedToppings.every((topping) => itemToAdd.selectedToppings.includes(topping));
          
        return sameProduct && sameSize && sameInstructions && sameToppings;
      });

      if (existingItem) {
        triggerToast(`Added ${itemToAdd.quantity} more ${itemToAdd.name} to order!`);
        return prevItems.map((item) =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + itemToAdd.quantity }
            : item
        );
      }

      const newId = `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      triggerToast(`Added ${itemToAdd.name} (${itemToAdd.quantity}x) to order!`);
      return [...prevItems, { ...itemToAdd, id: newId }];
    });
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (item) {
      triggerToast(`Removed ${item.name} from order`);
    }
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleScrollToMenu = () => {
    setActivePage('menu');
  };

  // Quick order a stacked premium burger from MiddleSection
  const handleOrderQuickBurger = () => {
    const premiumBurger = products.find(item => item.id === 'burger-double') || products[1];
    if (premiumBurger) {
      handleAddToCart({
        productId: premiumBurger.id,
        name: premiumBurger.name,
        price: premiumBurger.price,
        quantity: 1,
        selectedSize: 'Regular',
        selectedToppings: [],
        specialInstructions: '',
        image: premiumBurger.image
      });
      setIsCartOpen(true);
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const addedItemIds = cartItems.map((item) => item.productId);

  if (isPlaygroundActive) {
    return (
      <AIStudioPlayground onBackToFood={() => setIsPlaygroundActive(false)} />
    );
  }

  return (
    <div className="min-h-screen bg-[#141517] text-stone-100 font-sans selection:bg-tomato-orange selection:text-tomato-dark scroll-smooth relative flex flex-col overflow-x-hidden">

      {/* Staff & Management Gateways Ribbon */}
      <div className="bg-[#120808]/90 border-b border-white/5 py-2 px-4 sm:px-6 lg:px-8 text-center flex flex-wrap items-center justify-between gap-3 text-stone-400 font-outfit text-xs relative z-50 backdrop-blur-sm">
        <div className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-[10px] text-stone-400">
          <ShieldAlert className="h-3.5 w-3.5 text-tomato-orange" />
          Staff & Management Gateways
        </div>



        <div className="flex items-center gap-4">
          <button
            onClick={() => setPortalRole('customer')}
            className={`hover:text-white transition-colors cursor-pointer uppercase tracking-wider text-[10px] font-extrabold ${portalRole === 'customer' ? 'text-tomato-orange underline underline-offset-4' : 'text-stone-400'}`}
          >
            Storefront View
          </button>
          <span className="text-white/10">|</span>
          <button
            onClick={() => setPortalRole('chef')}
            className={`hover:text-white transition-colors cursor-pointer uppercase tracking-wider text-[10px] font-extrabold flex items-center gap-1.5 ${portalRole === 'chef' ? 'text-tomato-orange underline underline-offset-4' : 'text-stone-400'}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Kitchen (Chef KDS)
          </button>
          <span className="text-white/10">|</span>
          <button
            onClick={() => setPortalRole('admin')}
            className={`hover:text-white transition-colors cursor-pointer uppercase tracking-wider text-[10px] font-extrabold flex items-center gap-1.5 ${portalRole === 'admin' ? 'text-tomato-orange underline underline-offset-4' : 'text-stone-400'}`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-tomato-orange" />
            Admin Control Panel
          </button>
        </div>
      </div>

      {/* Conditionally render dynamic views */}
      {portalRole === 'chef' ? (
        <ChefPortal onExit={() => setPortalRole('customer')} />
      ) : portalRole === 'admin' ? (
        <AdminPortal onExit={() => setPortalRole('customer')} />
      ) : (
        <>
          <div className="relative z-10 flex-grow flex flex-col">
          {/* Immersive background photo fitting the website width perfectly, scrolling alongside the page content */}
          <div 
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: "url('https://i.pinimg.com/736x/be/00/64/be00644c0956d08813ce1bce465b0781.jpg')",
              backgroundSize: "100% auto",
              backgroundPosition: "center top",
              backgroundRepeat: "no-repeat"
            }}
          />
          {/* Extremely subtle dark overlay to keep text readable while letting the vibrant photo shine perfectly */}
          <div className="absolute inset-0 bg-black/25 pointer-events-none z-0" />

          {/* Content wrapper */}
          <div className="relative z-10 flex-grow flex flex-col">
          
          {/* Toast Notification Box */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -40, scale: 0.9 }}
                className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2.5 rounded-full bg-[#da291c] px-6 py-3 font-outfit text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-tomato-red/35 border border-white/10"
              >
                <CheckCircle className="h-4 w-4 stroke-[3]" />
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>
     
          {/* Header / Nav */}
          <Header
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenPlayground={() => setIsPlaygroundActive(true)}
            activePage={activePage}
            onChangePage={setActivePage}
          />

          {/* Active Seating QR Session Status Bar */}
          {tableSession && (
            <div className="bg-[#120808]/95 border-b border-white/5 py-3 px-4 sm:px-6 lg:px-8 relative z-40 backdrop-blur-md">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Session Info */}
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-tomato-orange/10 border border-tomato-orange/30 flex items-center justify-center text-tomato-orange shrink-0">
                    <MapPin className="h-4 w-4 animate-bounce" />
                  </div>
                  <div>
                    <div className="font-display text-xs font-bold tracking-wide text-stone-100 flex items-center gap-2">
                      Active Seating Session: <span className="text-tomato-orange font-black text-sm">{tableSession.tableName}</span>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      Table {tableSession.tableName} is securely associated with this device. Browse and order directly to your table.
                    </p>
                  </div>
                </div>

                {/* Simplified Controls */}
                <div className="flex items-center gap-3">
                  {/* Leave Table Session */}
                  <button
                    onClick={() => {
                      clearTableSession();
                      triggerToast("Table session cleared.");
                    }}
                    className="bg-tomato-red/10 hover:bg-tomato-red/20 text-tomato-orange border border-tomato-red/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Leave Table
                  </button>
                </div>
              </div>
            </div>
          )}



      {/* Pages Container with clean fade-in animations for perfect micro-interactions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="w-full relative z-10"
        >
          {activePage === 'home' && (
            <>
              {/* Hero Section */}
              <Hero onScrollToMenu={handleScrollToMenu} />

              {/* Middle Burgers showcase Section */}
              <MiddleSection onOrderQuickBurger={handleOrderQuickBurger} />
            </>
          )}

          {activePage === 'menu' && (
            /* Popular Menu Section */
            <MenuSection
              onAddToCart={handleAddToCart}
              addedItemIds={addedItemIds}
              onOpenCart={() => setIsCartOpen(true)}
              onChangePage={setActivePage}
            />
          )}

          {activePage === 'deals' && (
            <>
              {/* Featured Promo / Stats Section */}
              <section id="deals" className="relative py-20 bg-black/45 backdrop-blur-md border border-white/10 rounded-3xl max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-tomato-orange via-tomato-red to-tomato-orange" />
                <div className="text-center mb-12 relative z-10">
                  <h2 className="font-display text-4xl sm:text-5xl text-white tracking-wide">
                    Exclusive <span className="text-tomato-orange">Deals & Live Desire</span>
                  </h2>
                  <p className="font-outfit text-sm text-stone-400 mt-2 max-w-lg mx-auto">
                    Fresh ingredients, wood-fire speed, and community loyalty reward stats.
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
                  <div className="space-y-1 bg-black/20 p-6 rounded-2xl border border-white/5 hover:border-tomato-orange/30 transition-all duration-300">
                    <span className="font-display text-4xl md:text-5xl text-tomato-orange block font-black">100%</span>
                    <span className="font-outfit text-xs text-stone-300 uppercase tracking-widest font-semibold block">Fresh Beef</span>
                  </div>
                  <div className="space-y-1 bg-black/20 p-6 rounded-2xl border border-white/5 hover:border-tomato-orange/30 transition-all duration-300">
                    <span className="font-display text-4xl md:text-5xl text-tomato-orange block font-black">450°C</span>
                    <span className="font-outfit text-xs text-stone-300 uppercase tracking-widest font-semibold block">Wood Oven</span>
                  </div>
                  <div className="space-y-1 bg-black/20 p-6 rounded-2xl border border-white/5 hover:border-tomato-orange/30 transition-all duration-300">
                    <span className="font-display text-4xl md:text-5xl text-tomato-orange block font-black">25 Min</span>
                    <span className="font-outfit text-xs text-stone-300 uppercase tracking-widest font-semibold block">Fast Delivery</span>
                  </div>
                  <div className="space-y-1 bg-black/20 p-6 rounded-2xl border border-white/5 hover:border-tomato-orange/30 transition-all duration-300">
                    <span className="font-display text-4xl md:text-5xl text-tomato-orange block font-black">4.9/5</span>
                    <span className="font-outfit text-xs text-stone-300 uppercase tracking-widest font-semibold block">Customer Rating</span>
                  </div>
                </div>
              </section>

              {/* VIP Signup Newsletter Ribbon */}
              <section className="relative py-12 overflow-hidden px-4 mb-8">
                <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-tomato-red/85 to-[#b31910]/85 backdrop-blur-md text-white overflow-hidden border border-white/10 p-8 lg:p-12 shadow-2xl relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]" />
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-4 text-center lg:text-left flex-col lg:flex-row">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white shrink-0">
                        <Gift className="h-6 w-6 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl sm:text-2xl tracking-wide text-white">Join the VIP Rewards Lounge</h3>
                        <p className="font-outfit text-xs text-white/80 mt-1 max-w-md">
                          Unlock immediate access to chef special features, order reward points, and get member-only privileges.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsAuthOpen(true)}
                      className="rounded-full bg-tomato-orange text-tomato-dark font-outfit text-sm font-extrabold uppercase tracking-widest px-8 py-3.5 hover:bg-white transition-all shadow-xl hover:scale-[1.02] cursor-pointer"
                    >
                      Sign Up For Rewards
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}

          {activePage === 'reviews' && (
            <ReviewsSection />
          )}

          {activePage === 'about' && (
            /* About Us Section */
            <section className="relative py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-stone-100">
              <div className="bg-black/45 backdrop-blur-md rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-tomato-red via-tomato-orange to-tomato-red" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <span className="font-outfit text-tomato-orange font-bold uppercase tracking-widest text-xs">Our Heritage</span>
                    <h2 className="font-display text-4xl sm:text-5xl text-white mt-2 mb-6 tracking-wide">
                      The Craft of <span className="text-tomato-orange">Tomato Godotty</span>
                    </h2>
                    <p className="font-outfit text-sm text-stone-300 leading-relaxed mb-4">
                      Founded in 2026, Tomato Godotty is a sanctuary for authentic wood-fired, gourmet fast food. Our custom state-of-the-art brick ovens run at an intense 450°C, baking a sourdough crust that is perfectly bubbly, light, and crispy in under 90 seconds.
                    </p>
                    <p className="font-outfit text-sm text-stone-300 leading-relaxed mb-6">
                      Every hand-pressed dough and daily premium beef blend is sourced locally with uncompromising attention to freshness. We celebrate pure flavor, prompt delivery, and our passionate community of local foodies.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-8 border-t border-white/10 pt-6">
                      <div>
                        <h4 className="font-outfit font-bold text-xs text-tomato-orange uppercase tracking-wide">Opening Hours</h4>
                        <p className="font-outfit text-xs text-stone-400 mt-1">Mon - Sun: 11:00 AM - 11:00 PM</p>
                      </div>
                      <div>
                        <h4 className="font-outfit font-bold text-xs text-tomato-orange uppercase tracking-wide">Address</h4>
                        <p className="font-outfit text-xs text-stone-400 mt-1">452 Gourmet Blvd, Cloud Run</p>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <img
                      src="/src/assets/three_burgers_1782491679101.png"
                      alt="About Tomato Godotty Gourmet Kitchen"
                      className="rounded-2xl object-cover w-full h-[360px] border border-white/10 shadow-xl"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-4 -right-4 bg-tomato-orange text-tomato-dark font-display font-black text-xl italic px-6 py-4 rounded-2xl shadow-lg border border-white/10">
                      EST. 2026
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activePage === 'orders' && (
            <MyOrdersPage
              onNavigateToMenu={() => setActivePage('menu')}
              onAddToCart={handleAddToCart}
              onOpenCart={() => setIsCartOpen(true)}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer component */}
      <Footer />

      </div> {/* closes content wrapper */}
      </div> {/* closes background wrapper */}

      {/* Shopping Cart Sliding Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onViewOrders={() => setActivePage('orders')}
      />

      {/* VIP Club Sign-up Dialog */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Floatable Cart Button */}
      <motion.button
        initial={{ scale: 0, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-tomato-orange to-tomato-red text-tomato-dark shadow-2xl shadow-tomato-red/35 border-2 border-white/20 hover:border-white/40 cursor-pointer transition-colors group"
        aria-label="Open Shopping Cart"
        id="floating-cart-btn"
      >
        <ShoppingBag className="h-6 w-6 sm:h-7 sm:w-7 text-white group-hover:rotate-12 transition-transform duration-300" />
        {cartCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-tomato-red text-[11px] font-black shadow-md border-2 border-tomato-orange">
            {cartCount}
          </span>
        )}
      </motion.button>
      </>
      )}

    </div>
  );
}
