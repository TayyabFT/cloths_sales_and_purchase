import { getProducts } from "./productApi.js";
import { sendOrderToServer } from "./orderApi.js";
import { getProductById } from "./productApi.js";
function closeSidebar() {
  document.getElementById("sidebar").classList.add("sidebar-hidden");
}

function openSidebar() {
  updateOrderNowButton();
  document.getElementById("sidebar").classList.remove("sidebar-hidden");
}

function closeCartSidebar() {
  document
    .querySelector(".cartSideBar")
    .classList.remove("cartSideBar-visible");
  document.querySelector(".overlay").classList.remove("overlay-visible");
  document.body.classList.remove("no-scroll"); // Enable scrolling again
}

function openCartSidebar() {
  document.querySelector(".cartSideBar").classList.add("cartSideBar-visible");
  document.querySelector(".overlay").classList.add("overlay-visible");
  document.body.classList.add("no-scroll"); // Disable scrolling
}

function openOrderForm() {
  let form = document.querySelector(".order-form");
  form.classList.add("show");
}

function closeOrderForm() {
  let form = document.querySelector(".order-form");
  form.classList.remove("show");
}

//Load the products from the API and display them on the page
function loadProducts(category) {
  return getProducts(category).catch((error) => {
    console.error("Error fetching products:", error);
    throw error;
  });
}

let favoriteProducts = [];

document.addEventListener("DOMContentLoaded", async function () {
  loadCartItems();
  updateCartCount();
  var products = await loadProducts("all"); // Fetch products from API

  console.log("Products: ", products); // Log the products to the console
  showLoadProduct(products); // Call the function to display products
});

// Function to display products on the page
function showLoadProduct(products) {
  const productsContainer = document.querySelector(".products");
  productsContainer.innerHTML = ""; // Clear previous UI
  if (products.data && products.data.length > 0) {
    products.data.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");

      productCard.innerHTML = `
              <img src="${product.imageurl}" alt="${product.productname}">
              <h2>${product.productname}</h2>
              <p>Price: ${product.price}</p>
              <p>Category: ${product.categoryname}</p>
              <p style="display:none">${product.productid}</p>
          `;

      // Create icon container (new line, bottom right)
      const iconsContainer = document.createElement("div");
      iconsContainer.classList.add("product-card-icons");

      // Eye icon button
      const viewDetailBtn = document.createElement("button");
      viewDetailBtn.classList.add("view-detail");
      viewDetailBtn.innerHTML = `<i class="fas fa-eye"></i>`; // FontAwesome Eye icon
      viewDetailBtn.addEventListener("click", () => {
        const icon = viewDetailBtn.querySelector("i");
        debugger;
        openPopup(); // Open the popup
        getProductById(product.productid).then((productDetails) => {
          debugger;
          const popupImage = document.querySelector(".popup-image img");
          const popupContent = document.querySelector(".popup-content");
          const popupThumbnails = document.querySelector(".popup-thumbnails");

          popupImage.src = productDetails.data.images[0];
          popupImage.alt = productDetails.data.productname;

          popupContent.innerHTML = `
            <h2>${productDetails.data.productname}</h2>
            <p>${productDetails.data.description}</p>
            <p class="price">Rs.${productDetails.data.price}</p>
            <p class="category">Category: ${productDetails.data.categoryname}</p>
          `;

          // Clear previous thumbnails
          popupThumbnails.innerHTML = "";

          // Add thumbnails for each image
          productDetails.images.forEach((imageUrl, index) => {
            const thumbnail = document.createElement("img");
            thumbnail.src = imageUrl;
            thumbnail.alt = `${productDetails.productname} - Image ${
              index + 1
            }`;
            thumbnail.classList.add("thumbnail");
            thumbnail.addEventListener("click", () => {
              popupImage.src = imageUrl;
            });
            popupThumbnails.appendChild(thumbnail);
          });
        });
      });

      // Cart icon button
      const addToCartBtn = document.createElement("button");
      addToCartBtn.classList.add("add-to-cart");
      addToCartBtn.innerHTML = `<i class="fas fa-shopping-cart"></i>`; // FontAwesome Cart icon
      addToCartBtn.addEventListener("click", () => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        let existingProduct = cart.find(
          (item) => item.productid === product.productid
        );

        if (existingProduct) {
          // If product already exists in the cart, increment its quantity
          existingProduct.count = (existingProduct.count || 1) + 1;
        } else {
          // If product is added for the first time, set quantity to 1
          cart.push({
            productid: product.productid,
            productname: product.productname,
            price: product.price,
            imageurl: product.imageurl,
            categoryname: product.categoryname,
            count: 1, // Initialize quantity to 1
          });
        }
        console.log(cart);
        localStorage.setItem("cart", JSON.stringify(cart));
        loadCartItems();
        updateCartCount();
        openCartSidebar(); // Open cart sidebar on first click
        updateOrderNowButton(); // Update order now button
      });

      // Append buttons to the container
      iconsContainer.appendChild(viewDetailBtn);
      iconsContainer.appendChild(addToCartBtn);

      // Append icon container to product card
      productCard.appendChild(iconsContainer);

      // Append product card to products container
      productsContainer.appendChild(productCard);
    });
  } else {
    // Show "No data available" message
    const noDataMessage = document.createElement("p");
    noDataMessage.classList.add("no-data-message");
    noDataMessage.textContent = "No data available";
    productsContainer.appendChild(noDataMessage);
  }
}

