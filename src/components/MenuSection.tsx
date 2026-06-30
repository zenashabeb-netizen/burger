import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  Plus, 
  Minus, 
  Check, 
  Flame, 
  Leaf,
  Search, 
  ShoppingBag,
  Clock,
  X,
  Sparkles,
  ChevronRight,
  Heart,
  Award,
  Zap,
  Info,
  ChevronLeft,
  ArrowLeft,
  MessageSquare,
  Bell,
  Home,
  Eye
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { CartItem, Product } from '../types';

interface MenuSectionProps {
  onAddToCart: (itemToAdd: Omit<CartItem, 'id'>) => void;
  addedItemIds: string[];
  onOpenCart?: () => void;
  onChangePage?: (page: string) => void;
}

const GreenLeaf = ({ className, delay = 0, duration = 5, rotateStart = 0 }: { className?: string; delay?: number; duration?: number; rotateStart?: number }) => (
  <motion.div
    initial={{ y: 0, rotate: rotateStart }}
    animate={{ 
      y: [0, -15, 0],
      rotate: [rotateStart, rotateStart + 12, rotateStart - 12, rotateStart]
    }}
    transition={{
      duration: duration,
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay
    }}
    className={`absolute pointer-events-none z-20 select-none ${className}`}
  >
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_4px_8px_rgba(34,197,94,0.35)]">
      <path d="M10,90 C30,70 45,40 90,10 C80,35 65,70 10,90 Z" fill="#22c55e" />
      <path d="M25,75 C45,55 55,35 80,20" stroke="#15803d" strokeWidth="4" strokeLinecap="round" />
      <path d="M40,60 C48,58 55,54 62,48" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
      <path d="M50,50 C58,48 62,42 68,36" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  </motion.div>
);

