import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Order, RestaurantTable, TableReservation, TableSession, OrderStage, PaymentStatus, TableStatus } from '../types';

interface RestaurantContextType {
  products: Product[];
  orders: Order[];
  tables: RestaurantTable[];
  reservations: TableReservation[];
  loading: boolean;
  refreshAll: () => Promise<void>;
  placeOrder: (orderData: Partial<Order>) => Promise<Order>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<Order>;
  updateTable: (tableId: string, updates: Partial<RestaurantTable>) => Promise<RestaurantTable>;
  createTable: (tableData: { name: string; capacity: number; areaLocation?: string }) => Promise<RestaurantTable>;
  deleteTable: (tableId: string) => Promise<void>;
  regenerateTableToken: (tableId: string) => Promise<string>;
  createReservation: (reservationData: Omit<TableReservation, 'id' | 'tableName'>) => Promise<TableReservation>;
  createProduct: (productData: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (productId: string) => Promise<void>;
  searchWithAI: (query: string) => Promise<Product[]>;

  // Table Session Security & Location Verification State
  tableSession: TableSession | null;
  verifyTableToken: (token: string) => Promise<boolean>;
  clearTableSession: () => void;
  isInsideRestaurant: boolean;
  setIsInsideRestaurant: (val: boolean) => void;
  isWiFiConnected: boolean;
  setIsWiFiConnected: (val: boolean) => void;
  gpsCoords: { lat: number; lng: number } | null;
  setGpsCoords: (coords: { lat: number; lng: number } | null) => void;
  gpsDistance: number | null; // distance from restaurant center in meters
  gpsStatus: 'prompt' | 'granted' | 'denied' | 'verified' | 'failed';
  setGpsStatus: (val: 'prompt' | 'granted' | 'denied' | 'verified' | 'failed') => void;
  requestDeviceLocation: () => Promise<boolean>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

// Core Restaurant Latitude & Longitude (San Francisco)
const RESTAURANT_LAT = 37.7749;
const RESTAURANT_LNG = -122.4194;

function calculateDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Seating Session state
  const [tableSession, setTableSession] = useState<TableSession | null>(null);
  
  // Security simulation controls
  const [isInsideRestaurant, setIsInsideRestaurant] = useState<boolean>(true);
  const [isWiFiConnected, setIsWiFiConnected] = useState<boolean>(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>({ lat: 37.7748, lng: -122.4193 }); // Defaults to inside (14 meters away)
  const [gpsDistance, setGpsDistance] = useState<number | null>(14);
  const [gpsStatus, setGpsStatus] = useState<'prompt' | 'granted' | 'denied' | 'verified' | 'failed'>('prompt');

  const requestDeviceLocation = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        setGpsStatus('failed');
        resolve(false);
        return;
      }

      setGpsStatus('prompt');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setGpsCoords({ lat, lng });
          resolve(true);
        },
        (error) => {
          console.error("Geolocation request failed:", error);
          setGpsStatus('denied');
          setGpsCoords(null);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  // Load table session from storage if present on mount
  useEffect(() => {
    const saved = localStorage.getItem("tomato_table_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // check if expired
        if (new Date(parsed.expiresAt).getTime() > Date.now()) {
          setTableSession(parsed);
        } else {
          localStorage.removeItem("tomato_table_session");
        }
      } catch (e) {
        localStorage.removeItem("tomato_table_session");
      }
    }

    // Load security preference simulations if set
    const savedInside = localStorage.getItem("tomato_security_inside");
    if (savedInside !== null) setIsInsideRestaurant(savedInside === "true");

    const savedWifi = localStorage.getItem("tomato_security_wifi");
    if (savedWifi !== null) setIsWiFiConnected(savedWifi === "true");
  }, []);

  // Sync GPS Distance when coordinates shift
  useEffect(() => {
    if (gpsCoords) {
      const dist = calculateDistanceInMeters(RESTAURANT_LAT, RESTAURANT_LNG, gpsCoords.lat, gpsCoords.lng);
      setGpsDistance(Math.round(dist * 10) / 10);
      
      // If GPS distance is <= 30m, we are verified inside
      if (dist <= 30) {
        setGpsStatus('verified');
      } else {
        setGpsStatus('failed');
      }
    } else {
      setGpsDistance(null);
    }
  }, [gpsCoords]);

  // Handle localstorage updates when session changes
  const saveTableSession = (session: TableSession | null) => {
    setTableSession(session);
    if (session) {
      localStorage.setItem("tomato_table_session", JSON.stringify(session));
    } else {
      localStorage.removeItem("tomato_table_session");
    }
  };

