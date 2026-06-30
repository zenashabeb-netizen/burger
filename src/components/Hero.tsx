import { motion } from 'motion/react';
import { ArrowRight, Star } from 'lucide-react';
import { HERO_IMAGE } from '../data';

interface HeroProps {
  onScrollToMenu: () => void;
}

export default function Hero({ onScrollToMenu }: HeroProps) {
  return (
    <section id="home" className="relative min-h-[95vh] flex items-center overflow-hidden bg-transparent py-16 md:py-24 lg:py-28">
      
      {/* Background Radial Hot Glow to highlight the food */}
      <div className="absolute top-[45%] right-[5%] lg:right-[15%] h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(218,41,28,0.2)_0%,rgba(242,169,0,0.08)_50%,transparent_100%)] blur-[90px] pointer-events-none z-0" />
      <div className="absolute top-[30%] left-[10%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(242,169,0,0.15)_0%,transparent_80%)] blur-[100px] pointer-events-none z-0" />

      {/* Floating Ingredients Showcase - Scattered Dynamically */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        
        {/* Tomato piece flying */}
        <motion.div
          animate={{
            y: [0, -18, 0],
            x: [0, 8, 0],
            rotate: [12, 28, 12]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute top-[18%] left-[8%] md:left-[12%] select-none drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]"
        >
          <span className="text-5xl md:text-6xl block">🍅</span>
        </motion.div>

        {/* Basil leaf */}
        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [-35, -20, -35]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute top-[28%] left-[45%] lg:left-[40%] select-none drop-shadow-[0_8px_10px_rgba(0,0,0,0.4)]"
        >
          <span className="text-3xl md:text-4xl block">🌿</span>
        </motion.div>

        {/* Potato wedge bottom-left */}
        <motion.div
          animate={{
            y: [0, -22, 0],
            rotate: [110, 130, 110]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute bottom-[15%] left-[6%] md:left-[10%] select-none drop-shadow-[0_12px_18px_rgba(0,0,0,0.5)]"
        >
          <span className="text-4xl md:text-5xl block">🥔</span>
        </motion.div>

        {/* Cherry tomato flying right */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            x: [0, -10, 0],
            rotate: [45, 60, 45]
          }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute bottom-[22%] right-[8%] select-none drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]"
        >
          <span className="text-4xl block">🍅</span>
        </motion.div>

        {/* Basil leaf right top */}
        <motion.div
          animate={{
            y: [0, 12, 0],
            rotate: [15, 35, 15]
          }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute top-[15%] right-[10%] md:right-[15%] select-none drop-shadow-[0_8px_10px_rgba(0,0,0,0.3)]"
        >
          <span className="text-4xl block">🌿</span>
        </motion.div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10 w-full">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Text Column */}
          <div className="flex flex-col items-center text-center lg:col-span-6 lg:items-start lg:text-left">
            
            {/* Huge Headline (PIZZA & BURGER) */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 font-display text-5xl sm:text-8xl md:text-9xl lg:text-[100px] leading-[0.85] text-white tracking-tight text-shadow-md select-none"
              style={{
                textShadow: '0 8px 24px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9)'
              }}
            >
              PIZZA & <br />
              <span className="text-tomato-orange block mt-1 drop-shadow-[0_6px_15px_rgba(242,169,0,0.55)]">
                BURGER
              </span>
            </motion.h1>

            {/* Short authentic poster description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-8 max-w-md font-outfit text-base md:text-lg leading-relaxed text-stone-300 font-medium"
            >
              The ultimate mouthwatering combination of hand-rolled wood-fired pizza and stacked beef cheeseburger. Cooked fresh by premium masters.
            </motion.p>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto"
            >
              <button
                onClick={onScrollToMenu}
                className="group relative w-full sm:w-auto flex items-center justify-center gap-3 overflow-hidden rounded-full bg-[#da291c] px-10 py-5 font-outfit text-base font-black tracking-widest text-white uppercase shadow-xl shadow-tomato-red/30 hover:bg-[#da291c]/95 active:scale-95 transition-all cursor-pointer z-30"
              >
                <span>Order Now</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* Right Floating Image Column (Double burger stacked on pizza) */}
          <div className="relative flex justify-center lg:col-span-6 z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 60,
                damping: 12,
                delay: 0.2
              }}
              className="relative w-full max-w-[480px] px-4"
            >
              {/* Outer Wood Circle visual plate glow */}
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(242,169,0,0.25)_0%,transparent_70%)] blur-[40px] pointer-events-none" />

              {/* Wooden plate border around the hero food */}
              <motion.div
                animate={{
                  y: [0, -12, 0]
                }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative overflow-hidden rounded-full border-8 sm:border-[12px] border-[#251010] shadow-[0_25px_60px_rgba(0,0,0,0.95)] hover:scale-[1.01] transition-transform duration-500 aspect-square w-full"
              >
                <img
                  src={HERO_IMAGE}
                  alt="Famous Burger and Pizza wood board stack"
                  className="h-full w-full object-cover select-none"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              {/* Dynamic tag overlaying the wooden board */}
              <motion.div
                initial={{ rotate: -12, scale: 0 }}
                animate={{ rotate: -8, scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
                className="absolute bottom-4 left-0 bg-[#f2a900] text-tomato-dark font-display text-sm tracking-widest uppercase px-5 py-2.5 rounded-xl shadow-2xl border-2 border-tomato-dark font-bold hover:scale-105 transition-transform"
              >
                Mega Combo $16.99
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
