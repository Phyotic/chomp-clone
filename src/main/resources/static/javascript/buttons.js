// Enable toggle of cart 
const cartButton = document.getElementById("cart-button");
const blackout = document.getElementById("blackout");
const checkoutClose = document.getElementById("checkout-close");

cartButton.addEventListener("click", toggleAside);
blackout.addEventListener("click", toggleAside);
checkoutClose.addEventListener("click", toggleAside);

// FUNCTIONS
function toggleAside(event) {
    const aside = document.getElementById("checkout-aside");
    
    if(aside.style.display != "flex") {
        aside.style.display = "flex";
    } else {
        aside.style.display = "none";
    }
}