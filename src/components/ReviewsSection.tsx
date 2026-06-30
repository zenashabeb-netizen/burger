import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  Filter, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  User, 
  X, 
  Sparkles, 
  Check, 
  Clock,
  ChevronDown
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';

export interface FoodieReview {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  productId: string;
  title: string;
  comment: string;
  helpfulCount: number;
  isVerified: boolean;
  isCustom?: boolean;
}

const PRESET_AVATARS = [
  { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120', label: 'Sarah' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120', label: 'Michael' },
  { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120', label: 'Jessica' },
  { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120', label: 'David' },
  { url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120', label: 'Emma' },
  { url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120', label: 'James' },
];

const SEED_REVIEWS: FoodieReview[] = [
  {
    id: 'rev-1',
    name: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    rating: 5,
    date: '2026-06-25T14:22:00.000Z',
    productId: 'pizza-1',
    title: 'An absolute game-changer!',
    comment: 'This Pepperoni Pizza crust is an absolute masterpiece. I don\'t know how they get the crust so light and airy but they deserve a culinary medal! It is crispy, chewy, and has that perfect smoky, wood-fired aroma.',
    helpfulCount: 42,
    isVerified: true
  },
  {
    id: 'rev-2',
    name: 'Michael Brown',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    rating: 5,
    date: '2026-06-22T09:45:00.000Z',
    productId: 'burger-1',
    title: 'Unbelievably delicious!',
    comment: 'The Famous Cheese Burger is incredible. The beef is super juicy and the cheddar cheese melts incredibly well. Delivery is always fast and it arrives fresh and warm.',
    helpfulCount: 28,
    isVerified: true
  },
  {
    id: 'rev-3',
    name: 'Jessica Kael',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    rating: 4,
    date: '2026-06-20T18:30:00.000Z',
    productId: 'pizza-bbq',
    title: 'Top-tier BBQ chicken flavor',
    comment: 'The sourdough crust is extremely airy and bubbly, exactly like wood-fired pizza in Naples. Docked one star because the onions were a bit too strong, but the BBQ chicken quality is elite.',
    helpfulCount: 15,
    isVerified: true
  },
  {
    id: 'rev-4',
    name: 'David Wilson',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    rating: 5,
    date: '2026-06-18T12:15:00.000Z',
    productId: 'onion-rings-1',
    title: 'Best loaded onion rings ever',
    comment: 'I order the Crispy Onion Rings every single weekend. They are thick-cut, sweet, perfectly battered, and golden brown. Crispy, flavorful, and not greasy at all.',
    helpfulCount: 9,
    isVerified: true
  }
];

// Helper to match a product category with the UI category filter
const isCategoryMatch = (productCategory: string, selectedCat: string) => {
  if (selectedCat === 'All') return true;
  const prodCat = productCategory.toLowerCase();
  const selCat = selectedCat.toLowerCase();
  if (selCat === 'pizza') return prodCat === 'pizza';
  if (selCat === 'burger') return prodCat === 'burger';
  if (selCat === 'sides') return prodCat === 'side' || prodCat === 'salad' || prodCat === 'seafood';
  if (selCat === 'drinks') return prodCat === 'drink';
  return prodCat === selCat;
};

export default function ReviewsSection() {
  const { products } = useRestaurant();
  const [reviews, setReviews] = useState<FoodieReview[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [votedHelpful, setVotedHelpful] = useState<string[]>([]);

  // Form State
  const [formName, setFormName] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [formProductId, setFormProductId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formAvatar, setFormAvatar] = useState(PRESET_AVATARS[0].url);
  const [formVerified, setFormVerified] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProductId, setSelectedProductId] = useState('All');
  const [selectedRating, setSelectedRating] = useState<number | 'All'>('All');
  const [sortBy, setSortBy] = useState<'Newest' | 'Highest' | 'Helpful'>('Newest');

  // Load reviews on mount & migrate old schemas
  useEffect(() => {
    const loadReviews = () => {
      try {
        const stored = localStorage.getItem('tomato_godotty_reviews');
        if (stored) {
          const storedParsed = JSON.parse(stored) as any[];
          // Migrate legacy reviews that might only have category
          const migrated = storedParsed.map(item => {
            if (!item.productId) {
              if (item.category === 'Burger') item.productId = 'burger-1';
              else if (item.category === 'Pizza') item.productId = 'pizza-1';
              else if (item.category === 'Sides') item.productId = 'onion-rings-1';
              else if (item.category === 'Drinks') item.productId = 'drink-1';
              else item.productId = 'pizza-1';
            }
            return item as FoodieReview;
          });
          setReviews(migrated);
        } else {
          setReviews(SEED_REVIEWS);
          localStorage.setItem('tomato_godotty_reviews', JSON.stringify(SEED_REVIEWS));
        }
      } catch {
        setReviews(SEED_REVIEWS);
      }
    };

    loadReviews();

    try {
      const storedVotes = localStorage.getItem('tomato_godotty_voted_helpful');
      if (storedVotes) {
        setVotedHelpful(JSON.parse(storedVotes));
      }
    } catch {
      // Ignore
    }

    const handleSync = () => {
      loadReviews();
    };
    window.addEventListener('tomato_reviews_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('tomato_reviews_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Sync reviews helper
  const saveReviews = (updated: FoodieReview[]) => {
    setReviews(updated);
    localStorage.setItem('tomato_godotty_reviews', JSON.stringify(updated));
    window.dispatchEvent(new Event('tomato_reviews_updated'));
  };

  // Set default product when form opens
  useEffect(() => {
    if (showAddForm && products.length > 0 && !formProductId) {
      setFormProductId(products[0].id);
    }
  }, [showAddForm, products, formProductId]);

  // Reset specific product filter when category changes
  useEffect(() => {
    setSelectedProductId('All');
  }, [selectedCategory]);

  // Handle helpful click
  const handleHelpfulClick = (reviewId: string) => {
    if (votedHelpful.includes(reviewId)) return;

    const updatedVotes = [...votedHelpful, reviewId];
    setVotedHelpful(updatedVotes);
    localStorage.setItem('tomato_godotty_voted_helpful', JSON.stringify(updatedVotes));

    const updatedReviews = reviews.map(r => {
      if (r.id === reviewId) {
        return { ...r, helpfulCount: r.helpfulCount + 1 };
      }
      return r;
    });
    saveReviews(updatedReviews);
  };

  // Submit Review Form
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formProductId || !formTitle.trim() || !formComment.trim()) return;

    const newReview: FoodieReview = {
      id: `rev-custom-${Date.now()}`,
      name: formName,
      avatar: formAvatar,
      rating: formRating,
      date: new Date().toISOString(),
      productId: formProductId,
      title: formTitle,
      comment: formComment,
      helpfulCount: 0,
      isVerified: formVerified,
      isCustom: true
    };

    const updatedReviews = [newReview, ...reviews];
    saveReviews(updatedReviews);

    // Reset Form
    setFormName('');
    setFormRating(5);
    setFormTitle('');
    setFormComment('');
    setFormAvatar(PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)].url);
    setShowAddForm(false);
  };

  // Delete Custom Review
  const handleDeleteReview = (reviewId: string) => {
    const updated = reviews.filter(r => r.id !== reviewId);
    saveReviews(updated);
  };

  // Memoized Calculations - filtered specifically by category / product selection
  const stats = useMemo(() => {
    let filteredForStats = [...reviews];
    if (selectedCategory !== 'All') {
      filteredForStats = filteredForStats.filter(r => {
        const product = products.find(p => p.id === r.productId);
        return product && isCategoryMatch(product.category, selectedCategory);
      });
    }
    if (selectedProductId !== 'All') {
      filteredForStats = filteredForStats.filter(r => r.productId === selectedProductId);
    }

    if (filteredForStats.length === 0) return { avg: 0, total: 0, distribution: [0, 0, 0, 0, 0] };
    const total = filteredForStats.length;
    const sum = filteredForStats.reduce((acc, r) => acc + r.rating, 0);
    const avg = parseFloat((sum / total).toFixed(1));

    const counts = [0, 0, 0, 0, 0]; // 5 stars down to 1 star
    filteredForStats.forEach(r => {
      const idx = Math.max(1, Math.min(5, r.rating));
      counts[5 - idx] += 1;
    });

    const distribution = counts.map(count => Math.round((count / total) * 100));

    return { avg, total, distribution };
  }, [reviews, selectedCategory, selectedProductId, products]);

  // Filtered and Sorted list for display
  const processedReviews = useMemo(() => {
    let result = [...reviews];

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(r => {
        const product = products.find(p => p.id === r.productId);
        return product && isCategoryMatch(product.category, selectedCategory);
      });
    }

    // Filter by Specific Product ID
    if (selectedProductId !== 'All') {
      result = result.filter(r => r.productId === selectedProductId);
    }

    // Filter by Stars
    if (selectedRating !== 'All') {
      result = result.filter(r => r.rating === selectedRating);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'Newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'Highest') {
        return b.rating - a.rating;
      }
      if (sortBy === 'Helpful') {
        return b.helpfulCount - a.helpfulCount;
      }
      return 0;
    });

    return result;
  }, [reviews, selectedCategory, selectedProductId, selectedRating, sortBy, products]);

  // List of dishes matching the current category selection for the dropdown filter
  const filteredProductsForFilter = useMemo(() => {
    if (selectedCategory === 'All') return products;
    return products.filter(p => isCategoryMatch(p.category, selectedCategory));
  }, [products, selectedCategory]);

  return (
    <section id="reviews-interactive" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
      
      {/* Page Title & Header */}
      <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <span className="font-outfit text-tomato-orange font-bold uppercase tracking-widest text-xs flex items-center gap-1 justify-center md:justify-start">
            <Sparkles className="h-3.5 w-3.5" />
            Foodie Community Feedback
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-white mt-1">
            Gourmet <span className="text-tomato-orange">Reviews</span>
          </h1>
          <p className="font-outfit text-sm text-stone-400 mt-2 max-w-xl">
            Real reviews from actual wood-fire foodies. Tell us about your sourdough pizza and stacked burger experience!
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="self-center md:self-auto rounded-full bg-tomato-orange hover:bg-tomato-orange/90 text-tomato-dark font-outfit text-sm font-black uppercase tracking-widest px-6 py-3.5 transition-all shadow-xl shadow-tomato-orange/10 hover:scale-[1.02] cursor-pointer flex items-center gap-2 shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          Write A Review
        </button>
      </div>

      {/* RATING DASHBOARD BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 bg-[#1e0a0a]/90 border border-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-tomato-orange via-tomato-red to-tomato-orange" />
        
        {/* Dynamic Aggregations */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b lg:border-b-0 lg:border-r border-white/5">
          <span className="font-outfit text-stone-400 text-xs font-semibold uppercase tracking-wider mb-2">Overall Foodie Score</span>
          <span className="font-display text-6xl md:text-7xl text-white font-black leading-none block">{stats.avg}</span>
          
          <div className="flex items-center gap-1.5 my-3">
            {[...Array(5)].map((_, idx) => {
              const starVal = idx + 1;
              const isFull = starVal <= Math.floor(stats.avg);
              return (
                <Star 
                  key={idx} 
                  className={`h-5 w-5 ${isFull ? 'text-tomato-orange fill-tomato-orange' : 'text-white/20'}`} 
                />
              );
            })}
          </div>

          <span className="font-outfit text-xs text-stone-400">Based on {stats.total} verified reviews</span>
        </div>

        {/* Horizontal Progress bar distribution */}
        <div className="lg:col-span-8 flex flex-col justify-center gap-3.5 p-2">
          {[5, 4, 3, 2, 1].map((stars, idx) => {
            const pct = stats.distribution[idx] || 0;
            return (
              <div key={stars} className="flex items-center gap-4 text-xs font-outfit">
                <span className="w-10 text-stone-300 font-bold text-right flex items-center justify-end gap-1 shrink-0">
                  {stars} <Star className="h-3 w-3 fill-current text-tomato-orange" />
                </span>
                
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-tomato-orange to-tomato-red" 
                  />
                </div>

                <span className="w-12 text-stone-400 font-semibold text-left shrink-0">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTERS & SEARCH ROW */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 bg-black/20 border border-white/5 rounded-2xl p-4">
        
        {/* Category Pill Buttons & Specific Food selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          {/* Category Pill Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar shrink-0">
            <span className="font-outfit text-stone-500 text-xs uppercase tracking-wider mr-2 hidden md:inline">Category:</span>
            {['All', 'Pizza', 'Burger', 'Sides', 'Drinks'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-outfit font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-tomato-orange text-tomato-dark'
                    : 'bg-white/5 hover:bg-white/10 text-stone-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Specific Dish Selector Dropdown */}
          <div className="flex items-center gap-2 text-xs font-outfit w-full sm:w-auto">
            <span className="text-stone-500 shrink-0">Dish:</span>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="bg-[#2a1414] border border-white/10 rounded-xl px-3.5 py-2 font-outfit text-xs text-white focus:outline-none focus:border-tomato-orange transition-colors cursor-pointer w-full sm:w-56"
            >
              <option value="All">All {selectedCategory !== 'All' ? selectedCategory : 'Dishes'}</option>
              {filteredProductsForFilter.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right controls: Star filter & Sort */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Star filtering drop-down */}
          <div className="flex items-center gap-2 text-xs font-outfit">
            <span className="text-stone-500 hidden lg:inline">Rating:</span>
            <select
              value={selectedRating}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedRating(val === 'All' ? 'All' : parseInt(val));
              }}
              className="bg-[#2a1414] border border-white/10 rounded-xl px-3.5 py-2 font-outfit text-xs text-white focus:outline-none focus:border-tomato-orange transition-colors cursor-pointer"
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Stars only</option>
              <option value="4">4 Stars only</option>
              <option value="3">3 Stars only</option>
              <option value="2">2 Stars & below</option>
            </select>
          </div>

          {/* Sorting drop-down */}
          <div className="flex items-center gap-2 text-xs font-outfit">
            <span className="text-stone-500 hidden lg:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#2a1414] border border-white/10 rounded-xl px-3.5 py-2 font-outfit text-xs text-white focus:outline-none focus:border-tomato-orange transition-colors cursor-pointer"
            >
              <option value="Newest">Newest Feedback</option>
              <option value="Highest">Highest Rated</option>
              <option value="Helpful">Most Helpful</option>
            </select>
          </div>
        </div>
      </div>

      {/* REVIEWS GRID LAYOUT */}
      <AnimatePresence mode="popLayout">
        {processedReviews.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16 bg-black/20 border border-white/10 backdrop-blur-sm rounded-3xl p-8"
          >
            <MessageSquare className="h-12 w-12 text-stone-500 mx-auto mb-4" />
            <h3 className="font-display text-lg text-white font-medium">No reviews found matching filters</h3>
            <p className="font-outfit text-xs text-stone-400 mt-1 max-w-md mx-auto">
              Try changing your rating/category filters or write the first review for this food category yourself!
            </p>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
          >
            {processedReviews.map((review) => {
              const hasVoted = votedHelpful.includes(review.id);
              const product = products.find(p => p.id === review.productId);
              
              return (
                <motion.div
                  key={review.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-black/45 border border-white/10 hover:border-white/20 backdrop-blur-md rounded-2xl p-6 shadow-md flex flex-col justify-between relative group transition-all duration-300"
                >
                  {/* Category Pill Tag */}
                  <span className="absolute top-4 right-4 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full font-outfit text-[9px] font-black uppercase tracking-wider text-tomato-orange">
                    {product ? product.category : 'Gourmet'}
                  </span>

                  <div>
                    {/* Stars row */}
                    <div className="flex items-center gap-0.5 text-tomato-orange mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-white/10'}`} 
                        />
                      ))}
                    </div>

                    {/* Dish Badge */}
                    {product && (
                      <div className="flex items-center gap-3 mb-4 bg-white/5 border border-white/10 rounded-xl p-2.5 transition-all group-hover:bg-white/10">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-11 w-11 rounded-lg object-cover border border-white/10 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-left overflow-hidden">
                          <span className="font-outfit text-[9px] uppercase tracking-widest text-tomato-orange font-bold block">Reviewed Dish</span>
                          <span className="font-outfit text-xs font-black text-white block truncate leading-tight mt-0.5" title={product.name}>
                            {product.name}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Review Title */}
                    <h3 className="font-display text-base font-bold text-white tracking-wide mb-2 line-clamp-1">
                      {review.title}
                    </h3>

                    {/* Comment Body */}
                    <p className="font-outfit text-sm text-stone-300 leading-relaxed mb-6">
                      "{review.comment}"
                    </p>
                  </div>

                  {/* Review Footer / Profile Row */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <img
                        className="h-10 w-10 rounded-full object-cover border border-white/10"
                        src={review.avatar}
                        alt={review.name}
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-outfit text-xs font-bold text-white">{review.name}</h4>
                          {review.isVerified && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 fill-emerald-500/10" />
                          )}
                        </div>
                        <span className="font-outfit text-[10px] text-stone-400 block mt-0.5 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(review.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Helpful upvote & Delete actions */}
                    <div className="flex items-center gap-2.5">
                      {review.isCustom && (
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                          title="Delete My Review"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleHelpfulClick(review.id)}
                        disabled={hasVoted}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-outfit font-bold transition-all ${
                          hasVoted
                            ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400'
                            : 'bg-white/5 border-white/5 hover:border-white/10 text-stone-300 hover:text-white cursor-pointer'
                        }`}
                      >
                        <ThumbsUp className={`h-3 w-3 ${hasVoted ? 'fill-current' : ''}`} />
                        <span>{review.helpfulCount}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* WRITE REVIEW MODAL DIALOG */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a0808] border border-white/10 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative overflow-hidden text-left"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-tomato-orange via-tomato-red to-tomato-orange" />
              
              {/* Close Button */}
              <button
                onClick={() => setShowAddForm(false)}
                className="absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full bg-white/5 text-stone-400 hover:text-white border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-6">
                <span className="font-outfit text-tomato-orange text-xs font-black uppercase tracking-widest">Share Your Delight</span>
                <h2 className="font-display text-2xl text-white mt-1">Submit Your Review</h2>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                
                {/* Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-outfit text-[11px] text-stone-300 font-semibold uppercase tracking-wider">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Liam Sterling"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 font-outfit text-sm text-white placeholder-stone-500 focus:outline-none focus:border-tomato-orange transition-colors"
                    />
                  </div>

                  {/* Food Product Selection */}
                  <div className="flex flex-col gap-1">
                    <label className="font-outfit text-[11px] text-stone-300 font-semibold uppercase tracking-wider">Select Food Item *</label>
                    <select
                      value={formProductId}
                      onChange={(e) => setFormProductId(e.target.value)}
                      className="w-full rounded-xl bg-[#2a1414] border border-white/10 px-4 py-2.5 font-outfit text-sm text-white focus:outline-none focus:border-tomato-orange transition-colors cursor-pointer"
                      required
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.category.toUpperCase()}] {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Visual Product Preview */}
                {formProductId && (() => {
                  const selectedProd = products.find(p => p.id === formProductId);
                  if (!selectedProd) return null;
                  return (
                    <div className="bg-black/35 rounded-2xl p-3 border border-white/5 flex items-center gap-3.5">
                      <img
                        src={selectedProd.image}
                        alt={selectedProd.name}
                        className="h-14 w-14 rounded-xl object-cover border border-white/10 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left overflow-hidden">
                        <span className="font-outfit text-[9px] uppercase tracking-widest text-tomato-orange font-bold block">Selected For Review</span>
                        <h4 className="font-outfit text-sm font-bold text-white truncate mt-0.5">{selectedProd.name}</h4>
                        <p className="font-outfit text-[11px] text-stone-400 line-clamp-1 mt-0.5">{selectedProd.description}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Rating selection (Interactive Clickable/Hover stars) */}
                <div className="bg-black/35 rounded-xl p-3.5 border border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span className="font-outfit text-[11px] text-stone-300 font-bold uppercase tracking-wider block">Star Rating *</span>
                    <span className="font-outfit text-[10px] text-stone-500">Tap stars to set score</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = hoverRating !== null ? star <= hoverRating : star <= formRating;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setFormRating(star)}
                          className="p-1 focus:outline-none cursor-pointer transition-transform duration-100 hover:scale-125"
                        >
                          <Star 
                            className={`h-7 w-7 ${
                              active ? 'text-tomato-orange fill-tomato-orange' : 'text-white/10'
                            }`} 
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Avatar Selection Grid */}
                <div className="flex flex-col gap-1">
                  <label className="font-outfit text-[11px] text-stone-300 font-semibold uppercase tracking-wider mb-1">Choose Foodie Avatar</label>
                  <div className="grid grid-cols-6 gap-3 p-2 bg-black/20 rounded-xl border border-white/5">
                    {PRESET_AVATARS.map((av, idx) => {
                      const isSelected = formAvatar === av.url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormAvatar(av.url)}
                          className={`relative rounded-full aspect-square overflow-hidden border-2 cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-tomato-orange scale-105 shadow-md shadow-tomato-orange/20' 
                              : 'border-transparent hover:scale-102 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-tomato-orange/15 flex items-center justify-center">
                              <Check className="h-4 w-4 text-white stroke-[3] drop-shadow" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Review Title */}
                <div className="flex flex-col gap-1">
                  <label className="font-outfit text-[11px] text-stone-300 font-semibold uppercase tracking-wider">Review Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Best pizza crust in the town!"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 font-outfit text-sm text-white placeholder-stone-500 focus:outline-none focus:border-tomato-orange transition-colors"
                  />
                </div>

                {/* Comment */}
                <div className="flex flex-col gap-1">
                  <label className="font-outfit text-[11px] text-stone-300 font-semibold uppercase tracking-wider">Detailed Feedback *</label>
                  <textarea
                    required
                    rows={3}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Tell us what you liked (or what we could improve) about the service and flavors!"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 font-outfit text-sm text-white placeholder-stone-500 focus:outline-none focus:border-tomato-orange transition-colors resize-none"
                  />
                </div>

                {/* Verified toggle checkbox */}
                <label className="flex items-center gap-2 px-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formVerified}
                    onChange={(e) => setFormVerified(e.target.checked)}
                    className="rounded text-tomato-orange bg-white/5 border-white/10 focus:ring-tomato-orange"
                  />
                  <span className="font-outfit text-xs text-stone-400">Mark review as Verified Gourmet Diner</span>
                </label>

                {/* Submit Row */}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 py-3 font-outfit text-xs font-bold tracking-wider text-white uppercase transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-full bg-tomato-orange hover:bg-tomato-orange/95 py-3 font-outfit text-xs font-black tracking-wider text-tomato-dark uppercase shadow-lg shadow-tomato-orange/15 transition-all cursor-pointer"
                  >
                    Submit Review
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
