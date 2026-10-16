"use strict";

// 單一商品資料來源。價格依使用者於 2026-10-16 提供的售價設定。
const products = [
  { id: "petite-jasmine", name: "花信・晨光", original: "滿天星金盞皂", series: "petite", weight: 50, price: 80, oil: "金盞花茉莉精油", flowers: "原色滿天星、台灣肖楠葉片", description: "素白花點與綠葉，把一束小小的晨光留在掌心。", image: "assets/IMG_2758 2.jpg", alt: "花信・晨光：原色滿天星與肖楠葉片透明皂" },
  { id: "petite-rose", name: "花信・初綻", original: "滿天星玫瑰皂", series: "petite", weight: 50, price: 80, oil: "玫瑰精油", flowers: "粉色滿天星、台灣肖楠葉片", description: "粉色滿天星，在透明皂體裡留下一封花的信。", image: "assets/IMG_2758 3.jpg", alt: "花信・初綻：粉色滿天星與肖楠葉片透明皂" },
  { id: "petite-lavender", name: "花信・暮色", original: "滿天星薰衣草皂", series: "petite", weight: 50, price: 80, oil: "薰衣草精油", flowers: "藍色滿天星、台灣肖楠葉片", description: "細碎花點與植物枝葉，收藏一份安靜的暮色。", image: "assets/IMG_2758 4.jpg", alt: "花信・暮色：滿天星與肖楠葉片透明皂，花材顏色以實品為準" },
  { id: "classic-calendula", name: "花日・暖陽", original: "療癒金盞皂", series: "classic", weight: 100, price: 100, oil: "金盞花茉莉精油", flowers: "金盞花花瓣", description: "金黃色的花瓣，像被陽光輕輕照亮的日常。", image: "assets/IMG_2759 3.jpg", alt: "花日・暖陽：金盞花透明橢圓皂" },
  { id: "classic-lavender", name: "花日・靜紫", original: "薰衣草皂", series: "classic", weight: 100, price: 100, oil: "薰衣草精油", flowers: "甜薰衣草葉片、乾燥薰衣草花苞", description: "葉片與花苞交織，讓植物的細節慢慢被看見。", image: "assets/IMG_2759 2.jpg", alt: "花日・靜紫：薰衣草透明方形皂" },
  { id: "classic-rose", name: "花日・玫瑰箋", original: "玫瑰皂", series: "classic", weight: 100, price: 100, oil: "玫瑰精油", flowers: "玫瑰花瓣、粉色滿天星", description: "一抹玫瑰與點點花影，寫下想送給你的心意。", image: "assets/IMG_2759 4.jpg", alt: "花日・玫瑰箋：玫瑰花瓣透明橢圓皂" },
  { id: "classic-chamomile", name: "花日・小晴天", original: "洋甘菊金盞雙花皂", series: "classic", weight: 100, price: 100, oil: "洋甘菊精油、橘油", flowers: "金盞花花瓣／花托、台灣肖楠葉片、原色滿天星", description: "雙花與枝葉相遇，收藏一枚明亮的小晴天。", image: "assets/IMG_2759 5.jpg", alt: "花日・小晴天：洋甘菊金盞雙花透明橢圓皂" }
];

const grid = document.querySelector("#product-grid");
const filters = document.querySelectorAll("[data-filter]");
const dialog = document.querySelector("#bag-dialog");
const bagItems = document.querySelector("#bag-items");
const bagOpen = document.querySelector("#bag-open");
const menuButton = document.querySelector("#menu-toggle");
const nav = document.querySelector("#primary-nav");
const cart = new Map();
const money = value => `NT$ ${value.toLocaleString("zh-TW")}`;
let toastTimer;

// 資料皆為本檔固定商品內容；保留語意化 article 與 h3。
grid.innerHTML = products.map(product => `
  <article class="product-card" data-product="${product.id}" data-series="${product.series}">
    <div class="product-photo"><img src="${encodeURI(product.image)}" alt="${product.alt}" width="529" height="529" loading="lazy"><span class="photo-weight">${product.weight}g</span></div>
    <p class="product-series">${product.series === "petite" ? "花信系列 / PETITE BOTANICAL" : "花日系列 / EVERYDAY BOTANICAL"}</p>
    <div class="product-title-row"><h3>${product.name}</h3><span class="product-price">${money(product.price)}</span></div>
    <p class="product-subtitle">${product.original}</p><p class="product-description">${product.description}</p>
    <dl class="product-materials"><dt>精油</dt><dd>${product.oil}</dd><dt>花材</dt><dd>${product.flowers}</dd></dl>
    <button class="product-add" type="button" data-add="${product.id}" aria-label="將${product.name}加入模擬購物袋"><span>加入購物袋</span><span aria-hidden="true">＋</span></button>
  </article>`).join("");

