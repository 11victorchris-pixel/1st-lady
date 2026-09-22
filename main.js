document.addEventListener("DOMContentLoaded", () => {
  renderFeaturedProducts();
});

function renderFeaturedProducts() {
  const container = document.getElementById("featuredProducts");
  if (!container || typeof products === "undefined") return;

  const featured = products.slice(0, 4);

  container.innerHTML = featured.map(product => `
    <div class="col-sm-6 col-lg-3">
      <div class="product-card">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" class="img-fluid">
        </div>
        <div class="product-info">
          <small class="text-uppercase" style="color:#b76e79;">${product.category}</small>
          <h5 class="mt-2" style="font-size: 1.1rem;">${product.name}</h5>
          <p class="text-muted small">${product.description}</p>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <strong>${formatMoney(product.price)}</strong>
            <button class="add-cart" onclick="addToCart(${product.id})">
              <i class="bi bi-bag-plus"></i> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}