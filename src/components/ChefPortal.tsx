import React, { useState, useEffect, useRef } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Order, OrderStage } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Clock, Play, Check, XCircle, AlertCircle, ShoppingBag, Utensils, Truck, CheckCircle2 } from 'lucide-react';

interface ChefPortalProps {
  onExit?: () => void;
}

interface KitchenNotification {
  id: string;
  orderId: string;
  customerName: string;
  itemsCount: number;
  total: number;
  timestamp: string;
}

export default function ChefPortal({ onExit }: ChefPortalProps) {
  const { orders, updateOrder } = useRestaurant();
  const [activeTab, setActiveTab] = useState<'Pending' | 'Served'>('Pending');
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [notifications, setNotifications] = useState<KitchenNotification[]>([]);
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);

  // Define pending and served lists early so they can be referenced
  const pendingOrders = orders.filter(o => o.orderStage !== 'Delivered' && o.orderStage !== 'Cancelled');
  const servedOrders = orders.filter(o => o.orderStage === 'Delivered');

  // Keep track of known pending order IDs to play chime for brand new ones in the pending section
  const knownPendingIdsRef = useRef<string[]>([]);
  const isFirstLoadRef = useRef(true);

  const playChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (ctx.state === 'suspended') {
        setIsAudioBlocked(true);
      } else {
        setIsAudioBlocked(false);
      }
      
      // Chime synthesis: a sweet arpeggio (C5 -> E5 -> G5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      osc1.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.25); // G5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(261.63, ctx.currentTime); // C4 support
      osc2.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.3);

      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.7);
      osc2.stop(ctx.currentTime + 0.7);
    } catch (err) {
      console.warn("Chef audio chime initialization deferred until user interaction.", err);
      setIsAudioBlocked(true);
    }
  };

  useEffect(() => {
    const currentPendingIds = pendingOrders.map(o => o.id);

    if (isFirstLoadRef.current) {
      // Seed initial pending IDs on load without sounding
      knownPendingIdsRef.current = currentPendingIds;
      isFirstLoadRef.current = false;
      return;
    }

    // Check if there are any new orders that appeared in the pending list
    const newPendingOrders = pendingOrders.filter(o => !knownPendingIdsRef.current.includes(o.id));
    if (newPendingOrders.length > 0) {
      playChime();
      setIsPlayingSound(true);
      setTimeout(() => setIsPlayingSound(false), 2000);

      // Create new visual notifications
      const newNotifications: KitchenNotification[] = newPendingOrders.map(o => ({
        id: `${o.id}-${Date.now()}`,
        orderId: o.id,
        customerName: o.customerName || 'Guest',
        itemsCount: o.orderedItems.reduce((sum, item) => sum + item.quantity, 0),
        total: o.totalPrice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }));

      setNotifications(prev => [...newNotifications, ...prev].slice(0, 5));
    }

    // Keep memory updated
    knownPendingIdsRef.current = currentPendingIds;
  }, [orders]);

  // Click handler to auto-unlock audio context if it gets suspended or blocked
  useEffect(() => {
    const unlockAudio = () => {
      if (isAudioBlocked) {
        playChime();
        setIsAudioBlocked(false);
      }
    };
    window.addEventListener('click', unlockAudio);
    return () => window.removeEventListener('click', unlockAudio);
  }, [isAudioBlocked]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getStageColor = (stage: OrderStage) => {
    switch (stage) {
      case 'Delivered': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Cancelled': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    }
  };

  const getStageIcon = (stage: OrderStage) => {
    switch (stage) {
      case 'Delivered': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default: return <Clock className="w-4 h-4 text-amber-400" />;
    }
  };

  const markAsServed = async (orderId: string) => {
    await updateOrder(orderId, { orderStage: 'Delivered' });
  };

  const markAsPending = async (orderId: string) => {
    await updateOrder(orderId, { orderStage: 'Received' });
  };

  const cancelOrder = async (orderId: string) => {
    if (window.confirm("Are you sure you want to cancel preparation for this ticket?")) {
      await updateOrder(orderId, { orderStage: 'Cancelled' });
    }
  };

  return (
    <div className="min-h-screen bg-[#121214] text-stone-100 p-4 sm:p-6 lg:p-8 relative">
      {/* Floating Notifications Area */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none select-none max-w-full">
        <AnimatePresence mode="popLayout">
          {notifications.map(notification => (
            <NotificationToast
              key={notification.id}
              notification={notification}
              onDismiss={() => dismissNotification(notification.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Decorative ambient back glow */}
      <div className="absolute top-10 left-1/4 w-[350px] h-[350px] bg-emerald-950/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-tomato-red/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Interactive Browser Autoplay Warning Banner */}
      {isAudioBlocked && (
        <div 
          onClick={() => {
            playChime();
            setIsAudioBlocked(false);
          }}
          className="relative z-20 max-w-7xl mx-auto mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-amber-500/20 transition-all select-none animate-pulse"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🔔</span>
            <div>
              <h4 className="font-outfit text-xs font-bold text-amber-400 uppercase tracking-wider">
                Audio notifications are muted by your browser
              </h4>
              <p className="font-outfit text-[11px] text-stone-300 mt-0.5">
                Click anywhere on this screen or click the button to enable live chime alerts when new orders appear on the pending list.
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

      {/* Header Panel */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 border-b border-stone-800 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
              Chef Kitchen Display System (KDS)
            </h1>
          </div>
          <p className="font-outfit text-xs text-stone-400 mt-1 uppercase tracking-widest font-semibold">
            Real-time culinary order pipeline & prep dispatch desk
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 bg-stone-900/60 p-2.5 rounded-full border border-stone-800">
          <button 
            onClick={playChime}
            className="px-4 py-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-outfit text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
          >
            Test Chime Sound 🔔
          </button>
          {isPlayingSound && (
            <span className="text-[11px] font-bold text-emerald-400 animate-bounce pr-2">
              Chime Triggered!
            </span>
          )}
          {onExit && (
            <button
              onClick={onExit}
              className="px-4 py-1.5 rounded-full bg-tomato-orange/10 hover:bg-tomato-orange border border-tomato-orange/30 text-tomato-orange hover:text-black font-outfit text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
            >
              ← Exit Kitchen
            </button>
          )}
        </div>
      </div>

      {/* Mobile view tab bar switcher */}
      <div className="max-w-7xl mx-auto relative z-10 lg:hidden mb-6 flex gap-2 p-1.5 bg-stone-950 rounded-2xl border border-stone-850">
        <button
          onClick={() => setActiveTab('Pending')}
          className={`flex-1 py-3 rounded-xl font-outfit text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === 'Pending' 
              ? 'bg-amber-500 text-black font-black' 
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Pending ({pendingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('Served')}
          className={`flex-1 py-3 rounded-xl font-outfit text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === 'Served' 
              ? 'bg-emerald-500 text-black font-black' 
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Served ({servedOrders.length})
        </button>
      </div>

      {/* Grid columns or Tab selectors */}
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Columned Board Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUMN 1: PENDING - Shown on Desktop OR when Active Tab is Pending on Mobile */}
          <div className={`bg-stone-950/40 p-5 rounded-3xl border border-stone-800/80 flex flex-col h-[75vh] ${
            activeTab === 'Pending' ? 'flex' : 'hidden lg:flex'
          }`}>
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-stone-800/60 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <h3 className="font-display font-black text-sm text-stone-300 uppercase tracking-widest">
                  Pending Orders ({pendingOrders.length})
                </h3>
              </div>
              <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Awaiting Prep
              </span>
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-stone-800">
              <AnimatePresence mode="popLayout">
                {pendingOrders.length === 0 ? (
                  <EmptyQueueMessage message="No pending orders" />
                ) : (
                  pendingOrders.map(order => (
                    <KitchenTicket 
                      key={order.id} 
                      order={order} 
                      onAdvance={() => markAsServed(order.id)} 
                      onCancel={() => cancelOrder(order.id)} 
                      actionLabel="Mark Served"
                      actionColor="bg-amber-500 hover:bg-amber-600 text-black font-black shadow-lg shadow-amber-500/10"
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* COLUMN 2: SERVED - Shown on Desktop OR when Active Tab is Served on Mobile */}
          <div className={`bg-stone-950/40 p-5 rounded-3xl border border-stone-800/80 flex flex-col h-[75vh] ${
            activeTab === 'Served' ? 'flex' : 'hidden lg:flex'
          }`}>
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-stone-800/60 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-display font-black text-sm text-stone-300 uppercase tracking-widest">
                  Served Orders ({servedOrders.length})
                </h3>
              </div>
              <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Completed
              </span>
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              <AnimatePresence mode="popLayout">
                {servedOrders.length === 0 ? (
                  <EmptyQueueMessage message="No served orders yet" />
                ) : (
                  servedOrders.map(order => (
                    <KitchenTicket 
                      key={order.id} 
                      order={order} 
                      onAdvance={() => markAsPending(order.id)} 
                      actionLabel="Re-open Order"
                      actionColor="bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold"
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function EmptyQueueMessage({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-stone-600 border border-stone-900 border-dashed rounded-2xl h-32">
      <p className="font-outfit text-xs font-bold uppercase tracking-wider text-stone-600">{message}</p>
    </div>
  );
}

function KitchenTicket({ 
  order, 
  onAdvance, 
  onCancel, 
  actionLabel, 
  actionColor,
  isCancelledTerminal = false 
}: { 
  order: Order; 
  onAdvance?: () => void; 
  onCancel?: () => void; 
  actionLabel?: string; 
  actionColor?: string;
  isCancelledTerminal?: boolean;
  key?: string | number;
}) {
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "";
    }
  };

  const getTicketHeaderBg = () => {
    if (isCancelledTerminal) return 'bg-red-950/40 border-red-900/30 text-red-400';
    if (order.orderStage === 'Received') return 'bg-amber-950/40 border-amber-900/30 text-amber-400';
    if (order.orderStage === 'Preparing') return 'bg-blue-950/40 border-blue-900/30 text-blue-400';
    if (order.orderStage === 'Cooking') return 'bg-orange-950/40 border-orange-900/30 text-orange-400';
    return 'bg-emerald-950/40 border-emerald-900/30 text-emerald-400';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className={`rounded-2xl bg-[#19191c] border p-3.5 space-y-3.5 shadow-xl relative overflow-hidden ${
        isCancelledTerminal ? 'border-red-900/20' : 'border-stone-800'
      }`}
    >
      {/* Top Banner indicating Dine-In/Delivery */}
      <div className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest flex items-center justify-between border ${getTicketHeaderBg()}`}>
        <span>{order.deliveryType}</span>
        <span>{order.tableNumber ? order.tableNumber : 'Takeaway'}</span>
      </div>

      {/* Title block */}
      <div className="flex items-start justify-between gap-1.5 border-b border-stone-850 pb-2.5">
        <div>
          <h4 className="font-display text-[15px] font-black text-white">{order.id}</h4>
          <span className="font-outfit text-xs font-semibold text-stone-400">{order.customerName}</span>
        </div>
        <span className="font-mono text-[10px] text-stone-500 font-bold">
          {formatTime(order.timestamp)}
        </span>
      </div>

      {/* Itemization */}
      <div className="space-y-2 pb-2">
        {order.orderedItems.map((item, idx) => (
          <div key={idx} className="text-xs bg-stone-900/50 p-2 rounded-xl border border-stone-850">
            <div className="flex items-start justify-between font-bold text-stone-200">
              <span>{item.name} <span className="text-tomato-orange text-xs font-black">x{item.quantity}</span></span>
              <span className="font-mono text-[10px] text-stone-400">{item.size || 'Reg'}</span>
            </div>
            {/* Customizations chose */}
            {(item.addOns && item.addOns.length > 0) && (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.addOns.map((add, aIdx) => (
                  <span key={aIdx} className="bg-stone-800 text-stone-400 font-outfit text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border border-stone-700/50">
                    +{add}
                  </span>
                ))}
              </div>
            )}
            {item.notes && (
              <p className="font-outfit text-[10px] text-tomato-orange font-semibold italic mt-1 bg-tomato-orange/5 p-1 rounded border border-tomato-orange/10">
                " {item.notes} "
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Kitchen Action Buttons */}
      {!isCancelledTerminal && (
        <div className="flex gap-2 pt-1">
          {onCancel && (
            <button
              onClick={onCancel}
              className="w-10 h-10 rounded-xl bg-red-950/20 border border-red-900/30 hover:bg-red-950/50 text-red-400 flex items-center justify-center transition-all cursor-pointer active:scale-90"
              title="Cancel preparation (Prevent waste)"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
          {onAdvance && (
            <button
              onClick={onAdvance}
              className={`flex-grow h-10 rounded-xl flex items-center justify-center gap-1.5 font-outfit text-[11px] uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer ${actionColor}`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

function NotificationToast({ 
  notification, 
  onDismiss 
}: { 
  notification: KitchenNotification; 
  onDismiss: () => void; 
  key?: string | number;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, y: -10, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.2 } }}
      className="bg-stone-900 border border-amber-500/80 p-4 rounded-2xl shadow-[0_4px_20px_rgba(245,158,11,0.25)] flex items-start gap-3 w-80 pointer-events-auto relative overflow-hidden group"
    >
      {/* Amber alert status edge */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
      
      <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500 border border-amber-500/20 shrink-0">
        <ShoppingBag className="w-5 h-5 animate-bounce" />
      </div>

      <div className="flex-grow space-y-1 pl-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            New Ticket Received
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
        <p className="font-outfit text-[11px] text-stone-400">
          Ordered <span className="text-amber-400 font-bold">{notification.itemsCount} {notification.itemsCount === 1 ? 'item' : 'items'}</span> • Total: <span className="text-stone-200 font-bold">${notification.total.toFixed(2)}</span>
        </p>
      </div>

      <button
        onClick={onDismiss}
        className="text-stone-500 hover:text-white transition-colors cursor-pointer shrink-0"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