// 篩選只改變顯示狀態，不重建按鈕，維持鍵盤焦點。
filters.forEach(button => button.addEventListener("click", () => {
  const selected = button.dataset.filter;
  filters.forEach(filter => {
    const active = filter === button;
    filter.classList.toggle("is-active", active);
    filter.setAttribute("aria-pressed", String(active));
  });
  let visible = 0;
  document.querySelectorAll(".product-card").forEach(card => {
    card.hidden = selected !== "all" && card.dataset.series !== selected;
    if (!card.hidden) visible += 1;
  });
  document.querySelector("#result-count").textContent = `共 ${visible} 款`;
}));

function notify(message) {
  const toast = document.querySelector("#toast");
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function renderBag(focusTarget) {
  let quantity = 0;
  let total = 0;
  for (const [id, count] of cart) {
    quantity += count;
    total += products.find(product => product.id === id).price * count;
  }
  document.querySelectorAll("[data-bag-count]").forEach(el => el.textContent = String(quantity));
  bagOpen.setAttribute("aria-label", `開啟購物袋，目前 ${quantity} 件商品`);
  document.querySelector("#bag-quantity").textContent = `${quantity} 件`;
  document.querySelector("#bag-total").textContent = money(total);
  if (cart.size === 0) {
    bagItems.innerHTML = '<p class="bag-empty"><span>留一個位置，給喜歡的花。</span>購物袋目前是空的，先去探索花草選集吧。</p>';
  } else {
    bagItems.innerHTML = [...cart].map(([id, count]) => {
      const product = products.find(item => item.id === id);
      return `<article class="bag-item"><div class="product-photo"><img src="${encodeURI(product.image)}" alt="${product.alt}" width="72" height="72"></div><div><h3>${product.name}</h3><p class="bag-item-price">${product.weight}g · 單價 ${money(product.price)}</p><div class="bag-item-controls"><button class="quantity-button" type="button" data-action="decrease" data-id="${id}" aria-label="減少${product.name}數量">−</button><span class="item-quantity" aria-label="數量 ${count}">${count}</span><button class="quantity-button" type="button" data-action="increase" data-id="${id}" aria-label="增加${product.name}數量">＋</button><button class="remove-button" type="button" data-action="remove" data-id="${id}" aria-label="移除${product.name}">移除</button></div></div></article>`;
    }).join("");
  }
  // 更新購物袋後，讓鍵盤焦點留在原操作；商品移除後返回關閉鈕。
  if (focusTarget) {
    const replacement = bagItems.querySelector(`[data-id="${focusTarget.id}"][data-action="${focusTarget.action}"]`);
    (replacement || document.querySelector("#bag-close")).focus();
  }
}

grid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const product = products.find(item => item.id === button.dataset.add);
  cart.set(product.id, (cart.get(product.id) || 0) + 1);
  renderBag();
  notify(`已將「${product.name}」加入購物袋`);
});

bagItems.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { id, action } = button.dataset;
  const current = cart.get(id);
  if (action === "remove" || (action === "decrease" && current === 1)) cart.delete(id);
  else cart.set(id, current + (action === "increase" ? 1 : -1));
  renderBag({ id, action });
  notify("購物袋已更新");
});

function closeMenu(restoreFocus = false) {
  nav.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "開啟導覽選單");
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "關閉導覽選單" : "開啟導覽選單");
  nav.classList.toggle("is-open", open);
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  // 行動選單收合後，把焦點移到目的區塊，避免停在隱藏連結。
  const mobileOpen = menuButton.getAttribute("aria-expanded") === "true";
  closeMenu();
  if (mobileOpen) {
    const heading = document.querySelector(`${link.getAttribute("href")} h2`);
    if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: true }); }
  }
}));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") closeMenu(true);
});
window.matchMedia("(min-width: 768px)").addEventListener("change", event => { if (event.matches) closeMenu(); });

bagOpen.addEventListener("click", () => {
  closeMenu();
  dialog.showModal();
  document.body.classList.add("dialog-open");
  document.querySelector("#bag-close").focus();
});
document.querySelector("#bag-close").addEventListener("click", () => dialog.close());
document.querySelector("#bag-continue").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => { document.body.classList.remove("dialog-open"); bagOpen.focus(); });
dialog.addEventListener("click", event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});

renderBag();
