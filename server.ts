import express from "express";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Order, RestaurantTable, TableReservation, Product, OrderStage, PaymentStatus, TableStatus } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// -----------------------------------------------------------------------------
// QR Token & Session Security Engine
// -----------------------------------------------------------------------------
const QR_SIGN_SECRET = process.env.QR_SIGN_SECRET || "tomato-burger-secret-key-10492";

// Generate a secure signed token
function generateTableToken(tableId: string): string {
  const payload = {
    tableId,
    restaurantId: "tomato-burger",
    createdAt: Date.now()
  };
  const payloadStr = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", QR_SIGN_SECRET).update(payloadStr).digest("hex");
  return Buffer.from(payloadStr).toString("base64") + "." + signature;
}

// Verify and decode a signed token
function verifyTableToken(token: string): { tableId: string } | null {
  try {
    const [payloadBase64, signature] = token.split(".");
    if (!payloadBase64 || !signature) return null;
    
    const payloadStr = Buffer.from(payloadBase64, "base64").toString("utf-8");
    const expectedSignature = crypto.createHmac("sha256", QR_SIGN_SECRET).update(payloadStr).digest("hex");
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(payloadStr);
    if (payload.restaurantId !== "tomato-burger") return null;
    
    // Inactive timeout limit: configure to 12 hours (43200000ms) for order lifecycle
    const twelveHours = 12 * 60 * 60 * 1000;
    if (Date.now() - payload.createdAt > twelveHours) {
      return null;
    }
    
    return { tableId: payload.tableId };
  } catch (err) {
    return null;
  }
}

// In-Memory active QR Table sessions
interface ActiveSession {
  id: string;
  tableId: string;
  tableName: string;
  token: string;
  deviceId: string;
  createdAt: string;
  expiresAt: string;
}
let activeSessions: ActiveSession[] = [];

// Real-Time Event stream clients
let sseClients: any[] = [];

function broadcastUpdate(type: string, data: any) {
  const payload = JSON.stringify({ type, data });
  sseClients.forEach(client => {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch (e) {
      // client stale or closed
    }
  });
}

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini Client:", err);
  }
} else {
  console.log("No GEMINI_API_KEY found. Utilizing fallback AI search parsing.");
}

// -----------------------------------------------------------------------------
// In-Memory Database State
// -----------------------------------------------------------------------------

