// Enable toggle of cart 
const cartButton = document.getElementById("cart-button");
const blackout = document.getElementById("blackout");
const checkoutClose = document.getElementById("checkout-close");

cartButton.addEventListener("click", toggleAside);
blackout.addEventListener("click", toggleAside);
checkoutClose.addEventListener("click", toggleAside);

// Enable changing of menu tabs on home page.
const burgersMenuButton = document.getElementById("burgersMenuButton")
const sidesMenuButton = document.getElementById("sidesMenuButton")
const drinksMenuButton = document.getElementById("drinksMenuButton")

// Enable active feature on menu buttons.
const menuButtons = [];
menuButtons.push(burgersMenuButton);
menuButtons.push(sidesMenuButton);
menuButtons.push(drinksMenuButton);

for(const button of menuButtons) {
    button.addEventListener("click", () => {
        toggleOneActive(button.id, menuButtons, "active-button");
    });
}

// Load proper cart status element
if(localStorage.getItem("cc-cart-items")) {
    (async () => {
        await loadCartContains();
        await loadCartItems();
        addQuantityHandler();
        updateTotal();
    })();
} else {
    loadCartEmpty();
}

// Fetch the menu, load it into local storage, display it, add handlers to add-to-cart buttons.
(async () => {
    await fetchMenuToStorage();
    await populateMenu("menu-grid", "burgers");
    document.getElementById("menu-grid").addEventListener("submit", async (event) => {
        await handleSubmit(event, "addToCartForm");
    });

    burgersMenuButton.addEventListener("click", async () => {
        await populateMenu("menu-grid", "burgers");
    });

    sidesMenuButton.addEventListener("click", async () => {
        await populateMenu("menu-grid", "sides");
    });

    drinksMenuButton.addEventListener("click", async () => {
        await populateMenu("menu-grid", "drinks");
    });
})();

// == FUNCTIONS ==

//Toggle cart overlay.
function toggleAside(event) {
    const aside = document.getElementById("checkout-aside");
    
    if(aside.style.display != "flex") {
        aside.style.display = "flex";
    } else {
        aside.style.display = "none";
    }
}

//Load non-empty cart element
async function loadCartContains() {
    const checkoutBottomSection = document.getElementById("checkout-bottom-section");

    checkoutBottomSection.style.alignItems = "initial";

    const response = await fetch("/templates/NonEmptyCart.html");
    const nonEmptyTemplate = await response.text();
    checkoutBottomSection.innerHTML = nonEmptyTemplate;

    const itemsContainer = document.getElementById("items-container");

    itemsContainer.addEventListener("click", async (event) => {
        const t = event.target;

        if(t.classList.contains("cart-remove")) {
            const itemContainer = t.parentElement.parentElement;
            const itemName = itemContainer.querySelector('input[name="itemName"]').value;

            removeItemFromLocalStorage(itemName);
            removeItemFromCart(itemContainer);
        }
    });

    const checkoutButton = document.getElementById("continue-button");
    checkoutButton.addEventListener("click", (event) => {
        handleCheckout(event);
    })
}

//Load empty cart element
async function loadCartEmpty() {
    const checkoutBottomSection = document.getElementById("checkout-bottom-section");
    checkoutBottomSection.style.alignItems = "center";

    const response = await fetch("/templates/EmptyCart.html");
    const emptyTemplate = await response.text();
    checkoutBottomSection.innerHTML = emptyTemplate;
}

//Fetch the complete menu and save to local storage.
async function fetchMenuToStorage() {
    const response = await fetch("menu.json");
    const ccMenu = await response.text();
    localStorage.setItem("cc-menu", ccMenu);
}

//Load the specified sub menu from local storage.
function loadMenuFromStorage(kind) {
    if(localStorage.getItem("cc-menu")) {
        const completeMenu = JSON.parse(localStorage.getItem("cc-menu"));
    
        for(const menuObj of completeMenu) {
            if(menuObj.name === kind) {
                return menuObj;
            }
        }

        console.error("Provided key is not in stored data.")
        return null;
    } else {
        console.error("No data found in local storage");
        return null;
    }
}