function loadCartItems() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let cartContainer = document.getElementById("cart-items");
  let subtotalElement = document.getElementById("subtotal");
  let completeOrder = document.querySelector(".complete-order");

  cartContainer.innerHTML = ""; // Clear cart before appending

  let subtotal = 0;

  cart.forEach((item) => {
    let itemTotal = parseFloat(item.price.replace("$", "")) * item.count;
    subtotal += itemTotal;
    localStorage.setItem("total", subtotal);
    let cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");
    cartItem.innerHTML = `
            <img src="${item.imageurl}" alt="${item.imageurl}">
            <div class="cart-details">
            <h3>${item.productname}</h3>
            <p class="price">Rs.${item.price}</p>
            <div class="quantity-controls">
                <button class="decrease" onclick="updateQuantity('${item.productid}', -1)">-</button>
                <span class="count">${item.count}</span>
                <button class="increase" onclick="updateQuantity('${item.productid}', 1)">+</button>
            </div>
            <button class="remove" onclick="removeItem('${item.productid}')">🗑</button>
            </div>
        `;
    cartContainer.appendChild(cartItem);
  });

  // Update subtotal
  subtotalElement.textContent = `Rs.${subtotal.toFixed(2)}`;
  completeOrder.textContent = `COMPLETE ORDER Rs.${subtotal.toFixed(2)}`;
}

// Update quantity
// Update quantity
function updateQuantity(id, change) {
  let productid = Number(id); // Convert id to a number
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart.forEach((item, index) => {
    if (item.productid === productid) {
      if (change === -1) {
        // Decrease quantity or remove item if count reaches 0
        if (item.count > 1) {
          item.count -= 1;
        } else {
          cart.splice(index, 1); // Remove item if count is 0
        }
      } else if (change === 1) {
        // Increase quantity
        item.count = (item.count || 1) + 1;
      }
    }
  });

  console.log(cart);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCartItems(); // Reload cart
  updateOrderNowButton(); // Update order now button
}

// Remove item completely
function removeItem(id) {
  let productid = Number(id);

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].productid === productid) {
      cart.splice(i, 1); // Remove the item at index i
      break; // Exit the loop after removing the item
    }
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCartItems(); // Reload cart
  updateCartCount();
  updateOrderNowButton(); // Update order now button
}

async function showData(value) {
  const posters = document.getElementsByClassName("poster");
  for (let i = 0; i < posters.length; i++) {
    if (value === "home") {
      posters[i].style.display = "flex";
      value = "all";
    } else {
      posters[i].style.display = "none";
    }
  }
  closeSidebar();
  // Call loadProducts with the value
  showLoadProduct(await loadProducts(value));
}

function validateOrderForm() {
  const name = document.getElementById("name").value.trim();
  const phone1 = document.getElementById("phone1").value.trim();
  const phone2 = document.getElementById("phone2").value.trim();
  const address = document.getElementById("address").value.trim();
  const city = document.getElementById("city").value.trim();

  if (!name || !phone1 || !address || !city) {
    alert("Please fill in all required fields.");
    return;
  }

  const phonePattern = /^\d{10,11}$/;
  if (!phonePattern.test(phone1)) {
    alert("Please enter a valid primary phone number.");
    return;
  }

  if (phone2 && !phonePattern.test(phone2)) {
    alert("Please enter a valid secondary phone number.");
    return;
  }

  const btn = document.querySelector(".submit-btn");

  // Disable the button and show spinner
  btn.disabled = true;
  btn.innerHTML = `PROCESSING <span class="spinner"></span>`;

  // Simulate async (replace with actual async call)
  setTimeout(() => {
    submitOrderData().then(() => {
      btn.disabled = false;
      btn.innerHTML = "COMPLETE ORDER Rs.0";
    });
  }, 2000);
}