let products: Product[] = [
  {
    id: 'fries-1',
    name: 'Crispy Golden Fries',
    description: 'Golden potatoes fried to perfection and seasoned with sea salt and garlic powder.',
    price: 4.99,
    image: '/src/assets/card_fries_1782491692895.png',
    category: 'side',
    rating: 4.8,
    tags: ['Best Seller', 'Crispy'],
    customizations: {
      sizes: ['Regular', 'Large'],
      addOns: [
        { name: 'Extra Melted Cheddar', price: 1.50 },
        { name: 'Garlic Aioli Dip', price: 0.75 },
        { name: 'Truffle Mayo Dip', price: 1.00 }
      ]
    },
    prepTime: 10,
    calories: 320,
    rewardsPoints: 15,
    isPopular: true,
    isVegetarian: true
  },
  {
    id: 'burger-1',
    name: 'Famous Cheese Burger',
    description: 'Juicy double beef patty with melted cheddar, lettuce, fresh tomatoes, and secret burger sauce.',
    price: 9.99,
    image: '/src/assets/card_mini_burger_1782491705841.png',
    category: 'burger',
    rating: 4.9,
    tags: ['Gourmet', 'Most Loved'],
    customizations: {
      sizes: ['Regular', 'Large'],
      addOns: [
        { name: 'Extra Patty', price: 3.00 },
        { name: 'Smoked Bacon', price: 2.00 },
        { name: 'Fried Egg', price: 1.25 },
        { name: 'Extra Cheddar', price: 1.00 }
      ]
    },
    prepTime: 12,
    calories: 580,
    rewardsPoints: 30,
    isPopular: true
  },
  {
    id: 'onion-rings-1',
    name: 'Crispy Onion Rings',
    description: 'Sweet white onions thick-cut, double beer-battered, and fried to crispy golden brown.',
    price: 5.99,
    image: '/src/assets/card_onion_rings_1782491718138.png',
    category: 'side',
    rating: 4.6,
    tags: ['Crunchy', 'Appetizer'],
    customizations: {
      sizes: ['Regular', 'Large'],
      addOns: [
        { name: 'Spicy Sriracha Dip', price: 0.75 },
        { name: 'BBQ Sauce Dip', price: 0.50 }
      ]
    },
    prepTime: 8,
    calories: 290,
    rewardsPoints: 15,
    isVegetarian: true
  },
  {
    id: 'pizza-1',
    name: 'Classic Pepperoni Pizza',
    description: 'Fresh hand-tossed dough topped with premium tomato sauce, whole milk mozzarella, and spicy pepperoni.',
    price: 12.99,
    image: '/src/assets/card_pizza_1782491731811.png',
    category: 'pizza',
    rating: 4.9,
    tags: ['Classic', 'Wood Fired'],
    customizations: {
      sizes: ['Regular', 'Large'],
      addOns: [
        { name: 'Extra Pepperoni', price: 2.50 },
        { name: 'Double Mozzarella', price: 2.00 },
        { name: 'Jalapeño Slices', price: 1.00 },
        { name: 'Hot Honey Drizzle', price: 1.50 }
      ]
    },
    prepTime: 15,
    calories: 840,
    rewardsPoints: 40,
    isPopular: true,
    isSpicy: true
  },
  {
    id: 'burger-double',
    name: 'Mega Volcano Burger',
    description: 'Triple beef patty, triple cheddar, caramelized onions, jalapeños, and spicy sriracha mayo.',
    price: 14.99,
    image: '/src/assets/three_burgers_1782491679101.png',
    category: 'burger',
    rating: 5.0,
    tags: ['Spicy', 'Signature'],
    customizations: {
      sizes: ['Regular', 'Large'],
      addOns: [
        { name: 'Extra Cheddar', price: 1.00 },
        { name: 'Smoked Bacon', price: 2.00 },
        { name: 'Crispy Onion Strings', price: 1.25 }
      ]
    },
    prepTime: 15,
    calories: 920,
    rewardsPoints: 50,
    isSpicy: true,
    isChefSpecial: true
  },
  {
    id: 'pizza-bbq',
    name: 'BBQ Chicken Feast',
    description: 'Smoky BBQ sauce, grilled chicken breast strips, red onions, cilantro, and smoked gouda cheese.',
    price: 14.49,
    image: '/src/assets/card_pizza_1782491731811.png',
    category: 'pizza',
    rating: 4.7,
    tags: ['Tangy', 'Hearty'],
    customizations: {
      sizes: ['Regular', 'Large'],
      addOns: [
        { name: 'Grilled Mushrooms', price: 1.50 },
        { name: 'Pineapple Chunks', price: 1.00 },
        { name: 'Extra BBQ Drizzle', price: 0.50 }
      ]
    },
    prepTime: 18,
    calories: 890,
    rewardsPoints: 45,
    isChefSpecial: true
  },
  {
    id: 'salad-1',
    name: 'Gourmet Healthy Salad',
    description: 'Fresh grilled chicken breast, chopped bell peppers, pickled red onions, crumbly feta cheese, and garden-fresh greens with citrus hummus dressing.',
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600',
    category: 'salad',
    rating: 4.9,
    tags: ['Fit Choice', 'Low Carb'],
    customizations: {
      sizes: ['Regular', 'Large'],
      addOns: [
        { name: 'Avocado Slices', price: 1.50 },
        { name: 'Boiled Egg', price: 1.00 },
        { name: 'Roasted Almonds', price: 0.75 }
      ]
    },
    prepTime: 8,
    calories: 240,
    rewardsPoints: 20,
    isVegetarian: true
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
    customizations: {
      sizes: ['Regular', 'Large'],
      addOns: [
        { name: 'Feta Cheese', price: 1.25 },
        { name: 'Garlic Hummus Scoop', price: 1.00 },
        { name: 'Crispy Falafel (3x)', price: 1.75 }
      ]
    },
    prepTime: 10,
    calories: 310,
    rewardsPoints: 25,
    isVegetarian: true
  },
  {
    id: 'seafood-1',
    name: 'Garlic Butter Salmon Bowl',
    description: 'Pan-seared Atlantic salmon on a bed of seasoned warm wild rice, baby asparagus, sesame glazed cucumbers, and cilantro cream.',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=600',
    category: 'seafood',
    rating: 4.9,
    tags: ['Chef Special', 'High Protein'],
    customizations: {
      sizes: ['Regular', 'Large'],
      addOns: [
        { name: 'Extra Salmon Fillet', price: 5.50 },
        { name: 'Poached Egg', price: 1.00 },
        { name: 'Truffle Rice Upgrade', price: 1.50 }
      ]
    },
    prepTime: 15,
    calories: 540,
    rewardsPoints: 35,
    isChefSpecial: true
  },
  {
    id: 'seafood-2',
    name: 'Lemon Pepper Grilled Prawns',
    description: 'Wood-fired prawns tossed in garlic lemon reduction, served with roasted tomatoes and premium mixed organic greens.',
    price: 9.49,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=600',
    category: 'seafood',
    rating: 4.7,
    tags: ['Wood Fired', 'Fresh Catch'],
    customizations: {
      sizes: ['Regular', 'Large'],
      addOns: [
        { name: 'Extra Prawns (4x)', price: 4.00 },
        { name: 'Garlic Butter Bread', price: 1.25 }
      ]
    },
    prepTime: 12,
    calories: 420,
    rewardsPoints: 30,
    isChefSpecial: true
  },
  {
    id: 'drink-1',
    name: 'Infused Berry Splash',
    description: 'Refreshing cold-pressed berries, wild mint leaves, mineral water, and a dash of organic honey.',
    price: 2.99,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600',
    category: 'drink',
    rating: 4.8,
    tags: ['Organic', 'Zero Sugar'],
    customizations: {
      sizes: ['Regular', 'Large'],
      addOns: [
        { name: 'Chia Seeds scoop', price: 0.50 },
        { name: 'Mint Leaf Infusion', price: 0.25 }
      ]
    },
    prepTime: 5,
    calories: 85,
    rewardsPoints: 10,
    isVegetarian: true
  }
];

