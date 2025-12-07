// Using Fake API endpoints from API.docx 
const API_URL = 'https://fakestoreapi.com/products';

let products = [];
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function truncateTitle(title) {
  const parts = title.split(' ');
  return parts[0] + ' ...';
}
function truncateDesc(desc) {
  return desc.length > 120 ? desc.slice(0, 120) + '...' : desc;
}

async function loadProducts() {
  try {
    const res = await fetch(API_URL);
    products = await res.json();
    if (document.getElementById('product-grid')) {
      renderProducts(products);
    }
  } catch (e) {
    console.error(e);
  }
  updateCartCount();
  renderCartPage();
}



function filterByCategory(cat) {
  if (cat === 'all') renderProducts(products);
  else renderProducts(products.filter(p => p.category === cat));
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterByCategory(btn.dataset.category);
  });
});

function addToCart(id) {
  const p = products.find(pr => pr.id === id);
  if (!p) return;
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id: p.id, title: p.title, price: p.price, image: p.image, qty: 1 });
  saveCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCartPage();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const el = document.getElementById('cart-count');
  if (!el) return;
  el.textContent = cart.reduce((s, i) => s + i.qty, 0);
}

function renderCartPage() {
  const listEl = document.getElementById('cart-list');
  if (!listEl) return;

  const emptyEl = document.getElementById('cart-empty');
  const boxEl = document.getElementById('cart-box');

  if (cart.length === 0) {
    emptyEl.classList.remove('d-none');
    boxEl.classList.add('d-none');
    return;
  }
  emptyEl.classList.add('d-none');
  boxEl.classList.remove('d-none');

  listEl.innerHTML = cart.map(item => `
    <div class="d-flex align-items-center justify-content-between border-bottom py-3">
      <div class="d-flex align-items-center gap-3">
        <img src="${item.image}" style="width:60px;height:60px;object-fit:contain">
        <div>
          <div class="fw-semibold">${truncateTitle(item.title)}</div>
          <div class="small text-muted">1 x $${item.price}</div>
        </div>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-secondary btn-sm"
                onclick="changeQty(${item.id},-1)">−</button>
        <span>${item.qty}</span>
        <button class="btn btn-outline-secondary btn-sm"
                onclick="changeQty(${item.id},1)">+</button>
      </div>
    </div>
  `).join('');

  const productsTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = cart.length ? 30 : 0;
  document.getElementById('sum-products').textContent = productsTotal.toFixed(2);
  document.getElementById('sum-total').textContent = (productsTotal + shipping).toFixed(2);
}

window.addEventListener('DOMContentLoaded', loadProducts);
 
