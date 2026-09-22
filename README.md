# Cusmetic shop

Separated standard layout — no personal info changed.

```text
Cusmetic shop/
  brief.md
  frontend/              # client only (moved OUT of manage/)
    index.html
    check-out.html
    checkout.html        # alias (standard name)
    login.html
    register.html
    css/style.css
    js/app.js, auth.js, cart.js, main.js, products.js
    assets/images/
    README.md
  manage/                # BACKEND only (standard Express architecture)
    server.js
    package.json         # type: module
    .env.example
    config/database.js
    models/User.js, Product.js, Order.js, Review.js, Message.js
    controllers/auth, product, order, message
    routes/auth, product, order, message
    middleware/auth.js
    utils/asyncHandler.js, store.js
    data/products.json, orders.json
    README.md
```

## Run backend (serves frontend too)

```bash
cd manage
npm install
npm run dev
# http://localhost:5000
```