let tables: RestaurantTable[] = [
  { id: 'table-1', name: 'Table 1', capacity: 2, areaLocation: 'Window Side', tableStatus: 'Free', enabled: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-2', name: 'Table 2', capacity: 2, areaLocation: 'Window Side', tableStatus: 'Free', enabled: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-3', name: 'Table 3', capacity: 4, areaLocation: 'Main Floor', tableStatus: 'Free', enabled: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-4', name: 'Table 4', capacity: 4, areaLocation: 'Main Floor', tableStatus: 'Free', enabled: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-5', name: 'Table 5', capacity: 6, areaLocation: 'Family Booth', tableStatus: 'Free', enabled: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-6', name: 'Table 6', capacity: 6, areaLocation: 'Family Booth', tableStatus: 'Free', enabled: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-7', name: 'Table 7', capacity: 4, areaLocation: 'VIP Section', tableStatus: 'Free', enabled: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-8', name: 'Table 8', capacity: 8, areaLocation: 'VIP Boardroom', tableStatus: 'Free', enabled: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

// Generate dynamic secure QR tokens for initial tables
tables.forEach(t => {
  t.qrToken = generateTableToken(t.id);
});

let reservations: TableReservation[] = [
  { id: 'res-1', tableId: 'table-7', tableName: 'Table 7', customerName: 'Alex Mercer', guestCount: 4, reservationTime: '19:00', specialRequests: 'Birthday celebration, quiet corner preferred.' },
  { id: 'res-2', tableId: 'table-8', tableName: 'Table 8', customerName: 'Elena Rostova', guestCount: 7, reservationTime: '20:35', specialRequests: 'Need projector screen access if possible.' }
];

// Initial orders to populate the admin and kitchen dashboards on startup
let orders: Order[] = [
  {
    id: 'ORD-1042',
    customerName: 'Marcus Aurelius',
    contactNumber: '+1 415 888 9912',
    email: 'marcus@stoic.com',
    deliveryType: 'Dine-in',
    tableNumber: 'Table 3',
    orderedItems: [
      { productId: 'burger-1', name: 'Famous Cheese Burger', price: 9.99, quantity: 2, size: 'Regular', addOns: ['Extra Cheddar'] },
      { productId: 'fries-1', name: 'Crispy Golden Fries', price: 4.99, quantity: 1, size: 'Large', addOns: ['Garlic Aioli Dip'] }
    ],
    subtotal: 24.97,
    discount: 2.50, // 10% from SAVE10
    totalPrice: 22.47,
    orderStage: 'Preparing',
    paymentStatus: 'Paid',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 mins ago
  },
  {
    id: 'ORD-1043',
    customerName: 'Zoe Kravitz',
    contactNumber: '+1 212 555 4192',
    email: 'zoe@kravitz.me',
    deliveryType: 'Delivery',
    orderedItems: [
      { productId: 'pizza-1', name: 'Classic Pepperoni Pizza', price: 12.99, quantity: 1, size: 'Large', addOns: ['Hot Honey Drizzle'] },
      { productId: 'drink-1', name: 'Infused Berry Splash', price: 2.99, quantity: 2, size: 'Regular' }
    ],
    subtotal: 18.97,
    discount: 0,
    totalPrice: 18.97,
    orderStage: 'Received',
    paymentStatus: 'Pending',
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString() // 4 mins ago
  },
  {
    id: 'ORD-1041',
    customerName: 'Dianne Vance',
    contactNumber: '+1 650 334 1122',
    email: 'dianne@vance.io',
    deliveryType: 'Takeout',
    orderedItems: [
      { productId: 'salad-2', name: 'Mediterranean Avocado Bowl', price: 5.49, quantity: 1, size: 'Regular' }
    ],
    subtotal: 5.49,
    discount: 0,
    totalPrice: 5.49,
    orderStage: 'Delivered',
    paymentStatus: 'Paid',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago
  }
];

// Reflect initial seating mapping
tables = tables.map(t => {
  if (t.name === 'Table 3') return { ...t, tableStatus: 'Occupied' };
  if (t.id === 'table-7' || t.id === 'table-8') return { ...t, tableStatus: 'Reserved' };
  return t;
});

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// Global health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Products API
app.get("/api/products", (req, res) => {
  res.json(products);
});

app.post("/api/products", (req, res) => {
  const { name, category, price, description, image, rating, tags, customizations } = req.body;
  if (!name || !category || price === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const newProduct: Product = {
    id: 'p-' + Math.random().toString(36).substr(2, 9),
    name,
    category,
    price: Number(price),
    description: description || "",
    image: image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400",
    rating: rating || 4.5,
    tags: tags || [],
    customizations: customizations || { sizes: ['Regular', 'Large'], addOns: [] }
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }
  products[index] = { ...products[index], ...req.body, id }; // keep same ID
  res.json(products[index]);
});

app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  products = products.filter(p => p.id !== id);
  res.json({ success: true });
});

// Orders API
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

app.post("/api/orders", (req, res) => {
  const { 
    customerName, 
    contactNumber, 
    email, 
    deliveryType, 
    tableNumber, 
    orderedItems, 
    subtotal, 
    discount, 
    totalPrice, 
    paymentStatus,
    sessionToken,
    deviceId,
    isInsideRestaurant
  } = req.body;

  if (!customerName || !deliveryType || !orderedItems || orderedItems.length === 0) {
    return res.status(400).json({ error: "Missing crucial order parameters" });
  }

  // Session & Location Security Check for Table QR Code Orders
  if (deliveryType === 'Dine-in' && tableNumber) {
    if (sessionToken) {
      const decoded = verifyTableToken(sessionToken);
      if (!decoded) {
        return res.status(403).json({ error: "Your table session has expired or is invalid. Please scan the table QR code again." });
      }

      // Check if session is registered on server
      const registeredSession = activeSessions.find(s => s.token === sessionToken);
      if (!registeredSession) {
        return res.status(403).json({ error: "No active session found for this QR token. Please scan the QR code to order." });
      }

      // Strict enforcement: Ensure they do not forge/change the table number
      const mappedTable = tables.find(t => t.id === registeredSession.tableId);
      if (!mappedTable || mappedTable.name !== tableNumber) {
        return res.status(403).json({ error: "Table verification mismatch. Manual table switching is forbidden." });
      }

      if (mappedTable.enabled === false) {
        return res.status(403).json({ error: "This table is currently disabled by restaurant administration." });
      }
    }

    // Network / Location verification (automatically approved - security verification system removed)
    // if (isInsideRestaurant === false) {
    //   return res.status(403).json({ error: "Ordering is only available while you are inside the restaurant." });
    // }
  }

  const newOrder: Order = {
    id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    customerName,
    contactNumber: contactNumber || "",
    email: email || "",
    deliveryType,
    tableNumber,
    orderedItems,
    subtotal: Number(subtotal),
    discount: Number(discount || 0),
    totalPrice: Number(totalPrice),
    orderStage: 'Received',
    paymentStatus: paymentStatus || 'Pending',
    timestamp: new Date().toISOString()
  };

  orders.push(newOrder);

  // AUTOMATED SEATING INTEGRATION:
  // If Dine-In checkout is selected, automatically update table status to 'Occupied'
  if (deliveryType === 'Dine-in' && tableNumber) {
    const matchedTable = tables.find(t => t.name.toLowerCase() === tableNumber.toLowerCase());
    if (matchedTable) {
      matchedTable.tableStatus = 'Occupied';
      broadcastUpdate("table_updated", matchedTable);
    }
  }

  // Notify Kitchen and Admins instantly via SSE
  broadcastUpdate("order_created", newOrder);

  res.status(201).json(newOrder);
});

app.put("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const { orderStage, paymentStatus } = req.body;

  const orderIndex = orders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: "Order not found" });
  }

  const previousOrder = orders[orderIndex];
  const updatedOrder = { ...previousOrder, ...req.body, id }; // keep same ID
  orders[orderIndex] = updatedOrder;

  // If table is associated and stage changes to Delivered, Cancelled or Ready with OutForDelivery,
  // let's handle table releasing or cleaning appropriately:
  if (updatedOrder.deliveryType === 'Dine-in' && updatedOrder.tableNumber) {
    const table = tables.find(t => t.name.toLowerCase() === updatedOrder.tableNumber?.toLowerCase());
    if (table) {
      if (orderStage === 'Delivered' || orderStage === 'Cancelled') {
        // Automatically release or set to cleaning
        table.tableStatus = 'Cleaning';
        broadcastUpdate("table_updated", table);
      }
    }
  }

  // Notify Front-end Client and Portals instantly via SSE
  broadcastUpdate("order_updated", updatedOrder);

  res.json(updatedOrder);
});