//Load the the specified menu under the specified parent element.
async function populateMenu(parentName, kind) {
    const menuObj = loadMenuFromStorage(kind);

    if(menuObj) {
        const itemsArray = menuObj.menuItems;

        const parent = document.getElementById(parentName);
        parent.replaceChildren();
    
        const response = await fetch("/templates/MenuItem.html")
        const template = await response.text();

        for(const item of itemsArray) {
            let copyTemp = template.slice();
            let newItem = copyTemp
                .replaceAll("{{itemName}}", item.name)
                .replaceAll("{{itemPrice}}", item.price.toFixed(2))
                .replaceAll("{{imageSource}}", item.imageUrl);

            parent.innerHTML += newItem;
        }
    } else {
        console.error("Could not retrieve sub menu from storage.");
    }
}

//Toggles the specified element from array as the only active member defined by activeClass.
function toggleOneActive(elementName, array, activeClass) {
    for(const element of array) {
        let active = false;

        if(element.id == elementName) {
            active = true;
        }

        if(active) {
            if(!element.classList.contains(activeClass)) {
                element.classList.add(activeClass);
            }
        } else {
            if(element.classList.contains(activeClass)) {
                element.classList.remove(activeClass);
            }
        }
    }
}

//Handles add-to-cart button submit on homepage.
async function handleSubmit(event, formName) {
    if(event.target.classList.contains(formName)) {
        event.preventDefault();

        const button = event.target.querySelector(".add-to-cart-button");
        button.value = "Adding to cart...";

        const item = {}
        item.name = event.target.querySelector('input[name="itemName"]').value;
        item.price = event.target.querySelector('input[name="itemPrice"]').value;
        item.quantity = parseInt(event.target.querySelector('input[name="quantity"]').value);
        item.imageUrl = event.target.querySelector('input[name="imageSource"]').value;

        saveItemToLocalStorage(item);
        await addItemToCart(item);
        updateTotal();
        toggleAside();
        button.value = "Add to Cart";
    }
}

//Saves the item to the local storage.
function saveItemToLocalStorage(item) {
    let items = localStorage.getItem("cc-cart-items");

    if(items) {
        const jItems = JSON.parse(items);

        let found = false;

        for(curItem of jItems) {
            if(curItem.name === item.name) {
                let q = parseInt(curItem.quantity);
                q += parseInt(item.quantity);
                curItem.quantity = q;
                found = true;
                break;
            }
        }

        if(!found) {
            jItems.push(item);
        }

        items = jItems;
    } else {
        items = [];
        items.push(item)
    }

    items = JSON.stringify(items);
    localStorage.setItem("cc-cart-items", items);
}

//Removes the item from the local storage.
function removeItemFromLocalStorage(itemName) {
    const itemsInCart = JSON.parse(localStorage.getItem("cc-cart-items"));

    for(const index in itemsInCart) {
        if(itemsInCart[index].name === itemName) {
            itemsInCart.splice(index, 1);

            if(itemsInCart.length === 0) {
                localStorage.removeItem("cc-cart-items");
            } else {
                const strItems = JSON.stringify(itemsInCart);
                localStorage.setItem("cc-cart-items", strItems);
            }
            break;
        }
    }
}

//Loads templates for items in "cc-cart-items".
async function loadCartItems() {
    const nonEmptyCart = document.getElementById("non-empty-cart");

    if(!nonEmptyCart){
        await loadCartContains();
    }

    const itemsContainer = document.getElementById("items-container");
    const numDisplayed = itemsContainer.childElementCount;

    const stringCartItems = localStorage.getItem("cc-cart-items");
    const jsonCartItems = JSON.parse(stringCartItems);
    const cartItemsLen = jsonCartItems.length;

    const response = await fetch("/templates/CartItem.html");
    const template = await response.text();

    if(cartItemsLen != numDisplayed) {
        if(cartItemsLen > numDisplayed) {
            const children = itemsContainer.querySelectorAll("cart-item-container");

            for(child of children) {

                const dispName = child.querySelector('input[name="itemName"]').value; 
                
                for(cartItem of jsonCartItems) {
                    if(dispName == cartItem.itemName) {
                        jsonCartItems.remove(cartItem);
                    }
                }
            }

            for(item of jsonCartItems) {
                let temp = template.slice()
                    .replaceAll("{{itemName}}", item.name)
                    .replaceAll("{{itemPrice}}", item.price)
                    .replaceAll("{{itemQuantity}}", item.quantity)
                    .replaceAll("{{imageSource}}", item.imageUrl);
                
                itemsContainer.innerHTML += temp;
            }
        }
    }
}

