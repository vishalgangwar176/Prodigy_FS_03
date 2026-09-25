import { Product, Review, Order, SupportTicket, OrderStatus } from '../types';
import { INITIAL_PRODUCTS, INITIAL_REVIEWS, INITIAL_ORDERS } from '../data/seedProducts';

const KEYS = {
  PRODUCTS: 'freshkart_products_v2',
  REVIEWS: 'freshkart_reviews_v1',
  ORDERS: 'freshkart_orders_v1',
  TICKETS: 'freshkart_tickets_v1',
  RECENTLY_VIEWED: 'freshkart_recently_viewed_v1',
};

// Event bus for cross-tab or local component reactive updates
export const storageEvents = new EventTarget();

export function emitEvent(eventName: string, detail?: any) {
  storageEvents.dispatchEvent(new CustomEvent(eventName, { detail }));
  try {
    // Notify other tabs as well
    window.dispatchEvent(new StorageEvent('storage', { key: eventName }));
  } catch {
    // ignore in restricted environments
  }
}

// Initialise storage if empty
export function initStorage() {
  const existingV2 = localStorage.getItem(KEYS.PRODUCTS);
  if (!existingV2) {
    // Check if there was an earlier version with custom added products
    const oldV1 = localStorage.getItem('freshkart_products_v1');
    if (oldV1) {
      try {
        const parsedOld: Product[] = JSON.parse(oldV1);
        const map = new Map<string, Product>();
        // Seed with all current initial products first
        INITIAL_PRODUCTS.forEach(p => map.set(p.id, p));
        // Keep any modified stock or custom user-created products from old version
        parsedOld.forEach(p => {
          if (!map.has(p.id)) {
            map.set(p.id, p);
          }
        });
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(Array.from(map.values())));
      } catch {
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      }
    } else {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
  } else {
    // Ensure that if new initial products were added, they get included if not present
    try {
      const current: Product[] = JSON.parse(existingV2);
      const currentIds = new Set(current.map(p => p.id));
      let added = false;
      INITIAL_PRODUCTS.forEach(ip => {
        if (!currentIds.has(ip.id)) {
          current.push(ip);
          added = true;
        }
      });
      if (added) {
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(current));
      }
    } catch {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
  }
  if (!localStorage.getItem(KEYS.REVIEWS)) {
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  }
  if (!localStorage.getItem(KEYS.ORDERS)) {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  }
  if (!localStorage.getItem(KEYS.TICKETS)) {
    const defaultTickets: SupportTicket[] = [
      {
        id: 'TICK-101',
        userId: 'user-sample-01',
        userName: 'Pooja Verma',
        userEmail: 'pooja.verma@example.com',
        orderId: 'FK-2026-8832',
        subject: 'Delivery boy was polite and on time',
        message: 'Just wanted to appreciate the fast delivery to Chi IV within 25 mins!',
        status: 'Resolved',
        adminReply: 'Thank you Pooja ji! Glad we could serve you fresh groceries promptly.',
        createdAt: '2026-09-22T17:00:00Z',
        updatedAt: '2026-09-22T17:30:00Z',
      },
    ];
    localStorage.setItem(KEYS.TICKETS, JSON.stringify(defaultTickets));
  }
}

// Products API
export function getProducts(): Product[] {
  initStorage();
  try {
    const raw = localStorage.getItem(KEYS.PRODUCTS);
    return raw ? JSON.parse(raw) : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function getProductById(id: string): Product | undefined {
  const products = getProducts();
  return products.find(p => p.id === id);
}

export function saveProduct(product: Product): Product {
  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.unshift(product);
  }
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  emitEvent('products_updated', products);
  return product;
}

export function deleteProduct(id: string): boolean {
  const products = getProducts().filter(p => p.id !== id);
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  emitEvent('products_updated', products);
  return true;
}

export function updateProductStock(id: string, quantitySold: number): void {
  const products = getProducts();
  const product = products.find(p => p.id === id);
  if (product) {
    product.stock = Math.max(0, product.stock - quantitySold);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    emitEvent('products_updated', products);
  }
}

// Reviews API
export function getReviews(): Review[] {
  initStorage();
  try {
    const raw = localStorage.getItem(KEYS.REVIEWS);
    return raw ? JSON.parse(raw) : INITIAL_REVIEWS;
  } catch {
    return INITIAL_REVIEWS;
  }
}

export function getProductReviews(productId: string): Review[] {
  return getReviews().filter(r => r.productId === productId);
}

export function addReview(review: Review): Review {
  const reviews = getReviews();
  reviews.unshift(review);
  localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));

  // Recalculate and update product rating
  const productReviews = reviews.filter(r => r.productId === review.productId);
  const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
  const roundedRating = Math.round(avg * 10) / 10;

  const products = getProducts();
  const product = products.find(p => p.id === review.productId);
  if (product) {
    product.rating = roundedRating;
    product.ratingCount = productReviews.length;
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  }

  emitEvent('reviews_updated', { productId: review.productId, reviews });
  emitEvent('products_updated', products);
  return review;
}