// Real-Time SSE Stream Subscription
app.get("/api/updates/stream", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });
  
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
  
  sseClients.push(res);
  
  req.on("close", () => {
    sseClients = sseClients.filter(client => client !== res);
  });
});

// Verify QR Token and Establish Seating Session
app.post("/api/sessions/verify", (req, res) => {
  const { token, deviceId } = req.body;
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  const decoded = verifyTableToken(token);
  if (!decoded) {
    return res.status(400).json({ error: "Invalid, expired, or corrupted QR token. Please scan a fresh QR code at your table." });
  }

  const table = tables.find(t => t.id === decoded.tableId);
  if (!table) {
    return res.status(404).json({ error: "Associated physical table was not found in the seating map." });
  }

  if (table.enabled === false) {
    return res.status(400).json({ error: "This table is currently disabled by restaurant staff." });
  }

  // Check if session already registered for this device to prevent session duplication
  let session = activeSessions.find(s => s.token === token && s.deviceId === deviceId);
  if (!session) {
    session = {
      id: "sess-" + Math.random().toString(36).substr(2, 9),
      tableId: table.id,
      tableName: table.name,
      token,
      deviceId: deviceId || "anonymous-device",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() // 12 hours
    };
    activeSessions.push(session);
  }

  res.json({
    success: true,
    session,
    tableStatus: table.tableStatus
  });
});