export default function MenuSection({ onAddToCart, addedItemIds, onOpenCart, onChangePage }: MenuSectionProps) {
  const { products, searchWithAI } = useRestaurant();
  
  // Custom View Toggle: 'grid' (Gourmet Grid Catalog) or 'plates' (Interactive Plates Showcase)
  const [activeView, setActiveView] = useState<'grid' | 'plates'>('grid');
  
  // Category Selectors
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Dietary & Attribute Toggles
  const [filterPopular, setFilterPopular] = useState<boolean>(false);
  const [filterSpicy, setFilterSpicy] = useState<boolean>(false);
  const [filterVegetarian, setFilterVegetarian] = useState<boolean>(false);
  const [filterChefSpecial, setFilterChefSpecial] = useState<boolean>(false);
  
  // Searching & AI Suggestions
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Plate View Specific States
  const [plateCategory, setPlateCategory] = useState<string>('salad');
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [plateRotation, setPlateRotation] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Customization Modal States
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [chosenSize, setChosenSize] = useState<string>('Regular');
  const [chosenToppings, setChosenToppings] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [customizingQuantity, setCustomizingQuantity] = useState<number>(1);
  const [chosenSpice, setChosenSpice] = useState<string>('Medium');

  // Debounced AI Search
  useEffect(() => {
    if (!searchQuery) {
      setAiSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsAiLoading(true);
      try {
        const results = await searchWithAI(searchQuery);
        setAiSuggestions(results);
      } catch (err) {
        console.error("AI Search Error:", err);
      } finally {
        setIsAiLoading(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Custom Category Listing for Grid
  const gridCategories = [
    { id: 'all', label: 'All Items' },
    { id: 'burger', label: 'Burgers' },
    { id: 'pizza', label: 'Pizzas' },
    { id: 'salad', label: 'Salads & Greens' },
    { id: 'seafood', label: 'Seafood Specials' },
    { id: 'side', label: 'Appetizers & Sides' },
    { id: 'drink', label: 'Beverages' }
  ];

  // Plate View Categories
  const plateCategories = [
    { id: 'salad', label: 'Salad' },
    { id: 'seafood', label: 'Seafood' },
    { id: 'drink', label: 'Soft Drink' },
    { id: 'burger', label: 'Burger' },
    { id: 'pizza', label: 'Pizza' },
    { id: 'side', label: 'Side' }
  ];

  // Dynamic Filtration Logic
  const filteredProducts = products.filter((product) => {
    // 1. Category Filter
    if (activeCategory !== 'all' && product.category !== activeCategory) {
      return false;
    }

    // 2. Attribute Filters
    if (filterPopular && !product.isPopular) return false;
    if (filterSpicy && !product.isSpicy) return false;
    if (filterVegetarian && !product.isVegetarian) return false;
    if (filterChefSpecial && !product.isChefSpecial) return false;

    // 3. Search Matching (Text + AI)
    if (searchQuery) {
      // If we have AI recommendations, we match against those IDs first
      if (aiSuggestions.length > 0) {
        return aiSuggestions.some((aiItem) => aiItem.id === product.id);
      }
      // Fallback: Local Keyword Matching
      const term = searchQuery.toLowerCase();
      const matchesName = product.name.toLowerCase().includes(term);
      const matchesDesc = product.description.toLowerCase().includes(term);
      const matchesTags = product.tags?.some(tag => tag.toLowerCase().includes(term));
      return matchesName || matchesDesc || matchesTags;
    }

    return true;
  });

  // Fallback and dynamic customizations generator based on dish categories
  const getToppingsForCategory = (product: Product): { name: string; price: number }[] => {
    if (product.customizations?.addOns && product.customizations.addOns.length > 0) {
      return product.customizations.addOns;
    }
    const category = product.category;
    switch (category) {
      case 'burger':
        return [
          { name: 'Extra Patty', price: 3.00 },
          { name: 'Smoked Bacon', price: 2.00 },
          { name: 'Fried Egg', price: 1.25 },
          { name: 'Extra Cheddar', price: 1.00 }
        ];
      case 'pizza':
        return [
          { name: 'Extra Pepperoni', price: 2.50 },
          { name: 'Double Mozzarella', price: 2.00 },
          { name: 'Jalapeño Slices', price: 1.00 },
          { name: 'Hot Honey Drizzle', price: 1.50 }
        ];
      case 'salad':
        return [
          { name: 'Sliced Avocado', price: 1.75 },
          { name: 'Extra Feta Cheese', price: 1.25 },
          { name: 'Grilled Chicken', price: 2.50 },
          { name: 'Toasted Almonds', price: 1.00 }
        ];
      case 'seafood':
        return [
          { name: 'Garlic Butter Glaze', price: 1.00 },
          { name: 'Extra Grilled Prawns', price: 4.00 },
          { name: 'Crispy Garlic Crumbs', price: 0.75 },
          { name: 'Chili Infused Oil', price: 1.00 }
        ];
      case 'drink':
        return [
          { name: 'Extra Mint Leaves', price: 0.50 },
          { name: 'Chia Seeds Boost', price: 0.75 },
          { name: 'Squeeze of Fresh Lime', price: 0.25 },
          { name: 'Organic Honey Sweetener', price: 0.50 }
        ];
      default:
        return [
          { name: 'Extra Parmesan Cheese', price: 1.50 },
          { name: 'Crispy Bacon Bits', price: 1.75 },
          { name: 'Spicy Mayo Dip', price: 0.75 },
          { name: 'White Truffle Drizzle', price: 2.00 }
        ];
    }
  };

  // Calculate dynamic customization pricing
  const calculateCustomizationPrice = (product: Product, size: string, toppings: string[]): number => {
    let price = product.price;
    // Size Premium
    if (size === 'Large') price += 1.50;
    if (size === 'Premium/Double') price += 3.00;

    // Toppings Premiums
    const availableToppings = getToppingsForCategory(product);
    toppings.forEach((toppingName) => {
      const toppingObj = availableToppings.find(a => a.name === toppingName);
      if (toppingObj) {
        price += toppingObj.price;
      }
    });
    return price;
  };

  // Open the detailed customize modal
  const handleOpenCustomization = (product: Product) => {
    setCustomizingProduct(product);
    setChosenSize('Regular');
    setChosenToppings([]);
    setSpecialInstructions('');
    setCustomizingQuantity(1);
  };

  // Configure button pressed: switch to plates view and select the product
  const handleConfigureProduct = (product: Product) => {
    setActiveView('plates');
    setPlateCategory(product.category);
    const categoryProducts = products.filter(item => item.category === product.category);
    const targetIndex = categoryProducts.findIndex(item => item.id === product.id);
    if (targetIndex !== -1) {
      setCurrentItemIndex(targetIndex);
    } else {
      setCurrentItemIndex(0);
    }
  };

  // Toggle single topping selection
  const handleToggleTopping = (toppingName: string) => {
    setChosenToppings(prev => 
      prev.includes(toppingName) 
        ? prev.filter(t => t !== toppingName)
        : [...prev, toppingName]
    );
  };

  // Add the finalized custom item to cart
  const handleConfirmCustomization = () => {
    if (!customizingProduct) return;
    
    const computedUnitPrice = calculateCustomizationPrice(customizingProduct, chosenSize, chosenToppings);
    
    onAddToCart({
      productId: customizingProduct.id,
      name: customizingProduct.name,
      price: computedUnitPrice,
      quantity: customizingQuantity,
      selectedSize: chosenSize,
      selectedToppings: chosenToppings,
      specialInstructions: specialInstructions,
      image: customizingProduct.image
    });

    setCustomizingProduct(null);
  };

  // Quick Direct Add for Standard Simple Items
  const handleQuickAdd = (product: Product) => {
    onAddToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      selectedSize: 'Regular',
      selectedToppings: [],
      specialInstructions: '',
      image: product.image
    });
  };

  // Plate view active items helper
  const plateFilteredItems = products.filter(item => item.category === plateCategory);
  const activePlateItem = plateFilteredItems[currentItemIndex] || products[0] || { id: '', name: 'Loading...', price: 0, image: '', category: 'salad', rating: 5, description: '' };
  const nextPlateIndex = plateFilteredItems.length > 0 ? (currentItemIndex + 1) % plateFilteredItems.length : 0;
  const nextPlateItem = plateFilteredItems[nextPlateIndex] || plateFilteredItems[0] || activePlateItem;

  const handleNextPlateItem = () => {
    setPlateRotation(prev => prev + 180);
    setCurrentItemIndex(nextPlateIndex);
  };

  // Reset customization selections whenever active plate changes
  useEffect(() => {
    setChosenToppings([]);
    setChosenSize('Regular');
    setCustomizingQuantity(1);
    setSpecialInstructions('');
    setChosenSpice('Medium');
  }, [activePlateItem.id]);

  return (
    <section id="menu" className={`relative py-12 scroll-mt-24 ${activeView === 'plates' ? 'w-full max-w-none px-0 py-6' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
      {/* Decorative Floating Organic Elements */}
      <GreenLeaf className="top-16 left-8 rotate-12 scale-110 opacity-75 hidden md:block" delay={0.5} duration={6} rotateStart={12} />
      <GreenLeaf className="bottom-24 right-12 -rotate-45 scale-90 opacity-60 hidden md:block" delay={2} duration={8} rotateStart={-45} />

      {/* Elegant Centered Header */}
      <div className={`text-center mb-10 ${activeView === 'plates' ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : ''}`}>
        <h2 className="font-display text-4xl sm:text-5xl text-white tracking-tight">
          Browse Our <span className="text-tomato-orange font-semibold">Gourmet Masterpieces</span>
        </h2>
        <p className="font-outfit text-sm text-stone-400 mt-2.5 max-w-lg mx-auto leading-relaxed">
          Savor fresh ingredients layered dynamically by Chef Godotty. Switch between high-fidelity physical plates or a streamlined interactive catalog grid.
        </p>


      </div>

      {/* ======================= TAB 1: STREAMLINED GRID CATALOG ======================= */}
      {activeView === 'grid' && (
        <div className="space-y-8 relative z-10">
          
          {/* SEARCH & FILTERS CONTROLLER CONTAINER */}
          <div className="bg-[#150a0a]/95 rounded-3xl p-6 border border-white/5 shadow-2xl space-y-6">
            
            {/* Search inputs row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Text Search */}
              <div className="relative flex items-center bg-stone-900/80 rounded-2xl px-4 py-3.5 border border-white/5 focus-within:border-tomato-orange/30 transition-all">
                <Search className="w-4 h-4 text-stone-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search dishes, descriptions, or tags..."
                  className="bg-transparent text-sm text-white placeholder-stone-500 focus:outline-none w-full font-outfit"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-stone-400 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Natural Language AI Search */}
              <div className="relative flex items-center bg-stone-900/80 rounded-2xl px-4 py-3.5 border border-tomato-orange/15 focus-within:border-tomato-orange/40 transition-all">
                <Sparkles className="w-4 h-4 text-tomato-orange fill-tomato-orange/10 mr-3 animate-pulse" />
                <input
                  type="text"
                  placeholder="Gourmet AI Assistant: ask for 'something spicy with cheese'..."
                  className="bg-transparent text-sm text-white placeholder-stone-500 focus:outline-none w-full font-outfit italic"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {isAiLoading && (
                  <span className="w-4 h-4 border-2 border-stone-600 border-t-tomato-orange rounded-full animate-spin shrink-0 ml-2" />
                )}
              </div>
            </div>

            {/* Predefined prompts helper tags */}
            {!searchQuery && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500 font-outfit flex items-center gap-1">
                  <Zap className="w-3 h-3 text-tomato-orange" /> Try asking:
                </span>
                {[
                  { text: '🌶️ Something spicy', query: 'spicy' },
                  { text: '🥗 Healthy vegan bowl', query: 'vegan' },
                  { text: '🦐 High protein fresh catch', query: 'high protein seafood' },
                  { text: '🧀 Double cheeseburger', query: 'cheeseburger' }
                ].map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSearchQuery(tag.query)}
                    className="bg-stone-900 hover:bg-stone-850 hover:text-tomato-orange text-stone-300 text-xs px-3.5 py-1.5 rounded-full transition-all border border-white/5 cursor-pointer font-outfit"
                  >
                    {tag.text}
                  </button>
                ))}
              </div>
            )}

            {/* Category Selectors */}
            <div className="border-t border-white/5 pt-5">
              <div className="flex items-center overflow-x-auto gap-2 pb-2 scrollbar-none">
                {gridCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4.5 py-2.5 rounded-2xl font-outfit text-xs font-semibold tracking-wide whitespace-nowrap transition-all border cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-white text-[#150a0a] border-white shadow-lg shadow-white/5 font-extrabold'
                        : 'bg-stone-900/60 text-stone-400 border-white/5 hover:text-white hover:bg-stone-850'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Dietary / Attribute toggles */}
            <div className="flex flex-wrap items-center gap-3 border-t border-white/5 pt-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500 font-outfit">
                Refine Selection:
              </span>
              
              <button
                onClick={() => setFilterPopular(!filterPopular)}
                className={`px-3.5 py-1.5 rounded-xl font-outfit text-xs font-medium transition-all border flex items-center gap-1.5 cursor-pointer ${
                  filterPopular
                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 font-bold'
                    : 'bg-transparent text-stone-400 border-white/5 hover:text-stone-200'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${filterPopular ? 'fill-yellow-400' : ''}`} /> Best Sellers
              </button>

              <button
                onClick={() => setFilterSpicy(!filterSpicy)}
                className={`px-3.5 py-1.5 rounded-xl font-outfit text-xs font-medium transition-all border flex items-center gap-1.5 cursor-pointer ${
                  filterSpicy
                    ? 'bg-tomato-orange/10 text-tomato-orange border-tomato-orange/30 font-bold'
                    : 'bg-transparent text-stone-400 border-white/5 hover:text-stone-200'
                }`}
              >
                <Flame className={`w-3.5 h-3.5 ${filterSpicy ? 'fill-current' : ''}`} /> Spicy Dishes
              </button>

              <button
                onClick={() => setFilterVegetarian(!filterVegetarian)}
                className={`px-3.5 py-1.5 rounded-xl font-outfit text-xs font-medium transition-all border flex items-center gap-1.5 cursor-pointer ${
                  filterVegetarian
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold'
                    : 'bg-transparent text-stone-400 border-white/5 hover:text-stone-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" /> Vegan & Vegetarian
              </button>

              <button
                onClick={() => setFilterChefSpecial(!filterChefSpecial)}
                className={`px-3.5 py-1.5 rounded-xl font-outfit text-xs font-medium transition-all border flex items-center gap-1.5 cursor-pointer ${
                  filterChefSpecial
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 font-bold'
                    : 'bg-transparent text-stone-400 border-white/5 hover:text-stone-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Chef's Signature
              </button>
            </div>

          </div>

          {/* DYNAMIC PRODUCT LISTING GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const isItemAdded = addedItemIds.includes(product.id);
                // Check if this product has size customization options
                const hasSizes = product.customizations?.sizes && product.customizations.sizes.length > 0;
                const hasToppings = product.customizations?.addOns && product.customizations.addOns.length > 0;
                const isCustomizable = hasSizes || hasToppings;

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.35 }}
                    className="group bg-[#150a0a]/90 border border-white/5 hover:border-tomato-orange/30 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl flex flex-col h-full"
                  >
                    {/* Visual Asset Container */}
                    <div className="relative h-48 overflow-hidden bg-stone-900 shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Gradient bottom fog */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#150a0a] via-transparent to-transparent opacity-95" />

                      {/* Header Floating badges row */}
                      <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none">
                        {/* Rating Badges */}
                        <div className="bg-black/80 backdrop-blur-md text-white font-mono text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 border border-white/5">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          {product.rating.toFixed(1)}
                        </div>

                        {/* Attribute Badges */}
                        <div className="flex gap-1.5 flex-wrap justify-end">
                          {product.isPopular && (
                            <span className="bg-yellow-500 text-[#150a0a] text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-md">
                              Popular
                            </span>
                          )}
                          {product.isSpicy && (
                            <span className="bg-[#da291c] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-md flex items-center gap-0.5">
                              <Flame className="w-3 h-3 fill-white" /> Spicy
                            </span>
                          )}
                          {product.isVegetarian && (
                            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-md flex items-center gap-0.5">
                              <Leaf className="w-3 h-3 fill-white" /> Veggie
                            </span>
                          )}
                          {product.isChefSpecial && (
                            <span className="bg-amber-500 text-[#150a0a] text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-md flex items-center gap-0.5">
                              <Sparkles className="w-3 h-3 fill-white" /> Special
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Dynamic Metadata Attributes Row */}
                        <div className="flex items-center gap-3 font-mono text-[10px] text-stone-400 mb-2 border-b border-white/5 pb-2.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-tomato-orange" /> {product.prepTime || 12} mins
                          </span>
                          <span className="text-stone-600">•</span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-400" /> {product.calories || 480} kcal
                          </span>
                          <span className="text-stone-600">•</span>
                          <span className="flex items-center gap-1 text-tomato-orange font-bold">
                            <Award className="w-3 h-3" /> +{product.rewardsPoints || 25} pts
                          </span>
                        </div>

                        {/* Title and brief */}
                        <h4 className="font-display text-base tracking-wide text-white group-hover:text-tomato-orange transition-colors">
                          {product.name}
                        </h4>
                        <p className="font-outfit text-xs text-stone-400 mt-1.5 leading-relaxed line-clamp-2">
                          {product.description}
                        </p>
                      </div>

                      {/* Pricing and Action button footer */}
                      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest font-outfit">Starts at</span>
                          <span className="font-mono text-lg font-black text-white">${product.price.toFixed(2)}</span>
                        </div>

                        {/* Multi-Trigger add / custom buttons */}
                        {isCustomizable ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuickAdd(product)}
                              className={`font-outfit text-[11px] font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-2xl transition-all flex items-center gap-1 active:scale-95 cursor-pointer ${
                                isItemAdded
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-tomato-orange hover:bg-red-600 text-white'
                              }`}
                            >
                              {isItemAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" /> Added
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" /> Add to Cart
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleConfigureProduct(product)}
                              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-tomato-orange font-outfit text-[11px] font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-2xl transition-all flex items-center gap-1 active:scale-95 cursor-pointer shrink-0"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-tomato-orange" /> Configure
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleQuickAdd(product)}
                            className={`font-outfit text-xs font-bold uppercase tracking-wider px-4.5 py-2.5 rounded-2xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                              isItemAdded
                                ? 'bg-emerald-500 text-white'
                                : 'bg-tomato-orange hover:bg-red-600 text-white'
                            }`}
                          >
                            {isItemAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> Added
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" /> Quick Add
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Fallback layout for empty searches */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-stone-900/20 border border-white/5 rounded-3xl">
              <Sparkles className="w-12 h-12 text-stone-500 mx-auto mb-4 animate-pulse" />
              <h3 className="font-display text-lg text-stone-300">No Culinary Masterpieces Found</h3>
              <p className="font-outfit text-xs text-stone-500 max-w-sm mx-auto mt-1 leading-relaxed">
                We couldn't match any plates to your active search parameter. Try asking Chef Godotty for a simpler culinary descriptive query.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                  setFilterPopular(false);
                  setFilterSpicy(false);
                  setFilterVegetarian(false);
                  setFilterChefSpecial(false);
                }}
                className="mt-5 text-xs font-bold text-tomato-orange hover:underline uppercase tracking-wider font-outfit"
              >
                Clear Filters
              </button>
            </div>
          )}

        </div>
      )}

      {/* ======================= TAB 2: ORIGINAL INTERACTIVE PLATES SIMULATOR ======================= */}
      {activeView === 'plates' && (
        <div className="relative min-h-[85vh] md:min-h-[780px] w-full flex flex-col items-center justify-center py-6 md:py-10 z-10 bg-[#dfdbd4] border-y border-stone-300/50 shadow-inner overflow-hidden select-none">
          
          {/* Topographical contour map SVG background overlay */}
          <div className="absolute inset-0 opacity-[0.14] pointer-events-none mix-blend-multiply select-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <path d="M-100,50 C50,150 150,-50 300,100 C450,250 550,50 700,150" stroke="#1d1b18" strokeWidth="1.2" fill="none" />
              <path d="M-50,180 C150,280 250,80 400,230 C550,380 650,180 800,280" stroke="#1d1b18" strokeWidth="1.2" fill="none" />
              <path d="M-150,290 C50,390 150,190 300,340 C450,490 550,290 700,390" stroke="#1d1b18" strokeWidth="1.2" fill="none" />
              <path d="M100,-80 C250,70 350,-130 500,20 C650,170 750,-30 900,70" stroke="#1d1b18" strokeWidth="1.2" fill="none" />
              <path d="M200,220 C350,370 450,170 600,320" stroke="#1d1b18" strokeWidth="1.2" fill="none" />
              <path d="M50,520 C200,620 300,420 450,570 C600,720 700,520 850,670" stroke="#1d1b18" strokeWidth="1.2" fill="none" />
              <path d="M120,620 C270,720 370,520 520,670 C670,820 770,620 920,770" stroke="#1d1b18" strokeWidth="1.2" fill="none" />
            </svg>
          </div>

          {/* Drifting organic leaves inside the canvas */}
          <GreenLeaf className="top-10 left-[15%] opacity-90 scale-125" delay={0.2} duration={5.5} rotateStart={45} />
          <GreenLeaf className="top-24 right-[20%] opacity-80" delay={1.5} duration={6} rotateStart={120} />
          <GreenLeaf className="bottom-28 left-[10%] opacity-85 scale-95" delay={0.8} duration={4.8} rotateStart={-30} />
          <GreenLeaf className="bottom-16 right-[12%] opacity-90 scale-110" delay={2.1} duration={5.2} rotateStart={15} />

          {/* Main Simulated Showcase Frame wrapper - fitting the page dimensions beautifully */}
          <div className="relative w-[96%] max-w-7xl min-h-[750px] md:min-h-[660px] h-auto bg-gradient-to-b from-[#e5e1da] to-[#dfdbd4] rounded-[40px] md:rounded-[48px] shadow-[0_35px_90px_rgba(30,28,26,0.18)] p-6 md:p-8 lg:p-10 flex flex-col justify-between border border-stone-800/10 overflow-visible z-10 transition-all duration-500">
            
            {/* Phone Content area */}
            <div className="flex flex-col flex-1 justify-between pt-4 overflow-visible">
              
              {/* Header icons row */}
              <div className="flex items-center justify-between px-1">
                {/* Back button */}
                <button 
                  onClick={() => setActiveView('grid')}
                  className="flex items-center gap-2 bg-stone-900/5 hover:bg-stone-900/10 text-stone-900 border border-stone-800/10 rounded-full px-4 py-2 text-xs font-outfit font-black uppercase tracking-widest transition-all cursor-pointer active:scale-95 shadow-sm"
                  title="Back to Gourmet Grid"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-stone-900" strokeWidth={3} />
                  <span>Back</span>
                </button>
              </div>

              {/* Elegant Typography Display Headline moved to top right corner on desktop, placed outside Grid */}
              <div className="px-1 mt-4 md:mt-0 md:absolute md:top-8 md:right-10 md:text-right md:z-30">
                <h2 className="font-display font-black text-[31px] md:text-[32px] lg:text-[38px] text-stone-900 leading-[1.08] tracking-tight whitespace-pre-line">
                  {`Tek Your\nHealthy Food`}
                </h2>
              </div>

              {/* Responsive layout Grid (Portrait on mobile, 2 Columns on desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6 lg:gap-10 flex-grow mt-6 items-stretch overflow-visible">
                
                {/* COLUMN 2: Dish Customization Option List (Portion Sizes, Extra Toppings, & Interactive Specifications) */}
                <div className="col-span-12 md:col-span-7 flex flex-col justify-between text-left space-y-4 md:space-y-0 md:border-r border-stone-800/15 md:pr-8 md:pl-2 md:py-1 overflow-visible">
                  
                  {/* Row 1: Title and dynamic pricing details */}
                  <div className="flex items-center justify-between border-b border-stone-800/5 pb-2">
                    <div>
                      <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest font-outfit flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-tomato-orange" /> Personalize Dish
                      </span>
                      <span className="font-display font-black text-lg md:text-xl text-stone-900 leading-tight block mt-0.5">
                        {chosenSize} Option
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">Total Price</span>
                      <span className="font-mono text-sm md:text-base font-black text-tomato-red block leading-tight">
                        Rp. {(calculateCustomizationPrice(activePlateItem, chosenSize, chosenToppings) * 1000).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Two-column Subgrid for Left Specs vs Right Toppings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-4 lg:gap-5 flex-grow py-3 overflow-visible">
                    
                    {/* SUB-COLUMN A: Dish Portion Selector + Interactive Specifications */}
                    <div className="space-y-4 flex flex-col justify-between">
                      
                      {/* Portion size selection */}
                      <div>
                        <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest font-outfit block mb-1.5">Portion Size</span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {['Regular', 'Large', 'Premium/Double'].map((s) => {
                            const isSelected = chosenSize === s;
                            let extraPrice = 0;
                            if (s === 'Large') extraPrice = 1.50;
                            if (s === 'Premium/Double') extraPrice = 3.00;
                            
                            return (
                              <button
                                key={s}
                                onClick={() => setChosenSize(s)}
                                className={`w-full text-[9px] font-bold font-outfit uppercase px-2.5 py-1.5 rounded-xl transition-all border text-left flex items-center justify-between cursor-pointer ${
                                  isSelected 
                                    ? 'bg-black text-white border-black shadow-md shadow-black/15' 
                                    : 'bg-white/40 border-stone-200 text-stone-700 hover:bg-white/80 hover:border-stone-300'
                                }`}
                              >
                                <span className="font-extrabold">{s === 'Premium/Double' ? 'Double' : s}</span>
                                {extraPrice > 0 ? (
                                  <span className={`text-[8px] font-mono ${isSelected ? 'text-tomato-orange font-bold' : 'text-stone-500'}`}>
                                    +Rp. {(extraPrice * 1000).toLocaleString('id-ID')}
                                  </span>
                                ) : (
                                  <span className="text-[8px] opacity-40">Included</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Interactive Dish Specifications Block */}
                      <div className="bg-white/40 border border-stone-200/55 rounded-2xl p-3 space-y-2.5 shadow-sm">
                        <span className="text-[9px] font-black text-stone-600 uppercase tracking-widest font-outfit block mb-1">
                          Dish Stats
                        </span>
                        
                        {/* Calories / Heat / Prep specification fields */}
                        <div className="grid grid-cols-2 gap-2 text-stone-800 font-outfit">
                          <div className="bg-white/50 p-1.5 rounded-xl border border-stone-100/50 flex flex-col items-center justify-center text-center">
                            <Clock className="w-3.5 h-3.5 text-stone-600 mb-0.5" />
                            <span className="text-[8px] text-stone-500 uppercase font-bold leading-none">Prep Time</span>
                            <span className="text-[10px] font-extrabold mt-0.5 text-stone-900 leading-none">
                              {activePlateItem.category === 'burger' ? '12 Mins' :
                               activePlateItem.category === 'pizza' ? '15 Mins' :
                               activePlateItem.category === 'salad' ? '8 Mins' : '10 Mins'}
                            </span>
                          </div>

                          <div className="bg-white/50 p-1.5 rounded-xl border border-stone-100/50 flex flex-col items-center justify-center text-center">
                            <Flame className="w-3.5 h-3.5 text-orange-500 mb-0.5" />
                            <span className="text-[8px] text-stone-500 uppercase font-bold leading-none">Calories</span>
                            <span className="text-[10px] font-extrabold mt-0.5 text-stone-900 leading-none">
                              {activePlateItem.category === 'burger' ? '580 Kcal' :
                               activePlateItem.category === 'pizza' ? '720 Kcal' :
                               activePlateItem.category === 'salad' ? '240 Kcal' : '380 Kcal'}
                            </span>
                          </div>

                          <div className="bg-white/50 p-1.5 rounded-xl border border-stone-100/50 flex flex-col items-center justify-center text-center col-span-2">
                            <span className="text-[8px] text-stone-500 uppercase font-bold leading-none mb-1">Dietary Status</span>
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[10px] font-extrabold text-stone-800 uppercase tracking-wider">
                                {activePlateItem.category === 'salad' || activePlateItem.category === 'drink' ? '100% Organic 🌱' : 'Premium Fresh 🌟'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Spice level setting (interactive stats) */}
                        <div className="pt-1.5 border-t border-stone-200/40">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[8px] text-stone-500 uppercase font-bold">Spice Level</span>
                            <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">
                              {chosenSpice || 'Medium'}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {['Mild', 'Medium', 'Hot'].map((spice) => {
                              const isSelected = (chosenSpice || 'Medium') === spice;
                              return (
                                <button
                                  key={spice}
                                  onClick={() => setChosenSpice(spice)}
                                  className={`flex-1 text-[8px] font-extrabold font-outfit uppercase py-1 rounded-lg border text-center transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-orange-600 text-white border-orange-600'
                                      : 'bg-white/30 text-stone-600 border-stone-200 hover:bg-white/70'
                                  }`}
                                >
                                  {spice}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* SUB-COLUMN B: Dynamic Interactive Toppings Checklist */}
                    <div className="flex flex-col h-full max-h-[310px] sm:max-h-full">
                      <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest font-outfit block mb-1.5">Extra Ingredients</span>
                      <div className="flex-grow overflow-y-auto space-y-1.5 pr-1 max-h-[260px]">
                        {getToppingsForCategory(activePlateItem).map((topping) => {
                          const isChecked = chosenToppings.includes(topping.name);
                          return (
                            <button
                              key={topping.name}
                              onClick={() => handleToggleTopping(topping.name)}
                              className={`w-full flex items-center justify-between p-2 rounded-xl transition-all border text-left cursor-pointer ${
                                isChecked
                                  ? 'bg-white/85 border-stone-900 shadow-sm scale-[1.01]'
                                  : 'bg-white/20 border-stone-200/60 hover:bg-white/45'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {/* Custom checkmark indicator box */}
                                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                  isChecked 
                                    ? 'bg-black border-black text-white' 
                                    : 'border-stone-400 bg-white/50'
                                }`}>
                                  {isChecked && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                                </div>
                                <span className="font-outfit text-xs font-bold text-stone-850 truncate max-w-[85px] md:max-w-[100px]">
                                  {topping.name}
                                </span>
                              </div>
                              <span className="font-mono text-[10px] font-black text-stone-700 ml-1">
                                +Rp. {(topping.price * 1000).toLocaleString('id-ID')}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Row 3: Special note instructions & quantity counter */}
                  <div className="border-t border-stone-800/5 pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    
                    {/* Special Instructions text area */}
                    <div className="flex-1 min-w-[120px]">
                      <input
                        type="text"
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="Special instructions (e.g. no onions)..."
                        className="w-full bg-white/50 hover:bg-white/85 focus:bg-white border border-stone-300/40 rounded-xl px-3 py-2 text-stone-800 font-outfit text-[11px] placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 transition-all font-bold"
                      />
                    </div>

                    {/* Quantity counter */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest font-outfit sm:hidden">Quantity</span>
                      <div className="flex items-center bg-black rounded-full p-0.5 shadow-md shadow-black/25 w-fit border border-white/5 select-none active:scale-98 transition-all">
                        <button
                          onClick={() => setCustomizingQuantity(prev => Math.max(1, prev - 1))}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 text-white font-extrabold text-sm active:scale-90 transition-transform cursor-pointer"
                          title="Decrease Quantity"
                        >
                          -
                        </button>
                        <span className="font-outfit text-xs font-black text-white px-2.5 tracking-wider min-w-[24px] text-center">
                          {String(customizingQuantity).padStart(2, '0')}
                        </span>
                        <button
                          onClick={() => setCustomizingQuantity(prev => prev + 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 text-white font-extrabold text-sm active:scale-90 transition-transform cursor-pointer"
                          title="Increase Quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

                {/* COLUMN 3: Overlapping Massive interactive plate & small next-plate preview */}
                <div className="col-span-12 md:col-span-5 relative flex items-center justify-center md:justify-end min-h-[300px] md:min-h-[360px] overflow-visible py-6 md:py-0 md:pr-4 lg:pr-8">
                  
                  {/* Outer container sizing for active plate wrapper */}
                  <div className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px] lg:w-[380px] lg:h-[380px] z-10 flex items-center justify-center">
                    
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activePlateItem.id}
                        initial={{ opacity: 0, scale: 0.8, rotate: plateRotation - 75, x: 20 }}
                        animate={{ opacity: 1, scale: 1, rotate: plateRotation, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotate: plateRotation + 75, x: 20 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 85 }}
                        className="relative w-full h-full p-1.5 cursor-pointer select-none group"
                        onClick={() => handleOpenCustomization(activePlateItem)}
                      >
                        {/* Photorealistic smooth drop shadow wrapper */}
                        <div className="absolute inset-5 rounded-full bg-black/40 blur-2xl translate-y-9 translate-x-1.5 pointer-events-none transition-transform group-hover:scale-105" />
                        
                        {/* The high quality plate image */}
                        <img
                          src={activePlateItem.image}
                          alt={activePlateItem.name}
                          className="w-full h-full object-cover rounded-full border border-white/20 shadow-2xl relative z-20 pointer-events-none"
                          referrerPolicy="no-referrer"
                        />

                        {/* Interactive Configure Prompt Overlay */}
                        <div className="absolute inset-1.5 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex flex-col items-center justify-center text-white text-center p-3">
                          <Sparkles className="w-7 h-7 text-white mb-1 animate-pulse" />
                          <span className="font-outfit text-[9px] font-black uppercase tracking-widest">Customize Dish</span>
                        </div>

                        {/* Star Rating Tag on plate edge */}
                        <div className="absolute top-2.5 left-2.5 z-30 bg-black/95 text-white px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 font-mono text-[9px] font-bold shadow-md">
                          <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                          {activePlateItem.rating || '4.8'}
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Overlapping lower-right secondary preview next plate item */}
                    <div className="absolute right-[-12px] bottom-[-12px] md:right-[-24px] md:bottom-[-24px] z-30">
                      <button
                        onClick={handleNextPlateItem}
                        className="relative w-[84px] h-[84px] md:w-[100px] md:h-[100px] rounded-full border-2 border-white bg-stone-100 overflow-hidden shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer group"
                        title={`Next: ${nextPlateItem.name}`}
                      >
                        {/* Subtle interactive hover light mask */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 flex items-center justify-center">
                          <ChevronRight className="w-5 h-5 text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <img
                          src={nextPlateItem.image}
                          alt="Next plate"
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    </div>

                  </div>

                </div>

              </div>

              {/* Order Button / CTA moved to bottom center */}
              <div className="flex justify-center items-center w-full mt-6 md:mt-8 z-20">
                <div className="w-full max-w-sm px-1">
                  <button
                    onClick={() => {
                      const currentPrice = calculateCustomizationPrice(activePlateItem, chosenSize, chosenToppings);
                      onAddToCart({
                        productId: activePlateItem.id,
                        name: activePlateItem.name,
                        price: currentPrice,
                        quantity: customizingQuantity,
                        selectedSize: chosenSize || 'Regular',
                        selectedToppings: chosenToppings,
                        specialInstructions: specialInstructions || 'Quick order from interactive showcase',
                        image: activePlateItem.image
                      });
                      setShowNotification(true);
                      setTimeout(() => setShowNotification(false), 3000);
                    }}
                    className="w-full bg-black hover:bg-stone-900 text-white font-outfit text-xs font-black uppercase tracking-widest py-4 rounded-[22px] transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-white/5"
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-400" /> Order Active Plate
                  </button>
                </div>
              </div>

            </div>

            {/* Simulated Live Chef dialogue bubble */}
            <AnimatePresence>
              {showChat && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute bottom-22 inset-x-4 bg-white text-stone-900 rounded-3xl p-4 shadow-2xl z-40 border border-stone-200 text-left"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-display text-xs font-black text-stone-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-tomato-orange" /> Chef Godotty Lounge
                    </span>
                    <button onClick={() => setShowChat(false)} className="text-stone-400 hover:text-stone-700">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="font-outfit text-[11px] text-stone-600 leading-relaxed">
                    "Welcome! Customize your size and options here or click the Eye icon for our ingredient selection!"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notification reward inside mockup */}
            <AnimatePresence>
              {showNotification && (
                <motion.div 
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="absolute top-18 inset-x-4 bg-stone-900 text-white rounded-2xl p-3.5 shadow-2xl z-40 border border-white/10 text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display text-[10px] font-bold text-tomato-orange flex items-center gap-1 uppercase tracking-wider">
                      <Flame className="w-3 h-3 fill-current" /> VIP Offer
                    </span>
                    <button onClick={() => setShowNotification(false)} className="text-stone-400 hover:text-white">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="font-outfit text-[10px] text-stone-300 leading-normal">
                    Added to order! Earn valuable reward points on checkout for every chef special item you order!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>



        </div>
      )}

      {/* ======================= PRODUCT CUSTOMIZATION MODAL (INTERACTIVE OVERLAY) ======================= */}
      <AnimatePresence>
        {customizingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Dark modal Backdrop glass blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCustomizingProduct(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Body card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-xl bg-[#1c0f0f] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left"
            >
              
              {/* Image banner & Title header */}
              <div className="relative h-44 overflow-hidden shrink-0">
                <img
                  src={customizingProduct.image}
                  alt={customizingProduct.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Backdrop dark shadow */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c0f0f] via-black/40 to-black/30" />

                {/* Close Button */}
                <button
                  onClick={() => setCustomizingProduct(null)}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full border border-white/10 transition-colors cursor-pointer"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Title Overlay */}
                <div className="absolute bottom-4 left-6 right-6">
                  <h3 className="font-display text-2xl text-white tracking-wide">
                    {customizingProduct.name}
                  </h3>
                  <p className="font-outfit text-xs text-stone-300 line-clamp-1 leading-normal mt-0.5">
                    {customizingProduct.description}
                  </p>
                </div>
              </div>

              {/* Scrollable Configuration Areas */}
              <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin flex-1">
                
                {/* 1. Portion Size selection (Radio choices) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                    <span className="font-display text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-tomato-orange" /> 1. Portion Size Choice
                    </span>
                    <span className="bg-white/5 text-stone-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase">Required</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Regular', desc: 'Standard/Original portion size', premium: 0.00 },
                      { label: 'Large', desc: 'Slightly up-sized portioning', premium: 1.50 },
                      { label: 'Premium/Double', desc: 'Double sized portion', premium: 3.00 }
                    ].map((sz) => (
                      <button
                        key={sz.label}
                        onClick={() => setChosenSize(sz.label)}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer h-24 ${
                          chosenSize === sz.label
                            ? 'bg-tomato-orange/15 border-tomato-orange text-white ring-1 ring-tomato-orange/40'
                            : 'bg-stone-900/40 border-white/5 hover:border-white/20 text-stone-400'
                        }`}
                      >
                        <div>
                          <span className="font-outfit text-xs font-bold block">{sz.label}</span>
                          <span className="text-[9px] text-stone-500 font-outfit leading-tight mt-0.5 block">{sz.desc}</span>
                        </div>
                        <span className="font-mono text-xs font-semibold text-tomato-orange mt-1.5">
                          {sz.premium === 0 ? '+$0.00' : `+$${sz.premium.toFixed(2)}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Optional Toppings Checklist */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                    <span className="font-display text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-tomato-orange" /> 2. Optional Toppings & Extras
                    </span>
                    <span className="bg-white/5 text-stone-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase">Optional</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(customizingProduct.customizations?.addOns || [
                      { name: 'Extra Cheddar Cheese', price: 1.25 },
                      { name: 'Crispy Smoked Bacon', price: 2.00 },
                      { name: 'Fiery Jalapeño Slices', price: 0.75 },
                      { name: 'Fresh Avocado Scoop', price: 1.50 },
                      { name: 'Woodland Grilled Mushrooms', price: 1.00 }
                    ]).map((topping) => {
                      const isSelected = chosenToppings.includes(topping.name);
                      return (
                        <button
                          key={topping.name}
                          onClick={() => handleToggleTopping(topping.name)}
                          className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-white/5 border-tomato-orange text-white'
                              : 'bg-stone-900/40 border-white/5 hover:border-white/10 text-stone-400'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                              isSelected ? 'bg-tomato-orange border-tomato-orange text-white' : 'border-stone-600'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="font-outfit text-xs font-semibold">{topping.name}</span>
                          </div>
                          <span className="font-mono text-xs font-bold text-tomato-orange/80">
                            +${topping.price.toFixed(2)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Special preparation Instructions */}
                <div className="space-y-2">
                  <span className="font-display text-xs font-bold text-stone-400 uppercase tracking-widest block border-b border-white/5 pb-1.5">
                    3. Special Preparation Instructions
                  </span>
                  <textarea
                    rows={2.5}
                    placeholder="E.g. Sauce on the side, no onions, extra toasted..."
                    className="w-full bg-stone-900/80 border border-white/5 rounded-2xl p-3.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-tomato-orange/30 font-outfit"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                  />
                </div>

              </div>

              {/* Dynamic totals drawer and primary insert trigger */}
              <div className="bg-[#150a0a] border-t border-white/10 p-6 space-y-4 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest font-outfit">Dynamic Total</span>
                    <span className="font-mono text-2xl font-black text-white">
                      ${(calculateCustomizationPrice(customizingProduct, chosenSize, chosenToppings) * customizingQuantity).toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-3.5 rounded-full bg-stone-900 p-1.5 border border-white/5">
                    <button
                      onClick={() => setCustomizingQuantity(prev => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 text-stone-300 transition-colors cursor-pointer"
                      title="Decrease quantity"
                    >
                      <Minus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <span className="font-mono text-sm font-bold text-white px-1">
                      {customizingQuantity}
                    </span>
                    <button
                      onClick={() => setCustomizingQuantity(prev => prev + 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 text-stone-300 transition-colors cursor-pointer"
                      title="Increase quantity"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleConfirmCustomization}
                  className="w-full bg-tomato-orange hover:bg-red-600 text-white font-outfit text-xs font-bold uppercase tracking-widest py-3.5 rounded-2xl transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4.5 h-4.5" /> Confirm & Add to Cart
                </button>
              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