  const fetchAll = async () => {
    try {
      const [resProducts, resOrders, resTables, resReservations] = await Promise.all([
        fetch('/api/products').then(res => res.json()),
        fetch('/api/orders').then(res => res.json()),
        fetch('/api/tables').then(res => res.json()),
        fetch('/api/reservations').then(res => res.json()),
      ]);

      setProducts(resProducts);
      setOrders((resOrders as Order[]).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setTables(resTables);
      setReservations(resReservations);
    } catch (err) {
      console.error('Error polling restaurant backend API:', err);
    } finally {
      setLoading(false);
    }
  };

  // Live Server-Sent Events (SSE) Stream Subscriber
  useEffect(() => {
    fetchAll();

    const sse = new EventSource('/api/updates/stream');
    
    sse.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'order_created') {
          const o = payload.data;
          setOrders(prev => {
            if (prev.some(item => item.id === o.id)) return prev;
            return [o, ...prev];
          });
        } else if (payload.type === 'order_updated') {
          const o = payload.data;
          setOrders(prev => prev.map(item => item.id === o.id ? o : item));
        } else if (payload.type === 'table_updated') {
          const t = payload.data;
          setTables(prev => prev.map(item => item.id === t.id ? { ...item, ...t } : item));
        } else if (payload.type === 'table_deleted') {
          const d = payload.data;
          setTables(prev => prev.filter(item => item.id !== d.id));
        }
      } catch (err) {
        console.warn("Error parsing incoming SSE updates:", err);
      }
    };

    sse.onerror = () => {
      // Fallback polling if SSE connection drops or is blocked
      console.log("SSE stream disconnected. Engaging 4-second short-polling fallback.");
    };

    // Poll every 4 seconds as a fallback safety mesh
    const interval = setInterval(fetchAll, 4000);

    return () => {
      sse.close();
      clearInterval(interval);
    };
  }, []);

  const refreshAll = async () => {
    setLoading(true);
    await fetchAll();
  };

  // Retrieve or create a persistent device footprint
  const getDeviceId = () => {
    let dId = localStorage.getItem("tomato_device_id");
    if (!dId) {
      dId = "dev_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("tomato_device_id", dId);
    }
    return dId;
  };

  const verifyTableToken = async (token: string): Promise<boolean> => {
    try {
      const dId = getDeviceId();
      const res = await fetch('/api/sessions/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, deviceId: dId })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to verify table QR token");
      }

      const data = await res.json();
      if (data.success && data.session) {
        saveTableSession(data.session);
        return true;
      }
      return false;
    } catch (e) {
      console.error("QR Code token validation failure:", e);
      return false;
    }
  };

  const clearTableSession = () => {
    saveTableSession(null);
  };

  const placeOrder = async (orderData: Partial<Order>) => {
    const isInside = true;
    
    const bodyPayload = {
      ...orderData,
      sessionToken: tableSession?.token,
      deviceId: getDeviceId(),
      isInsideRestaurant: isInside
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit order');
    }

    const newOrder = await res.json();
    await fetchAll();
    return newOrder;
  };

  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update order');
    const updated = await res.json();
    await fetchAll();
    return updated;
  };

  const updateTable = async (tableId: string, updates: Partial<RestaurantTable>) => {
    const res = await fetch(`/api/tables/${tableId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update table details');
    const updated = await res.json();
    await fetchAll();
    return updated;
  };

  const createTable = async (tableData: { name: string; capacity: number; areaLocation?: string }) => {
    const res = await fetch('/api/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tableData),
    });
    if (!res.ok) throw new Error('Failed to create new table');
    const newTable = await res.json();
    await fetchAll();
    return newTable;
  };

  const deleteTable = async (tableId: string) => {
    const res = await fetch(`/api/tables/${tableId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete table');
    await fetchAll();
  };

  const regenerateTableToken = async (tableId: string): Promise<string> => {
    const res = await fetch(`/api/tables/${tableId}/regenerate`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to regenerate table token');
    const data = await res.json();
    await fetchAll();
    return data.qrToken;
  };

  const createReservation = async (reservationData: Omit<TableReservation, 'id' | 'tableName'>) => {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservationData),
    });
    if (!res.ok) throw new Error('Failed to create reservation');
    const newRes = await res.json();
    await fetchAll();
    return newRes;
  };

  const createProduct = async (productData: Omit<Product, 'id'>) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error('Failed to add product');
    const newProduct = await res.json();
    await fetchAll();
    return newProduct;
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update product');
    const updated = await res.json();
    await fetchAll();
    return updated;
  };

  const deleteProduct = async (productId: string) => {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete product');
    await fetchAll();
  };

  const searchWithAI = async (query: string): Promise<Product[]> => {
    const res = await fetch('/api/ai-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const suggestions: string[] = data.suggestions || [];
    return products.filter(p => suggestions.includes(p.id));
  };

  const setInsideAndStore = (val: boolean) => {
    setIsInsideRestaurant(val);
    localStorage.setItem("tomato_security_inside", String(val));
  };

  const setWifiAndStore = (val: boolean) => {
    setIsWiFiConnected(val);
    localStorage.setItem("tomato_security_wifi", String(val));
  };

  return (
    <RestaurantContext.Provider
      value={{
        products,
        orders,
        tables,
        reservations,
        loading,
        refreshAll,
        placeOrder,
        updateOrder,
        updateTable,
        createTable,
        deleteTable,
        regenerateTableToken,
        createReservation,
        createProduct,
        updateProduct,
        deleteProduct,
        searchWithAI,

        // Table Session Verification Context
        tableSession,
        verifyTableToken,
        clearTableSession,
        isInsideRestaurant,
        setIsInsideRestaurant: setInsideAndStore,
        isWiFiConnected,
        setIsWiFiConnected: setWifiAndStore,
        gpsCoords,
        setGpsCoords,
        gpsDistance,
        gpsStatus,
        setGpsStatus,
        requestDeviceLocation
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}