// Tables API
app.get("/api/tables", (req, res) => {
  res.json(tables);
});

app.post("/api/tables", (req, res) => {
  const { name, capacity, areaLocation } = req.body;
  if (!name || !capacity) {
    return res.status(400).json({ error: "Name and capacity are required" });
  }

  const newId = 'table-' + (tables.length + 1) + '-' + Math.random().toString(36).substr(2, 4);
  const newTable: RestaurantTable = {
    id: newId,
    name,
    capacity: Number(capacity),
    areaLocation: areaLocation || "Main Floor",
    tableStatus: "Free",
    enabled: true,
    qrToken: generateTableToken(newId),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  tables.push(newTable);
  broadcastUpdate("table_updated", newTable);
  res.status(201).json(newTable);
});

app.put("/api/tables/:id", (req, res) => {
  const { id } = req.params;
  const { name, capacity, areaLocation, tableStatus, enabled } = req.body;

  const table = tables.find(t => t.id === id);
  if (!table) {
    return res.status(404).json({ error: "Table not found" });
  }

  if (name !== undefined) table.name = name;
  if (capacity !== undefined) table.capacity = Number(capacity);
  if (areaLocation !== undefined) table.areaLocation = areaLocation;
  if (tableStatus !== undefined) table.tableStatus = tableStatus;
  if (enabled !== undefined) table.enabled = !!enabled;
  table.updatedAt = new Date().toISOString();

  broadcastUpdate("table_updated", table);
  res.json(table);
});

app.delete("/api/tables/:id", (req, res) => {
  const { id } = req.params;
  const index = tables.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Table not found" });
  }

  tables.splice(index, 1);
  broadcastUpdate("table_deleted", { id });
  res.json({ success: true });
});

