import { User, Product, Order, Cart, OrderStatus } from './types';

// In-memory data stores (mutable during session)
export const usersDb = new Map<string, User>();
export const productsDb = new Map<string, Product>();
export const ordersDb = new Map<string, Order>();
export const cartsDb = new Map<string, Cart>();

// Seed Users
const seedUsers: User[] = [
  {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
    status: 'active',
    bio: 'System administrator',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    name: 'Jane Admin',
    email: 'jane@test.com',
    password: 'password123',
    role: 'admin',
    status: 'active',
    bio: 'Senior admin',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'user-3',
    name: 'Regular User',
    email: 'user@test.com',
    password: 'password123',
    role: 'user',
    status: 'active',
    bio: 'Regular customer',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
    createdAt: '2024-01-03T00:00:00Z',
  },
  {
    id: 'user-4',
    name: 'Bob Smith',
    email: 'bob@test.com',
    password: 'password123',
    role: 'user',
    status: 'active',
    bio: 'Avid shopper',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    createdAt: '2024-01-04T00:00:00Z',
  },
  {
    id: 'user-5',
    name: 'Alice Wonder',
    email: 'alice@test.com',
    password: 'password123',
    role: 'user',
    status: 'disabled',
    bio: 'Disabled account',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    createdAt: '2024-01-05T00:00:00Z',
  },
];

// Seed Products
const seedProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'MacBook Pro 14"',
    price: 999.99,
    category: 'Electronics',
    stock: 15,
    description: 'Powerful laptop with M3 chip, 16GB RAM, 512GB SSD. Perfect for professionals.',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Wireless Noise-Cancelling Headphones',
    price: 299.99,
    category: 'Electronics',
    stock: 3,
    description: 'Premium audio experience with 30-hour battery life and active noise cancellation.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    createdAt: '2024-01-11T00:00:00Z',
    updatedAt: '2024-01-11T00:00:00Z',
  },
  {
    id: 'prod-3',
    name: 'Running Shoes Ultra',
    price: 129.99,
    category: 'Sports',
    stock: 22,
    description: 'Lightweight running shoes with advanced cushioning and breathable mesh upper.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z',
  },
  {
    id: 'prod-4',
    name: 'The Clean Coder',
    price: 39.99,
    category: 'Books',
    stock: 50,
    description: 'A code of conduct for professional programmers by Robert C. Martin.',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
    createdAt: '2024-01-13T00:00:00Z',
    updatedAt: '2024-01-13T00:00:00Z',
  },
  {
    id: 'prod-5',
    name: 'Ergonomic Office Chair',
    price: 449.99,
    category: 'Home',
    stock: 8,
    description: 'Adjustable lumbar support, breathable mesh back, perfect for long work sessions.',
    imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400',
    createdAt: '2024-01-14T00:00:00Z',
    updatedAt: '2024-01-14T00:00:00Z',
  },
  {
    id: 'prod-6',
    name: 'Classic Denim Jacket',
    price: 89.99,
    category: 'Clothing',
    stock: 0,
    description: 'Timeless denim jacket with modern fit. Available in multiple washes.',
    imageUrl: 'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=400',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'prod-7',
    name: 'Smart Watch Series X',
    price: 399.99,
    category: 'Electronics',
    stock: 5,
    description: 'Health tracking, GPS, waterproof, 7-day battery. Your fitness companion.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    createdAt: '2024-01-16T00:00:00Z',
    updatedAt: '2024-01-16T00:00:00Z',
  },
  {
    id: 'prod-8',
    name: 'Yoga Mat Premium',
    price: 59.99,
    category: 'Sports',
    stock: 35,
    description: 'Non-slip surface, 6mm thick, eco-friendly materials. Perfect for yoga and pilates.',
    imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
    createdAt: '2024-01-17T00:00:00Z',
    updatedAt: '2024-01-17T00:00:00Z',
  },
  {
    id: 'prod-9',
    name: 'Coffee Table Book: Architecture',
    price: 9.99,
    category: 'Books',
    stock: 2,
    description: 'Stunning photography of world-class architecture. A beautiful addition to any space.',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    createdAt: '2024-01-18T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z',
  },
  {
    id: 'prod-10',
    name: 'LED Desk Lamp',
    price: 79.99,
    category: 'Home',
    stock: 18,
    description: 'Adjustable brightness and color temperature. USB charging port built-in.',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    createdAt: '2024-01-19T00:00:00Z',
    updatedAt: '2024-01-19T00:00:00Z',
  },
];

const orderStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

function randomStatus(): OrderStatus {
  return orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
}

function createStatusHistory(status: OrderStatus): { status: OrderStatus; timestamp: string; note?: string }[] {
  const history: { status: OrderStatus; timestamp: string; note?: string }[] = [
    { status: 'pending', timestamp: '2024-02-01T10:00:00Z', note: 'Order placed' },
  ];
  if (['processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
    history.push({ status: 'processing', timestamp: '2024-02-01T12:00:00Z', note: 'Payment confirmed' });
  }
  if (['shipped', 'delivered'].includes(status)) {
    history.push({ status: 'shipped', timestamp: '2024-02-02T09:00:00Z', note: 'Shipped via FedEx #1234567' });
  }
  if (status === 'delivered') {
    history.push({ status: 'delivered', timestamp: '2024-02-04T14:00:00Z', note: 'Delivered to front door' });
  }
  if (status === 'cancelled') {
    history.push({ status: 'cancelled', timestamp: '2024-02-01T15:00:00Z', note: 'Cancelled by customer' });
  }
  return history;
}

// Seed Orders
const seedOrders: Order[] = Array.from({ length: 20 }, (_, i) => {
  const productSubset = seedProducts.slice(0, Math.ceil(Math.random() * 5));
  const items = productSubset.map((p) => ({
    productId: p.id,
    productName: p.name,
    price: p.price,
    quantity: Math.ceil(Math.random() * 3),
  }));
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const status = orderStatuses[i % orderStatuses.length];
  const userId = seedUsers[i % 3 + 2].id; // cycle through users 3,4,5

  return {
    id: `order-${i + 1}`,
    userId,
    items,
    status,
    total: Math.round(total * 100) / 100,
    shippingAddress: {
      street: `${100 + i} Main Street`,
      city: ['New York', 'Los Angeles', 'Chicago', 'Houston'][i % 4],
      state: ['NY', 'CA', 'IL', 'TX'][i % 4],
      zip: `${10000 + i * 111}`,
      country: 'US',
    },
    paymentMethod: i % 2 === 0 ? 'Credit Card' : 'PayPal',
    statusHistory: createStatusHistory(status),
    createdAt: new Date(2024, 1, (i % 28) + 1).toISOString(),
    updatedAt: new Date(2024, 1, (i % 28) + 2).toISOString(),
  };
});

// Initialize in-memory maps
let initialized = false;

export function initializeData() {
  if (initialized) return;
  initialized = true;

  seedUsers.forEach((u) => usersDb.set(u.id, u));
  seedProducts.forEach((p) => productsDb.set(p.id, p));
  seedOrders.forEach((o) => ordersDb.set(o.id, o));
}

// Auto-initialize
initializeData();
