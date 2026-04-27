function makeProductImage(title, toneA, toneB) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${toneA}"/>
          <stop offset="100%" stop-color="${toneB}"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#g)"/>
      <circle cx="650" cy="120" r="90" fill="rgba(255,255,255,0.18)"/>
      <circle cx="120" cy="520" r="120" fill="rgba(255,255,255,0.13)"/>
      <text x="48" y="525" fill="rgba(255,255,255,0.92)" font-family="Arial, sans-serif" font-size="46" font-weight="700">${title}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const products = [
  {
    id: 1,
    name: "Audifonos Pulse X",
    category: "Audio",
    price: 1499,
    rating: 4.8,
    featured: true,
    badge: "Top Venta",
    image: makeProductImage("Pulse X", "#0f766e", "#134e4a")
  },
  {
    id: 2,
    name: "Smartwatch Core S",
    category: "Wearables",
    price: 2299,
    rating: 4.6,
    featured: true,
    badge: "Nuevo",
    image: makeProductImage("Core S", "#1d4ed8", "#0891b2")
  },
  {
    id: 3,
    name: "Mochila Urban Pro",
    category: "Accesorios",
    price: 899,
    rating: 4.7,
    featured: false,
    badge: "Premium",
    image: makeProductImage("Urban Pro", "#6d28d9", "#db2777")
  },
  {
    id: 4,
    name: "Teclado Flow TKL",
    category: "Perifericos",
    price: 1799,
    rating: 4.9,
    featured: true,
    badge: "Editor Choice",
    image: makeProductImage("Flow TKL", "#0f766e", "#f59e0b")
  },
  {
    id: 5,
    name: "Lampara Orbit Desk",
    category: "Hogar",
    price: 749,
    rating: 4.5,
    featured: false,
    badge: "Oferta",
    image: makeProductImage("Orbit Desk", "#ca8a04", "#b45309")
  },
  {
    id: 6,
    name: "Webcam Vision 2K",
    category: "Perifericos",
    price: 1299,
    rating: 4.4,
    featured: false,
    badge: "Home Office",
    image: makeProductImage("Vision 2K", "#0e7490", "#334155")
  },
  {
    id: 7,
    name: "Bocina Sonic Mini",
    category: "Audio",
    price: 1099,
    rating: 4.3,
    featured: false,
    badge: "Compacta",
    image: makeProductImage("Sonic Mini", "#2563eb", "#9333ea")
  },
  {
    id: 8,
    name: "Botella Smart Flask",
    category: "Accesorios",
    price: 659,
    rating: 4.1,
    featured: false,
    badge: "Lifestyle",
    image: makeProductImage("Smart Flask", "#15803d", "#0f766e")
  }
];

const productGrid = document.getElementById("product-grid");
const categoryFilters = document.getElementById("category-filters");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const productsVisible = document.getElementById("products-visible");
const favoritesCount = document.getElementById("favorites-count");
const summaryTotal = document.getElementById("summary-total");
const cartCount = document.getElementById("cart-count");
const cartDrawer = document.getElementById("cart-drawer");
const openCartBtn = document.getElementById("open-cart");
const closeCartBtn = document.getElementById("close-cart");
const cartItemsEl = document.getElementById("cart-items");
const subtotalAmount = document.getElementById("subtotal-amount");
const discountAmount = document.getElementById("discount-amount");
const totalAmount = document.getElementById("total-amount");
const couponInput = document.getElementById("coupon-input");
const applyCouponBtn = document.getElementById("apply-coupon");
const checkoutBtn = document.getElementById("checkout-btn");
const simulateCheckoutBtn = document.getElementById("simulate-checkout");
const toast = document.getElementById("toast");

const state = {
  query: "",
  category: "Todos",
  sort: "featured",
  favorites: new Set(),
  cart: [],
  coupon: ""
};

function money(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2
  }).format(value);
}

function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(notify.timeoutId);
  notify.timeoutId = setTimeout(() => toast.classList.remove("show"), 1800);
}

function categoriesList() {
  return ["Todos", ...new Set(products.map((item) => item.category))];
}

function buildCategoryFilters() {
  categoryFilters.innerHTML = categoriesList()
    .map((category) => {
      const active = state.category === category ? "active" : "";
      return `<button class="chip ${active}" type="button" data-category="${category}">${category}</button>`;
    })
    .join("");
}

function getVisibleProducts() {
  let list = products.filter((product) => {
    const matchCategory = state.category === "Todos" || product.category === state.category;
    const text = `${product.name} ${product.category}`.toLowerCase();
    const matchQuery = text.includes(state.query.toLowerCase().trim());
    return matchCategory && matchQuery;
  });

  if (state.sort === "price-asc") {
    list = list.sort((a, b) => a.price - b.price);
  } else if (state.sort === "price-desc") {
    list = list.sort((a, b) => b.price - a.price);
  } else if (state.sort === "rating-desc") {
    list = list.sort((a, b) => b.rating - a.rating);
  } else {
    list = list.sort((a, b) => Number(b.featured) - Number(a.featured));
  }

  return list;
}

