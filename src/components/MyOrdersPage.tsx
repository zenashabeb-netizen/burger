import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRestaurant } from '../context/RestaurantContext';
import { Order, OrderStage } from '../types';
import {
  Clock,
  Receipt,
  Printer,
  RotateCcw,
  Utensils,
  MapPin,
  Truck,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Sparkles,
  ShoppingBag,
  Coins,
  Lock,
  Unlock,
  Star,
  X,
  MessageSquare
} from 'lucide-react';

interface MyOrdersPageProps {
  onNavigateToMenu: () => void;
  onAddToCart: (item: any) => void;
  onOpenCart: () => void;
}

export default function MyOrdersPage({ onNavigateToMenu, onAddToCart, onOpenCart }: MyOrdersPageProps) {
  const { orders, products, updateOrder } = useRestaurant();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Review form states
  const [reviewingItemId, setReviewingItemId] = useState<string | null>(null);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState<number | null>(null);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewedProductIds, setReviewedProductIds] = useState<string[]>([]);
  const [isReviewSuccess, setIsReviewSuccess] = useState(false);

  const handleReviewSubmit = (productId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewTitle.trim() || !reviewComment.trim()) return;

    try {
      const stored = localStorage.getItem('tomato_godotty_reviews');
      let reviewsList = [];
      if (stored) {
        reviewsList = JSON.parse(stored);
      }

      const newReview = {
        id: `rev-custom-${Date.now()}`,
        name: reviewName,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
        rating: reviewRating,
        date: new Date().toISOString(),
        productId: productId,
        title: reviewTitle,
        comment: reviewComment,
        helpfulCount: 0,
        isVerified: true,
        isCustom: true
      };

      const updated = [newReview, ...reviewsList];
      localStorage.setItem('tomato_godotty_reviews', JSON.stringify(updated));
      window.dispatchEvent(new Event('tomato_reviews_updated'));

      setReviewedProductIds(prev => [...prev, productId]);
      setIsReviewSuccess(true);
      setTimeout(() => {
        setIsReviewSuccess(false);
        setReviewingItemId(null);
        setReviewTitle('');
        setReviewComment('');
        setReviewRating(5);
      }, 3000);

    } catch (err) {
      console.error('Error saving review:', err);
    }
  };

  // Retrieve placed order IDs from localStorage
  const myOrderIds: string[] = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('my_orders') || '[]');
    } catch {
      return [];
    }
  }, [orders]); // re-run when orders list updates

  // Filter global orders to show only this user's active/non-completed orders
  const myOrders = React.useMemo(() => {
    return orders.filter(order => myOrderIds.includes(order.id) && !order.isCheckedOut && order.paymentStatus !== 'Paid');
  }, [orders, myOrderIds]);

  // Clean up completed/checked out order IDs from localStorage to keep it empty & fresh
  React.useEffect(() => {
    const completedLocalOrders = orders.filter(order => myOrderIds.includes(order.id) && (order.isCheckedOut || order.paymentStatus === 'Paid'));
    if (completedLocalOrders.length > 0) {
      try {
        const stored = JSON.parse(localStorage.getItem('my_orders') || '[]');
        const updated = stored.filter((id: string) => !completedLocalOrders.some(co => co.id === id));
        localStorage.setItem('my_orders', JSON.stringify(updated));
        // Dispatch event for other listeners
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error('Error cleaning up completed orders from localStorage:', err);
      }
    }
  }, [orders, myOrderIds]);

  // Set default selected order if none selected
  React.useEffect(() => {
    if (myOrders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(myOrders[0].id);
    }
  }, [myOrders, selectedOrderId]);

  const activeOrder = myOrders.find(o => o.id === selectedOrderId);

  // Sync default customer name for reviews
  React.useEffect(() => {
    if (activeOrder) {
      setReviewName(activeOrder.customerName || '');
    }
  }, [activeOrder]);

  // Order stage progression configuration
  const stages: { stage: OrderStage; label: string; desc: string }[] = [
    { stage: 'Received', label: 'Received', desc: 'Order received by kitchen' },
    { stage: 'Preparing', label: 'Prepped', desc: 'Prepping fresh ingredients' },
    { stage: 'Cooking', label: 'Baking', desc: 'Wood-fired brick oven' },
    { stage: 'Ready', label: 'Ready', desc: 'Freshly packed & ready' },
    { stage: 'OutForDelivery', label: 'En Route', desc: 'On its way to you' },
    { stage: 'Delivered', label: 'Delivered', desc: 'Enjoy your delicious feast!' }
  ];

  const getStageIndex = (currentStage: OrderStage): number => {
    if (currentStage === 'Cancelled') return -1;
    return stages.findIndex(s => s.stage === currentStage);
  };

  const handleReorder = (order: Order) => {
    order.orderedItems.forEach(item => {
      // Find matching catalog product
      const product = products.find(p => p.id === item.productId || p.name === item.name);
      onAddToCart({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.size || 'Regular',
        selectedToppings: item.addOns || [],
        specialInstructions: item.notes || '',
        image: product?.image || '/src/assets/three_burgers_1782491679101.png'
      });
    });
    onOpenCart();
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  if (myOrders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center relative z-10" id="orders-empty-state">
        <div className="bg-black/45 border border-white/10 backdrop-blur-md rounded-3xl p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-tomato-red via-tomato-orange to-tomato-red" />
          
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-tomato-orange/10 text-tomato-orange mx-auto mb-6">
            <Receipt className="h-10 w-10 animate-pulse" />
          </div>
          
          <h2 className="font-display text-3xl text-white tracking-wide mb-3">No Orders Found</h2>
          <p className="font-outfit text-sm text-stone-400 max-w-md mx-auto mb-8 leading-relaxed">
            You haven't placed any gourmet orders yet. Check out our signature wood-fired pizzas and stacked double burgers!
          </p>

          <button
            onClick={onNavigateToMenu}
            className="rounded-full bg-tomato-orange hover:bg-tomato-orange/90 text-tomato-dark font-outfit text-sm font-extrabold uppercase tracking-widest px-8 py-3.5 transition-all shadow-xl hover:scale-[1.02] cursor-pointer inline-flex items-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Explore Flavor Furies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10" id="my-orders-view">
      
      {/* Page Header */}
      <div className="mb-10 text-center md:text-left">
        <span className="font-outfit text-tomato-orange font-bold uppercase tracking-widest text-xs">Live Tracker & Receipts</span>
        <h1 className="font-display text-4xl sm:text-5xl text-white mt-1">
          My <span className="text-tomato-orange">Orders & Bill</span>
        </h1>
        <p className="font-outfit text-sm text-stone-400 mt-2 max-w-xl">
          Track your real-time cooking stages, view itemized digital bills, and download official invoices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column - History List */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-display text-lg text-white mb-2 tracking-wide px-1 flex items-center gap-2">
            <Clock className="h-4 w-4 text-tomato-orange" />
            Order History ({myOrders.length})
          </h3>
          <div className="space-y-3.5 max-h-[640px] overflow-y-auto pr-2 custom-scrollbar">
            {myOrders.map((order) => {
              const isActive = order.id === selectedOrderId;
              const isOrderCancelled = order.orderStage === 'Cancelled';
              const itemsCount = order.orderedItems.reduce((acc, item) => acc + item.quantity, 0);
              
              return (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`w-full text-left rounded-2xl p-5 border backdrop-blur-md transition-all duration-300 relative group cursor-pointer ${
                    isActive
                      ? 'bg-[#2d1111]/90 border-tomato-orange/60 shadow-xl shadow-tomato-orange/5'
                      : 'bg-black/35 border-white/10 hover:border-white/20 hover:bg-black/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-stone-400 group-hover:text-white transition-colors">
                      {order.id}
                    </span>
                    <span className="font-outfit text-[11px] text-stone-500">
                      {new Date(order.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-sm text-white font-semibold">
                        {order.deliveryType} {order.tableNumber ? `(${order.tableNumber})` : ''}
                      </p>
                      <p className="font-outfit text-xs text-stone-400 mt-1">
                        {itemsCount} {itemsCount === 1 ? 'item' : 'items'} •{' '}
                        <span className="font-mono text-tomato-orange font-bold">
                          ${order.totalPrice.toFixed(2)}
                        </span>
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isOrderCancelled
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : order.orderStage === 'Delivered'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-tomato-orange/10 text-tomato-orange border border-tomato-orange/20 animate-pulse'
                      }`}>
                        {order.orderStage}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column - Detailed Tracker & Receipt Bill */}
        <div className="lg:col-span-7">
          {activeOrder ? (
            <div className="bg-[#1e0a0a]/90 border border-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-tomato-orange via-tomato-red to-tomato-orange" />
              
              {/* Receipt Header Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-2 w-2 rounded-full bg-tomato-orange animate-ping" />
                    <h2 className="font-mono text-lg font-bold text-white tracking-wider">{activeOrder.id}</h2>
                  </div>
                  <p className="font-outfit text-xs text-stone-400 mt-1">
                    Placed on {new Date(activeOrder.timestamp).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handlePrint}
                    className="rounded-full bg-tomato-orange hover:bg-tomato-orange/90 text-tomato-dark px-4 py-2 font-outfit text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-tomato-orange/10"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print Bill
                  </button>
                </div>
              </div>





              {/* ITEMIZED RECEIPT / BILL DETAILS */}
              <div>
                <h3 className="font-display text-sm text-stone-200 tracking-wide mb-4 flex items-center gap-1.5">
                  <Receipt className="h-4 w-4 text-tomato-orange" />
                  Itemized Bill Breakdown
                </h3>

                {/* Items loop */}
                <div className="space-y-3.5 bg-black/10 rounded-2xl p-4 border border-white/5 mb-6">
                  {activeOrder.orderedItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-black text-tomato-orange bg-tomato-orange/10 h-5 w-5 flex items-center justify-center rounded">
                            {item.quantity}x
                          </span>
                          <span className="font-display text-sm text-white font-medium">{item.name}</span>
                        </div>
                        {/* Customization Details */}
                        <div className="text-[10px] text-stone-400 font-outfit mt-1 ml-6 space-y-0.5">
                          {item.size && (
                            <div>Size: <span className="text-stone-300 font-semibold">{item.size}</span></div>
                          )}
                          {item.addOns && item.addOns.length > 0 && (
                            <div>Add-ons: <span className="text-tomato-orange/95 font-medium">{item.addOns.join(', ')}</span></div>
                          )}
                          {item.notes && (
                            <div className="italic text-stone-500">"{item.notes}"</div>
                          )}
                        </div>
                      </div>
                      <span className="font-mono text-sm text-stone-200 font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing totals list */}
                <div className="bg-black/25 rounded-2xl p-5 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between font-outfit text-sm text-stone-400">
                    <span>Subtotal</span>
                    <span className="font-mono text-stone-200">${activeOrder.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {activeOrder.discount > 0 && (
                    <div className="flex items-center justify-between font-outfit text-sm text-emerald-400">
                      <span>Promo Discount Applied</span>
                      <span className="font-mono font-bold">-${activeOrder.discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between font-outfit text-sm text-stone-400">
                    <span>VAT / Taxes (8%)</span>
                    <span className="font-mono text-stone-200">${(activeOrder.subtotal * 0.08).toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between font-outfit text-sm text-stone-400">
                    <span>Delivery & Service Fee</span>
                    <span className="font-mono text-stone-200">
                      {activeOrder.deliveryType === 'Delivery' && activeOrder.subtotal < 20 ? '$2.99' : 'FREE'}
                    </span>
                  </div>

                  <hr className="border-white/5 my-2" />

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-display text-base text-white font-bold block">Bill Total</span>
                      <span className="font-outfit text-[10px] text-stone-400 block mt-0.5">VAT, service fee & taxes included</span>
                    </div>
                    <span className="text-tomato-orange font-mono text-2xl font-black">
                      ${activeOrder.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Cash Payment & Checkout Control Panel */}
                <div className="mt-6 border-t border-white/5 pt-6">
                  {activeOrder.paymentStatus === 'Paid' || activeOrder.isCheckedOut ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-3"
                    >
                      <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-display text-base font-bold text-white">Checkout Completed!</h4>
                        <p className="font-outfit text-xs text-stone-400 mt-1 max-w-md mx-auto">
                          Thank you for dining with us! Your cash payment has been processed and your checkout is complete. We hope you enjoyed your gourmet experience!
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="bg-black/35 rounded-2xl p-5 border border-white/5 space-y-4">
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-tomato-orange" />
                        <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">Cash Pay & Checkout Portal</h4>
                      </div>

                      {/* Scenario A: Customer hasn't requested cash payment yet */}
                      {!activeOrder.cashCheckoutRequested && !activeOrder.cashCheckoutActive && (
                        <div className="space-y-3">
                          <p className="font-outfit text-xs text-stone-400 leading-relaxed">
                            Are you paying by cash? Click the button below to notify the admin/waitstaff. They will collect your payment and activate your checkout button.
                          </p>
                          <button
                            onClick={async () => {
                              try {
                                await updateOrder(activeOrder.id, { cashCheckoutRequested: true });
                              } catch (err) {
                                console.error('Failed to request cash checkout:', err);
                              }
                            }}
                            className="w-full rounded-xl bg-[#2a1414] hover:bg-[#3d1a1a] border border-tomato-orange/30 text-tomato-orange py-2.5 font-outfit text-xs font-bold uppercase tracking-widest transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                          >
                            <Coins className="h-4 w-4" />
                            Request Cash Payment
                          </button>
                        </div>
                      )}

                      {/* Scenario B: Cash pay requested but not yet activated by Admin */}
                      {activeOrder.cashCheckoutRequested && !activeOrder.cashCheckoutActive && (
                        <div className="space-y-4">
                          <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3.5 flex items-start gap-2.5 text-left">
                            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-outfit text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Awaiting Cash Payment</span>
                              <p className="font-outfit text-[11px] text-stone-300 mt-0.5 leading-normal">
                                Cash payment request of <span className="font-mono font-bold text-white">${activeOrder.totalPrice.toFixed(2)}</span> has been sent. Please pay at the counter or wait for our staff to collect your cash.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between px-2 text-stone-400 font-outfit text-[11px]">
                            <span className="flex items-center gap-1.5 font-semibold">
                              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                              Awaiting staff confirmation...
                            </span>
                            <button
                              onClick={async () => {
                                try {
                                  await updateOrder(activeOrder.id, { cashCheckoutRequested: false });
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="text-[10px] text-stone-500 hover:text-white underline cursor-pointer"
                            >
                              Cancel Request
                            </button>
                          </div>

                          {/* Disabled checkout button */}
                          <button
                            disabled
                            className="w-full rounded-xl bg-stone-900 border border-stone-800 text-stone-500 py-3 font-outfit text-xs font-bold uppercase tracking-widest transition-all cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <Lock className="h-3.5 w-3.5 text-stone-600" />
                            Check Out (Locked)
                          </button>
                          <p className="font-outfit text-[10px] text-stone-500 text-center italic mt-1">
                            This button will become active as soon as the admin verifies your cash payment.
                          </p>
                        </div>
                      )}

                      {/* Scenario C: Admin has activated the checkout button */}
                      {activeOrder.cashCheckoutActive && (
                        <div className="space-y-4">
                          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3.5 flex items-start gap-2.5 text-left">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-outfit text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Payment Verified & Activated</span>
                              <p className="font-outfit text-[11px] text-stone-300 mt-0.5 leading-normal">
                                Your cash payment has been confirmed by our staff! You are now authorized to complete your checkout.
                              </p>
                            </div>
                          </div>

                          {/* Active / Enabled pulsating checkout button */}
                          <motion.button
                            onClick={async () => {
                              try {
                                await updateOrder(activeOrder.id, {
                                  paymentStatus: 'Paid',
                                  isCheckedOut: true,
                                  orderStage: 'Delivered' // Automatically releases Dine-in tables
                                });
                              } catch (err) {
                                console.error('Failed to finalize checkout:', err);
                              }
                            }}
                            animate={{ scale: [1, 1.015, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="w-full rounded-xl bg-gradient-to-r from-tomato-orange to-tomato-red text-black py-3 font-outfit text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-tomato-orange/20 hover:from-white hover:to-white hover:scale-[1.02]"
                          >
                            <Unlock className="h-4 w-4 stroke-[3]" />
                            Finalize Check Out
                          </motion.button>
                          <p className="font-outfit text-[10px] text-emerald-400 text-center font-bold animate-pulse">
                            Click to complete your transaction and receive your receipt.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Review Section when Checkout is Activated / Complete */}
                {(activeOrder.cashCheckoutActive || activeOrder.paymentStatus === 'Paid' || activeOrder.isCheckedOut) && (
                  <div className="mt-6 border-t border-white/5 pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-tomato-orange" />
                        <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">Gourmet Feedback Center</h4>
                      </div>
                      <span className="text-[10px] text-stone-400 bg-white/5 px-2.5 py-1 rounded-full font-outfit uppercase tracking-widest font-semibold border border-white/5">
                        Share your experience
                      </span>
                    </div>

                    <p className="font-outfit text-xs text-stone-400">
                      We would love to hear your thoughts on the dishes you ordered! Click any item below to share your review with our culinary team.
                    </p>

                    {/* Ordered Items List to Review */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {activeOrder.orderedItems.map((item, idx) => {
                        // Find corresponding product to get its image
                        const correspondingProduct = products.find(p => p.id === item.productId || p.name.toLowerCase() === item.name.toLowerCase());
                        const imageUrl = correspondingProduct?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=120';
                        const productId = correspondingProduct?.id || item.productId || `prod-${idx}`;
                        const isReviewed = reviewedProductIds.includes(productId);
                        const isCurrentlyReviewing = reviewingItemId === productId;

                        return (
                          <div key={idx} className="flex flex-col">
                            <div 
                              onClick={() => {
                                if (isReviewed) return;
                                if (isCurrentlyReviewing) {
                                  setReviewingItemId(null);
                                } else {
                                  setReviewingItemId(productId);
                                  setReviewRating(5);
                                  setReviewTitle('');
                                  setReviewComment('');
                                }
                              }}
                              className={`bg-[#1c0e0e] border rounded-2xl p-3 flex items-center gap-3 transition-all ${
                                isReviewed 
                                  ? 'border-emerald-500/20 opacity-75 cursor-default' 
                                  : isCurrentlyReviewing 
                                    ? 'border-tomato-orange bg-[#241212] ring-1 ring-tomato-orange/30 cursor-pointer' 
                                    : 'border-white/5 hover:border-white/15 cursor-pointer hover:bg-[#201010]'
                              }`}
                            >
                              <img 
                                src={imageUrl} 
                                alt={item.name} 
                                className="h-11 w-11 rounded-xl object-cover border border-white/5"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0 text-left">
                                <span className="font-outfit text-[9px] uppercase tracking-wider text-stone-500 block">
                                  {correspondingProduct?.category || 'Dish'}
                                </span>
                                <h5 className="font-display text-xs font-bold text-white truncate">{item.name}</h5>
                                {isReviewed ? (
                                  <span className="font-outfit text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                                    <CheckCircle2 className="h-3 w-3" /> Reviewed
                                  </span>
                                ) : (
                                  <span className="font-outfit text-[10px] text-tomato-orange/80 hover:text-tomato-orange font-semibold flex items-center gap-1 mt-0.5">
                                    <Star className="h-3 w-3 fill-tomato-orange/30 text-tomato-orange" /> Rate this item
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Drop-down Review Form */}
                            <AnimatePresence>
                              {isCurrentlyReviewing && !isReviewed && (
                                <motion.form
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.25 }}
                                  onSubmit={(e) => handleReviewSubmit(productId, e)}
                                  className="bg-black/40 border-x border-b border-tomato-orange/20 rounded-b-2xl -mt-2 p-4 text-left space-y-3 overflow-hidden"
                                >
                                  {/* Star selection */}
                                  <div className="flex items-center justify-between">
                                    <span className="font-outfit text-[11px] text-stone-300 font-semibold uppercase tracking-wider">Your Rating</span>
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          type="button"
                                          onClick={() => setReviewRating(star)}
                                          onMouseEnter={() => setReviewHoverRating(star)}
                                          onMouseLeave={() => setReviewHoverRating(null)}
                                          className="p-0.5 transition-transform hover:scale-125 focus:outline-none cursor-pointer animate-none bg-transparent border-none outline-none"
                                        >
                                          <Star
                                            className={`h-5 w-5 ${
                                              star <= (reviewHoverRating ?? reviewRating)
                                                ? 'text-amber-400 fill-amber-400'
                                                : 'text-stone-600'
                                            }`}
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Reviewer Name */}
                                  <div className="flex flex-col gap-1">
                                    <label className="font-outfit text-[11px] text-stone-300 font-semibold uppercase tracking-wider">Reviewer Name</label>
                                    <input
                                      type="text"
                                      required
                                      value={reviewName}
                                      onChange={(e) => setReviewName(e.target.value)}
                                      placeholder="e.g. Jean Dupont"
                                      className="w-full rounded-xl bg-[#2a1414] border border-white/10 px-3 py-2 font-outfit text-xs text-white focus:outline-none focus:border-tomato-orange transition-colors"
                                    />
                                  </div>

                                  {/* Review Title */}
                                  <div className="flex flex-col gap-1">
                                    <label className="font-outfit text-[11px] text-stone-300 font-semibold uppercase tracking-wider">Review Headline</label>
                                    <input
                                      type="text"
                                      required
                                      value={reviewTitle}
                                      onChange={(e) => setReviewTitle(e.target.value)}
                                      placeholder="e.g. Best pizza ever!"
                                      className="w-full rounded-xl bg-[#2a1414] border border-white/10 px-3 py-2 font-outfit text-xs text-white focus:outline-none focus:border-tomato-orange transition-colors"
                                    />
                                  </div>

                                  {/* Review Comment */}
                                  <div className="flex flex-col gap-1">
                                    <label className="font-outfit text-[11px] text-stone-300 font-semibold uppercase tracking-wider">Detailed thoughts</label>
                                    <textarea
                                      required
                                      rows={3}
                                      value={reviewComment}
                                      onChange={(e) => setReviewComment(e.target.value)}
                                      placeholder="Tell us about the flavour, texture, or presentation..."
                                      className="w-full rounded-xl bg-[#2a1414] border border-white/10 px-3 py-2 font-outfit text-xs text-white focus:outline-none focus:border-tomato-orange transition-colors resize-none"
                                    />
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-2 pt-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setReviewingItemId(null)}
                                      className="flex-1 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 py-2 font-outfit text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="submit"
                                      className="flex-1 rounded-xl bg-tomato-orange hover:bg-tomato-orange/90 text-black py-2 font-outfit text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-tomato-orange/15"
                                    >
                                      Submit Review
                                    </button>
                                  </div>
                                </motion.form>
                              )}
                            </AnimatePresence>

                            {/* Success Toast / Note per item */}
                            {isCurrentlyReviewing && isReviewSuccess && reviewingItemId === productId && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-2.5 mt-2 text-center text-xs text-emerald-400 font-medium font-outfit flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Review submitted! Thank you!
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
              
            </div>
          ) : (
            <div className="h-[500px] flex items-center justify-center text-center bg-black/20 border border-white/10 backdrop-blur-md rounded-3xl p-6">
              <p className="font-outfit text-stone-400">Select an order from the list to view live tracking status and bill receipt.</p>
            </div>
          )}
        </div>

      </div>

      {/* DETAILED PRINT INVOICE MODAL BACKDROP (STYLING DESIGNED SPECIFICALLY FOR PRINT MODE) */}
      <AnimatePresence>
        {isPrintModalOpen && activeOrder && (
          <div className="fixed inset-0 z-[300] bg-black flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white text-black rounded-2xl max-w-lg w-full p-8 font-sans shadow-2xl relative">
              <button 
                onClick={() => setIsPrintModalOpen(false)}
                className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200 cursor-pointer print:hidden"
              >
                <XCloseIcon className="h-5 w-5" />
              </button>

              <div className="text-center mb-6">
                <h1 className="font-serif text-3xl font-extrabold tracking-tight">TOMATO GODOTTY</h1>
                <p className="text-xs text-stone-500 font-mono mt-1">452 Gourmet Blvd, Cloud Run • Est. 2026</p>
                <div className="border-b-2 border-dashed border-stone-300 my-4" />
                <h2 className="text-sm font-bold tracking-widest uppercase">OFFICIAL FISCAL RECEIPT</h2>
                <p className="text-xs text-stone-500 font-mono mt-0.5">Order ID: {activeOrder.id}</p>
              </div>

              <div className="space-y-1.5 text-xs font-mono mb-6">
                <div className="flex justify-between">
                  <span>DATE/TIME:</span>
                  <span>{new Date(activeOrder.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>CUSTOMER:</span>
                  <span>{activeOrder.customerName.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>CONTACT:</span>
                  <span>{activeOrder.contactNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>SERVICE:</span>
                  <span>{activeOrder.deliveryType.toUpperCase()} {activeOrder.tableNumber ? `(${activeOrder.tableNumber})` : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>PAYMENT STATUS:</span>
                  <span>{activeOrder.paymentStatus.toUpperCase()}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-stone-300 my-4" />

              {/* Itemized list */}
              <div className="space-y-3 mb-6">
                {activeOrder.orderedItems.map((item, idx) => (
                  <div key={idx} className="text-xs font-mono">
                    <div className="flex justify-between font-bold">
                      <span>{item.quantity}x {item.name.toUpperCase()}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    {item.size && (
                      <div className="text-stone-500 text-[10px] pl-4">• SIZE: {item.size.toUpperCase()}</div>
                    )}
                    {item.addOns && item.addOns.length > 0 && (
                      <div className="text-stone-500 text-[10px] pl-4">• ADDONS: {item.addOns.join(', ').toUpperCase()}</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-b border-dashed border-stone-300 my-4" />

              {/* Pricing totals */}
              <div className="space-y-1.5 text-xs font-mono mb-6">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>${activeOrder.subtotal.toFixed(2)}</span>
                </div>
                {activeOrder.discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>DISCOUNT:</span>
                    <span>-${activeOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>TAX/VAT (8%):</span>
                  <span>${(activeOrder.subtotal * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>DELIVERY FEE:</span>
                  <span>{activeOrder.deliveryType === 'Delivery' && activeOrder.subtotal < 20 ? '$2.99' : 'FREE'}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold border-t border-dashed border-stone-300 pt-2 mt-2">
                  <span>TOTAL AMOUNT:</span>
                  <span>${activeOrder.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center text-[10px] font-mono text-stone-500 mt-8">
                <p>THANK YOU FOR DINING WITH TOMATO GODOTTY!</p>
                <p className="mt-1">YOUR SATISFACTION IS OUR ABSOLUTE PRIORITY.</p>
                <p className="mt-4 text-stone-400 print:hidden">Press ESC or click close to return</p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Inline helper close icon to prevent extra imports
function XCloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