//Manages the display of the item to the cart; if it exists already, add to the existing quantity.
async function addItemToCart(item) {
    const nonEmptyCart = document.getElementById("non-empty-cart");

    if(!nonEmptyCart){
        await loadCartContains();
    }
    let itemsContainer = document.getElementById("items-container");
    const numDisplayed = itemsContainer.getElementsByClassName("cart-item-container").length;

    const stringCartItems = localStorage.getItem("cc-cart-items");
    const jsonCartItems = JSON.parse(stringCartItems);
    const cartItemsLen = jsonCartItems.length;

    if(numDisplayed < cartItemsLen) {
        const response = await fetch("/templates/CartItem.html");
        let template = await response.text();
        const temp = template
            .replaceAll("{{imageSource}}", item.imageUrl)
            .replaceAll("{{itemName}}", item.name)
            .replaceAll("{{itemPrice}}", item.price)
            .replaceAll("{{itemQuantity}}", item.quantity);

        itemsContainer.innerHTML += temp;

        addQuantityHandler();
    } else {
        const forms = itemsContainer.getElementsByClassName("update-cart-item");

        for(const form of forms) {
            if(form.querySelector('input[name="itemName"]').value === item.name) {
                for(const e of form) {
                    if(e.name === "itemQuantity") {
                        let oldQ = e.value;
                        const newQ = parseInt(e.value) + item.quantity;

                        let outer = e.outerHTML;
                        const replace = outer.replace('value="' + oldQ + '"', 'value="' + newQ + '"');
                        e.outerHTML = replace;
                        break;
                    }
                }
                break;
            }
        }
    }
}

//Removes the item from the displayed cart.
async function removeItemFromCart(cartItem) {
    cartItem.remove();
    
    const itemsContainer = document.getElementById("items-container");
    const items = itemsContainer.getElementsByClassName("cart-item-container");

    if(!items.length) {
        loadCartEmpty();
    } else {
        updateTotal();
    }
}

//Update total price of items in the cart.
function updateTotal() {
    const jItems = JSON.parse(localStorage.getItem("cc-cart-items"));

    let total = 0;

    if(jItems) {
        for(const item of jItems) {
            total += parseFloat(item.price) * parseFloat(item.quantity);
        }
    }

    let totalElement = document.getElementById("subtotal");
    totalElement.innerHTML = "$" + total.toFixed(2) + " USD";
}

//Adds handlers to the quantity change input in the cart items.
function addQuantityHandler() {
    const itemsContainer = document.getElementById("items-container");
    const items = itemsContainer.getElementsByClassName("cart-item-container");

    for(const item of items) {
        const children = item.children;

        for(const e of children) {
            if(e.classList.contains("update-cart-item")) {
                item.addEventListener("submit", (event) => {
                    quantitySubmit(event);
                });
            }
        }
    }
}

//Handles the quantity change of an item in the cart.
function quantitySubmit(event) {
    event.preventDefault();

    const form = event.target;
    const children = form.children;

    let itemName = "";
    for(const child of children) {
        if(child.name === "itemName") {
            itemName = child.value;
        }

        if(child.name === "itemQuantity") {
            if(child.value == 0) {
                removeItemFromLocalStorage(itemName);
                removeItemFromCart(form.parentElement);
            } else {
                let outer = child.outerHTML;
                const newQuantity = child.valueAsNumber;

                child.outerHTML = outer.replace(
                    'value="' + child.defaultValue + '"',
                    'value="' + newQuantity + '"');
    
                setItemInLocalStorage(itemName, newQuantity)
            }
            break;
        }
    }
    updateTotal();
}

//Sets the item in local storage to the specified quantity.
function setItemInLocalStorage(itemName, quantity) {
    const jItems = JSON.parse(localStorage.getItem("cc-cart-items"));

    for(const item of jItems) {
        if(item.name === itemName) {
            item.quantity = quantity;
            localStorage.setItem("cc-cart-items", JSON.stringify(jItems));
            break;
        }
    }
}

//Handles the "checkout" of the cart items.
async function handleCheckout(event) {
    const url = "/checkout";
    const order = JSON.parse(localStorage.getItem("cc-cart-items"));

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: order
    });

    alert("Responded with: " + response.status);
}