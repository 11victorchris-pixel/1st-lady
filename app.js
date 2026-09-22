// Global App State
let state = {
  products: [],
  cart: [],
  currentView: 'home',
  selectedCategory: 'All',
  searchQuery: ''
};

const CATEGORIES = [
  'All',
  'Skincare',
  'Makeup',
  'Hair Care & Wigs',
  'Body Care',
  'Accessories & Glasses',
  'Baby & Mom',
  'Perfume'
];

document.addEventListener('DOMContentLoaded', () => {
  setupCartDrawer();
  window.addEventListener('hashchange', handleRouting);
  fetchProducts();
});

async function fetchProducts() {
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success && data.products.length > 0) {
      state.products = data.products;
    }
  } catch (e) {
    console.warn('Backend API connection failed, checking local catalog:', e);
  }
  handleRouting();
}

function handleRouting() {
  const hash = window.location.hash.replace('#', '') || 'home';
  
  if (hash.startsWith('product-')) {
    const id = hash.replace('product-', '');
    state.currentView = 'detail';
    renderProductDetail(id);
  } else if (hash === 'categories') {
    state.currentView = 'categories';
    renderCategoriesView();
  } else if (hash === 'checkout') {
    state.currentView = 'checkout';
    renderCheckoutView();
  } else if (hash === 'track') {
    state.currentView = 'track';
    renderTrackView();
  } else if (hash === 'shop') {
    state.currentView = 'shop';
    renderShopView();
  } else {
    state.currentView = 'home';
    renderHomeView();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 1. HOME VIEW
function renderHomeView() {
  const app = document.getElementById('app-content');
  const featured = state.products.slice(0, 6);

  app.innerHTML = `
    <!-- HERO -->
    <section class="bg-rose-light/50 py-16 px-4 mb-10 text-center space-y-4">
      <span class="text-xs uppercase tracking-widest text-gold font-bold bg-white px-3 py-1 rounded-full border border-gold/20">Beauty & Essentials</span>
      <h1 class="text-4xl md:text-6xl font-serif font-bold text-dark leading-tight">Feel Beautiful.<br><span class="text-rose">Be Effortlessly You.</span></h1>
      <p class="text-gray-600 max-w-xl mx-auto text-sm">Discover body creams, hair growth creams, luxury wigs, designer glasses, makeup & baby essentials.</p>
      <div class="flex justify-center gap-4 pt-2">
        <a href="#shop" class="bg-rose text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-rose-dark transition shadow-md">Shop Catalog</a>
        <a href="#categories" class="bg-white text-dark border border-gray-200 px-8 py-3 rounded-full font-bold text-sm hover:border-rose transition">Browse Categories</a>
      </div>
    </section>

    <!-- CATEGORY PILLS -->
    <section class="max-w-7xl mx-auto px-4 mb-12">
      <h2 class="text-2xl font-serif font-bold text-dark mb-4">Shop By Category</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        ${CATEGORIES.filter(c => c !== 'All').map(cat => `
          <button onclick="filterCategoryAndShop('${cat}')" class="bg-white p-4 rounded-xl border border-rose-100 text-center hover:border-rose hover:shadow-sm transition">
            <h3 class="font-serif font-bold text-xs text-dark">${cat}</h3>
          </button>
        `).join('')}
      </div>
    </section>

    <!-- FEATURED GRID -->
    <section class="max-w-7xl mx-auto px-4 mb-16">
      <div class="flex justify-between items-end mb-6">
        <h2 class="text-2xl font-serif font-bold text-dark">Top Picks</h2>
        <a href="#shop" class="text-xs font-bold text-rose hover:underline">View All &rarr;</a>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${featured.map(p => renderProductCard(p)).join('')}
      </div>
    </section>
  `;
}

// 2. SHOP VIEW
function renderShopView() {
  const app = document.getElementById('app-content');
  
  const filtered = state.products.filter(p => {
    const matchesCat = state.selectedCategory === 'All' || p.category === state.selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(state.searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  app.innerHTML = `
    <section class="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div class="text-center space-y-2 border-b border-rose-100 pb-6">
        <h1 class="text-3xl font-serif font-bold text-dark">Shop All Beauty & Essentials</h1>
        <p class="text-xs text-gray-500">Showing ${filtered.length} products</p>
      </div>

      <!-- FILTER BAR -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
        <div class="flex flex-wrap gap-2">
          ${CATEGORIES.map(cat => `
            <button class="cat-btn text-xs px-3.5 py-1.5 rounded-full font-semibold border transition ${state.selectedCategory === cat ? 'bg-rose text-white border-rose' : 'bg-cream text-dark border-gray-200 hover:border-rose'}" data-cat="${cat}">
              ${cat}
            </button>
          `).join('')}
        </div>

        <input type="text" id="search-input" placeholder="Search body cream, wig, glasses..." value="${state.searchQuery}" class="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-full text-xs focus:outline-none focus:border-rose">
      </div>

      <!-- PRODUCT GRID -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${filtered.map(p => renderProductCard(p)).join('')}
      </div>
    </section>
  `;

  attachShopEventListeners();
}

// 3. CATEGORIES VIEW
function renderCategoriesView() {
  const app = document.getElementById('app-content');
  const activeCategories = CATEGORIES.filter(c => c !== 'All');

  app.innerHTML = `
    <section class="max-w-7xl mx-auto px-4 py-10 space-y-12">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-serif font-bold text-dark">Organized Collections</h1>
        <p class="text-xs text-gray-500">Browse by exact product category</p>
      </div>

      <div class="space-y-10">
        ${activeCategories.map(cat => {
          const items = state.products.filter(p => p.category === cat);
          if (items.length === 0) return '';
          return `
            <div class="space-y-4">
              <div class="flex justify-between items-center border-b border-rose-200 pb-2">
                <h2 class="text-xl font-serif font-bold text-dark">${cat} <span class="text-xs font-sans text-rose font-semibold">(${items.length} items)</span></h2>
                <button onclick="filterCategoryAndShop('${cat}')" class="text-xs text-rose font-bold hover:underline">View All ${cat} &rarr;</button>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                ${items.map(p => renderProductCard(p)).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

// REUSABLE CARD
function renderProductCard(p) {
  return `
    <div class="bg-white rounded-2xl overflow-hidden border border-rose-100 shadow-sm hover:shadow-md transition flex flex-col group">
      <a href="#product-${p.id}" class="block relative aspect-square overflow-hidden bg-gray-100">
        <img src="${p.images[0]}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
        <span class="absolute top-3 left-3 bg-white/90 backdrop-blur text-dark text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">${p.category}</span>
      </a>
      <div class="p-5 flex flex-col flex-grow justify-between">
        <div>
          <div class="flex items-center gap-1 text-gold text-xs mb-1">
            ★ <span>${p.rating} (${p.reviewsCount})</span>
          </div>
          <a href="#product-${p.id}" class="font-serif font-bold text-dark text-base hover:text-rose transition line-clamp-1">${p.name}</a>
          <p class="text-xs text-gray-500 mt-1 line-clamp-2">${p.description}</p>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span class="font-bold text-dark text-sm">₦${p.price.toLocaleString()}</span>
          <button onclick="addToCart('${p.id}')" class="bg-rose text-white text-xs px-4 py-2 rounded-full font-semibold hover:bg-rose-dark transition">
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  `;
}

function filterCategoryAndShop(cat) {
  state.selectedCategory = cat;
  window.location.hash = 'shop';
}

function attachShopEventListeners() {
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.selectedCategory = e.target.dataset.cat;
      renderShopView();
    });
  });

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderShopView();
    });
  }
}

