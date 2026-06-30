import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flame, Gift, CheckCircle, Sparkles, Star } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [formState, setFormState] = useState({ name: '', email: '', choice: 'burger' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'register' | 'loyalty'>('register');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (formState.name && formState.email) {
      setIsSubmitted(true);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#1e0a0a] border border-white/10 p-6 text-white shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Success State */}
              {isSubmitted ? (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 10 }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-tomato-orange shadow-lg shadow-tomato-orange/20 mb-6"
                  >
                    <Gift className="h-8 w-8 text-tomato-dark" />
                  </motion.div>
                  <h3 className="font-display text-2xl text-white">Welcome, {formState.name}!</h3>
                  <p className="mt-2 font-outfit text-sm text-stone-300">
                    You are now a certified VIP member of the <br /><strong>Tomato & Burger Club</strong>.
                  </p>

                  <div className="mt-6 rounded-2xl bg-tomato-orange/15 border border-tomato-orange/30 p-5 relative overflow-hidden">
                    <span className="font-outfit text-[11px] font-bold text-tomato-orange uppercase tracking-widest block">VIP Club Membership Active</span>
                    <span className="font-outfit text-xs text-stone-300 mt-2 block">Show your membership profile to any staff member to unlock exclusive seasonal products and earn double points on every visit!</span>
                  </div>

                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      onClose();
                    }}
                    className="mt-8 w-full rounded-full bg-tomato-red py-3.5 font-outfit text-sm font-bold tracking-wider text-white uppercase shadow-lg shadow-tomato-red/10 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                  >
                    Mouthwatering! Let's Eat
                  </button>
                </div>
              ) : (
                /* INPUT STATE */
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Flame className="h-5 w-5 text-tomato-orange fill-current animate-bounce" />
                    <span className="font-display text-xl tracking-wide">Club Lounge</span>
                  </div>

                  {/* Header Tabs */}
                  <div className="flex bg-white/5 rounded-full p-1 border border-white/5 mb-6">
                    <button
                      onClick={() => setActiveTab('register')}
                      className={`flex-1 text-center py-2 rounded-full font-outfit text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === 'register' ? 'bg-tomato-orange text-tomato-dark font-extrabold' : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      Join Club
                    </button>
                    <button
                      onClick={() => setActiveTab('loyalty')}
                      className={`flex-1 text-center py-2 rounded-full font-outfit text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === 'loyalty' ? 'bg-tomato-orange text-tomato-dark font-extrabold' : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      Check Points
                    </button>
                  </div>

                  {activeTab === 'register' ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block font-outfit text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                          Full Name
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="Gordon Ramsay"
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          className="w-full rounded-xl bg-white/5 border border-white/10 hover:border-white/25 focus:border-tomato-orange focus:outline-none px-4 py-3 text-sm transition-all text-white placeholder:text-stone-600"
                        />
                      </div>

                      <div>
                        <label className="block font-outfit text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                          Email Address
                        </label>
                        <input
                          required
                          type="email"
                          placeholder="gordon@chef.com"
                          value={formState.email}
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          className="w-full rounded-xl bg-white/5 border border-white/10 hover:border-white/25 focus:border-tomato-orange focus:outline-none px-4 py-3 text-sm transition-all text-white placeholder:text-stone-600"
                        />
                      </div>

                      <div>
                        <label className="block font-outfit text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                          Your Ultimate Food Choice
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setFormState({ ...formState, choice: 'burger' })}
                            className={`py-3 rounded-xl border font-outfit text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              formState.choice === 'burger'
                                ? 'bg-tomato-orange/10 border-tomato-orange text-tomato-orange'
                                : 'bg-white/5 border-white/5 text-stone-300 hover:bg-white/10'
                            }`}
                          >
                            <span>🍔</span> Burger Fan
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormState({ ...formState, choice: 'pizza' })}
                            className={`py-3 rounded-xl border font-outfit text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              formState.choice === 'pizza'
                                ? 'bg-tomato-orange/10 border-tomato-orange text-tomato-orange'
                                : 'bg-white/5 border-white/5 text-stone-300 hover:bg-white/10'
                            }`}
                          >
                            <span>🍕</span> Pizza Lover
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-full bg-tomato-red hover:bg-tomato-red/90 py-4 font-outfit text-sm font-extrabold tracking-wider text-white uppercase shadow-lg shadow-tomato-red/15 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer mt-4"
                      >
                        Join the Club Lounge
                      </button>
                    </form>
                  ) : (
                    /* LOYALTY TAB */
                    <div className="space-y-6 text-center py-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-tomato-orange/10 text-tomato-orange">
                        <Star className="h-6 w-6 fill-current" />
                      </div>
                      <div>
                        <h4 className="font-display text-lg">Coming Extremely Soon!</h4>
                        <p className="mt-2 font-outfit text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
                          We are launching our unified loyalty portal next week! Registered club members will be auto-migrated with 100 free base points.
                        </p>
                      </div>
                      <div className="rounded-xl bg-white/5 border border-white/5 p-4 text-left">
                        <div className="flex justify-between font-outfit text-xs text-stone-400">
                          <span>Base Points Reward</span>
                          <span className="font-bold text-emerald-400">100 Pts</span>
                        </div>
                        <div className="flex justify-between font-outfit text-xs text-stone-400 mt-2">
                          <span>Sign up status</span>
                          <span className="font-bold text-tomato-orange">Bronze Level</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
