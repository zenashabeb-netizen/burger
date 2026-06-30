import { useState } from 'react';
import { Menu, X, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenPlayground: () => void;
  activePage: string;
  onChangePage: (page: string) => void;
}

export default function Header({ onOpenAuth, onOpenPlayground, activePage, onChangePage }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Menu', id: 'menu' },
    { name: 'My Orders & Bill', id: 'orders' },
    { name: 'Reviews', id: 'reviews' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#1a0808]/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <button onClick={() => onChangePage('home')} className="flex flex-col group leading-none text-left cursor-pointer">
            <span className="font-display text-2xl tracking-wide text-white italic font-extrabold group-hover:scale-105 transition-transform duration-300">
              Tomato <span className="text-tomato-orange text-xl">Godotty</span>
            </span>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onChangePage(link.id)}
                className={`font-outfit text-sm font-medium tracking-wider uppercase transition-all duration-200 cursor-pointer relative py-1 ${
                  isActive 
                    ? 'text-tomato-orange scale-105 font-bold' 
                    : 'text-stone-300 hover:text-tomato-orange hover:translate-y-[-1px]'
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabUnderline" 
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-tomato-orange rounded-full" 
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-11 w-11 md:hidden items-center justify-center rounded-full bg-white/5 text-white border border-white/10 hover:bg-white/10"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-white/5 bg-[#1e0a0a] md:hidden overflow-hidden"
          >
            <div className="flex flex-col space-y-4 px-6 py-6">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onChangePage(link.id);
                  }}
                  className={`text-left font-outfit text-base font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                    activePage === link.id ? 'text-tomato-orange' : 'text-stone-200 hover:text-tomato-orange'
                  }`}
                >
                  {link.name}
                </button>
              ))}
              {/* Removed Register Button to simplify navigation */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