// DETAIL VIEW
function renderProductDetail(id) {
  const p = state.products.find(item => item.id === id);
  const app = document.getElementById('app-content');

  if (!p) {
    app.innerHTML = `<div class="text-center py-20">Product not found. <a href="#shop" class="text-rose underline">Return to Shop</a></div>`;
    return;
  }

  app.innerHTML = `
    <section class="max-w-6xl mx-auto px-4 py-10">
      <a href="#shop" class="text-xs font-semibold text-rose hover:underline mb-6 inline-block">&larr; Back to Shop</a>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <div class="aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-rose-100">
          <img src="${p.images[0]}" alt="${p.name}" class="w-full h-full object-cover">
        </div>
        <div class="space-y-5">
          <div>
            <span class="text-xs uppercase tracking-widest text-gold font-bold">${p.category}</span>
            <h1 class="text-3xl font-serif font-bold text-dark mt-1">${p.name}</h1>
            <p class="text-2xl font-bold text-dark mt-2">₦${p.price.toLocaleString()}</p>
          </div>
          <p class="text-xs text-gray-600 leading-relaxed">${p.description}</p>
          ${p.shades ? `
            <div>
              <label class="block text-xs font-bold text-dark uppercase mb-1">Option / Size:</label>
              <select id="shade-select" class="w-full border border-gray-200 rounded-lg p-2.5 text-xs bg-white">
                ${p.shades.map(s => `<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>
          ` : ''}
          <button onclick="addToCart('${p.id}')" class="w-full bg-rose text-white py-3.5 rounded-full font-bold hover:bg-rose-dark transition shadow">
            Add to Bag — ₦${p.price.toLocaleString()}
          </button>
          <div class="border-t border-gray-200 pt-4 space-y-3 text-xs">
            <div><h4 class="font-bold text-dark uppercase">Ingredients / Materials</h4><p class="text-gray-500">${p.ingredients}</p></div>
            <div><h4 class="font-bold text-dark uppercase">How to Use</h4><p class="text-gray-500">${p.usage}</p></div>
          </div>
        </div>
      </div>
    </section>
  `;
}

// CHECKOUT VIEW
function renderCheckoutView() {
  const app = document.getElementById('app-content');
  if (state.cart.length === 0) {
    app.innerHTML = `
      <div class="max-w-md mx-auto text-center py-20 px-4 space-y-4">
        <h2 class="text-2xl font-serif font-bold">Your Bag is Empty</h2>
        <a href="#shop" class="inline-block bg-rose text-white px-6 py-3 rounded-full text-xs font-bold">Start Shopping</a>
      </div>
    `;
    return;
  }

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  app.innerHTML = `
    <section class="max-w-4xl mx-auto px-4 py-12">
      <h1 class="text-3xl font-serif font-bold text-dark mb-8">Checkout</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form id="checkout-form" class="space-y-4 bg-white p-6 rounded-2xl border border-rose-100">
          <h2 class="font-bold text-sm uppercase text-gold">1. Delivery Details</h2>
          <input type="text" id="cust-name" placeholder="Full Name" required class="w-full border p-3 rounded-lg text-xs">
          <input type="email" id="cust-email" placeholder="Email Address" required class="w-full border p-3 rounded-lg text-xs">
          <input type="tel" id="cust-phone" placeholder="Phone Number" required class="w-full border p-3 rounded-lg text-xs">
          <input type="text" id="cust-address" placeholder="Delivery Address" required class="w-full border p-3 rounded-lg text-xs">
          <select id="cust-state" required class="w-full border p-3 rounded-lg text-xs bg-white">
            <option value="Lagos">Lagos State</option>
            <option value="Abuja">Abuja (FCT)</option>
            <option value="Rivers">Rivers State</option>
            <option value="Oyo">Oyo State</option>
            <option value="Other">Other State</option>
          </select>
          <button type="submit" class="w-full bg-rose text-white py-4 rounded-full font-bold hover:bg-rose-dark transition mt-4">
            Pay with Paystack — ₦${subtotal.toLocaleString()}
          </button>
        </form>

        <div class="bg-cream p-6 rounded-2xl border border-rose-100 space-y-4">
          <h2 class="font-bold text-sm uppercase text-gold">Order Summary</h2>
          <div class="divide-y divide-gray-200 text-xs">
            ${state.cart.map(item => `
              <div class="py-2 flex justify-between">
                <span>${item.name} (x${item.quantity})</span>
                <span class="font-semibold">₦${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            `).join('')}
          </div>
          <div class="border-t border-gray-200 pt-4 flex justify-between font-bold text-sm">
            <span>Total Due:</span><span>₦${subtotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </section>
  `;

  document.getElementById('checkout-form').addEventListener('submit', handleCheckoutSubmit);
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const payload = {
    customer: {
      fullName: document.getElementById('cust-name').value,
      email: document.getElementById('cust-email').value,
      phone: document.getElementById('cust-phone').value,
      address: document.getElementById('cust-address').value,
      state: document.getElementById('cust-state').value
    },
    items: state.cart,
    subtotal: subtotal,
    discount: 0,
    grandTotal: subtotal
  };

  try {
    const res = await fetch('/api/orders/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert(`Order Received! Order Ref: ${data.reference}`);
        state.cart = [];
        updateCartUI();
        window.location.hash = 'track';
      }
    }
  } catch (error) {
    alert('Failed to process checkout. Please try again.');
  }
}

function renderTrackView() {
  const app = document.getElementById('app-content');
  app.innerHTML = `
    <section class="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
      <h1 class="text-3xl font-serif font-bold text-dark">Track Your Order</h1>
      <div class="flex gap-2">
        <input type="text" id="track-input" placeholder="e.g. GB-1700000000" class="flex-grow border p-3 rounded-full text-xs">
        <button onclick="trackOrder()" class="bg-rose text-white px-6 py-3 rounded-full text-xs font-bold">Search</button>
      </div>
      <div id="track-result" class="text-left mt-6"></div>
    </section>
  `;
}

async function trackOrder() {
  const query = document.getElementById('track-input').value;
  const resultDiv = document.getElementById('track-result');
  if(!query) return;

  try {
    const res = await fetch(`/api/orders/track/${query}`);
    const data = await res.json();
    if (data.success) {
      const o = data.order;
      resultDiv.innerHTML = `
        <div class="bg-white p-6 rounded-2xl border border-rose-100 space-y-3 text-xs">
          <div class="flex justify-between font-bold text-sm">
            <span>Order ID: ${o.orderId}</span>
            <span class="text-rose">${o.status}</span>
          </div>
          <p><strong>Customer:</strong> ${o.customer.fullName}</p>
          <p><strong>Total Amount:</strong> ₦${o.grandTotal.toLocaleString()}</p>
        </div>
      `;
    } else {
      resultDiv.innerHTML = `<p class="text-red-500 text-xs">No matching order found.</p>`;
    }
  } catch (e) {
    resultDiv.innerHTML = `<p class="text-red-500 text-xs">Error searching order.</p>`;
  }
}

// CART HELPERS
function addToCart(id) {
  const product = state.products.find(p => p.id === id);
  if (!product) return;

  const existing = state.cart.find(i => i.id === id);
  if (existing) {
    existing.quantity++;
  } else {
    state.cart.push({ ...product, quantity: 1 });
  }

  updateCartUI();
  toggleCart(true);
}

function updateCartUI() {
  const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-count').innerText = totalCount;

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  document.getElementById('cart-subtotal').innerText = `₦${subtotal.toLocaleString()}`;

  const container = document.getElementById('cart-items-container');
  if (state.cart.length === 0) {
    container.innerHTML = `<p class="text-center text-xs text-gray-400 py-10">Your bag is currently empty.</p>`;
    return;
  }

  container.innerHTML = state.cart.map(item => `
    <div class="flex gap-4 items-center border-b border-gray-100 pb-4">
      <img src="${item.images[0]}" class="w-16 h-16 rounded-lg object-cover">
      <div class="flex-grow text-xs">
        <h4 class="font-bold text-dark">${item.name}</h4>
        <p class="text-gray-500">₦${item.price.toLocaleString()}</p>
        <div class="flex items-center gap-2 mt-2">
          <button onclick="changeQty('${item.id}', -1)" class="w-5 h-5 border rounded flex items-center justify-center font-bold">-</button>
          <span>${item.quantity}</span>
          <button onclick="changeQty('${item.id}', 1)" class="w-5 h-5 border rounded flex items-center justify-center font-bold">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

function changeQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      state.cart = state.cart.filter(i => i.id !== id);
    }
  }
  updateCartUI();
}

function setupCartDrawer() {
  document.getElementById('open-cart-btn').addEventListener('click', () => toggleCart(true));
  document.getElementById('close-cart-btn').addEventListener('click', () => toggleCart(false));
  document.getElementById('cart-backdrop').addEventListener('click', () => toggleCart(false));
  document.getElementById('proceed-checkout-btn').addEventListener('click', () => {
    toggleCart(false);
    window.location.hash = 'checkout';
  });
}

function toggleCart(open) {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  const panel = document.getElementById('cart-panel');

  if (open) {
    drawer.classList.remove('invisible');
    backdrop.classList.add('opacity-100');
    panel.classList.remove('translate-x-full');
  } else {
    backdrop.classList.remove('opacity-100');
    panel.classList.add('translate-x-full');
    setTimeout(() => drawer.classList.add('invisible'), 300);
  }
}