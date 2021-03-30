let budget = 0;
let totalPrice = 0;
const budgetInput = document.getElementById("budget");

budgetInput.addEventListener("change", () => {
  budget = budgetInput.value;
});

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("minus")) {
    removeCartItem(event.target.dataset.id);
    updateCart();
    return;
  }

  if (event.target.classList.contains("plus")) {
    const id = event.target.dataset.id;
    const item = document.querySelector("#basket ul li[data-id='" + id + "']");

    let newPrice = parseFloat(
      item.querySelectorAll("p")[1].querySelector("span").innerHTML
    );

    if (totalPrice + newPrice > budget) {
      alert(`Стоимость ваших покупок выходит за рамки бюджета`);
      return;
    }

    updateCartItem(item);
    updateCart();
    return;
  }

  if (event.target.classList.contains("removeBtn")) {
    removeAllCartItems();
    updateCart();
    return;
  }
});

fetch("https://kodaktor.ru/cart_data.json")
  .then((result) => result.json())
  .then(({ hdd, sdd, usbdrive }) => {
    document.getElementById("hddPrice").textContent = hdd;
    document.getElementById("sddPrice").textContent = sdd;
    document.getElementById("usbPrice").textContent = usbdrive;
  });

function addEvent(element, event, delegate) {
  if (typeof window.event != "undefined" && element.attachEvent)
    element.attachEvent("on" + event, delegate);
  else element.addEventListener(event, delegate, false);
}

addEvent(document, "readystatechange", function () {
  if (document.readyState !== "complete") return true;

  let items = document.querySelectorAll("section.products ul li");
  let cart = document.querySelectorAll("#basket ul")[0];

  function addCartItem(item, id) {
    let clone = item.cloneNode(true);
    clone.setAttribute("data-id", id);
    clone.setAttribute("data-quantity", 1);
    clone.removeAttribute("id");

    let fragment = document.createElement("span");
    fragment.setAttribute("class", "quantity");
    const plusMinusButtons = `
      <button class="plus" data-id="${id}">+</button>
      <button class="minus" data-id="${id}">–</button>
    `;
    fragment.innerHTML = " x 1 " + plusMinusButtons;
    clone.appendChild(fragment);

    fragment = document.createElement("span");
    fragment.setAttribute("class", "sub-total");
    clone.appendChild(fragment);
    cart.appendChild(clone);
  }

  function onDrop(event) {
    if (event.preventDefault) event.preventDefault();
    if (event.stopPropagation) event.stopPropagation();
    else event.cancelBubble = true;

    let id = event.dataTransfer.getData("Text");
    let item = document.getElementById(id);

    let newPrice = parseFloat(
      item.querySelectorAll("p")[1].querySelector("span").innerHTML
    );

    if (totalPrice + newPrice > budget) {
      alert(`Стоимость ваших покупок выходит за рамки бюджета`);
      return;
    }

    let exists = document.querySelectorAll(
      "#basket ul li[data-id='" + id + "']"
    );

    if (exists.length > 0) {
      updateCartItem(exists[0]);
    } else {
      addCartItem(item, id);
    }

    updateCart();

    return false;
  }

  function onDragOver(event) {
    if (event.preventDefault) event.preventDefault();
    if (event.stopPropagation) event.stopPropagation();
    else event.cancelBubble = true;
    return false;
  }

  addEvent(cart, "drop", onDrop);
  addEvent(cart, "dragover", onDragOver);

  function onDrag(event) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.dropEffect = "move";
    let target = event.target || event.srcElement;
    let success = event.dataTransfer.setData("Text", target.id);
  }

  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    item.setAttribute("draggable", "true");
    addEvent(item, "dragstart", onDrag);
  }
});

function updateCartItem(item) {
  let quantity = item.getAttribute("data-quantity");
  quantity = parseInt(quantity) + 1;
  item.setAttribute("data-quantity", quantity);
  let span = item.querySelectorAll("span.quantity");

  const plusMinusButtons = `
    <button class="plus" data-id="${item.dataset.id}">+</button>
    <button class="minus" data-id="${item.dataset.id}">–</button>
  `;
  span[0].innerHTML = ` x ${quantity} ${plusMinusButtons}`;
}

function updateCart() {
  let total = 0.0;
  let cart_items = document.querySelectorAll("#basket ul li");
  for (let i = 0; i < cart_items.length; i++) {
    let cart_item = cart_items[i];
    let quantity = cart_item.getAttribute("data-quantity");
    let price = document.getElementById(
      `${cart_item.getAttribute("data-id")}Price`
    ).innerHTML;

    let sub_total = parseFloat(quantity * parseFloat(price));

    cart_item.querySelectorAll("span.sub-total")[0].innerHTML =
      " = " + sub_total.toFixed(2);

    total += sub_total;
  }

  document.querySelectorAll("#basket span.total")[0].innerHTML = total.toFixed(
    2
  );

  totalPrice = total;
}

function removeCartItem(id) {
  let item = document.querySelector("#basket ul li[data-id='" + id + "']");
  let quantity = item.getAttribute("data-quantity");
  quantity = parseInt(quantity) - 1;
  item.setAttribute("data-quantity", quantity);

  if (quantity === 0) {
    item.remove();
  }

  let span = item.querySelectorAll("span.quantity");
  const plusMinusButtons = `
    <button class="plus" data-id="${id}">+</button>
    <button class="minus" data-id="${id}">–</button>
  `;
  span[0].innerHTML = ` x ${quantity} ${plusMinusButtons}`;
}

function removeAllCartItems() {
  let ul = document.querySelector("#basket ul");
  ul.innerHTML = "";
}
