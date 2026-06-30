import { MenuItem } from './types';

export const HERO_IMAGE = 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80';
export const THREE_BURGERS_IMAGE = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80';

export const POPULAR_ITEMS: MenuItem[] = [
  {
    id: 'fries-1',
    name: 'Crispy Golden Fries',
    description: 'Golden potatoes fried to perfection and seasoned with sea salt and garlic powder.',
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
    category: 'side',
    rating: 4.8,
    tags: ['Best Seller', 'Crispy']
  },
  {
    id: 'burger-1',
    name: 'Famous Cheese Burger',
    description: 'Juicy double beef patty with melted cheddar, lettuce, fresh tomatoes, and secret burger sauce.',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=600&q=80',
    category: 'burger',
    rating: 4.9,
    tags: ['Gourmet', 'Most Loved']
  },
  {
    id: 'onion-rings-1',
    name: 'Crispy Onion Rings',
    description: 'Sweet white onions thick-cut, double beer-battered, and fried to crispy golden brown.',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=600&q=80',
    category: 'side',
    rating: 4.6,
    tags: ['Crunchy', 'Appetizer']
  },
  {
    id: 'pizza-1',
    name: 'Classic Pepperoni Pizza',
    description: 'Fresh hand-tossed dough topped with premium tomato sauce, whole milk mozzarella, and spicy pepperoni.',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=600&q=80',
    category: 'pizza',
    rating: 4.9,
    tags: ['Classic', 'Wood Fired']
  }
];

export const ALL_MENU_ITEMS: MenuItem[] = [
  ...POPULAR_ITEMS,
  {
    id: 'burger-double',
    name: 'Mega Volcano Burger',
    description: 'Triple beef patty, triple cheddar, caramelized onions, jalapeños, and spicy sriracha mayo.',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=600&q=80',
    category: 'burger',
    rating: 5.0,
    tags: ['Spicy', 'Signature']
  },
  {
    id: 'pizza-bbq',
    name: 'BBQ Chicken Feast',
    description: 'Smoky BBQ sauce, grilled chicken breast strips, red onions, cilantro, and smoked gouda cheese.',
    price: 14.49,
    image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=600&q=80',
    category: 'pizza',
    rating: 4.7,
    tags: ['Tangy', 'Hearty'],
    rpPrice: 'Rp. 145.000'
  },
  {
    id: 'salad-1',
    name: 'Gourmet Healthy Salad',
    description: 'Fresh grilled chicken breast, chopped bell peppers, pickled red onions, crumbly feta cheese, and garden-fresh greens with citrus hummus dressing.',
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80',
    category: 'salad',
    rating: 4.9,
    tags: ['Fit Choice', 'Low Carb'],
    rpPrice: 'Rp. 50.000'
  },
  {
    id: 'salad-2',
    name: 'Mediterranean Avocado Bowl',
    description: 'Creamy avocado slices, organic quinoa, wild greens, cherry tomatoes, cucumbers, and a zesty garlic vinaigrette.',
    price: 5.49,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600',
    category: 'salad',
    rating: 4.8,
    tags: ['Superfood', 'Vegan'],
    rpPrice: 'Rp. 55.000'
  },
  {
    id: 'seafood-1',
    name: 'Garlic Butter Salmon Bowl',
    description: 'Pan-seared Atlantic salmon on a bed of seasoned warm wild rice, baby asparagus, sesame glazed cucumbers, and cilantro cream.',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb22?auto=format&fit=crop&w=600&q=80',
    category: 'seafood',
    rating: 4.9,
    tags: ['Chef Special', 'High Protein'],
    rpPrice: 'Rp. 90.000'
  },
  {
    id: 'seafood-2',
    name: 'Lemon Pepper Grilled Prawns',
    description: 'Wood-fired prawns tossed in garlic lemon reduction, served with roasted tomatoes and premium mixed organic greens.',
    price: 9.49,
    image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb22?auto=format&fit=crop&w=600&q=80',
    category: 'seafood',
    rating: 4.7,
    tags: ['Wood Fired', 'Fresh Catch'],
    rpPrice: 'Rp. 95.000'
  },
  {
    id: 'drink-1',
    name: 'Infused Berry Splash',
    description: 'Refreshing cold-pressed berries, wild mint leaves, mineral water, and a dash of organic honey.',
    price: 2.99,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    category: 'drink',
    rating: 4.8,
    tags: ['Organic', 'Zero Sugar'],
    rpPrice: 'Rp. 30.000'
  }
];

export interface DecorativeIngredient {
  id: string;
  type: 'tomato' | 'wedge' | 'basil' | 'pepper';
  top: string;
  left: string;
  size: number;
  rotation: number;
  delay: number;
  speed: number;
}

export const FLOATING_INGREDIENTS: DecorativeIngredient[] = [
  { id: 'ing-1', type: 'tomato', top: '12%', left: '8%', size: 48, rotation: 15, delay: 0.5, speed: 2 },
  { id: 'ing-2', type: 'basil', top: '22%', left: '82%', size: 30, rotation: -45, delay: 1, speed: 1.5 },
  { id: 'ing-3', type: 'wedge', top: '35%', left: '15%', size: 42, rotation: 120, delay: 0, speed: 2.2 },
  { id: 'ing-4', type: 'pepper', top: '48%', left: '88%', size: 28, rotation: 65, delay: 1.5, speed: 1.8 },
  { id: 'ing-5', type: 'basil', top: '60%', left: '5%', size: 34, rotation: -20, delay: 2, speed: 1.2 },
  { id: 'ing-6', type: 'tomato', top: '75%', left: '84%', size: 40, rotation: 110, delay: 0.8, speed: 2 },
  { id: 'ing-7', type: 'wedge', top: '88%', left: '12%', size: 44, rotation: -80, delay: 1.2, speed: 2.5 }
];
