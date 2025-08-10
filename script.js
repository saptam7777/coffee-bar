const menu = [
  { name: "Espresso", price: 120, stock: 10 },
  { name: "Cappuccino", price: 150, stock: 5 },
  { name: "Latte", price: 140, stock: 8 },
  { name: "Mocha", price: 160, stock: 6 },
  { name: "Americano", price: 130, stock: 9 }
];

// Cart: array of {name, price, qty}
let cart = [];

const menuItemsDiv = document.getElementById('menu-items');
const cartItemsList = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const themeBtn = document.getElementById('theme-toggle');
const checkoutBtn = document.getElementById('checkout-btn');
const emptyCartBtn = document.getElementById('empty-cart-btn');
const modal = document.getElementById('modal');
const modalMsg = document.getElementById('modal-msg');
const closeModalBtn = document.getElementById('close-modal');

// ---------- Menu Rendering ----------
function renderMenu() {
  menuItemsDiv.innerHTML = '';
  menu.forEach((item, idx) => {
    const stockLeft = getStockLeft(item.name, item.stock);
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
      <h3>${item.name}</h3>
      <p>₹${item.price}</p>
      <div class="stock">Available: ${stockLeft}</div>
      <input type="number" id="qty-${idx}" min="1" max="${stockLeft}" value="1" style="width:50px" ${stockLeft === 0 ? "disabled" : ""}/>
      <button ${stockLeft === 0 ? "disabled" : ""} onclick="addToCart(${idx})">Add to Cart</button>
    `;
    menuItemsDiv.appendChild(div);
  });
}

// Helper: Calculate stock left for each menu item
function getStockLeft(name, totalStock) {
  const inCart = cart.find(i => i.name === name);
  return totalStock - (inCart ? inCart.qty : 0);
}

// ---------- Cart Management ----------
function addToCart(idx) {
  const qtyInput = document.getElementById(`qty-${idx}`);
  const qty = parseInt(qtyInput.value, 10);
  if (!Number.isInteger(qty) || qty < 1) return;

  const item = menu[idx];
  const stockLeft = getStockLeft(item.name, item.stock);
  if (qty > stockLeft) {
    qtyInput.value = stockLeft > 0 ? stockLeft : 1;
    return;
  }

  let found = cart.find(i => i.name === item.name);
  if (found) {
    found.qty += qty;
  } else {
    cart.push({ name: item.name, price: item.price, qty: qty });
  }

  updateCart();
  saveCart();
  renderMenu();
}

function removeItem(name) {
  cart = cart.filter(i => i.name !== name);
  updateCart();
  saveCart();
  renderMenu();
}

function updateQty(name, delta) {
  const found = cart.find(i => i.name === name);
  if (!found) return;

  const menuItem = menu.find(m => m.name === name);
  if (!menuItem) return;

  const maxQty = menuItem.stock;
  found.qty += delta;

  if (found.qty <= 0) {
    removeItem(name);
    return;
  }

  if (found.qty > maxQty) found.qty = maxQty;

  updateCart();
  saveCart();
  renderMenu();
}

function emptyCart() {
  cart = [];
  updateCart();
  saveCart();
  renderMenu();
}

function updateCart() {
  cartItemsList.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    const li = document.createElement('li');
    li.innerHTML = `
      ${item.name}
      <span class="qty-btns">
        <button title="Remove one" onclick="updateQty('${item.name}', -1)">-</button>
        <span style="margin:0 7px;">${item.qty}</span>
        <button title="Add one" onclick="updateQty('${item.name}', 1)">+</button>
      </span>
      ₹${subtotal}
      <button title="Remove item" onclick="removeItem('${item.name}')">&times;</button>
    `;
    cartItemsList.appendChild(li);
  });

  const totalQty = cart.reduce((a, b) => a + b.qty, 0);
  cartCount.textContent = `Cart: ${totalQty}`;
  cartTotal.textContent = cart.length ? `Total: ₹${total}` : '';
}

// Expose functions to global scope for inline HTML onclick handlers
window.addToCart = addToCart;
window.removeItem = removeItem;
window.updateQty = updateQty;

// ---------- Persistence ----------
function saveCart() {
  localStorage.setItem('coffeeBarCart', JSON.stringify(cart));
}

function loadCart() {
  const saved = localStorage.getItem('coffeeBarCart');
  cart = saved ? JSON.parse(saved) : [];
  updateCart();
  renderMenu();
}

// ---------- Dark Mode ----------
themeBtn.onclick = function () {
  document.body.classList.toggle('dark');
};

// ---------- Modal ----------
checkoutBtn.onclick = function () {
  if (cart.length === 0) {
    modalMsg.textContent = "Cart is empty!";
    modal.classList.add('active');
    return;
  }

  modalMsg.textContent = "Order Confirmed! Thank you for ordering.";
  modal.classList.add('active');
  emptyCart();
};

emptyCartBtn.onclick = emptyCart;

closeModalBtn.onclick = function () {
  modal.classList.remove('active');
};

// ---------- On Load ----------
loadCart();
