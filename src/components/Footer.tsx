import { Flame, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-black/45 backdrop-blur-md text-stone-300 pt-16 pb-8 overflow-hidden border-t border-white/10">
      {/* Absolute Red spatter visual decor at bottom of page to match the image */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-tomato-red/20 to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Logo & Slogan Column */}
          <div className="md:col-span-1.5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tomato-red">
                <Flame className="h-5 w-5 text-white fill-current" />
              </div>
              <span className="font-display text-2xl tracking-wide text-white">
                Tomato <span className="text-tomato-orange">&</span> Burger
              </span>
            </div>
            <p className="font-outfit text-xs leading-relaxed text-stone-400">
              The premium destination for wood-fired pepperoni pizzas and double-stacked gourmet beef burgers. Crafted by hand with authentic local ingredients.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-base text-white tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5 font-outfit text-xs">
              <li><a href="#home" className="hover:text-tomato-orange transition-colors">Home Landing</a></li>
              <li><a href="#menu" className="hover:text-tomato-orange transition-colors">Popular Eats Menu</a></li>
              <li><a href="#deals" className="hover:text-tomato-orange transition-colors">Exclusive Offers</a></li>
              <li><a href="#reviews" className="hover:text-tomato-orange transition-colors">Reviews & Testimonials</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="font-display text-base text-white tracking-wider">Get in Touch</h4>
            <ul className="space-y-3 font-outfit text-xs text-stone-400">
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-tomato-orange flex-shrink-0" />
                <span>+1 (800) 555-YUMM</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-tomato-orange flex-shrink-0" />
                <span>orders@tomatoburger.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-tomato-orange flex-shrink-0" />
                <span>742 Evergreen Terrace, Springfield</span>
              </li>
            </ul>
          </div>

          {/* Working Hours */}
          <div className="space-y-4">
            <h4 className="font-display text-base text-white tracking-wider">Baking Hours</h4>
            <div className="rounded-xl bg-white/5 border border-white/5 p-3.5 space-y-2 font-outfit text-xs text-stone-400">
              <div className="flex items-center gap-1.5 text-tomato-orange font-semibold">
                <Clock className="h-3.5 w-3.5" />
                <span>Open Daily</span>
              </div>
              <div className="flex justify-between">
                <span>Mon - Thu:</span>
                <span className="font-mono text-white">11 AM - 10 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Fri - Sat:</span>
                <span className="font-mono text-white">11 AM - 12 AM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span className="font-mono text-white">12 PM - 9 PM</span>
              </div>
            </div>
          </div>

        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-outfit text-xs text-white">
            &copy; {currentYear} Tomato & Burger Restaurant Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs font-outfit text-white">
            <a href="#" className="hover:text-stone-300">Privacy Policy</a>
            <a href="#" className="hover:text-stone-300">Terms of Service</a>
            <a href="#" className="hover:text-stone-300">Licensing</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
