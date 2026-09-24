# FreshKart - Online Grocery & Kirana Supermarket (Greater Noida)
**Prodigy Infotech Web Development Task-03: E-commerce Website**

FreshKart is a full-featured, production-quality quick-commerce web application for a local kirana store based in Jagat Farm, Greater Noida. Built with React 19, TypeScript, Tailwind CSS, Lucide icons, and Motion, it delivers a modern Blinkit / BigBasket tier experience with fast 25-minute delivery simulation across all major Greater Noida sectors.

---

## 🌟 Key Features & Implementation Checklist

### 1. Catalog & Discovery
- **48+ Realistic Grocery Products**: Handpicked staples, dairy, farm-fresh produce, snacks, beverages, and household essentials from top Indian brands (Aashirvaad, Amul, Tata, Fortune, Parle, Britannia, Maggi, Surf Excel, Haldiram's, etc.).
- **Instant Search with Live Suggestions**: Debounced search dropdown showing image, title, category, and price.
- **Greater Noida Sector Selector**: Quick location selector for Alpha 1 & 2, Beta, Gamma, Delta, Pari Chowk, Chi IV, ATS Paradiso, and Jaypee Greens with 20–30 min delivery promises.

### 2. Working Sort & Filters (Synced to URL Query)
- **Filters**: Category tabs, price range slider (₹30–₹700), brand selector, minimum star ratings (★ 3.5+, 4.0+, 4.5+), in-stock only toggle, discount % thresholds (10%+, 15%+, 20%+).
- **Sorting**: Relevance, Price low→high, Price high→low, Highest Customer Rating, Newest Arrivals, Name A→Z.
- **Active Filter Chips**: Individual dismissal chips and "Clear all filters" button.
- **Responsive Layout**: Grid and List view toggle for desktop; full bottom-sheet filter drawer for mobile.

### 3. Product Detail & Working Reviews
- **Interactive Gallery**: Thumbnail selector and zoom effect.
- **Variants Selector**: Pack size and weight selector (e.g. 500g, 1kg, 2kg, 5kg).
- **Working User Reviews**:
  - Live average rating calculation and star distribution breakdown bars (5★ through 1★).
  - Write a review form (1 to 5 stars + feedback comment).
  - One review per user enforcement.
  - Delete user review functionality with automatic re-computation of the product rating.
- **Related Products**: Smart cross-sell carousel of items in the same grocery category.

### 4. Shopping Cart & Micro-Interactions
- **Slide-in Mini-Cart Drawer**: Triggered from navbar with smooth backdrop.
- **Full Cart Page**: Stepper controls (`- 1 +`), item removal, line totals.
- **Free Delivery Progress Bar**: Dynamic calculation towards the ₹499 free-delivery threshold.
- **Working Coupons**:
  - `FRESH10`: 10% discount on entire cart.
  - `WELCOME50`: Flat ₹50 off on orders above ₹199.
- **Persistence & Merging**: Preserves items across browser reloads for guests and logged-in users.

### 5. Multi-Step Checkout & Payments
- **Progress Indicator**: Address Step → Payment Step → Review & Confirmation.
- **Greater Noida Address Validation**: Flat/House, Society, Landmark, Sector, Pincode, and recipient contact. Saved address selector with default toggle.
- **Payments**:
  - **Razorpay Test Mode**: Loads `checkout.js` with `VITE_RAZORPAY_KEY_ID`.
  - **Interactive Test Payment Simulator**: Auto-approving UPI / Card simulation if no test key is set, ensuring tests never break.
  - **Cash on Delivery (COD)**: Contactless cash or UPI QR handover option.

### 6. Real-Time Order Tracking
- **Sequential Statuses**: `Placed` → `Confirmed` → `Packed` → `Out for Delivery` → `Delivered` (or `Cancelled`).
- **Audit History**: `statusHistory` array with timestamps and store notes.
- **Live Reactive Updates**: Store manager status changes in the Admin portal reflect immediately in the customer's tracking screen without full page reloads.
- **Customer Cancellation**: Enabled before the `Packed` stage.
- **Reorder Button**: 1-click re-addition of all items to cart.

### 7. Customer Support & FAQs
- **Interactive FAQ Accordion**: Delivery radius, store timings, and returns.
- **Support Ticket Form**: Submit tickets with optional order ID.
- **My Tickets**: Displays ticket status (`Open`, `In Progress`, `Resolved`) and admin replies.
- **Floating Help Button**: Persistent button across all pages.

### 8. Authentication & Profile
- Email/Password login and registration with persistent local storage.
- Single-click **Google Sign-In** simulation.
- Profile page for managing saved delivery addresses.

### 9. Admin Dashboard (`/admin`)
- **KPI Metrics**: Total orders, revenue, catalog SKUs, open support tickets.
- **7-Day Sales Trend Bar Chart**: Revenue visualizer.
- **Catalog Management**: Add, edit, and delete products with image preview, stock count, and price.
- **Live Order Control**: Advance statuses (`Placed` → `Confirmed` → `Packed` → `Out for Delivery` → `Delivered`).
- **Ticket Helpdesk**: View open tickets and post official replies.

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Quick Access |
| :--- | :--- | :--- | :--- |
| **Store Admin** | `admin@freshkart.com` | `Admin@123` | Direct button on `/auth` or `/admin` |
| **Demo Customer** | `pooja.verma@example.com` | `Pooja@123` | Direct button on `/auth` |

---

## ⚙️ Environment Variables (`.env.example`)

```env
# Optional Razorpay Test Key (If not provided, FreshKart uses its interactive test payment simulation)
VITE_RAZORPAY_KEY_ID="rzp_test_YourKeyHere"

# Optional Firebase Configuration (If not provided, FreshKart uses its persistent local storage engine)
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""
```

---

## 🚀 Local Development & Build

```bash
# Run development server
npm run dev

# Build for production deployment
npm run build
```