function showSuccessMessage(message) {
  closeOrderForm();
  closeSidebar();
  closeCartSidebar();
  // Create success message container
  let successMsg = document.createElement("div");
  successMsg.classList.add("success-message");
  successMsg.innerText = message;

  // Append to body
  document.body.appendChild(successMsg);

  // Show with animation
  setTimeout(() => {
    successMsg.classList.add("show");
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    successMsg.classList.remove("show");
    setTimeout(() => successMsg.remove(), 500);
  }, 3000);

  // Clear all local storages
  localStorage.clear();
}

function showErrorMessage(message) {
  console.log("Error Message Triggered:", message); // Debugging log
  closeOrderForm();
  closeSidebar();
  closeCartSidebar();

  let errorMsg = document.createElement("div");
  errorMsg.classList.add("error-message");
  errorMsg.innerText = message;

  document.body.appendChild(errorMsg);

  setTimeout(() => {
    errorMsg.classList.add("show");
  }, 100);

  setTimeout(() => {
    errorMsg.classList.remove("show");
    setTimeout(() => errorMsg.remove(), 500);
  }, 3000);
}

// Function to get cart items from local storage
function getCartItems() {
  let cart = JSON.parse(localStorage.getItem("cart")) || []; // Get cart array or empty if null
  return cart;
}

// Function to update cart count
function updateCartCount() {
  let cartItems = getCartItems(); // Fetch cart items
  document.getElementById("cart-count").textContent = cartItems.length; // Update count
}

function updateOrderNowButton() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const orderNowButton = document.querySelector(".order-now");

  if (cart.length > 0) {
    orderNowButton.disabled = false; // Enable the button
    orderNowButton.style.background = "red"; // Set color to red
  } else {
    orderNowButton.disabled = true; // Disable the button
    orderNowButton.style.background = "rgb(245, 141, 141)"; // Set color to light red
  }
}

//Function to submit order data
async function submitOrderData() {
  const name = document.getElementById("name").value.trim();
  const phone1 = document.getElementById("phone1").value.trim();
  const phone2 = document.getElementById("phone2").value.trim();
  const address = document.getElementById("address").value.trim();
  const city = document.getElementById("city").value.trim();

  const fullAddress = `${address}, ${city}`;
  const userDetails = {
    fullname: name,
    phonenumber1: phone1,
    phonenumber2: phone2,
    address: fullAddress,
  };

  debugger;
  const cartItems = getCartItems();

  const subtotal = localStorage.getItem("total");

  const orderItems = cartItems.map(({ count, price, ...rest }) => {
    return {
      ...rest,
      quantity: count,
      totalprice: subtotal, // Add total price column
    };
  });

  console.log(orderItems);

  if (!name || !phone1 || !address || orderItems.length === 0) {
    showErrorMessage(
      "❌ Please fill out all required fields and add products to cart."
    );
    return;
  }

  const orderPayload = {
    userDetails,
    orderItems,
  };

  const response = await sendOrderToServer(orderPayload);

  if (response.ok) {
    showSuccessMessage("🎉 Order placed successfully!");
    console.log("Order Success:", response.data);
    localStorage.clear();
    loadCartItems();
    loadProducts("all");
    updateCartCount();
  } else {
    showErrorMessage(`❌ ${response.data.message || "Failed to place order"}`);
    console.error("Order Error:", response.data);
  }
}

function openPopup() {
  document.getElementById("popup").style.display = "flex";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

window.openCartSidebar = openCartSidebar;
window.closeCartSidebar = closeCartSidebar;
window.removeItem = removeItem;
window.updateQuantity = updateQuantity;
window.openOrderForm = openOrderForm;
window.closeOrderForm = closeOrderForm;
window.validateOrderForm = validateOrderForm;
window.showData = showData;
window.closeSidebar = closeSidebar;
window.openSidebar = openSidebar;
window.loadProducts = loadProducts;
window.loadCartItems = loadCartItems;
window.updateCartCount = updateCartCount;
window.showSuccessMessage = showSuccessMessage;
window.showErrorMessage = showErrorMessage;
window.openPopup = openPopup;
window.closePopup = closePopup;
