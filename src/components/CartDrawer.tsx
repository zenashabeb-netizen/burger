import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Trash2, ShoppingBag, CreditCard, Sparkles, Clock, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types';
import { useRestaurant } from '../context/RestaurantContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onViewOrders?: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onViewOrders
}: CartDrawerProps) {
  const { 
    placeOrder, 
    tables,
    tableSession,
    isWiFiConnected,
    gpsDistance
  } = useRestaurant();

  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'details' | 'checking-out' | 'success'>('idle');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryType, setDeliveryType] = useState<'Dine-in' | 'Delivery' | 'Takeout'>('Dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>('');

  // Lock to table session if active
  useEffect(() => {
    if (tableSession) {
      setDeliveryType('Dine-in');
      setTableNumber(tableSession.tableName);
    }
  }, [tableSession, isOpen]);

  // Determine if device is inside premises - security verification removed
  const isInside = true;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 20 || subtotal === 0 ? 0 : 2.99;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  const handleCheckout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customerName.trim()) return;

    setCheckoutStep('checking-out');

    try {
      const orderedItems = cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.selectedSize,
        addOns: item.selectedToppings,
        notes: item.specialInstructions || ''
      }));

      const newOrder = await placeOrder({
        customerName,
        contactNumber,
        email,
        deliveryType,
        tableNumber: deliveryType === 'Dine-in' ? (tableNumber || 'Table 1') : undefined,
        orderedItems,
        subtotal,
        discount: 0,
        totalPrice: total,
        paymentStatus: 'Pending'
      });

      // Save order ID to localStorage to retrieve later on "My Orders" page
      const currentOrders = JSON.parse(localStorage.getItem('my_orders') || '[]');
      if (!currentOrders.includes(newOrder.id)) {
        localStorage.setItem('my_orders', JSON.stringify([...currentOrders, newOrder.id]));
      }
      setConfirmedOrderId(newOrder.id);

      setCheckoutStep('success');
    } catch (err) {
      console.error('Error placing order:', err);
      setCheckoutStep('idle');
    }
  };

  const resetAndClose = () => {
    onClearCart();
    setCheckoutStep('idle');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex h-full w-full max-w-md flex-col bg-[#1e0a0a] text-white shadow-2xl border-l border-white/5"
          >
            {/* Header */}
            <div className="flex h-20 items-center justify-between border-b border-white/5 px-6">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-tomato-orange" />
                <span className="font-display text-xl tracking-wide">Your Order</span>
                {cartItems.length > 0 && (
                  <span className="rounded-full bg-tomato-red px-2 py-0.5 text-xs font-bold text-white">
                    {cartItems.length}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Switcher */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {checkoutStep === 'success' ? (
                /* SUCCESS SCREEN */
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 10 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-xl shadow-emerald-500/20"
                  >
                    <CheckCircle className="h-10 w-10 text-white" />
                  </motion.div>
                  <h3 className="mt-6 font-display text-2xl tracking-wide text-white">Order Confirmed!</h3>
                  <p className="mt-2 font-outfit text-sm text-stone-300 max-w-xs leading-relaxed">
                    Our master chefs have received your order and are starting to bake it fresh right now.
                  </p>

                  <div className="mt-8 w-full rounded-2xl bg-white/5 border border-white/5 p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-left">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tomato-orange/10 text-tomato-orange">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-outfit text-[11px] font-bold text-tomato-orange uppercase tracking-wider">Estimated Delivery</p>
                        <p className="font-outfit text-sm font-semibold text-white">15 - 25 Minutes</p>
                      </div>
                    </div>
                    <hr className="border-white/5" />
                    <div className="flex items-center justify-between font-mono text-xs text-stone-400">
                      <span>Order ID</span>
                      <span className="text-white font-bold">{confirmedOrderId || `ORD-${Math.floor(1000 + Math.random() * 9000)}`}</span>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-3 w-full">
                    {onViewOrders && (
                      <button
                        onClick={() => {
                          onClearCart();
                          setCheckoutStep('idle');
                          onViewOrders();
                          onClose();
                        }}
                        className="w-full rounded-full bg-tomato-orange py-3.5 font-outfit text-sm font-black tracking-wider text-tomato-dark uppercase shadow-lg shadow-tomato-orange/15 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                      >
                        Track Order & View Bill
                      </button>
                    )}
                    <button
                      onClick={resetAndClose}
                      className="w-full rounded-full border border-white/10 bg-white/5 hover:bg-white/10 py-3 font-outfit text-sm font-bold tracking-wider text-white uppercase transition-all cursor-pointer"
                    >
                      Order More Delights
                    </button>
                  </div>
                </div>
              ) : checkoutStep === 'checking-out' ? (
                /* LOADING SCREEN */
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tomato-orange/20 opacity-75"></span>
                    <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-tomato-dark border-2 border-tomato-orange">
                      <CreditCard className="h-5 w-5 text-tomato-orange animate-pulse" />
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-xl tracking-wide">Processing Secure Payment...</h3>
                  <p className="mt-2 font-outfit text-xs text-stone-400">
                    Encrypting transaction. Please do not close or refresh this drawer.
                  </p>
                </div>
              ) : checkoutStep === 'details' ? (
                /* DETAILS FORM SCREEN */
                <form onSubmit={handleCheckout} className="flex flex-col gap-4 text-left">
                  <h3 className="font-display text-lg tracking-wide text-white border-b border-white/5 pb-2 mb-2">Delivery Details</h3>
                  
                  <div className="flex flex-col gap-1">
                    <label className="font-outfit text-[11px] text-stone-300 font-semibold uppercase tracking-wider">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 font-outfit text-sm text-white placeholder-stone-500 focus:outline-none focus:border-tomato-orange transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-outfit text-[11px] text-stone-300 font-semibold uppercase tracking-wider">Contact Number *</label>
                    <input
                      type="tel"
                      required
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="e.g. +1 555-0199"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 font-outfit text-sm text-white placeholder-stone-500 focus:outline-none focus:border-tomato-orange transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-outfit text-[11px] text-stone-300 font-semibold uppercase tracking-wider">Email (Optional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 font-outfit text-sm text-white placeholder-stone-500 focus:outline-none focus:border-tomato-orange transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-outfit text-[11px] text-stone-300 font-semibold uppercase tracking-wider">Delivery Type</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {(['Dine-in', 'Delivery', 'Takeout'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            if (tableSession) return; // Locked to dine-in
                            setDeliveryType(type);
                          }}
                          disabled={tableSession && type !== 'Dine-in'}
                          className={`py-2 rounded-xl border font-outfit text-[10px] font-bold transition-all uppercase tracking-wider ${
                            deliveryType === type
                              ? 'bg-tomato-orange text-tomato-dark border-tomato-orange font-black'
                              : 'bg-white/5 text-stone-300 border-white/10 hover:border-white/20'
                          } ${tableSession && type !== 'Dine-in' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {deliveryType === 'Dine-in' ? (
                    <div className="flex flex-col gap-1">
                      <label className="font-outfit text-[11px] text-stone-300 font-semibold uppercase tracking-wider">Select Table *</label>
                      {tableSession ? (
                        <div className="w-full rounded-xl bg-tomato-orange/10 border border-tomato-orange/30 px-4 py-2.5 font-outfit text-sm text-tomato-orange font-bold flex items-center justify-between">
                          <span className="flex items-center gap-1.5">📍 Table Locked: {tableSession.tableName}</span>
                          <span className="text-[9px] uppercase font-black tracking-widest bg-tomato-orange/20 px-2 py-0.5 rounded border border-tomato-orange/30">Verified QR</span>
                        </div>
                      ) : (
                        <select
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                          className="w-full rounded-xl bg-[#2a1414] border border-white/10 px-4 py-2.5 font-outfit text-sm text-white focus:outline-none focus:border-tomato-orange transition-colors cursor-pointer"
                        >
                          <option value="">Choose a Table</option>
                          {tables && tables.length > 0 ? (
                            tables.map((t) => (
                              <option key={t.id} value={t.name}>
                                {t.name} ({t.areaLocation}) - {t.tableStatus}
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="Table 1">Table 1 (VIP)</option>
                              <option value="Table 2">Table 2 (Window)</option>
                              <option value="Table 3">Table 3 (Standard)</option>
                            </>
                          )}
                        </select>
                      )}
                    </div>
                  ) : deliveryType === 'Delivery' ? (
                    <div className="flex flex-col gap-1">
                      <label className="font-outfit text-[11px] text-stone-300 font-semibold uppercase tracking-wider">Delivery Address *</label>
                      <textarea
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter full home address"
                        rows={2}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 font-outfit text-sm text-white placeholder-stone-500 focus:outline-none focus:border-tomato-orange transition-colors resize-none"
                      />
                    </div>
                  ) : null}

                  {deliveryType === 'Dine-in' && tableSession && !isInside && (
                    <div className="bg-tomato-red/10 border border-tomato-red/30 p-3 rounded-xl flex items-start gap-2.5 text-tomato-orange mt-2">
                      <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-outfit text-[10px] font-black uppercase tracking-widest">Premise Violation</p>
                        <p className="text-[10px] text-stone-300 leading-normal">
                          Ordering is only available while you are inside the restaurant. Check Wi-Fi / GPS distance simulation settings.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('idle')}
                      className="flex-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 py-3 font-outfit text-xs font-bold tracking-wider text-white uppercase transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={deliveryType === 'Dine-in' && tableSession && !isInside}
                      className={`flex-1 rounded-full py-3 font-outfit text-xs font-black tracking-wider uppercase shadow-lg transition-all ${
                        (deliveryType === 'Dine-in' && tableSession && !isInside)
                          ? 'bg-stone-800 text-stone-500 cursor-not-allowed shadow-none border border-white/5'
                          : 'bg-tomato-orange text-tomato-dark hover:bg-tomato-orange/95 shadow-tomato-orange/15 cursor-pointer'
                      }`}
                    >
                      {(deliveryType === 'Dine-in' && tableSession && !isInside) ? 'Locked (Outside)' : 'Place Order'}
                    </button>
                  </div>
                </form>
              ) : cartItems.length === 0 ? (
                /* EMPTY STATE */
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-stone-500 mb-4">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <h3 className="font-display text-lg text-white">Your Cart is Empty</h3>
                  <p className="mt-2 font-outfit text-xs text-stone-400 max-w-[240px] leading-relaxed">
                    Select mouthwatering pizzas, delicious sides, and stacked burgers from the menu to fill your box.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 rounded-full border border-white/10 hover:border-tomato-orange bg-white/5 hover:bg-tomato-orange hover:text-tomato-dark px-6 py-2.5 font-outfit text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Explore Menu
                  </button>
                </div>
              ) : (
                /* CART LIST */
                <div className="flex flex-col gap-5">
                  {cartItems.map((item) => (
                    <motion.div
                      layout
                      key={item.id}
                      className="flex gap-4 rounded-xl bg-white/5 p-3 border border-white/5"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-lg object-cover bg-tomato-dark"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-display text-sm tracking-wide text-white">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="text-stone-500 hover:text-tomato-red transition-colors cursor-pointer"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          {/* Customization details */}
                          <div className="text-[10px] text-stone-400 font-outfit mt-1 space-y-0.5">
                            <div>Size: <span className="text-stone-300 font-bold">{item.selectedSize}</span></div>
                            {item.selectedToppings.length > 0 && (
                              <div>Toppings: <span className="text-tomato-orange font-medium">{item.selectedToppings.join(', ')}</span></div>
                            )}
                            {item.specialInstructions && (
                              <div className="italic text-stone-500">"{item.specialInstructions}"</div>
                            )}
                          </div>

                          <p className="font-mono text-xs font-semibold text-tomato-orange/80 mt-1">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5 rounded-full bg-black/40 p-1 border border-white/5">
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/10 text-stone-300 transition-all cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3 stroke-[2.5]" />
                            </button>
                            <span className="font-mono text-xs font-bold text-white px-2">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/10 text-stone-300 transition-all cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3 stroke-[2.5]" />
                            </button>
                          </div>
                          <span className="font-mono text-sm font-extrabold text-white">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Receipt Summary & Checkout button */}
            {cartItems.length > 0 && checkoutStep === 'idle' && (
              <div className="border-t border-white/5 bg-[#170808] px-6 py-6">
                <div className="flex flex-col gap-2.5 mb-6">
                  <div className="flex items-center justify-between font-outfit text-sm text-stone-400">
                    <span>Subtotal</span>
                    <span className="font-mono text-stone-200">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between font-outfit text-sm text-stone-400">
                    <span>Delivery Fee</span>
                    <span className="font-mono text-stone-200">
                      {deliveryFee === 0 ? <span className="text-emerald-400">FREE</span> : `$${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-outfit text-sm text-stone-400">
                    <span>VAT / Taxes (8%)</span>
                    <span className="font-mono text-stone-200">${tax.toFixed(2)}</span>
                  </div>
                  <hr className="border-white/5 my-1" />
                  <div className="flex items-center justify-between font-display text-lg tracking-wide">
                    <span>Order Total</span>
                    <span className="text-tomato-orange font-mono font-bold">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Free Delivery promo bar */}
                {subtotal < 20 && (
                  <div className="flex items-center gap-2 rounded-xl bg-tomato-orange/10 border border-tomato-orange/20 px-4 py-2.5 mb-4 text-[11px] font-outfit text-stone-300">
                    <Sparkles className="h-4 w-4 text-tomato-orange animate-pulse" />
                    <span>Add <strong className="text-tomato-orange font-mono font-extrabold">${(20 - subtotal).toFixed(2)}</strong> more to unlock <strong>FREE Delivery</strong>!</span>
                  </div>
                )}

                <button
                  onClick={() => setCheckoutStep('details')}
                  className="w-full rounded-full bg-tomato-red hover:bg-tomato-red/90 py-4 font-outfit text-base font-bold tracking-wider text-white uppercase shadow-lg shadow-tomato-red/20 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Secure Checkout</span>
                </button>
              </div>
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