export function deleteReview(reviewId: string, productId: string): boolean {
  const reviews = getReviews().filter(r => r.id !== reviewId);
  localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));

  const productReviews = reviews.filter(r => r.productId === productId);
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (product) {
    if (productReviews.length > 0) {
      const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
      product.rating = Math.round(avg * 10) / 10;
      product.ratingCount = productReviews.length;
    } else {
      product.rating = 4.5;
      product.ratingCount = 0;
    }
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  }

  emitEvent('reviews_updated', { productId, reviews });
  emitEvent('products_updated', products);
  return true;
}

// Orders API
export function getOrders(): Order[] {
  initStorage();
  try {
    const raw = localStorage.getItem(KEYS.ORDERS);
    return raw ? JSON.parse(raw) : INITIAL_ORDERS;
  } catch {
    return INITIAL_ORDERS;
  }
}

export function getOrderById(id: string): Order | undefined {
  return getOrders().find(o => o.id === id);
}

export function getUserOrders(userId: string, email?: string): Order[] {
  return getOrders().filter(o => o.userId === userId || (email && o.userEmail === email));
}

export function createOrder(order: Order): Order {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));

  // Deduct stock for each purchased item
  order.items.forEach(item => {
    updateProductStock(item.productId, item.quantity);
  });

  emitEvent('orders_updated', orders);
  return order;
}

export function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note?: string
): Order | undefined {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Order marked as ${newStatus}`,
    });
    if (newStatus === 'Delivered') {
      order.estimatedDelivery = 'Delivered successfully';
    } else if (newStatus === 'Cancelled') {
      order.estimatedDelivery = 'Cancelled';
    }
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    emitEvent('orders_updated', orders);
    emitEvent(`order_status_${orderId}`, order);
  }
  return order;
}

export function cancelOrder(orderId: string, reason?: string): boolean {
  const order = getOrderById(orderId);
  if (!order) return false;
  // Allow cancel only if not Packed or beyond
  if (order.status === 'Packed' || order.status === 'Out for Delivery' || order.status === 'Delivered') {
    return false;
  }
  updateOrderStatus(orderId, 'Cancelled', reason || 'Cancelled by customer');
  return true;
}

// Support Tickets API
export function getTickets(): SupportTicket[] {
  initStorage();
  try {
    const raw = localStorage.getItem(KEYS.TICKETS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getUserTickets(userId: string, email?: string): SupportTicket[] {
  return getTickets().filter(t => t.userId === userId || (email && t.userEmail === email));
}

export function createTicket(ticket: SupportTicket): SupportTicket {
  const tickets = getTickets();
  tickets.unshift(ticket);
  localStorage.setItem(KEYS.TICKETS, JSON.stringify(tickets));
  emitEvent('tickets_updated', tickets);
  return ticket;
}

export function updateTicket(
  ticketId: string,
  status: 'Open' | 'In Progress' | 'Resolved',
  adminReply?: string
): SupportTicket | undefined {
  const tickets = getTickets();
  const ticket = tickets.find(t => t.id === ticketId);
  if (ticket) {
    ticket.status = status;
    if (adminReply) {
      ticket.adminReply = adminReply;
    }
    ticket.updatedAt = new Date().toISOString();
    localStorage.setItem(KEYS.TICKETS, JSON.stringify(tickets));
    emitEvent('tickets_updated', tickets);
  }
  return ticket;
}

// Recently Viewed Products
export function getRecentlyViewed(): Product[] {
  try {
    const raw = localStorage.getItem(KEYS.RECENTLY_VIEWED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(product: Product): void {
  try {
    let list = getRecentlyViewed().filter(p => p.id !== product.id);
    list.unshift(product);
    list = list.slice(0, 8); // Keep top 8
    localStorage.setItem(KEYS.RECENTLY_VIEWED, JSON.stringify(list));
    emitEvent('recently_viewed_updated', list);
  } catch {
    // ignore storage quota
  }
}