function renderProducts() {
  const visible = getVisibleProducts();
  productsVisible.textContent = visible.length;
  favoritesCount.textContent = state.favorites.size;

  if (visible.length === 0) {
    productGrid.innerHTML = `<p class="empty-state">No encontramos resultados con ese filtro.</p>`;
    return;
  }

  productGrid.innerHTML = visible
    .map((product) => {
      const isFav = state.favorites.has(product.id);
      return `
        <article class="product-card">
          <div class="product-media">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <span class="badge">${product.badge}</span>
            <button class="favorite-btn ${isFav ? "active" : ""}" type="button" data-fav-id="${product.id}" aria-label="Marcar favorito">${isFav ? "★" : "☆"}</button>
          </div>
          <div class="product-info">
            <h4>${product.name}</h4>
            <div class="meta-row">
              <span>${product.category}</span>
              <span>${product.rating} / 5</span>
            </div>
            <div class="price-row">
              <strong>${money(product.price)}</strong>
              <button class="add-btn" type="button" data-add-id="${product.id}">Agregar</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function getCartItem(productId) {
  return state.cart.find((item) => item.productId === productId);
}

function addToCart(productId) {
  const item = getCartItem(productId);
  if (item) {
    item.qty += 1;
  } else {
    state.cart.push({ productId, qty: 1 });
  }
  renderCart();
}

function updateQty(productId, delta) {
  const item = getCartItem(productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter((cartItem) => cartItem.productId !== productId);
  }
  renderCart();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter((item) => item.productId !== productId);
  renderCart();
}

function cartCalculation() {
  const subtotal = state.cart.reduce((sum, item) => {
    const product = products.find((productItem) => productItem.id === item.productId);
    return sum + product.price * item.qty;
  }, 0);

  const discount = state.coupon === "NOVA10" ? subtotal * 0.1 : 0;
  const total = subtotal - discount;
  return { subtotal, discount, total };
}

function renderCart() {
  const itemsCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = itemsCount;

  if (state.cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="empty-state">No hay productos agregados aun.</p>`;
  } else {
    cartItemsEl.innerHTML = state.cart
      .map((item) => {
        const product = products.find((productItem) => productItem.id === item.productId);
        const lineTotal = product.price * item.qty;
        return `
          <article class="cart-item">
            <div class="cart-item-head">
              <div>
                <strong>${product.name}</strong>
                <small>${money(product.price)} c/u</small>
              </div>
              <strong>${money(lineTotal)}</strong>
            </div>
            <div class="qty-row">
              <button type="button" data-qty-id="${product.id}" data-delta="-1">-</button>
              <span>${item.qty}</span>
              <button type="button" data-qty-id="${product.id}" data-delta="1">+</button>
            </div>
            <button class="remove-link" type="button" data-remove-id="${product.id}">Eliminar</button>
          </article>
        `;
      })
      .join("");
  }

  const { subtotal, discount, total } = cartCalculation();
  subtotalAmount.textContent = money(subtotal);
  discountAmount.textContent = `-${money(discount)}`;
  totalAmount.textContent = money(total);
  summaryTotal.textContent = money(total);
}

function toggleFavorite(productId) {
  if (state.favorites.has(productId)) {
    state.favorites.delete(productId);
  } else {
    state.favorites.add(productId);
  }
  renderProducts();
}

function simulateCheckout() {
  const { total } = cartCalculation();
  if (total <= 0) {
    notify("Agrega productos para probar el checkout demo.");
    return;
  }
  notify("Pedido de prueba generado. Compra real desactivada.");
}

categoryFilters.addEventListener("click", (event) => {
  const target = event.target.closest(".chip");
  if (!target) return;
  state.category = target.dataset.category;
  buildCategoryFilters();
  renderProducts();
});

searchInput.addEventListener("input", () => {
  state.query = searchInput.value;
  renderProducts();
});

sortSelect.addEventListener("change", () => {
  state.sort = sortSelect.value;
  renderProducts();
});

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-id]");
  const favButton = event.target.closest("[data-fav-id]");

  if (addButton) {
    addToCart(Number(addButton.dataset.addId));
    notify("Producto agregado al carrito demo.");
  }

  if (favButton) {
    toggleFavorite(Number(favButton.dataset.favId));
  }
});

cartItemsEl.addEventListener("click", (event) => {
  const qtyButton = event.target.closest("[data-qty-id]");
  const removeButton = event.target.closest("[data-remove-id]");

  if (qtyButton) {
    updateQty(Number(qtyButton.dataset.qtyId), Number(qtyButton.dataset.delta));
  }

  if (removeButton) {
    removeFromCart(Number(removeButton.dataset.removeId));
  }
});

openCartBtn.addEventListener("click", () => {
  cartDrawer.classList.add("open");
});

closeCartBtn.addEventListener("click", () => {
  cartDrawer.classList.remove("open");
});

applyCouponBtn.addEventListener("click", () => {
  const code = couponInput.value.trim().toUpperCase();
  if (!code) {
    notify("Escribe un codigo de prueba.");
    return;
  }
  if (code !== "NOVA10") {
    state.coupon = "";
    renderCart();
    notify("Codigo no valido. Prueba con NOVA10.");
    return;
  }
  state.coupon = code;
  renderCart();
  notify("Descuento aplicado: 10% demo.");
});

checkoutBtn.addEventListener("click", simulateCheckout);
simulateCheckoutBtn.addEventListener("click", simulateCheckout);

buildCategoryFilters();
renderProducts();
renderCart();