app.post("/api/tables/:id/regenerate", (req, res) => {
  const { id } = req.params;
  const table = tables.find(t => t.id === id);
  if (!table) {
    return res.status(404).json({ error: "Table not found" });
  }

  table.qrToken = generateTableToken(table.id);
  table.updatedAt = new Date().toISOString();

  broadcastUpdate("table_updated", table);
  res.json({ success: true, qrToken: table.qrToken });
});

// Reservations API
app.get("/api/reservations", (req, res) => {
  res.json(reservations);
});

app.post("/api/reservations", (req, res) => {
  const { tableId, customerName, guestCount, reservationTime, specialRequests } = req.body;
  if (!tableId || !customerName || !reservationTime) {
    return res.status(400).json({ error: "Missing required reservation details" });
  }

  const table = tables.find(t => t.id === tableId);
  const tableName = table ? table.name : "Unknown Table";

  const newReservation: TableReservation = {
    id: 'res-' + Math.floor(1000 + Math.random() * 9000),
    tableId,
    tableName,
    customerName,
    guestCount: Number(guestCount || 2),
    reservationTime,
    specialRequests: specialRequests || ""
  };

  reservations.push(newReservation);

  // Update table status to Reserved
  if (table) {
    table.tableStatus = 'Reserved';
  }

  res.status(201).json(newReservation);
});

