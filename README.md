<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
</div>

<br />

<div align="center">
  <h1 align="center">Nayora Clothing — Premium E-Commerce Platform</h1>
  <p align="center">
    A high-performance, aesthetically driven e-commerce storefront built with Next.js App Router, demonstrating best-in-class full-stack architecture, SEO optimization, and exceptional User Experience.
    <br />
    <br />
    <a href="https://github.com/minsadimethsani/E-Commerce-platform-for-Nayora-Clothing"><strong>Explore the Repository »</strong></a>
  </p>
</div>

---

## ✨ Overview

**Nayora Clothing** is a modern e-commerce web application engineered to deliver a seamless shopping experience. The platform combines a luxurious design aesthetic (featuring espresso, cream, and olive tones) with a highly optimized, production-ready technical foundation. 

By leveraging the latest Next.js 16 App Router features, this project strictly adheres to the separation of **Server Components** (for lightning-fast initial loads and pristine SEO) and **Client Components** (for deep interactivity and state management).

## 🚀 Key Features

### 🛍️ Dynamic Product Architecture
- **Slug-Based Routing:** Every product utilizes unique, human-readable slugs (e.g., `/product/silk-blend-slip-dress`) enabling exceptional SEO and clean URLs.
- **Hierarchical Categories:** Complex routing structures (`/category/[slug]/[subslug]`) handle collections like "Women's", "Men's", and deeply nested subcategories effortlessly.

### ⚡ Exceptional User Experience (UX)
- **Advanced Loading States:** Custom `loading.tsx` files implement beautifully synchronized skeleton loaders (using Tailwind's `animate-pulse`) for Categories, Single Products, and the Homepage. This entirely eliminates Layout Shifts.
- **Lazy Loading:** The homepage's "Curated Categories" utilize React `<Suspense>` to lazy-load content seamlessly, boosting initial render performance.
- **Custom Error Boundaries:** Deeply integrated `not-found.tsx` routes. A specialized fallback exists for individual products that may be out of stock, offering a "Recommended Products" grid rather than a dead-end 404 page.

### 🛒 High-Intent Shopping Flow
- **URL-Synced Filtering:** The Collections page features Search, Category Filtering, Sorting, and Pagination that automatically sync to the URL parameters (`?category=Men&page=2`). This allows users to bookmark and share exact search states.
- **Secure Checkout Modal:** The "Buy Now" button triggers a glassmorphic checkout modal.
- **Robust Validation:** Real-time frontend validations ensure proper email formatting and required fields before any API interaction occurs.

### 🔌 Full-Stack API Integration
- **Simulated Backend ORM:** The `lib/products.ts` layer acts as a simulated database controller with built-in network latency to mimic realistic data fetching.
- **API Routes:** The `/api/checkout` and `/api/products` endpoints handle POST and GET requests natively. 
- **Graceful Failure Handling:** The checkout API includes a simulated 10% failure rate to demonstrate robust frontend error catching and display (preventing data loss while notifying the user).

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router paradigm)
- **Language:** [TypeScript](https://www.typescriptlang.org/) for strict type safety
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for utility-first, responsive design
- **State Management:** React Hooks (`useState`, `useEffect`, `useSearchParams`)
- **Icons & Assets:** Curated visual assets mirroring high-end editorial brands.

---

## 📂 Project Structure

```text
├── app/
│   ├── api/                  # Backend REST API endpoints (checkout, products)
│   ├── category/             # Dynamic category and subcategory routes
│   ├── collections/          # Interactive product grid with URL-synced filters
│   ├── product/[slug]/       # Dynamic individual product SEO pages
│   ├── loading.tsx           # Global fallback loaders
│   ├── not-found.tsx         # Global 404 handling
│   └── page.tsx              # Homepage with Suspense-driven lazy loading
├── components/               
│   ├── ProductActions.tsx    # Client-side size selection & checkout modal
│   ├── ProductCard.tsx       # Reusable UI component for product grids
│   └── ProductCardSkeleton.tsx # Reusable loading skeleton
├── data/
│   └── cloths.ts             # Source of truth for product mock data
└── lib/
    └── products.ts           # Data access layer mimicking an ORM/Database
```

---

## 💻 Getting Started

To run this project locally, follow these steps:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18.17 or higher) installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/minsadimethsani/E-Commerce-platform-for-Nayora-Clothing.git
   cd E-Commerce-platform-for-Nayora-Clothing
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Explore the platform:**
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🏗️ Future Roadmap

- **Cloud Firestore Integration:** Transitioning the `lib/products.ts` helper layer to query a live Google Firebase/Firestore database.
- **Global State Management:** Implementing Zustand or the React Context API to manage a persistent Shopping Cart across all routes.
- **Payment Gateway:** Connecting the `/api/checkout` route to Stripe for live transaction processing.

---

<div align="center">
  <p>Crafted with precision for <strong>Nayora Clothing</strong></p>
</div>
