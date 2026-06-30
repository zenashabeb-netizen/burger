export type OrderStage = 'Received' | 'Preparing' | 'Cooking' | 'Ready' | 'OutForDelivery' | 'Delivered' | 'Cancelled';
export type TableStatus = 'Free' | 'Occupied' | 'Reserved' | 'Cleaning';
export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded' | 'Failed';

export interface Product {
  id: string;
  name: string;
  category: 'burger' | 'pizza' | 'side' | 'drink' | 'salad' | 'seafood';
  price: number;
  description: string;
  image: string;
  rating: number;
  tags?: string[];
  customizations?: {
    sizes?: string[]; // e.g. ["Regular", "Large"]
    addOns?: { name: string; price: number }[]; // e.g. [{name: "Extra Cheese", price: 1.50}]
  };
  prepTime?: number;
  calories?: number;
  rewardsPoints?: number;
  isPopular?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  isChefSpecial?: boolean;
}

export interface OrderedItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  addOns?: string[];
  notes?: string;
}

export interface Order {
  id: string;
  customerName: string;
  contactNumber: string;
  email: string;
  deliveryType: 'Dine-in' | 'Delivery' | 'Takeout';
  tableNumber?: string; // Table Name or Number e.g. "Table 3"
  orderedItems: OrderedItem[];
  subtotal: number;
  discount: number;
  totalPrice: number;
  orderStage: OrderStage;
  paymentStatus: PaymentStatus;
  timestamp: string;
  cashCheckoutRequested?: boolean;
  cashCheckoutActive?: boolean;
  isCheckedOut?: boolean;
}

export interface RestaurantTable {
  id: string;
  name: string; // e.g., "Table 1" to "Table 8"
  capacity: number;
  areaLocation: string; // e.g. "Window Side", "VIP Section"
  tableStatus: TableStatus;
  enabled?: boolean;
  qrToken?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TableSession {
  id: string;
  tableId: string;
  tableName: string;
  token: string;
  deviceId: string;
  createdAt: string;
  expiresAt: string;
}

export interface TableReservation {
  id: string;
  tableId: string;
  tableName: string;
  customerName: string;
  guestCount: number;
  reservationTime: string;
  specialRequests?: string;
}

// Keep backward compatibility with existing components
export interface MenuItem extends Product {
  rpPrice?: string;
}

export interface CartItem {
  id: string;                // Automatically generated unique ID for this specific configured item
  productId: string;         // Reference to the parent catalog product
  name: string;              // Catalog product name
  price: number;             // Unit price including chosen size/topping premiums
  quantity: number;          // Chosen quantity
  selectedSize: string;      // Label of the chosen size (e.g. "Medium", "Large")
  selectedToppings: string[];// Array of topping labels selected
  specialInstructions: string;// Raw text input from user
  image: string;             // Asset pointer
}
