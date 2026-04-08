<div align="center">

# CLOTHSY

**Seasonless. Considered. Full-Stack E-Commerce.**

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.11.2-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org)
[![Vite](https://img.shields.io/badge/Vite-8.0.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Stripe](https://img.shields.io/badge/Stripe-24.22.0-008CDD?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.19-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![MUI](https://img.shields.io/badge/MUI-7.3.9-007FFF?style=for-the-badge&logo=mui&logoColor=white)](https://mui.com)

[**Live Demo**](https://clothsy-seven.vercel.app/) · [**API Base**](https://clothsy-api.onrender.com) · [**GitHub**](https://github.com/harshadunna/Clothsy)

> ⚠️ **Note on Live Demo:** The Spring Boot backend is hosted on a free Render instance. If it has been inactive, the very first request may take **40-50 seconds** to wake the server up. Subsequent requests will be lightning fast.

</div>
---

## Overview

Clothsy is a production-deployed, full-stack luxury fashion e-commerce platform built with a Spring Boot 3.3.5 REST API and a React 19 SPA. The system ships with:

- **Dual-layer CORS architecture** — a `FilterRegistrationBean<CorsFilter>` at `Ordered.HIGHEST_PRECEDENCE` (Tomcat servlet level) handles preflight `OPTIONS` before Spring Security's `JwtTokenValidator` ever fires
- **OAuth2 social login** (Google + GitHub) with an automatic email/login fallback for users with hidden GitHub emails, plus a UUID-based password reset flow via Resend transactional emails
- **"Complete the Look" AI pairing engine** — gender-resolved outfit recommendations using recursive category tree traversal, hand-curated pairing maps, a three-join JPQL query, and randomized selection with fallback
- **Dynamic pricing engine** — `applyActivePromotions()` walks the category hierarchy at query time, applies the best active `Promotion` discount in memory, never persists promotional prices to the database
- **12-state order lifecycle** with item-level granularity (partial cancel, partial return), a `@Scheduled` courier tracking simulator for both forward and reverse logistics, and status-driven transactional email dispatch via the Resend API
- **Server-side PDF invoice generation** with OpenPDF, attached to order confirmation emails as Base64-encoded Resend attachments
- **Fuzzy search** with Levenshtein distance scoring and stop-word filtering across product title, description, brand, color, and category
- **Guest cart persistence** in `localStorage` with automatic merge on login via `POST /api/cart/merge`
- **Admin analytics dashboard** with time-windowed KPIs (weekly/monthly/yearly), category revenue breakdown, top products, low stock alerts, pending directives, and Recharts-powered revenue trend charts
- **Cloudinary image pipeline** for admin product uploads with `q_auto,f_auto` compression applied across the frontend

---

## System Architecture

```mermaid
graph TB
    subgraph Client["Client Browser"]
        React["React 19 SPA<br/>(Vite 8)"]
    end

    subgraph Vercel["Vercel Edge Network"]
        SPA["Static Build + SPA Rewrites<br/>/* → /index.html"]
    end

    subgraph Render["Render Docker Service"]
        Boot["Spring Boot 3.3.5<br/>(Temurin JDK 21)"]
    end

    subgraph Database["Managed MySQL 8"]
        MySQL[(MySQL)]
    end

    subgraph ThirdParty["Third-Party Integrations"]
        Stripe["Stripe Checkout<br/>+ Webhook Verification"]
        Cloudinary["Cloudinary CDN<br/>Image Upload & Compression"]
        Resend["Resend API<br/>Transactional Emails"]
        Google["Google OAuth2"]
        GitHub["GitHub OAuth2"]
    end

    React -->|HTTPS| SPA
    SPA -->|API Requests| Boot
    Boot -->|JPA / Hibernate| MySQL
    Boot -->|Checkout Sessions| Stripe
    Boot -->|Image Upload| Cloudinary
    Boot -->|Email Dispatch| Resend
    Boot -->|Social Login| Google
    Boot -->|Social Login| GitHub
    Stripe -->|checkout.session.completed| Boot

    style Client fill:#FFF8F5,stroke:#1A1109,color:#1A1109
    style Vercel fill:#000,stroke:#fff,color:#fff
    style Render fill:#46E3B7,stroke:#000,color:#000
    style Database fill:#4479A1,stroke:#fff,color:#fff
    style ThirdParty fill:#F5F0EA,stroke:#C8742A,color:#1A1109
```

---

## CORS & Security Filter Architecture

The CORS strategy intentionally disables Spring Security's built-in CORS support (`.cors(AbstractHttpConfigurer::disable)`) and registers a standalone Tomcat-level `CorsFilter` at `Ordered.HIGHEST_PRECEDENCE`. This guarantees that `OPTIONS` preflight requests are fully resolved and responded to before the request ever reaches the Spring Security filter chain where `JwtTokenValidator` sits.

```mermaid
sequenceDiagram
    participant Browser
    participant Tomcat as Tomcat Servlet Container
    participant CORS as GlobalCorsFilter<br/>(Ordered.HIGHEST_PRECEDENCE)
    participant Security as Spring Security FilterChain
    participant JWT as JwtTokenValidator<br/>(before BasicAuthFilter)
    participant Controller

    Note over Browser,Controller: OPTIONS Preflight Request
    Browser->>Tomcat: OPTIONS /api/orders
    Tomcat->>CORS: FilterRegistrationBean fires first
    CORS-->>Browser: 200 OK + Access-Control-Allow-*
    Note right of CORS: Request NEVER reaches<br/>Security or JWT filter

    Note over Browser,Controller: Authenticated GET Request
    Browser->>Tomcat: GET /api/orders/user<br/>Authorization: Bearer <jwt>
    Tomcat->>CORS: Add CORS headers
    CORS->>Security: Pass to next filter
    Security->>JWT: Extract & validate JWT
    JWT->>Controller: SecurityContext populated
    Controller-->>Browser: 200 OK + JSON payload
```

**Key design decisions:**
- `FilterRegistrationBean<CorsFilter>` bean in `AppConfig` with `bean.setOrder(Ordered.HIGHEST_PRECEDENCE)`
- `JwtTokenValidator` extends `OncePerRequestFilter`, registered via `.addFilterBefore(new JwtTokenValidator(jwtSecret), BasicAuthenticationFilter.class)`
- JWT validation failures clear `SecurityContext` silently instead of throwing — prevents 500 errors on public endpoints with stale tokens
- Allowed origins include `safeFrontendUrl` (env-driven), `localhost:5173`, and `https://*.vercel.app` wildcard patterns

---

## Authentication & OAuth2 Flow

```mermaid
sequenceDiagram
    participant User
    participant React as React SPA
    participant Auth as AuthController<br/>(/auth)
    participant OAuth as OAuth2 Success Handler
    participant DB as MySQL
    participant JWT as JwtTokenProvider

    Note over User,JWT: Standard Email/Password Signup
    User->>React: Submit registration form
    React->>Auth: POST /auth/signup {email, password, firstName, lastName, role}
    Auth->>DB: Check findByEmail()
    Auth->>DB: Save new User (BCrypt encoded password)
    Auth->>DB: cartService.createCart(user)
    Auth->>JWT: generateToken(authentication)
    JWT-->>React: { jwt, status: true }
    React->>React: localStorage.setItem("jwt", token)<br/>dispatch(mergeCart())

    Note over User,JWT: Standard Email/Password Signin
    User->>React: Submit login form
    React->>Auth: POST /auth/signin {email, password}
    Auth->>DB: loadUserByUsername(email)
    Auth->>Auth: passwordEncoder.matches()
    Auth->>JWT: generateToken(authentication)
    JWT-->>React: { jwt, status: true }

    Note over User,JWT: Google / GitHub OAuth2
    User->>React: Click "Sign in with Google/GitHub"
    React->>OAuth: Redirect to /oauth2/authorization/{provider}
    OAuth->>OAuth: OAuth2 callback received
    OAuth->>OAuth: Extract email (or login + @github.com fallback)
    OAuth->>DB: findByEmail(email)
    alt User does not exist
        OAuth->>DB: Save new User (provider: OAUTH2, no password)
        OAuth->>DB: cartService.createCart(user)
    end
    OAuth->>JWT: generateTokenFromEmail(email, role)
    OAuth-->>React: Redirect to /oauth2/redirect?token=<jwt>
    React->>React: OAuth2RedirectHandler stores token

    Note over User,JWT: Password Reset (UUID Token)
    User->>React: Submit forgot password form
    React->>Auth: POST /auth/forgot-password {email}
    Auth->>DB: Generate UUID token, save PasswordResetToken (10 min TTL)
    Auth->>Auth: emailApiService.sendPasswordResetEmail(email, resetLink)
    Auth-->>React: { message, status: true } (always succeeds)
    User->>React: Click reset link, submit new password
    React->>Auth: POST /auth/reset-password {token, newPassword}
    Auth->>DB: Validate token, update BCrypt password, delete token
```

---

## Order Lifecycle State Diagram

```mermaid
stateDiagram-v2
    [*] --> PENDING: createOrder()
    PENDING --> PLACED: placedOrder() [Stripe webhook]
    PLACED --> CONFIRMED: confirmedOrder() [Admin]
    CONFIRMED --> SHIPPED: shippedOrder() [Admin]
    SHIPPED --> OUT_FOR_DELIVERY: simulateCourierTracking() [progress ≥ 85%]
    OUT_FOR_DELIVERY --> DELIVERED: simulateCourierTracking() [progress ≥ 100%]
    
    DELIVERED --> RETURN_REQUESTED: returnOrderItems() [User, 7-day window]
    RETURN_REQUESTED --> RETURN_PICKED: returnPickedOrder() [Scheduler, 12h]
    RETURN_PICKED --> RETURN_RECEIVED: returnReceivedOrder() [Scheduler, 36h]
    RETURN_RECEIVED --> REFUND_INITIATED: refundInitiatedOrder() [Scheduler, 48h]
    REFUND_INITIATED --> REFUND_COMPLETED: refundCompletedOrder() [Scheduler, 60h]
    
    PENDING --> CANCELLED: cancelOrder()
    PLACED --> CANCELLED: cancelOrder() / cancelOrderItems()
    CONFIRMED --> CANCELLED: cancelOrder() / cancelOrderItems()

    note right of PLACED
        Stripe webhook verification:
        Webhook.constructEvent(payload, sigHeader, endpointSecret)
        Falls back to raw JSON parsing if standard
        deserialization fails
    end note

    note right of REFUND_COMPLETED
        Inventory restocked on:
        - CANCELLED (per-item)
        - REFUND_COMPLETED (per-item)
    end note
```

**Stripe Webhook Verification Sequence:**
1. `POST /api/payments/webhook` receives raw payload + `Stripe-Signature` header
2. `Webhook.constructEvent()` verifies HMAC signature against `stripe.webhook.secret`
3. On `checkout.session.completed`, extracts `order_id` from session metadata
4. Falls back to raw JSON parsing via Jackson `ObjectMapper` if standard Stripe deserialization returns empty
5. Calls `orderService.placedOrder(orderId)` — deducts inventory, sets payment status to `COMPLETED`
6. Fires `emailApiService.sendOrderUpdateEmail(confirmedOrder, "PLACED")` with attached PDF invoice

---

## Complete the Look — Pairing Engine

```mermaid
flowchart TB
    Start["getRecommendations(productId)"] --> FindProduct["findProductById(productId)"]
    FindProduct --> Resolve["resolveGenderRoot(category)"]
    
    Resolve --> CheckParent{"parentCategory == null?"}
    CheckParent -->|Yes| ReturnName["Return category.name<br/>(collections or atelier)"]
    CheckParent -->|No| Recurse["resolveGenderRoot(parentCategory)"]
    Recurse --> CheckParent
    
    ReturnName --> Gender{"genderRoot?"}
    
    Gender -->|atelier| MensMap["Mens Pairing Map"]
    Gender -->|collections| WomensMap["Womens Pairing Map"]
    
    MensMap --> MensEntries["poplin-shirts → trousers, raw-denim, suits, briefcases, watches, boots<br/>fine-knits → trousers, raw-denim, suits, briefcases, watches, boots<br/>trousers → poplin-shirts, fine-knits, overcoats, boots, belts<br/>raw-denim → poplin-shirts, fine-knits, overcoats, boots, belts<br/>overcoats → poplin-shirts, trousers, raw-denim, suits, briefcases<br/>suits → poplin-shirts, overcoats, watches, briefcases, boots<br/>briefcases/boots/watches/belts → suits, poplin-shirts, trousers, raw-denim, overcoats"]
    
    WomensMap --> WomensEntries["blouses/knits/jumpers → womens-trousers, outerwear, bags, jewelry, footwear<br/>womens-trousers → blouses, knits, jumpers, outerwear, footwear, bags<br/>silk-dresses/evening-dresses → jewelry, bags, scarves, footwear, outerwear<br/>outerwear → blouses, womens-trousers, knits, silk-dresses, bags, eyewear<br/>bags/footwear/jewelry/scarves/eyewear → silk-dresses, evening-dresses, womens-trousers, blouses, outerwear"]
    
    MensEntries --> Shuffle["Collections.shuffle(targetCategories)"]
    WomensEntries --> Shuffle
    
    Shuffle --> Query["For each target slug:<br/>findTopByGenderAndCategory(genderRoot, slug)<br/>(3-join JPQL: product → leaf → mid → root)"]
    Query --> ShuffleResults["Shuffle results, pick 1 unique per category<br/>Until 4 results collected"]
    
    ShuffleResults --> Enough{"results.size() >= 4?"}
    Enough -->|No| Fallback["findRecentByGenderExcludingCategory()<br/>Shuffle + fill to 4"]
    Enough -->|Yes| Pricing
    Fallback --> Pricing["applyActivePromotions() on each result"]
    Pricing --> Return["Return 4 paired products"]

    style Start fill:#C8742A,color:#fff
    style Return fill:#16A34A,color:#fff
```

**Three-Join JPQL Query:**
```sql
SELECT p FROM Product p
JOIN p.category c           -- leaf (level 3)
JOIN c.parentCategory mid   -- mid  (level 2)
JOIN mid.parentCategory root -- root (level 1)
WHERE LOWER(root.name) = LOWER(:genderRoot)
AND LOWER(c.name) = LOWER(:categorySlug)
ORDER BY p.createdAt DESC
```

---

## Dynamic Pricing Engine

```mermaid
flowchart TB
    Entry["applyActivePromotions(product, activePromotions)"] --> Guard{"product.category != null<br/>AND activePromtions not empty?"}
    Guard -->|No| Skip["Return unchanged product"]
    Guard -->|Yes| Init["maxDiscount = product.discountPercent"]
    
    Init --> Loop["For each active Promotion"]
    Loop --> Match{"isCategoryInTree(<br/>product.category,<br/>promo.targetCategory)?"}
    
    Match -->|No| Loop
    Match -->|Yes| Compare{"promo.discountPercent<br/>> maxDiscount?"}
    Compare -->|No| Loop
    Compare -->|Yes| Update["maxDiscount = promo.discountPercent"]
    Update --> Loop
    
    Loop --> Apply{"maxDiscount > original<br/>discountPercent?"}
    Apply -->|No| NoChange["Return product as-is"]
    Apply -->|Yes| Calculate["product.discountPercent = maxDiscount<br/>product.discountedPrice = price - (price × maxDiscount / 100)<br/>(IN MEMORY ONLY — never persisted)"]
    
    subgraph TreeWalk["isCategoryInTree() — Recursive"]
        CatCheck{"productCategory.id ==<br/>promoCategory.id?"}
        CatCheck -->|Yes| Found["return true"]
        CatCheck -->|No| WalkUp["isCategoryInTree(<br/>productCategory.parentCategory,<br/>promoCategory)"]
        WalkUp --> CatCheck
    end

    style Entry fill:#C8742A,color:#fff
    style Calculate fill:#16A34A,color:#fff
    style Skip fill:#7A7570,color:#fff
```

**How it works at query time:**
1. `PromotionRepository.findActivePromotions(LocalDateTime.now())` fetches all promotions where `startDate <= now AND endDate >= now`
2. For every product returned from any query (paginated listing, search, product detail, recommendations), `applyActivePromotions()` is called
3. The engine walks up the product's category tree (`leaf → mid → root`) checking if any ancestor matches a promotion's `targetCategory`
4. The best discount (highest `discountPercent`) wins — applied **in memory only**, never saved to the database
5. This means promotional pricing is instantly live and automatically expires without any cron job or database migration

---

## Frontend Redux State Architecture

```mermaid
graph TB
    subgraph Store["Redux Store (configureStore)"]
        Auth["auth<br/>─────────────<br/>user: User | null<br/>jwt: string | null<br/>isLoading: boolean<br/>error: string | null<br/>customers: User[]<br/>fetchingUser: boolean"]
        
        Product["product / customersProduct<br/>─────────────<br/>products: Product[]<br/>product: Product | null<br/>loading: boolean<br/>error: string | null<br/>searchProducts: Product[]"]
        
        Cart["cart<br/>─────────────<br/>cart: Cart | null<br/>cartItems: CartItem[]<br/>loading: boolean<br/>error: string | null<br/>(initialized from localStorage)"]
        
        OrderSlice["order<br/>─────────────<br/>orders: Order[]<br/>order: Order | null<br/>loading: boolean<br/>error: string | null<br/>success: boolean"]
        
        Wishlist["wishlist<br/>─────────────<br/>wishlist: Wishlist | null<br/>loading: boolean<br/>error: string | null"]
        
        Review["review<br/>─────────────<br/>reviews: Review[]<br/>loading: boolean<br/>error: string | null"]
    end

    subgraph Interceptor["Axios Interceptor (api.js)"]
        Token["Dual-Token Selection:<br/>pathname.startsWith('/admin')<br/>→ localStorage.admin_jwt<br/>else → localStorage.jwt"]
    end

    subgraph Pages["Pages & Components"]
        Nav["Navigation"] -->|auth| Auth
        Home["HomePage"] -->|product| Product
        PDP["ProductDetails"] -->|product, review| Product
        PDP -->|product, review| Review
        CartPage["Cart"] -->|cart| Cart
        Checkout["Checkout"] -->|auth, cart| Auth
        Checkout -->|auth, cart| Cart
        Orders["Profile/Orders"] -->|auth, order| Auth
        Orders -->|auth, order| OrderSlice
        WishPage["Wishlist"] -->|wishlist| Wishlist
        AdminDash["AdminDashboard"] -->|auth| Auth
        AdminOrders["AdminOrders"] -->|auth| Auth
        AdminProducts["AdminProducts"] -->|product| Product
        AdminCustomers["AdminCustomers"] -->|auth.customers| Auth
    end

    Token -.->|Bearer header| Store

    style Store fill:#F5F0EA,stroke:#C8742A,color:#1A1109
    style Interceptor fill:#1A1109,stroke:#C8742A,color:#FFF8F5
    style Pages fill:#FFF8F5,stroke:#1A1109,color:#1A1109
```

**Dual-Token Interceptor Logic:**
```javascript
api.interceptors.request.use((config) => {
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const token = isAdminRoute
    ? localStorage.getItem("admin_jwt")
    : localStorage.getItem("jwt");
  if (token && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

On `getUser()` success, if the authenticated user has role `ADMIN` or `ROLE_ADMIN`, the token is duplicated to `localStorage.admin_jwt`. On logout, only the context-appropriate token is removed (admin route clears `admin_jwt`, storefront clears `jwt`).

---

## Three-Level Category Hierarchy

```mermaid
graph TB
    Root["Category Hierarchy<br/>(3 levels)"]
    
    Root --> Women["collections<br/>(Level 1)"]
    Root --> Men["atelier<br/>(Level 1)"]
    
    Women --> WClothing["women_clothing<br/>(Level 2)"]
    Women --> WAccessories["women_accessories<br/>(Level 2)"]
    
    WClothing --> blouses["blouses"]
    WClothing --> knits["knits"]
    WClothing --> jumpers["jumpers"]
    WClothing --> womensTrousers["womens-trousers"]
    WClothing --> silkDresses["silk-dresses"]
    WClothing --> eveningDresses["evening-dresses"]
    WClothing --> outerwear["outerwear"]
    
    WAccessories --> bags["bags"]
    WAccessories --> footwear["footwear"]
    WAccessories --> jewelry["jewelry"]
    WAccessories --> scarves["scarves"]
    WAccessories --> eyewear["eyewear"]
    
    Men --> MClothing["men_clothing<br/>(Level 2)"]
    Men --> MAccessories["men_accessories<br/>(Level 2)"]
    
    MClothing --> poplinShirts["poplin-shirts"]
    MClothing --> fineKnits["fine-knits"]
    MClothing --> trousers["trousers"]
    MClothing --> rawDenim["raw-denim"]
    MClothing --> overcoats["overcoats"]
    MClothing --> suits["suits"]
    
    MAccessories --> briefcases["briefcases"]
    MAccessories --> boots["boots"]
    MAccessories --> watches["watches"]
    MAccessories --> belts["belts"]

    style Root fill:#1A1109,color:#FFF8F5
    style Women fill:#C8742A,color:#fff
    style Men fill:#C8742A,color:#fff
    style WClothing fill:#F5F0EA,stroke:#C8742A,color:#1A1109
    style WAccessories fill:#F5F0EA,stroke:#C8742A,color:#1A1109
    style MClothing fill:#F5F0EA,stroke:#C8742A,color:#1A1109
    style MAccessories fill:#F5F0EA,stroke:#C8742A,color:#1A1109
```

Categories are auto-created by `ProductServiceImplementation.createProduct()` via a three-level cascade: `topLevelCategory` → `secondLevelCategory` → `thirdLevelCategory`. The `resolveGenderRoot()` function recursively walks up to the Level 1 root to determine gender context for the pairing engine.

---

## Database ER Diagram

```mermaid
erDiagram
    users {
        Long id PK
        String firstName
        String lastName
        String password
        String email
        String role
        String mobile
        LocalDateTime createdAt
        String provider
    }

    addresses {
        Long id PK
        String firstName
        String lastName
        String streetAddress
        String city
        String state
        String zipCode
        String mobile
        Long user_id FK
    }

    payment_information {
        String cardholderName
        String cardNumber
        LocalDate expirationDate
        String cvv
        Long user_id FK
    }

    categories {
        Long id PK
        String name
        int level
        Long parent_category_id FK
    }

    products {
        Long id PK
        String title
        String description
        String materials
        String fit
        Integer price
        Integer discountedPrice
        Integer discountPercent
        Integer quantity
        String brand
        String color
        String imageUrl
        String curation_tag
        LocalDateTime createdAt
        Integer num_ratings
        Double average_rating
        Long category_id FK
    }

    product_images {
        Long product_id FK
        String image_url
    }

    product_sizes {
        Long product_id FK
        String name
        int quantity
    }

    carts {
        Long id PK
        Long user_id FK
        double totalPrice
        int totalItem
        int totalDiscountedPrice
        int discount
    }

    cart_items {
        Long id PK
        Long cart_id FK
        Long product_id FK
        String size
        int quantity
        Integer price
        Integer discountedPrice
        Long userId
    }

    orders {
        Long id PK
        String orderId
        Long user_id FK
        Long shipping_address_id FK
        LocalDate orderDate
        LocalDate deliveryDate
        double totalPrice
        Integer totalDiscountedPrice
        Integer discount
        String orderStatus
        int totalItem
        LocalDateTime createdAt
        String trackingNumber
        LocalDateTime shippedAt
        LocalDateTime estimatedDeliveryAt
        LocalDateTime returnRequestedAt
        String paymentMethod
        String status
        String stripeSessionId
        String stripePaymentIntentId
        String stripePaymentStatus
    }

    order_items {
        Long id PK
        Long order_id FK
        Long product_id FK
        String size
        int quantity
        Integer price
        Integer discountedPrice
        Long userId
        LocalDateTime deliveryDate
        String itemStatus
    }

    order_tracking_history {
        Long order_id FK
        String tracking_event
    }

    ratings {
        Long id PK
        Long user_id FK
        Long product_id FK
        double rating
        LocalDateTime createdAt
    }

    reviews {
        Long id PK
        String review
        double rating
        Long product_id FK
        Long user_id FK
        LocalDateTime createdAt
    }

    wishlist {
        Long id PK
        Long user_id FK
    }

    wishlist_products {
        Long wishlist_id FK
        Long product_id FK
    }

    promotions {
        Long id PK
        String name
        Integer discountPercent
        LocalDateTime startDate
        LocalDateTime endDate
        Long category_id FK
    }

    password_reset_token {
        Long id PK
        String token
        Long user_id FK
        LocalDateTime expiryDate
    }

    users ||--o{ addresses : "has"
    users ||--o{ payment_information : "has"
    users ||--|| carts : "has"
    users ||--o{ ratings : "submits"
    users ||--o{ reviews : "writes"
    users ||--|| wishlist : "has"
    users ||--o{ orders : "places"
    users ||--|| password_reset_token : "has"

    categories ||--o{ categories : "parent"
    categories ||--o{ products : "contains"
    categories ||--o{ promotions : "targeted by"

    products ||--o{ product_images : "has"
    products ||--o{ product_sizes : "has"
    products ||--o{ ratings : "receives"
    products ||--o{ reviews : "receives"
    products ||--o{ cart_items : "in"
    products ||--o{ order_items : "in"

    carts ||--o{ cart_items : "contains"
    wishlist ||--o{ wishlist_products : "contains"

    orders ||--o{ order_items : "contains"
    orders ||--o{ order_tracking_history : "tracks"
    orders }o--|| addresses : "ships to"
```

---

## Complete API Reference

### Authentication (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/signup` | Public | Register new user (BCrypt password, auto-creates cart) |
| `POST` | `/auth/signin` | Public | Authenticate and receive JWT token |
| `POST` | `/auth/forgot-password` | Public | Initiate password reset (UUID token, 10-min TTL, Resend email) |
| `POST` | `/auth/reset-password` | Public | Validate reset token and update password |

### Products (`/api/products`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | Public | Paginated product listing with filters (category, color, size, price range, discount, sort, stock, search) |
| `GET` | `/api/products/id/{productId}` | Public | Get single product by ID (with reviews and dynamic pricing) |
| `GET` | `/api/products/search?q=` | Public | Full-text fuzzy search with Levenshtein distance |
| `GET` | `/api/products/{productId}/recommendations` | Public | "Complete the Look" gender-aware outfit pairings (4 products) |
| `GET` | `/api/products/{productId}/similar` | Public | Similar products by category (4 products) |
| `GET` | `/api/products/curations/{tag}` | Public | Curated editorial collections with multi-tier fallback |

### Cart (`/api/cart`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/cart/` | JWT | Get authenticated user's cart |
| `PUT` | `/api/cart/add` | JWT | Add item to cart |
| `POST` | `/api/cart/merge` | JWT | Merge guest localStorage cart into DB cart on login |
| `DELETE` | `/api/cart/clear` | JWT | Clear all items from cart |

### Cart Items (`/api/cart_items`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `DELETE` | `/api/cart_items/{cartItemId}` | JWT | Remove specific item from cart |
| `PUT` | `/api/cart_items/{cartItemId}` | JWT | Update cart item quantity or size |

### Orders (`/api/orders`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/orders` | JWT | Create order from cart with shipping address ID |
| `GET` | `/api/orders/user` | JWT | Get user's full order history (excludes PENDING) |
| `GET` | `/api/orders/{orderId}` | JWT | Get specific order by ID (JOIN FETCH items + products) |
| `PUT` | `/api/orders/{orderId}/cancel-items` | JWT | Partially cancel specific items (restocks inventory) |
| `PUT` | `/api/orders/{orderId}/return-items` | JWT | Request return for delivered items (7-day window) |

### Payments (`/api/payments`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/payments/{orderId}` | JWT | Create Stripe Checkout session (INR, order metadata) |
| `POST` | `/api/payments/webhook` | Public | Stripe webhook handler (signature verification, order placement) |

### Users (`/api/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/users/profile` | JWT | Get authenticated user profile |
| `POST` | `/api/users/addresses` | JWT | Save a new address for the user |

### Addresses (`/api/addresses`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `DELETE` | `/api/addresses/{addressId}` | JWT | Soft-delete address (sets user to null, preserves for old orders) |
| `PUT` | `/api/addresses/{addressId}` | JWT | Update an existing address |

### Wishlist (`/api/wishlist`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/wishlist` | JWT | Get user's wishlist |
| `PUT` | `/api/wishlist/toggle/{productId}` | JWT | Toggle product in/out of wishlist |

### Ratings (`/api/ratings`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/ratings/create` | JWT | Submit a rating for a product |
| `GET` | `/api/ratings/product/{productId}` | Public | Get all ratings for a product |

### Reviews (`/api/reviews`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/reviews/create` | JWT | Submit a review for a product |
| `GET` | `/api/reviews/product/{productId}` | Public | Get all reviews for a product |

### Admin — Products (`/api/admin/products`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/admin/products/` | ADMIN | Create product (multipart: JSON req + image file → Cloudinary) |
| `POST` | `/api/admin/products/creates` | ADMIN | Bulk create products (JSON array) |
| `GET` | `/api/admin/products/all` | ADMIN | List all products (unfiltered) |
| `PUT` | `/api/admin/products/{productId}/update` | ADMIN | Update product details |
| `DELETE` | `/api/admin/products/{productId}/delete` | ADMIN | Delete product |

### Admin — Orders (`/api/admin/orders`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/orders` | ADMIN | List all orders (sorted by createdAt DESC) |
| `PUT` | `/api/admin/orders/{orderId}/confirmed` | ADMIN | Mark order as CONFIRMED |
| `PUT` | `/api/admin/orders/{orderId}/ship` | ADMIN | Mark order as SHIPPED (generates tracking number + ETA) |
| `PUT` | `/api/admin/orders/{orderId}/deliver` | ADMIN | Mark order as DELIVERED |
| `PUT` | `/api/admin/orders/{orderId}/cancel` | ADMIN | Cancel entire order (restocks all items) |
| `PUT` | `/api/admin/orders/{orderId}/return-picked` | ADMIN | Mark return items as picked up |
| `PUT` | `/api/admin/orders/{orderId}/return-received` | ADMIN | Mark return items as received at warehouse |
| `PUT` | `/api/admin/orders/{orderId}/refund-initiated` | ADMIN | Initiate refund process |
| `PUT` | `/api/admin/orders/{orderId}/refund-completed` | ADMIN | Complete refund (restocks inventory, sends email) |
| `DELETE` | `/api/admin/orders/{orderId}/delete` | ADMIN | Hard delete order |

### Admin — Users (`/api/admin`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/users` | ADMIN | List all registered users |
| `PUT` | `/api/admin/users/{userId}/role` | ADMIN | Update user role (promote/demote) |
| `GET` | `/api/admin/users/export` | ADMIN | Export all users as CSV download |

### Admin — Promotions (`/api/admin/promotions`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/admin/promotions/?categoryId=` | ADMIN | Create time-bound promotion for a category |
| `GET` | `/api/admin/promotions/` | ADMIN | List all promotions |
| `DELETE` | `/api/admin/promotions/{promoId}` | ADMIN | Delete promotion |
| `GET` | `/api/admin/promotions/categories` | ADMIN | List all categories (for promotion targeting) |

### Admin — Analytics (`/api/admin/analytics`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/analytics/dashboard?timeframe=` | ADMIN | Dashboard KPIs (revenue, orders, AOV, return rate, status distribution, top products, category revenue, low stock, pending orders, recent transactions) |
| `GET` | `/api/admin/analytics/charts` | ADMIN | Revenue trend data (weekly by day, monthly by week, yearly by month) |

### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Public | API health check — returns welcome message |

---

## Project Directory Tree

```
Clothsy/
├── Backend/
│   ├── Dockerfile                              # Multi-stage: Temurin JDK 21, mvnw build, JAR execution
│   ├── pom.xml                                 # Spring Boot 3.3.5 parent, all dependency versions
│   └── src/main/
│       ├── resources/
│       │   └── application.properties          # Env-var-driven config (DB, Stripe, OAuth2, Cloudinary, Resend)
│       └── java/org/harsha/backend/
│           ├── BackendApplication.java         # @EnableScheduling, PageSerializationMode.VIA_DTO
│           ├── config/
│           │   ├── AppConfig.java              # SecurityFilterChain + FilterRegistrationBean<CorsFilter> + OAuth2 handler
│           │   ├── CloudinaryConfig.java       # Cloudinary bean from env vars
│           │   ├── JwtConstant.java            # JWT_HEADER = "Authorization"
│           │   ├── JwtTokenProvider.java       # Token generation (24h TTL) + email extraction
│           │   └── JwtTokenValidator.java      # OncePerRequestFilter, silent failure on bad tokens
│           ├── controller/
│           │   ├── AuthController.java         # /auth — signup, signin, forgot-password, reset-password
│           │   ├── UserController.java         # /api/users — profile, address creation
│           │   ├── UserProductController.java  # /api/products — public listing, search, recommendations, curations
│           │   ├── CartController.java         # /api/cart — get, add, merge, clear
│           │   ├── CartItemController.java     # /api/cart_items — update, remove
│           │   ├── OrderController.java        # /api/orders — create, history, cancel-items, return-items
│           │   ├── PaymentController.java      # /api/payments — Stripe checkout + webhook
│           │   ├── AddressController.java      # /api/addresses — soft-delete, update
│           │   ├── WishlistController.java     # /api/wishlist — get, toggle
│           │   ├── RatingController.java       # /api/ratings — create, get by product
│           │   ├── ReviewController.java       # /api/reviews — create, get by product
│           │   ├── AdminProductController.java # /api/admin/products — CRUD + Cloudinary upload
│           │   ├── AdminOrderController.java   # /api/admin/orders — full lifecycle management
│           │   ├── AdminUserController.java    # /api/admin — user list, role update, CSV export
│           │   ├── AdminPromotionController.java # /api/admin/promotions — CRUD
│           │   ├── AdminAnalyticsController.java # /api/admin/analytics — KPIs + charts
│           │   └── HomeController.java         # / — health check
│           ├── model/
│           │   ├── User.java                   # Users table + addresses, ratings, reviews, paymentInfo
│           │   ├── Product.java                # Products table + sizes, images, ratings, reviews, category
│           │   ├── Category.java               # Self-referencing 3-level hierarchy with indexed name
│           │   ├── Order.java                  # Orders table + embedded PaymentDetails, tracking history
│           │   ├── OrderItem.java              # Per-item status tracking with delivery date
│           │   ├── Cart.java                   # 1:1 with User, totals calculated on access
│           │   ├── CartItem.java               # Cart item with product, size, quantity, prices
│           │   ├── Address.java                # Soft-deletable addresses (user set to null)
│           │   ├── Wishlist.java               # ManyToMany with Products
│           │   ├── Rating.java                 # Numeric rating per user per product
│           │   ├── Review.java                 # Text review + star rating
│           │   ├── Size.java                   # Embeddable: name + quantity per size
│           │   ├── Promotion.java              # Time-bound discount targeting a category
│           │   ├── PaymentDetails.java         # Embedded: Stripe session/intent IDs + status
│           │   ├── PaymentInformation.java     # Embedded: demo card details (non-PCI)
│           │   └── PasswordResetToken.java     # UUID token with 10-minute TTL
│           ├── repository/
│           │   ├── ProductRepository.java      # filterProducts(), 3-join gender queries, curation fallbacks
│           │   ├── OrderRepository.java        # JOIN FETCH queries, tracking status filters, analytics
│           │   ├── CategoryRepository.java     # findByName(), findByNameAndParent()
│           │   ├── OrderItemRepository.java    # findFrequentlyBoughtTogether() co-purchase query
│           │   ├── PromotionRepository.java    # findActivePromotions() by date range
│           │   ├── UserRepository.java         # findByEmail()
│           │   ├── CartRepository.java         # findByUserId()
│           │   ├── CartItemRepository.java     # User-scoped item queries
│           │   ├── AddressRepository.java      # findByUserId()
│           │   ├── WishlistRepository.java     # findByUserId()
│           │   ├── RatingRepository.java       # Product-scoped rating queries
│           │   ├── ReviewRepository.java       # Product-scoped review queries
│           │   └── PasswordResetTokenRepository.java # findByToken(), deleteByUserId()
│           ├── service/
│           │   ├── ProductServiceImplementation.java  # Pairing engine, dynamic pricing, fuzzy search
│           │   ├── OrderServiceImplementation.java    # 12-state lifecycle + @Scheduled courier sim
│           │   ├── CartServiceImplementation.java     # Cart operations with price recalculation
│           │   ├── EmailApiService.java               # Resend API + OpenPDF invoice generation
│           │   ├── CloudinaryService.java             # Image upload to Cloudinary
│           │   ├── CustomerUserDetails.java           # UserDetailsService for Spring Security
│           │   ├── DataInitializationComponent.java   # CommandLineRunner: seeds default admin
│           │   └── ... (interfaces + other implementations)
│           ├── request/                        # DTOs: AddItemRequest, CreateProductRequest, LoginRequest, etc.
│           ├── response/                       # DTOs: AuthResponse, ApiResponse
│           └── exception/                      # GlobalException handler + domain exceptions
│
└── Frontend/
    ├── vercel.json                             # SPA rewrite: /* → /index.html
    ├── package.json                            # React 19, Vite 8, MUI 7, Redux Toolkit 2.11
    └── src/
        ├── main.jsx                            # BrowserRouter + Provider + StrictMode
        ├── App.jsx                             # Top-level route split: /admin/* vs /*
        ├── ErrorBoundary.jsx                   # React error boundary wrapper
        ├── config/
        │   └── api.js                          # Axios instance + dual-token interceptor
        ├── Redux/
        │   ├── store.js                        # 6 slices: auth, product, customersProduct, cart, order, wishlist, review
        │   ├── Auth/
        │   │   ├── Action.js                   # register, login, getUser, logout, socialLoginSuccess, address CRUD
        │   │   ├── ActionTypes.js              # All auth action type constants
        │   │   └── Reducer.js                  # Auth state with address management
        │   └── Customers/
        │       ├── Product/                    # Product CRUD, search, find by ID/category
        │       ├── Cart/                       # Add, remove, update, get, merge, clear (localStorage init)
        │       ├── Order/                      # Create, get by ID, order history
        │       ├── Wishlist/                   # Get, toggle
        │       └── Review/                     # Create, get all by product
        ├── Routers/
        │   └── CustomerRoutes.jsx              # 25+ routes with Framer Motion page transitions
        ├── Admin/
        │   ├── AdminRoutes.jsx                 # 8 admin routes with role-gated access
        │   └── components/                     # Dashboard, Products, Orders, Customers, Promotions, Analytics
        └── customer/
            ├── components/
            │   ├── Navigation/                 # Responsive nav with search, cart, auth modals
            │   ├── Product/                    # Product grid with filters
            │   ├── ProductDetails/             # PDP with reviews, ratings, recommendations
            │   ├── Cart/                       # Shopping cart with guest persistence
            │   ├── Checkout/                   # Multi-step checkout with address management
            │   ├── Order/                      # OrderDetails, ReturnOrder, Invoice
            │   ├── Payment/                    # PaymentSuccess, PaymentCancel
            │   ├── Account/                    # Profile with orders and addresses
            │   ├── Auth/                       # OAuth2RedirectHandler
            │   └── Footer/                     # Site-wide footer
            └── pages/
                ├── HomePage.jsx                # Hero slideshow + editorial curations
                ├── Wishlist.jsx                # Wishlist grid
                ├── CurationPage.jsx            # Editorial product collections
                ├── Journal.jsx                 # Brand journal / editorial content
                ├── Returns.jsx                 # Return policy page
                ├── Track.jsx                   # Order tracking page
                ├── ResetPassword.jsx           # Password reset form
                ├── Contact.jsx                 # Contact page
                ├── About.jsx                   # Brand story / craftsmanship
                └── NotFound.jsx                # 404 page
```

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17 | Language runtime |
| Spring Boot | 3.3.5 | Application framework |
| Spring Security | (managed) | Authentication, authorization, OAuth2 |
| Spring Data JPA | (managed) | ORM and data access |
| Spring OAuth2 Client | (managed) | Google + GitHub social login |
| Spring Validation | (managed) | Request body validation |
| MySQL Connector/J | (managed) | Database driver |
| JJWT (jjwt-api/impl/jackson) | 0.12.6 | JWT token generation and validation |
| Stripe Java | 24.22.0 | Payment processing + webhook verification |
| Cloudinary HTTP44 | 1.36.0 | Image upload and CDN management |
| OpenPDF | 1.3.32 | Server-side PDF invoice generation |
| SpringDoc OpenAPI | 2.5.0 | API documentation (Swagger UI) |
| Lombok | 1.18.30 | Boilerplate reduction |
| Spring Dotenv | 4.0.0 | `.env` file support for local development |
| Eclipse Temurin | 21 (Docker) | Production JDK runtime |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.4 | UI library |
| React DOM | 19.2.4 | DOM rendering |
| React Router DOM | 7.13.1 | Client-side routing |
| Redux Toolkit | 2.11.2 | Global state management |
| React Redux | 9.2.0 | React-Redux bindings |
| Axios | 1.13.6 | HTTP client with interceptors |
| MUI Material | 7.3.9 | Component library |
| MUI Icons Material | 7.3.9 | Icon set |
| Emotion (react + styled) | 11.14.0 / 11.14.1 | CSS-in-JS for MUI |
| Headless UI | 2.2.9 | Unstyled accessible components |
| Heroicons | 2.2.0 | SVG icon library |
| Framer Motion | 12.38.0 | Page transitions and animations |
| GSAP | 3.14.2 | Advanced animations (hero slideshow) |
| Recharts | 3.8.1 | Admin analytics charts |
| React Alice Carousel | 2.9.1 | Product carousels |
| html2pdf.js | 0.14.0 | Client-side invoice PDF generation |
| Tailwind CSS | 3.4.19 | Utility-first CSS framework |
| Vite | 8.0.0 | Build tool and dev server |

---

## Local Development Setup

### Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven (or use the included `mvnw` wrapper)

### 1. Clone the Repository

```bash
git clone https://github.com/harshadunna/Clothsy.git
cd Clothsy
```

### 2. MySQL Database Setup

```sql
CREATE DATABASE clothsy_db;
```

> On first run with `ddl-auto=update`, Hibernate will auto-create all tables. Production uses `ddl-auto=validate`.

### 3. Backend Setup

```bash
cd Backend

# Create .env file (spring-dotenv reads this automatically)
cp .env.example .env
# Fill in all environment variables (see table below)

# Run with Maven wrapper
./mvnw spring-boot:run
```

The backend starts on `http://localhost:8080`.  
A default admin account is seeded on first launch via the `DataInitializationComponent`.

### 4. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8080" > .env

# Start dev server
npm run dev
```

The frontend starts on `http://localhost:5173`.

---

## Environment Variables

### Backend (`Backend/.env`)

| Variable | Description |
|----------|-------------|
| `FRONTEND_URL` | Frontend origin URL (e.g., `https://clothsy-seven.vercel.app`) |
| `BACKEND_URL` | Backend origin URL (e.g., `https://clothsy-api.onrender.com`) |
| `DB_URL` | MySQL JDBC URL (e.g., `jdbc:mysql://host:3306/clothsy_db`) |
| `DB_USERNAME` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `JWT_SECRET` | HMAC signing key for JWT tokens (min 32 chars) |
| `STRIPE_SECRET_KEY` | Stripe secret API key (`sk_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook endpoint secret (`whsec_...`) |
| `RESEND_API_KEY` | Resend API key for transactional email delivery |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth2 client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth2 client secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### Frontend (`Frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (e.g., `https://clothsy-api.onrender.com`) |

---

## Deployment

### Frontend — Vercel

The frontend is deployed as a static Vite build on Vercel. The `vercel.json` configuration enables SPA client-side routing:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

All routes (including `/admin/*`, `/:levelOne/:levelTwo/:levelThree`, `/account/order/:orderId`, etc.) are rewritten to `index.html`, allowing React Router to handle routing entirely on the client side.

**Build command:** `npm run build` (Vite production build)  
**Output directory:** `dist/`

### Backend — Render (Docker)

The backend is deployed on Render using a Docker-based build. The `Dockerfile`:

```dockerfile
FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY . .
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests
EXPOSE 8080
CMD java -jar target/*.jar
```

**Build process:**
1. Uses Eclipse Temurin JDK 21 as the base image
2. Copies the entire backend source into the container
3. Runs `mvnw clean package -DskipTests` to build the Spring Boot fat JAR
4. Exposes port 8080 (Render's default HTTP port)
5. Starts the application using the shell form of `CMD` with wildcard JAR resolution

**Environment variables** are configured through Render's dashboard and injected at runtime.

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## Contact

**Harsha Vardhan Dunna**

📧 [harshadunna27@gmail.com](mailto:harshadunna27@gmail.com)

🔗 [LinkedIn](https://www.linkedin.com/in/harsha-dunna)

💻 [GitHub](https://github.com/harshadunna)
