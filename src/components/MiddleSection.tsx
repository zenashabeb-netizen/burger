import { motion } from 'motion/react';
import { ArrowRight, Flame } from 'lucide-react';
import { THREE_BURGERS_IMAGE } from '../data';

interface MiddleSectionProps {
  onOrderQuickBurger: () => void;
}

export default function MiddleSection({ onOrderQuickBurger }: MiddleSectionProps) {
  return (
    <section className="relative overflow-hidden bg-transparent pt-24 pb-28 md:pt-28 md:pb-36">

      {/* Dynamic Background Splashes/Shapes */}
      <div className="absolute -left-16 top-1/4 h-72 w-72 rounded-full bg-tomato-orange/10 blur-[80px] pointer-events-none" />
      <div className="absolute -right-16 bottom-1/4 h-72 w-72 rounded-full bg-tomato-red/10 blur-[80px] pointer-events-none" />

      {/* Floating ingredients over cream section */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {/* Falling potato wedge */}
        <motion.div
          animate={{
            y: [0, 10, 0],
            rotate: [10, -5, 10]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="hidden sm:block absolute top-[15%] left-[12%] text-3xl opacity-90 filter drop-shadow-md"
        >
          🥔
        </motion.div>

        {/* Floating single french fry piece */}
        <motion.div
          animate={{
            y: [0, -12, 0],
            rotate: [-45, -30, -45]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="hidden sm:block absolute top-[30%] right-[15%] text-2xl opacity-90 filter drop-shadow-md"
        >
          🍟
        </motion.div>

        {/* Floating basil leaf */}
        <motion.div
          animate={{
            y: [0, 8, 0],
            rotate: [20, 40, 20]
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="hidden sm:block absolute bottom-[20%] left-[8%] text-2xl opacity-85 filter drop-shadow-sm"
        >
          🌿
        </motion.div>

        {/* Floating cherry tomato */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [-15, 10, -15]
          }}
          transition={{
            duration: 4.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="hidden sm:block absolute bottom-[25%] right-[10%] text-3xl opacity-90 filter drop-shadow-md"
        >
          🍅
        </motion.div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-20">
        
        {/* Core Content Box */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Subheader Accent */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-1.5 text-tomato-red font-outfit text-sm font-extrabold tracking-widest uppercase mb-3"
          >
            <Flame className="h-4 w-4 text-tomato-red fill-current" />
            Signature Burger Lineup
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl text-white leading-tight"
          >
            FRESH, HOT & <span className="text-tomato-red">Sizzling</span>
          </motion.h2>

          {/* Short Bio */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-4 font-outfit text-base md:text-lg text-white max-w-2xl leading-relaxed"
          >
            Each burger is individually prepared by hand using premium, freshly-ground prime beef, cheddar cheese blankets, hand-chopped farm vegetables, and daily house-baked brioche buns.
          </motion.p>

          {/* CTA Order Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-6"
          >
            <button
              onClick={onOrderQuickBurger}
              className="group flex items-center gap-2 rounded-full bg-tomato-red hover:bg-tomato-red/90 px-8 py-3.5 font-outfit text-sm font-bold tracking-wider text-white uppercase shadow-lg shadow-tomato-red/20 transition-all active:scale-95 cursor-pointer"
            >
              Order Premium Burger
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Three Burgers Showcase Section with Yellow Paint Stroke Effect */}
        <div className="relative mt-10 max-w-4xl mx-auto flex justify-center">
          
          {/* Yellow Brush/Paint stroke backdrop behind the burgers */}
          <div className="absolute top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] max-w-[800px] h-[140px] md:h-[200px] pointer-events-none select-none z-0">
            <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="w-full h-full text-tomato-orange fill-current opacity-95 transform -rotate-[1.5deg] filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.15)]">
              <path d="M 12 75 C 50 60, 95 85, 140 65 C 185 45, 235 90, 280 70 C 325 50, 375 95, 420 75 C 465 55, 515 80, 550 65 C 580 50, 595 72, 590 100 C 580 140, 510 135, 460 150 C 410 165, 340 120, 290 135 C 240 150, 190 165, 140 145 C 90 125, 30 155, 15 130 C 5 110, -5 90, 12 75 Z" />
            </svg>
          </div>

          {/* Core Image Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 50, damping: 12 }}
            className="relative z-10 w-full max-w-2xl px-4 filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.45)]"
          >
            <img
              src={THREE_BURGERS_IMAGE}
              alt="Three juicy burgers side-by-side on yellow backdrop"
              className="rounded-3xl object-contain w-full select-none"
              referrerPolicy="no-referrer"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
