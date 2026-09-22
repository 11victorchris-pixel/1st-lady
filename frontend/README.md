# 1st Lady Cosmetic — Frontend (`frontend/`)

Bootstrap 5 + Bootstrap Icons storefront (no build step).

```text
frontend/
  index.html          # SPA: home / shop / categories / product / checkout / track / contact
  check-out.html      # standalone checkout page (legacy name, kept)
  checkout.html       # alias of check-out.html (standard name per brief)
  login.html
  register.html
  css/style.css
  js/
    app.js            # hash routing + views + Paystack checkout + tracking
    auth.js           # login/register (localStorage)
    cart.js           # localStorage cart + badge
    main.js           # featured products renderer
    products.js       # static product list
  assets/images/      # black.jpg, body.webp, images.jpg
```

Open directly (`frontend/index.html`) for UI-only mode, or run the backend
(`manage/`) which serves this folder at http://localhost:5000 with live `/api/*`.
