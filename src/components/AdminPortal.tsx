import React, { useState, useRef, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Product, Order, RestaurantTable, TableReservation, OrderStage, PaymentStatus, TableStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  ClipboardList, 
  Plus, 
  Edit3, 
  Trash2, 
  Percent, 
  Map, 
  Calendar, 
  Check, 
  X, 
  AlertTriangle,
  Upload,
  Search,
  CheckCircle,
  RefreshCw,
  Clock,
  ShieldAlert,
  Coins,
  Bell,
  XCircle,
  Flame,
  Leaf,
  Sparkles,
  QrCode,
  Printer,
  Download,
  Eye
} from 'lucide-react';

interface AdminPortalProps {
  onExit?: () => void;
}

interface CheckoutNotification {
  id: string;
  orderId: string;
  customerName: string;
  tableNumber?: string;
  totalPrice: number;
  timestamp: string;
}

export default function AdminPortal({ onExit }: AdminPortalProps) {
  const { 
    products, 
    orders, 
    tables, 
    reservations, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    updateOrder,
    updateTable,
    createTable,
    deleteTable,
    regenerateTableToken
  } = useRestaurant();

  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'menu' | 'orders' | 'tables'>('analytics');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'active' | 'history'>('active');
  const [checkoutNotifications, setCheckoutNotifications] = useState<CheckoutNotification[]>([]);
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);

  const knownCheckoutRequestIdsRef = useRef<string[]>([]);
  const isFirstLoadRef = useRef(true);

  // Sound generator for checkout alerts
  const playCheckoutChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (ctx.state === 'suspended') {
        setIsAudioBlocked(true);
      } else {
        setIsAudioBlocked(false);
      }
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc1.frequency.setValueAtTime(1320, ctx.currentTime + 0.1); // E6
      
      osc2.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc2.frequency.setValueAtTime(660, ctx.currentTime + 0.1); // E5

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } catch (err) {
      console.warn("Admin audio chime deferred until user interaction.", err);
      setIsAudioBlocked(true);
    }
  };

  // Listen for new cash checkout requests
  useEffect(() => {
    const activeRequests = orders.filter(o => o.cashCheckoutRequested && o.paymentStatus !== 'Paid');
    const currentRequestIds = activeRequests.map(o => o.id);

    if (isFirstLoadRef.current) {
      knownCheckoutRequestIdsRef.current = currentRequestIds;
      isFirstLoadRef.current = false;
      return;
    }

    const newRequests = activeRequests.filter(o => !knownCheckoutRequestIdsRef.current.includes(o.id));
    if (newRequests.length > 0) {
      playCheckoutChime();

      const newNotifications: CheckoutNotification[] = newRequests.map(o => ({
        id: `${o.id}-${Date.now()}`,
        orderId: o.id,
        customerName: o.customerName || 'Guest',
        tableNumber: o.tableNumber,
        totalPrice: o.totalPrice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }));

      setCheckoutNotifications(prev => [...newNotifications, ...prev].slice(0, 5));
    }

    knownCheckoutRequestIdsRef.current = currentRequestIds;
  }, [orders]);

  // Click listener to auto-enable audio when blocked
  useEffect(() => {
    const unlockAudio = () => {
      if (isAudioBlocked) {
        playCheckoutChime();
        setIsAudioBlocked(false);
      }
    };
    window.addEventListener('click', unlockAudio);
    return () => window.removeEventListener('click', unlockAudio);
  }, [isAudioBlocked]);

  const dismissCheckoutNotification = (id: string) => {
    setCheckoutNotifications(prev => prev.filter(n => n.id !== id));
  };

  const pendingCheckoutRequests = orders.filter(o => o.cashCheckoutRequested && o.paymentStatus !== 'Paid');
  const pendingCheckoutRequestsCount = pendingCheckoutRequests.length;

  // --- Search & Filter states ---
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // --- CRUD Drawers/Modals ---
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productForm, setProductForm] = useState<Omit<Product, 'id'>>({
    name: '',
    category: 'burger',
    price: 0,
    description: '',
    image: '',
    rating: 4.8,
    tags: [],
    customizations: { sizes: ['Regular', 'Large'], addOns: [] },
    isSpicy: false,
    isVegetarian: false,
    isChefSpecial: false,
    prepTime: undefined,
    calories: undefined
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newAddOnName, setNewAddOnName] = useState('');
  const [newAddOnPrice, setNewAddOnPrice] = useState<number>(1.00);

  const [isTableFormOpen, setIsTableFormOpen] = useState(false);
  const [selectedQrTable, setSelectedQrTable] = useState<RestaurantTable | null>(null);
  const [tableForm, setTableForm] = useState({
    name: '',
    capacity: 4,
    areaLocation: 'Indoor Dining Hall'
  });

  // -----------------------------------------------------------------------------
  // Analytics Aggregation
  // -----------------------------------------------------------------------------
  const paidOrders = orders.filter(o => o.paymentStatus === 'Paid' && o.orderStage !== 'Cancelled');
  const grossSalesRevenue = paidOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalOrdersFulfilled = orders.filter(o => o.orderStage === 'Delivered').length;
  const activeOrdersCount = orders.filter(o => o.orderStage !== 'Delivered' && o.orderStage !== 'Cancelled').length;
  
  // Calculate unique customers based on email or name
  const uniqueCustomerEmails = Array.from(new Set(orders.map(o => o.email.toLowerCase().trim()).filter(Boolean)));
  const uniqueCustomerNames = Array.from(new Set(orders.map(o => o.customerName.toLowerCase().trim())));
  const uniqueCustomerReach = Math.max(uniqueCustomerEmails.length, uniqueCustomerNames.length, 1);

  // Top products calculation
  const productQuantities: Record<string, { name: string; qty: number; revenue: number }> = {};
  orders.forEach(order => {
    if (order.orderStage !== 'Cancelled') {
      order.orderedItems.forEach(item => {
        if (!productQuantities[item.productId]) {
          productQuantities[item.productId] = { name: item.name, qty: 0, revenue: 0 };
        }
        productQuantities[item.productId].qty += item.quantity;
        productQuantities[item.productId].revenue += item.price * item.quantity;
      });
    }
  });

  const sortedTopProducts = Object.values(productQuantities).sort((a, b) => b.qty - a.qty).slice(0, 5);

  // Category sales split
  const categorySales: Record<string, number> = { burger: 0, pizza: 0, side: 0, salad: 0, seafood: 0, drink: 0 };
  orders.forEach(order => {
    if (order.orderStage !== 'Cancelled') {
      order.orderedItems.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        const cat = prod?.category || 'burger';
        categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity);
      });
    }
  });

  // -----------------------------------------------------------------------------
  // Product CRUD Handlers
  // -----------------------------------------------------------------------------
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addAddOnToForm = () => {
    if (!newAddOnName.trim()) return;
    const currentAddOns = productForm.customizations?.addOns || [];
    if (currentAddOns.some(a => a.name.toLowerCase() === newAddOnName.trim().toLowerCase())) {
      alert("This extra ingredient is already in the list!");
      return;
    }
    const updatedAddOns = [...currentAddOns, { name: newAddOnName.trim(), price: Number(newAddOnPrice) || 0 }];
    setProductForm(prev => ({
      ...prev,
      customizations: {
        ...(prev.customizations || { sizes: ['Regular', 'Large'] }),
        addOns: updatedAddOns
      }
    }));
    setNewAddOnName('');
    setNewAddOnPrice(1.00);
  };

  const removeAddOnFromForm = (nameToRemove: string) => {
    const currentAddOns = productForm.customizations?.addOns || [];
    const updatedAddOns = currentAddOns.filter(a => a.name !== nameToRemove);
    setProductForm(prev => ({
      ...prev,
      customizations: {
        ...(prev.customizations || { sizes: ['Regular', 'Large'] }),
        addOns: updatedAddOns
      }
    }));
  };

  const openProductCreate = () => {
    setEditingProduct(null);
    setNewAddOnName('');
    setNewAddOnPrice(1.00);
    setProductForm({
      name: '',
      category: 'burger',
      price: 9.99,
      description: '',
      image: '',
      rating: 4.8,
      tags: ['Gourmet'],
      customizations: {
        sizes: ['Regular', 'Large'],
        addOns: [
          { name: 'Extra Cheddar', price: 1.00 },
          { name: 'Smoked Bacon', price: 2.00 }
        ]
      },
      isSpicy: false,
      isVegetarian: false,
      isChefSpecial: false,
      prepTime: undefined,
      calories: undefined
    });
    setIsProductFormOpen(true);
  };

  const openProductEdit = (p: Product) => {
    setEditingProduct(p);
    setNewAddOnName('');
    setNewAddOnPrice(1.00);
    setProductForm({
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description,
      image: p.image,
      rating: p.rating,
      tags: p.tags || [],
      customizations: p.customizations || { sizes: ['Regular', 'Large'], addOns: [] },
      isSpicy: p.isSpicy || false,
      isVegetarian: p.isVegetarian || false,
      isChefSpecial: p.isChefSpecial || false,
      prepTime: p.prepTime,
      calories: p.calories
    });
    setIsProductFormOpen(true);
  };

  const saveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!productForm.name || !productForm.price) {
        alert("Please provide name and price.");
        return;
      }
      if (editingProduct) {
        await updateProduct(editingProduct.id, productForm);
      } else {
        await createProduct(productForm);
      }
      setIsProductFormOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save product.");
    }
  };

  const handleDeleteProductClick = async (productId: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete '${name}' from the menu database?`)) {
      try {
        await deleteProduct(productId);
      } catch (err) {
        console.error(err);
        alert("Failed to delete product.");
      }
    }
  };

  // -----------------------------------------------------------------------------
  // Order Override Controls
  // -----------------------------------------------------------------------------
  const handleOrderStageChange = async (orderId: string, stage: OrderStage) => {
    await updateOrder(orderId, { orderStage: stage });
  };

  const handleOrderPaymentChange = async (orderId: string, status: PaymentStatus) => {
    await updateOrder(orderId, { paymentStatus: status });
  };

  const handleTriggerRefund = async (order: Order) => {
    if (window.confirm(`Initiate complete refund of $${order.totalPrice.toFixed(2)} for ${order.id}?`)) {
      await updateOrder(order.id, { 
        paymentStatus: 'Refunded',
        orderStage: 'Cancelled'
      });
    }
  };

  // -----------------------------------------------------------------------------
  // Table Allocation Overrides
  // -----------------------------------------------------------------------------
  const handleTableStatusOverride = async (tableId: string, status: TableStatus) => {
    await updateTable(tableId, { tableStatus: status });
  };

  // Filters
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase()));
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || o.customerName.toLowerCase().includes(orderSearch.toLowerCase());
    if (!matchesSearch) return false;

    const isCompleted = o.isCheckedOut || o.paymentStatus === 'Paid' || o.orderStage === 'Cancelled';
    if (orderStatusFilter === 'active') {
      return !isCompleted;
    } else {
      return isCompleted;
    }
  });

  return (
    <div className="min-h-screen bg-[#111315] text-stone-100 p-4 sm:p-6 lg:p-8 relative">
      {/* Floating Notifications Area */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none select-none max-w-full">
        <AnimatePresence mode="popLayout">
          {checkoutNotifications.map(notification => (
            <CheckoutNotificationToast
              key={notification.id}
              notification={notification}
              onDismiss={() => dismissCheckoutNotification(notification.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Interactive Browser Autoplay Warning Banner */}
      {isAudioBlocked && (
        <div 
          onClick={() => {
            playCheckoutChime();
            setIsAudioBlocked(false);
          }}
          className="relative z-20 max-w-full lg:max-w-[1550px] mx-auto mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-amber-500/20 transition-all select-none animate-pulse"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🔔</span>
            <div>
              <h4 className="font-outfit text-xs font-bold text-amber-400 uppercase tracking-wider">
                Admin sounds are muted by your browser
              </h4>
              <p className="font-outfit text-[11px] text-stone-300 mt-0.5">
                Click anywhere on this screen or click the button to enable live chime alerts when a customer requests a checkout payment.
              </p>
            </div>
          </div>
          <button 
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-outfit text-[10.5px] font-black uppercase tracking-wider transition-all self-end sm:self-auto shadow-lg shadow-amber-500/10"
          >
            Enable Sounds
          </button>
        </div>
      )}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.04),transparent_50%)] pointer-events-none" />

      {/* Main Admin Header bar */}
      <div className="max-w-full lg:max-w-[1550px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-800 pb-5 mb-6 gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-tomato-orange" />
            <h1 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Restaurant Admin Panel
            </h1>
          </div>
          <p className="font-outfit text-xs text-stone-400 mt-1 uppercase tracking-widest font-semibold">
            Central Command & Business Intelligence Center
          </p>
        </div>

        {/* Subtab selection pills & exit */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex flex-wrap gap-2 bg-stone-950 p-1.5 rounded-2xl border border-stone-850">
            {(['analytics', 'menu', 'orders', 'tables'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-4.5 py-2 rounded-xl font-outfit text-[11px] font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === tab 
                    ? 'bg-tomato-orange text-black font-black' 
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-900/40'
                }`}
              >
                <span>{tab}</span>
                {tab === 'orders' && pendingCheckoutRequestsCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[9px] bg-red-600 text-white rounded-full font-sans font-black animate-pulse shadow-md">
                    {pendingCheckoutRequestsCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          {onExit && (
            <button
              onClick={onExit}
              className="px-4.5 py-3 rounded-2xl bg-tomato-orange/10 hover:bg-tomato-orange border border-tomato-orange/30 text-tomato-orange hover:text-black font-outfit text-[11px] font-extrabold uppercase tracking-widest transition-all active:scale-95 cursor-pointer shadow-lg"
            >
              ← Exit Admin
            </button>
          )}
        </div>
      </div>

      <div className="max-w-full lg:max-w-[1550px] mx-auto relative z-10">
        <AnimatePresence mode="wait">
          
          {/* ===================================================================
              SUBTAB 1: ANALYTICS (BUSINESS INTELLIGENCE)
              =================================================================== */}
          {activeSubTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Aggregated counter cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Revenue Card */}
                <div className="bg-stone-900/50 backdrop-blur-md p-5 rounded-3xl border border-stone-850 shadow-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-outfit text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Gross Revenue</span>
                    <h3 className="font-display text-2xl font-black text-white mt-1">
                      ${grossSalesRevenue.toFixed(2)}
                    </h3>
                  </div>
                </div>

                {/* Fulfilled Card */}
                <div className="bg-stone-900/50 backdrop-blur-md p-5 rounded-3xl border border-stone-850 shadow-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-tomato-orange/10 border border-tomato-orange/20 flex items-center justify-center text-tomato-orange">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-outfit text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Orders Completed</span>
                    <h3 className="font-display text-2xl font-black text-white mt-1">
                      {totalOrdersFulfilled} <span className="font-outfit text-xs text-stone-500 font-semibold">items</span>
                    </h3>
                  </div>
                </div>

                {/* Active Card */}
                <div className="bg-stone-900/50 backdrop-blur-md p-5 rounded-3xl border border-stone-850 shadow-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-outfit text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Active Prep Queue</span>
                    <h3 className="font-display text-2xl font-black text-white mt-1">
                      {activeOrdersCount} <span className="font-outfit text-xs text-stone-500 font-semibold">tickets</span>
                    </h3>
                  </div>
                </div>

                {/* Customers Reach Card */}
                <div className="bg-stone-900/50 backdrop-blur-md p-5 rounded-3xl border border-stone-850 shadow-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-outfit text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Unique Customers</span>
                    <h3 className="font-display text-2xl font-black text-white mt-1">
                      {uniqueCustomerReach} <span className="font-outfit text-xs text-stone-500 font-semibold">foodies</span>
                    </h3>
                  </div>
                </div>

              </div>

              {/* Data visualizations / top sellers */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Top Products List */}
                <div className="col-span-12 lg:col-span-7 bg-stone-900/30 backdrop-blur-md p-6 rounded-3xl border border-stone-850">
                  <h3 className="font-display text-lg font-bold text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Top-Performing Products
                  </h3>
                  <div className="space-y-4">
                    {sortedTopProducts.length === 0 ? (
                      <div className="text-center py-8 text-stone-500 font-outfit text-xs font-semibold uppercase">No products sold yet</div>
                    ) : (
                      sortedTopProducts.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-950/40 border border-stone-850">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-stone-800 text-[11px] font-black font-mono flex items-center justify-center text-tomato-orange">
                              #{idx + 1}
                            </span>
                            <span className="font-outfit text-xs font-bold text-stone-200">{p.name}</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="font-mono text-xs text-stone-400 font-bold">{p.qty} sold</span>
                            <span className="font-mono text-xs text-emerald-400 font-black">${p.revenue.toFixed(2)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right: Category Split */}
                <div className="col-span-12 lg:col-span-5 bg-stone-900/30 backdrop-blur-md p-6 rounded-3xl border border-stone-850">
                  <h3 className="font-display text-lg font-bold text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                    Category Distribution
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(categorySales).map(([cat, val]) => (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between font-outfit text-[11px] uppercase tracking-wider font-bold text-stone-400">
                          <span className="capitalize">{cat}</span>
                          <span className="font-mono text-white">${val.toFixed(2)}</span>
                        </div>
                        <div className="h-2 bg-stone-950 rounded-full overflow-hidden border border-stone-850">
                          <div 
                            className="h-full bg-gradient-to-r from-tomato-orange to-red-500 rounded-full"
                            style={{ width: `${grossSalesRevenue > 0 ? (val / grossSalesRevenue) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ===================================================================
              SUBTAB 2: MENU INVENTORY MANAGER (CRUD)
              =================================================================== */}
          {activeSubTab === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Product search & Add panel */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-stone-900/40 p-4 rounded-3xl border border-stone-850">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search menu catalogue..."
                    className="w-full bg-stone-950 rounded-2xl border border-stone-800 text-xs text-stone-100 pl-10 pr-4 py-3 focus:outline-none focus:border-tomato-orange transition-all font-outfit"
                  />
                </div>
                <button
                  onClick={openProductCreate}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-tomato-orange text-black font-outfit text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer hover:bg-white"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> Add Menu Item
                </button>
              </div>

              {/* Products table list */}
              <div className="bg-stone-900/20 backdrop-blur-md rounded-3xl border border-stone-850 overflow-x-auto shadow-xl scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
                <table className="w-full min-w-[800px] text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-950 font-outfit text-[11px] uppercase tracking-wider font-bold text-stone-400 border-b border-stone-850">
                      <th className="py-4 px-6">Image</th>
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Rating</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(prod => (
                      <tr key={prod.id} className="border-b border-stone-850 hover:bg-stone-900/15 transition-all text-xs">
                        <td className="py-3.5 px-6">
                          <img 
                            src={prod.image} 
                            alt={prod.name} 
                            className="w-12 h-12 rounded-xl object-cover border border-stone-800"
                            referrerPolicy="no-referrer"
                          />
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="font-outfit font-extrabold text-stone-100">{prod.name}</div>
                          {prod.description && <div className="text-[10px] text-stone-400 mt-0.5 line-clamp-1 max-w-xs">{prod.description}</div>}
                          {(prod.prepTime || prod.calories) && (
                            <div className="flex gap-2.5 mt-1 font-mono text-[9px]">
                              {prod.prepTime && (
                                <span className="flex items-center gap-0.5 text-stone-400">
                                  ⏱️ {prod.prepTime} mins
                                </span>
                              )}
                              {prod.calories && (
                                <span className="flex items-center gap-0.5 text-amber-500/90">
                                  🔥 {prod.calories} kcal
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-6 capitalize font-semibold text-stone-300">
                          {prod.category}
                        </td>
                        <td className="py-3.5 px-6 font-mono font-bold text-emerald-400">
                          ${prod.price.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-6 font-mono font-semibold text-amber-400">
                          ★ {prod.rating}
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center justify-center gap-2.5">
                            <button
                              onClick={() => openProductEdit(prod)}
                              className="w-8.5 h-8.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                              title="Edit product"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProductClick(prod.id, prod.name)}
                              className="w-8.5 h-8.5 rounded-xl bg-red-950/20 border border-red-900/30 hover:bg-red-950/50 text-red-400 flex items-center justify-center transition-all cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* CRUD Drawer Modal overlay */}
              {isProductFormOpen && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#161719] border border-stone-850 rounded-[32px] w-full max-w-xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
                  >
                    <button
                      onClick={() => setIsProductFormOpen(false)}
                      className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 hover:text-white active:scale-95 transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <h2 className="font-display text-xl font-bold uppercase tracking-tight text-white mb-6">
                      {editingProduct ? 'Edit Menu Item' : 'Add New Menu Item'}
                    </h2>

                    <form onSubmit={saveProductSubmit} className="space-y-4 text-xs">
                      <div>
                        <label className="font-outfit font-bold text-stone-400 uppercase tracking-widest block mb-1">Product Name *</label>
                        <input
                          type="text"
                          value={productForm.name}
                          onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                          className="w-full bg-stone-950 rounded-xl border border-stone-800 text-stone-100 p-3 focus:outline-none focus:border-tomato-orange"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="font-outfit font-bold text-stone-400 uppercase tracking-widest block mb-1">Category *</label>
                          <select
                            value={productForm.category}
                            onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value as any }))}
                            className="w-full bg-stone-950 rounded-xl border border-stone-800 text-stone-100 p-3 focus:outline-none"
                          >
                            <option value="burger">Burger</option>
                            <option value="pizza">Pizza</option>
                            <option value="salad">Salad</option>
                            <option value="drink">Drink</option>
                            <option value="seafood">Seafood</option>
                            <option value="side">Side Dish</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-outfit font-bold text-stone-400 uppercase tracking-widest block mb-1">Price ($) *</label>
                          <input
                            type="number"
                            step="0.01"
                            value={productForm.price || ''}
                            onChange={(e) => setProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                            required
                            className="w-full bg-stone-950 rounded-xl border border-stone-800 text-stone-100 p-3 focus:outline-none focus:border-tomato-orange"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-outfit font-bold text-stone-400 uppercase tracking-widest block mb-1">Description</label>
                        <textarea
                          value={productForm.description}
                          onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full bg-stone-950 rounded-xl border border-stone-800 text-stone-100 p-3 focus:outline-none focus:border-tomato-orange"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="font-outfit font-bold text-stone-400 uppercase tracking-widest block mb-1">Prep Time (minutes)</label>
                          <input
                            type="number"
                            min="1"
                            value={productForm.prepTime || ''}
                            onChange={(e) => setProductForm(prev => ({ ...prev, prepTime: e.target.value ? Number(e.target.value) : undefined }))}
                            placeholder="e.g. 15"
                            className="w-full bg-stone-950 rounded-xl border border-stone-800 text-stone-100 p-3 focus:outline-none focus:border-tomato-orange"
                          />
                        </div>
                        <div>
                          <label className="font-outfit font-bold text-stone-400 uppercase tracking-widest block mb-1">Calories (kcal)</label>
                          <input
                            type="number"
                            min="0"
                            value={productForm.calories || ''}
                            onChange={(e) => setProductForm(prev => ({ ...prev, calories: e.target.value ? Number(e.target.value) : undefined }))}
                            placeholder="e.g. 450"
                            className="w-full bg-stone-950 rounded-xl border border-stone-800 text-stone-100 p-3 focus:outline-none focus:border-tomato-orange"
                          />
                        </div>
                      </div>

                      {/* Food Flags & Characteristics */}
                      <div>
                        <label className="font-outfit font-bold text-stone-400 uppercase tracking-widest block mb-2">Food Characteristics</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setProductForm(prev => ({ ...prev, isSpicy: !prev.isSpicy }))}
                            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-[10px] sm:text-xs font-outfit font-extrabold uppercase tracking-wider transition-all duration-200 select-none cursor-pointer ${
                              productForm.isSpicy 
                                ? 'bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_2px_10px_rgba(239,68,68,0.15)]' 
                                : 'bg-stone-950 border-stone-850 text-stone-400 hover:text-stone-300'
                            }`}
                          >
                            <Flame className={`w-3.5 h-3.5 ${productForm.isSpicy ? 'animate-pulse text-red-500' : ''}`} />
                            Spicy
                          </button>

                          <button
                            type="button"
                            onClick={() => setProductForm(prev => ({ ...prev, isVegetarian: !prev.isVegetarian }))}
                            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-[10px] sm:text-xs font-outfit font-extrabold uppercase tracking-wider transition-all duration-200 select-none cursor-pointer ${
                              productForm.isVegetarian 
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_2px_10px_rgba(16,185,129,0.15)]' 
                                : 'bg-stone-950 border-stone-850 text-stone-400 hover:text-stone-300'
                            }`}
                          >
                            <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                            Veggie
                          </button>

                          <button
                            type="button"
                            onClick={() => setProductForm(prev => ({ ...prev, isChefSpecial: !prev.isChefSpecial }))}
                            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-[10px] sm:text-xs font-outfit font-extrabold uppercase tracking-wider transition-all duration-200 select-none cursor-pointer ${
                              productForm.isChefSpecial 
                                ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_2px_10px_rgba(245,158,11,0.15)]' 
                                : 'bg-stone-950 border-stone-850 text-stone-400 hover:text-stone-300'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            Special
                          </button>
                        </div>
                      </div>

                      {/* Extra Ingredients / Customizable Add-ons */}
                      <div className="bg-stone-950 p-4 rounded-2xl border border-stone-850 space-y-3">
                        <div>
                          <label className="font-outfit font-bold text-stone-400 uppercase tracking-widest block mb-0.5">Extra Ingredients & Toppings</label>
                          <p className="text-[10px] text-stone-500 font-outfit leading-normal">
                            Define selectable extras that customers can add with a price surcharge.
                          </p>
                        </div>

                        {/* List of current Add-ons */}
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {(!productForm.customizations?.addOns || productForm.customizations.addOns.length === 0) ? (
                            <div className="text-[10px] text-stone-600 font-mono italic p-2.5 bg-[#0d0d0e] rounded-xl text-center border border-dashed border-stone-850/80">
                              No extras listed yet.
                            </div>
                          ) : (
                            productForm.customizations.addOns.map((addon, index) => (
                              <div 
                                key={index} 
                                className="flex items-center justify-between bg-[#0d0d0e] px-3 py-2 rounded-xl border border-stone-850/50 hover:border-stone-800 transition-colors"
                              >
                                <span className="font-outfit font-bold text-stone-300 text-xs">{addon.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-tomato-orange font-bold text-[11px]">+${addon.price.toFixed(2)}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeAddOnFromForm(addon.name)}
                                    className="p-1 rounded-lg hover:bg-stone-850 text-stone-500 hover:text-red-400 transition-colors cursor-pointer"
                                    title="Remove Add-on"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Form to add a new Add-on */}
                        <div className="flex gap-2 items-end pt-1 border-t border-stone-900/60">
                          <div className="flex-grow">
                            <label className="font-outfit font-bold text-stone-500 uppercase tracking-widest block mb-1 text-[9px]">Extra Ingredient Name</label>
                            <input
                              type="text"
                              value={newAddOnName}
                              onChange={(e) => setNewAddOnName(e.target.value)}
                              placeholder="e.g. Double Cheese"
                              className="w-full bg-[#0d0d0e] rounded-xl border border-stone-850 text-stone-200 p-2 text-xs focus:outline-none focus:border-tomato-orange placeholder:text-stone-700"
                            />
                          </div>
                          <div className="w-24">
                            <label className="font-outfit font-bold text-stone-500 uppercase tracking-widest block mb-1 text-[9px]">Surcharge ($)</label>
                            <input
                              type="number"
                              step="0.05"
                              min="0"
                              value={newAddOnPrice === 0 ? '' : newAddOnPrice}
                              onChange={(e) => setNewAddOnPrice(Math.max(0, Number(e.target.value)))}
                              placeholder="1.00"
                              className="w-full bg-[#0d0d0e] rounded-xl border border-stone-850 text-stone-200 p-2 text-xs font-mono focus:outline-none focus:border-tomato-orange"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={addAddOnToForm}
                            className="bg-stone-800 hover:bg-stone-700 text-tomato-orange p-2.5 rounded-xl border border-stone-750 transition-colors cursor-pointer active:scale-95 flex items-center justify-center h-9 w-9 shrink-0"
                            title="Add Extra Ingredient"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Image Upload Component */}
                      <div>
                        <label className="font-outfit font-bold text-stone-400 uppercase tracking-widest block mb-1">Product Illustration</label>
                        <div className="flex gap-4 items-center">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 px-4 py-2.5 rounded-xl border border-stone-750 font-outfit font-bold uppercase text-[10px] tracking-wider transition-all active:scale-95 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" /> Upload File (Base64)
                          </button>
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleProductImageUpload}
                            className="hidden"
                          />
                          <span className="text-[10px] text-stone-500 font-mono italic max-w-xs truncate">
                            {productForm.image ? "Custom Base64 Cached" : "No custom image uploaded"}
                          </span>
                        </div>
                        {productForm.image && (
                          <div className="mt-3 relative w-16 h-16 rounded-xl overflow-hidden border border-stone-800 bg-stone-900">
                            <img src={productForm.image} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setProductForm(prev => ({ ...prev, image: '' }))}
                              className="absolute top-0 right-0 bg-black/60 p-1 text-white hover:bg-red-500 transition-all"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-stone-850 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setIsProductFormOpen(false)}
                          className="px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 font-outfit uppercase tracking-widest font-extrabold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-3 rounded-xl bg-tomato-orange text-black font-outfit uppercase tracking-widest font-black hover:bg-white cursor-pointer"
                        >
                          {editingProduct ? 'Update Product' : 'Save Product'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {/* ===================================================================
              SUBTAB 3: OPERATIONAL ORDER HUB
              =================================================================== */}
          {activeSubTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search orders (ID, Customer Name)..."
                    className="w-full bg-stone-950 rounded-2xl border border-stone-800 text-xs text-stone-100 pl-10 pr-4 py-3 focus:outline-none focus:border-tomato-orange transition-all font-outfit"
                  />
                </div>

                {/* Active vs History Toggles */}
                <div className="flex gap-2 p-1 bg-stone-950 rounded-2xl border border-stone-850 shrink-0 self-start md:self-auto">
                  <button
                    onClick={() => setOrderStatusFilter('active')}
                    className={`px-4.5 py-2 rounded-xl font-outfit text-[11px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
                      orderStatusFilter === 'active'
                        ? 'bg-tomato-orange text-black'
                        : 'text-stone-400 hover:text-stone-100 hover:bg-stone-900/20'
                    }`}
                  >
                    Active Orders
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter('history')}
                    className={`px-4.5 py-2 rounded-xl font-outfit text-[11px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
                      orderStatusFilter === 'history'
                        ? 'bg-[#1c0e0e] border border-tomato-orange/30 text-tomato-orange font-black'
                        : 'text-stone-400 hover:text-stone-100 hover:bg-stone-900/20'
                    }`}
                  >
                    Order History
                  </button>
                </div>
              </div>

              {/* Order Hub Table Grid */}
              <div className="bg-stone-900/20 backdrop-blur-md rounded-3xl border border-stone-850 overflow-x-auto shadow-xl scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
                <table className="w-full min-w-[950px] text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-950 font-outfit text-[11px] uppercase tracking-wider font-bold text-stone-400 border-b border-stone-850">
                      <th className="py-4 px-6">Order ID</th>
                      <th className="py-4 px-6">Customer</th>
                      <th className="py-4 px-6">Delivery Type</th>
                      <th className="py-4 px-6">Total Bill</th>
                      <th className="py-4 px-6">KDS Stage</th>
                      <th className="py-4 px-6">Payment</th>
                      <th className="py-4 px-6 text-center">Administrative Overrides</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="border-b border-stone-850 hover:bg-stone-900/15 transition-all text-xs">
                        <td className="py-4 px-6 font-mono font-bold text-white">
                          {order.id}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-outfit font-extrabold text-stone-200">{order.customerName}</div>
                          <div className="text-[10px] text-stone-400 font-mono mt-0.5">{order.email}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-stone-300">{order.deliveryType}</span>
                          {order.tableNumber && (
                            <span className="bg-stone-800 text-[10px] text-stone-300 ml-1.5 px-1.5 py-0.5 rounded border border-stone-700">
                              {order.tableNumber}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-emerald-400">
                          ${order.totalPrice.toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          <select
                            value={order.orderStage}
                            onChange={(e) => handleOrderStageChange(order.id, e.target.value as OrderStage)}
                            className="bg-stone-950 text-stone-300 border border-stone-800 text-[11px] px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-tomato-orange cursor-pointer"
                          >
                            <option value="Received">Received</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Cooking">Cooking</option>
                            <option value="Ready">Ready</option>
                            <option value="OutForDelivery">Out For Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-4 px-6">
                          <select
                            value={order.paymentStatus}
                            onChange={(e) => handleOrderPaymentChange(order.id, e.target.value as PaymentStatus)}
                            className="bg-stone-950 text-stone-300 border border-stone-800 text-[11px] px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-tomato-orange cursor-pointer font-bold"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Refunded">Refunded</option>
                            <option value="Failed">Failed</option>
                          </select>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col md:flex-row justify-center items-center gap-3">
                            {order.paymentStatus === 'Paid' && (
                              <button
                                onClick={() => handleTriggerRefund(order)}
                                className="px-3 py-1.5 rounded-lg bg-red-950/20 border border-red-900/30 hover:bg-red-950/50 text-red-400 font-outfit text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                                title="Refund transaction"
                              >
                                Trigger Refund
                              </button>
                            )}
                            {order.paymentStatus === 'Pending' && order.orderStage !== 'Cancelled' && (
                              <div className="flex flex-col items-center gap-1">
                                {order.cashCheckoutRequested && (
                                  <span className="text-[9px] text-amber-400 font-outfit font-black tracking-wider uppercase animate-pulse">
                                    💵 CASH PAY REQUESTED
                                  </span>
                                )}
                                <button
                                  onClick={async () => {
                                    await updateOrder(order.id, { cashCheckoutActive: !order.cashCheckoutActive });
                                  }}
                                  className={`px-3 py-1.5 rounded-lg font-outfit text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
                                    order.cashCheckoutActive
                                      ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/10'
                                      : 'bg-[#2a1a15] hover:bg-[#3d251d] text-tomato-orange border border-tomato-orange/30'
                                  }`}
                                  title={order.cashCheckoutActive ? "Disable customer's checkout button" : "Activate customer's checkout button"}
                                >
                                  {order.cashCheckoutActive ? 'Deactivate Checkout' : 'Activate Checkout'}
                                </button>
                              </div>
                            )}
                            <span className="text-[10px] text-stone-500 font-mono italic">
                              {order.orderStage === 'Cancelled' ? 'Void ticket' : 'Active'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ===================================================================
              SUBTAB 5: PHYSICAL TABLE ALLOCATOR
              =================================================================== */}
          {activeSubTab === 'tables' && (
            <motion.div
              key="tables"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Seating Map Title */}
              <div className="bg-stone-900/40 p-4 rounded-3xl border border-stone-850 flex justify-between items-center">
                <div>
                  <h3 className="font-display text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                    <Map className="w-5 h-5 text-tomato-orange" /> Diner Table Seating Map & Status Desk
                  </h3>
                  <p className="font-outfit text-xs text-stone-400 mt-0.5">Physical tables with secure cryptographic QR ordering tokens</p>
                </div>
                <button
                  onClick={() => setIsTableFormOpen(true)}
                  className="bg-tomato-orange hover:bg-tomato-orange/90 text-tomato-dark font-outfit text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4 stroke-[3]" /> Add Table
                </button>
              </div>

              {/* Table Map layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tables.map(table => {
                  const getStatusColor = (status: TableStatus) => {
                    switch (status) {
                      case 'Free': return 'border-emerald-500/25 bg-emerald-500/5 text-emerald-400';
                      case 'Occupied': return 'border-red-500/25 bg-red-500/5 text-red-400 animate-pulse';
                      case 'Reserved': return 'border-yellow-500/25 bg-yellow-500/5 text-yellow-400';
                      case 'Cleaning': return 'border-blue-500/25 bg-blue-500/5 text-blue-400';
                    }
                  };

                  return (
                    <div key={table.id} className={`rounded-3xl border p-5 shadow-xl flex flex-col justify-between min-h-[220px] relative overflow-hidden transition-all duration-300 ${getStatusColor(table.tableStatus)}`}>
                      {/* Top Row: Info and Status Toggle */}
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-display text-lg font-black text-white">{table.name}</span>
                            <p className="font-outfit text-[11px] text-stone-400 mt-0.5 uppercase tracking-wider font-semibold">
                              {table.areaLocation}
                            </p>
                          </div>
                          
                          {/* Active State Toggle */}
                          <button
                            onClick={() => updateTable(table.id, { enabled: !table.enabled })}
                            className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border cursor-pointer transition-colors ${
                              table.enabled 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-stone-800 text-stone-500 border-stone-700'
                            }`}
                          >
                            {table.enabled ? 'Active' : 'Disabled'}
                          </button>
                        </div>

                        <p className="font-outfit text-[11px] text-stone-500 mt-1.5">
                          Capacity: <span className="font-mono font-bold text-stone-300">{table.capacity} guests</span>
                        </p>

                        {/* Secure QR Code Session Details */}
                        <div className="mt-3 bg-black/35 rounded-xl p-2.5 border border-white/5 flex items-center justify-between gap-2">
                          <div className="truncate">
                            <span className="text-[9px] text-stone-400 block uppercase tracking-widest">QR Security Token</span>
                            <span className="font-mono text-[9px] text-stone-300 truncate block mt-0.5 max-w-[140px]">{table.qrToken || 'None Generated'}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setSelectedQrTable(table)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-stone-300 hover:text-tomato-orange transition-colors cursor-pointer"
                              title="Show Secure QR Code"
                            >
                              <QrCode className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                await regenerateTableToken(table.id);
                              }}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-stone-300 hover:text-tomato-orange transition-colors cursor-pointer"
                              title="Regenerate/Rotate QR Token"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* State Override Seating Actions */}
                      <div className="pt-3 border-t border-stone-800/20 mt-3 flex items-center justify-between gap-2">
                        <div className="flex gap-1">
                          {(['Free', 'Occupied', 'Reserved', 'Cleaning'] as const).map(st => (
                            <button
                              key={st}
                              onClick={() => handleTableStatusOverride(table.id, st)}
                              className={`text-[9px] font-outfit font-extrabold uppercase px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                                table.tableStatus === st 
                                  ? 'bg-white text-black font-black scale-105 border-white' 
                                  : 'bg-stone-950/50 text-stone-400 border-stone-850 hover:text-white'
                              }`}
                            >
                              {st[0]}
                            </button>
                          ))}
                        </div>

                        {/* Delete Table button */}
                        <button
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete ${table.name}?`)) {
                              await deleteTable(table.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-tomato-red/10 hover:bg-tomato-red/25 border border-tomato-red/20 text-tomato-orange hover:text-white transition-all cursor-pointer"
                          title="Delete Table"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Table Reservations Ledger */}
              <div className="bg-stone-900/20 backdrop-blur-md p-6 rounded-3xl border border-stone-850 shadow-xl">
                <h3 className="font-display text-base font-bold text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-tomato-orange" /> Live Reservations Ledger
                </h3>
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
                  <table className="w-full min-w-[650px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-stone-950 font-outfit text-[11px] uppercase tracking-wider font-bold text-stone-400 border-b border-stone-850">
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Seating</th>
                        <th className="py-3 px-4">Guests</th>
                        <th className="py-3 px-4">Timing</th>
                        <th className="py-3 px-4">Special Requests</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map(res => (
                        <tr key={res.id} className="border-b border-stone-850 hover:bg-stone-900/10">
                          <td className="py-3 px-4 font-outfit font-extrabold text-stone-200">{res.customerName}</td>
                          <td className="py-3 px-4 font-semibold text-stone-300">{res.tableName}</td>
                          <td className="py-3 px-4 font-mono font-bold text-stone-400">{res.guestCount} guests</td>
                          <td className="py-3 px-4 font-mono font-bold text-amber-400">{res.reservationTime}</td>
                          <td className="py-3 px-4 text-stone-400 max-w-xs truncate italic">
                            {res.specialRequests ? `"${res.specialRequests}"` : 'None'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CREATE TABLE MODAL */}
              {isTableFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md rounded-3xl bg-stone-900 border border-stone-800 p-6 shadow-2xl text-stone-200 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                      <h4 className="font-display font-bold text-base text-white uppercase tracking-wider flex items-center gap-2">
                        <Map className="w-5 h-5 text-tomato-orange" /> Create New Physical Table
                      </h4>
                      <button
                        onClick={() => setIsTableFormOpen(false)}
                        className="text-stone-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await createTable({
                          name: tableForm.name,
                          capacity: Number(tableForm.capacity),
                          areaLocation: tableForm.areaLocation
                        });
                        setIsTableFormOpen(false);
                        setTableForm({ name: '', capacity: 4, areaLocation: 'Indoor Dining Hall' });
                      }}
                      className="space-y-4 text-left"
                    >
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-stone-400">Table Code/Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Table 9"
                          value={tableForm.name}
                          onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                          className="w-full rounded-xl bg-black/40 border border-stone-800 px-4 py-2 text-sm text-white focus:outline-none focus:border-tomato-orange transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-stone-400">Guest Capacity *</label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={20}
                          value={tableForm.capacity}
                          onChange={(e) => setTableForm({ ...tableForm, capacity: Number(e.target.value) })}
                          className="w-full rounded-xl bg-black/40 border border-stone-800 px-4 py-2 text-sm text-white focus:outline-none focus:border-tomato-orange transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-stone-400">Area Location *</label>
                        <select
                          value={tableForm.areaLocation}
                          onChange={(e) => setTableForm({ ...tableForm, areaLocation: e.target.value })}
                          className="w-full rounded-xl bg-black/40 border border-stone-800 px-4 py-2 text-sm text-white focus:outline-none focus:border-tomato-orange transition-colors cursor-pointer"
                        >
                          <option value="Indoor Dining Hall">Indoor Dining Hall</option>
                          <option value="VIP Private Lounge">VIP Private Lounge</option>
                          <option value="Outdoor Terrace Suite">Outdoor Terrace Suite</option>
                          <option value="Windowside lane">Windowside Lane</option>
                        </select>
                      </div>

                      <div className="pt-3 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setIsTableFormOpen(false)}
                          className="flex-1 py-2.5 rounded-full border border-stone-800 text-stone-400 hover:text-white transition-colors uppercase font-outfit text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 rounded-full bg-tomato-orange text-tomato-dark font-outfit text-xs font-black uppercase tracking-wider shadow-lg shadow-tomato-orange/10 cursor-pointer"
                        >
                          Create Table
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {/* SECURE QR CODE PREVIEW MODAL */}
              {selectedQrTable && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md rounded-3xl bg-stone-900 border border-stone-800 p-6 shadow-2xl text-stone-200 text-center relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
                      <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-tomato-orange animate-pulse" /> Seating QR Card
                      </h4>
                      <button
                        onClick={() => setSelectedQrTable(null)}
                        className="text-stone-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-2xl max-w-[200px] mx-auto shadow-xl">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${window.location.origin}/menu?token=${selectedQrTable.qrToken}`)}`}
                          alt="Dynamic Table QR Code"
                          className="w-full h-auto aspect-square rounded-lg"
                        />
                      </div>

                      <div>
                        <h5 className="font-display text-base font-extrabold text-white">{selectedQrTable.name}</h5>
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-0.5">{selectedQrTable.areaLocation}</p>
                      </div>

                      {/* Display Secure Decrypted Target URL */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[9px] uppercase font-bold tracking-widest text-stone-500">Secure Ordering Endpoint</label>
                        <input
                          type="text"
                          readOnly
                          value={`${window.location.origin}/menu?token=${selectedQrTable.qrToken}`}
                          className="w-full rounded-xl bg-black/40 border border-stone-800 px-3 py-2 font-mono text-[9px] text-stone-300 select-all focus:outline-none"
                        />
                      </div>

                      {/* Print and Open utilities */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          onClick={() => {
                            const secureUrl = `${window.location.origin}/menu?token=${selectedQrTable.qrToken}`;
                            const printWindow = window.open('', '_blank');
                            if (printWindow) {
                              printWindow.document.write(`
                                <html>
                                  <head>
                                    <title>Print QR Card - \${selectedQrTable.name}</title>
                                    <style>
                                      body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 40px; color: #111; background-color: #fafafa; }
                                      .card { border: 1px solid #e5e7eb; border-radius: 24px; padding: 48px; max-width: 420px; margin: 40px auto; background: white; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }
                                      h1 { font-size: 32px; font-weight: 900; color: #da291c; margin: 0 0 4px 0; letter-spacing: -0.025em; }
                                      p.desc { font-size: 15px; color: #4b5563; margin: 0 0 32px 0; }
                                      img { width: 260px; height: 260px; padding: 8px; border: 1px solid #f3f4f6; border-radius: 16px; }
                                      p.info { margin-top: 32px; font-size: 18px; font-weight: 800; color: #111827; }
                                      p.footer { font-size: 9px; color: #9ca3af; font-family: monospace; word-break: break-all; margin-top: 24px; padding: 0 20px; }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="card">
                                      <h1>TOMATO BURGER</h1>
                                      <p class="desc">Scan the QR code to browse our menu and order instantly from your table.</p>
                                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=\${encodeURIComponent(secureUrl)}" />
                                      <p class="info">📍 Table: \${selectedQrTable.name}</p>
                                      <p class="footer">Secure Table Token: \${selectedQrTable.qrToken}</p>
                                    </div>
                                    <script>
                                      window.onload = function() {
                                        window.print();
                                        setTimeout(function() { window.close(); }, 500);
                                      }
                                    </script>
                                  </body>
                                </html>
                              `);
                              printWindow.document.close();
                            }
                          }}
                          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200 border border-stone-850 hover:border-stone-700 transition-colors uppercase font-outfit text-xs font-bold cursor-pointer"
                        >
                          <Printer className="h-4 w-4" />
                          <span>Print Card</span>
                        </button>
                        
                        <a
                          href={`${window.location.origin}/menu?token=${selectedQrTable.qrToken}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-tomato-orange text-tomato-dark font-outfit text-xs font-black uppercase tracking-wider shadow-lg shadow-tomato-orange/15 cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Test Order</span>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

function CheckoutNotificationToast({ 
  notification, 
  onDismiss,
  key
}: { 
  notification: CheckoutNotification; 
  onDismiss: () => void; 
  key?: string | number;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, y: -10, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.2 } }}
      className="bg-stone-900 border border-tomato-orange/80 p-4 rounded-2xl shadow-[0_4px_25px_rgba(240,82,82,0.3)] flex items-start gap-3 w-80 pointer-events-auto relative overflow-hidden group"
    >
      {/* Tomato red status edge */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-tomato-orange to-[#ff3b30]" />
      
      <div className="bg-tomato-orange/10 p-2 rounded-xl text-tomato-orange border border-tomato-orange/20 shrink-0">
        <Coins className="w-5 h-5 animate-bounce" />
      </div>

      <div className="flex-grow space-y-1 pl-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] font-black text-tomato-orange uppercase tracking-wider">
            Checkout Requested
          </span>
          <span className="font-mono text-[9px] text-stone-500">
            {notification.timestamp}
          </span>
        </div>
        <h4 className="font-display text-xs font-black text-white">
          {notification.orderId}
        </h4>
        <p className="font-outfit text-xs text-stone-300">
          Customer: <span className="font-semibold text-white">{notification.customerName}</span>
        </p>
        {notification.tableNumber && (
          <p className="font-outfit text-[11px] text-stone-300">
            Table: <span className="text-amber-400 font-bold">{notification.tableNumber}</span>
          </p>
        )}
        <p className="font-outfit text-[11px] text-stone-400">
          Total Amount: <span className="text-emerald-400 font-bold">${notification.totalPrice.toFixed(2)}</span>
        </p>
      </div>

      <button
        onClick={onDismiss}
        className="text-stone-500 hover:text-white transition-colors cursor-pointer shrink-0 animate-pulse"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