// AI Search Grounding & Menu Discovery Assistant using Gemini API
app.post("/api/ai-search", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  // Fallback keyword-based searching (very polished)
  const getFallbackSuggestions = (q: string): string[] => {
    const queryLower = q.toLowerCase();
    const suggestions: string[] = [];

    // Simple mappings for robustness
    if (queryLower.includes("spicy") || queryLower.includes("hot") || queryLower.includes("volcano") || queryLower.includes("pepper")) {
      suggestions.push("burger-double", "pizza-1", "seafood-2");
    }
    if (queryLower.includes("veg") || queryLower.includes("salad") || queryLower.includes("healthy") || queryLower.includes("carb")) {
      suggestions.push("salad-1", "salad-2");
    }
    if (queryLower.includes("seafood") || queryLower.includes("fish") || queryLower.includes("salmon") || queryLower.includes("prawn")) {
      suggestions.push("seafood-1", "seafood-2");
    }
    if (queryLower.includes("burger") || queryLower.includes("beef") || queryLower.includes("cheese")) {
      suggestions.push("burger-1", "burger-double");
    }
    if (queryLower.includes("pizza") || queryLower.includes("pepperoni") || queryLower.includes("bbq") || queryLower.includes("chicken")) {
      suggestions.push("pizza-1", "pizza-bbq");
    }
    if (queryLower.includes("drink") || queryLower.includes("berry") || queryLower.includes("splash") || queryLower.includes("beverage")) {
      suggestions.push("drink-1");
    }
    if (queryLower.includes("side") || queryLower.includes("onion") || queryLower.includes("ring") || queryLower.includes("fries")) {
      suggestions.push("fries-1", "onion-rings-1");
    }

    // Default suggestions if no match
    if (suggestions.length === 0) {
      // Pick 3 popular ones
      return ["burger-1", "pizza-1", "fries-1"];
    }

    return Array.from(new Set(suggestions));
  };

  // If Gemini client exists, query Gemini!
  if (ai) {
    try {
      const menuContext = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        tags: p.tags || []
      }));

      const prompt = `You are a culinary AI search engine for 'Tomato & Burger'.
Here is our current active food menu in JSON format:
${JSON.stringify(menuContext, null, 2)}

The user asks: "${query}"

Suggest the most relevant 1 to 4 food item IDs from our menu. Match the query's flavor notes, dietary tags, categories, or overall culinary mood (spicy, lightweight, sweet, seafood-filled, etc).
Return your response STRICTLY as a JSON array of string IDs, like:
["burger-1", "fries-1"]

Make sure to ONLY return item IDs that exist in the menu provided above. If no logical match can be found, return an empty array [].`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "";
      console.log("Gemini AI Search response:", responseText);

      try {
        const parsedIds = JSON.parse(responseText.trim());
        if (Array.isArray(parsedIds)) {
          // Validate that the IDs exist
          const validIds = parsedIds.filter(id => products.some(p => p.id === id));
          return res.json({ suggestions: validIds, source: "gemini" });
        }
      } catch (jsonErr) {
        console.error("Failed to parse Gemini response JSON, utilizing fallback:", jsonErr);
      }
    } catch (apiErr) {
      console.error("Gemini content generation failed, utilizing fallback:", apiErr);
    }
  }

  // Use high-fidelity local keyword search as fallback
  const fallbackIds = getFallbackSuggestions(query);
  return res.json({ suggestions: fallbackIds, source: "local-keywords" });
});

// -----------------------------------------------------------------------------
// Vite or Production Static Hosting
// -----------------------------------------------------------------------------

async function serveApp() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting development mode with live Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting production mode, serving compiled assets...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Multi-Role Restaurant Platform server running on http://localhost:${PORT}`);
  });
}

serveApp().catch((err) => {
  console.error("Failed to boot Express+Vite full-stack system:", err);
});
