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
    loadCartContains();
    loadCartItems();
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

    fetch("../templates/NonEmptyCart.html")
    .then(response => response.text())
    .then(nonEmptyTemplate => {
        if(checkoutBottomSection.childElementCount === 0) {
            checkoutBottomSection.innerHTML = nonEmptyTemplate;
        } else {
            if(!checkoutBottomSection.firstElementChild.id.match("non-empty-cart")) {
                checkoutBottomSection.replaceChild(checkoutBottomSection.firstElementChild, nonEmptyTemplate);
            }
        }
    })
}

//Load empty cart element
async function loadCartEmpty() {
    const checkoutBottomSection = document.getElementById("checkout-bottom-section");
    fetch("../templates/EmptyCart.html")
    .then(response => response.text())
    .then((emptyTemplate) => {
        if(checkoutBottomSection.childElementCount === 0) {
            checkoutBottomSection.innerHTML = emptyTemplate;
        } else {
            if(!checkoutBottomSection.firstElementChild.id.match("checkout-empty")) {
                checkoutBottomSection.replaceChild(checkoutBottomSection.firstElementChild, template);
            }
        }
    })
    .catch(error => {
        console.error(error);
    });
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
    
        const response = await fetch("../templates/MenuItem.html")
        const template = await response.text();

        for(const item of itemsArray) {
            let copyTemp = template.slice();
            let newItem = copyTemp
                .replaceAll("{{itemName}}", item.name)
                .replaceAll("{{itemPrice}}", item.price.toFixed(2))
                .replace("{{imageSource}}", item.imageUrl);

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

async function handleSubmit(event, formName) {
    if(event.target.classList.contains(formName)) {
        event.preventDefault();

        const button = event.target.querySelector(".add-to-cart-button");
        button.value = "Adding to cart...";

        const item = {}
        item.itemName = event.target.querySelector('input[name="itemName"]').value;
        item.itemPrice = event.target.querySelector('input[name="itemPrice"]').value;
        item.quantity = event.target.querySelector('input[name="quantity"]').value;

        saveItemToLocalStorage(item);
        await addItemToCart(item)
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
            if(curItem.itemName === item.itemName) {
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

//Loads templates for items in "cc-cart-items".
async function loadCartItems() {
    const emptyCart = document.getElementById("checkout-empty");

    if(emptyCart){
        await loadCartContains();
    }

    const itemsContainer = document.getElementById("items-container");
    const children = itemsContainer.childElementCount;

    if(localStorage.getItem("cc-cart-items" != children)) {
        // const response = await fetch();

        itemsContainer.replaceChildren();
    }

    /*
    if checkout empty exists
        loadCartContains()

    if cc-cart-items != children of items-container
        reload all items
    */
}

async function addItemToCart(item) {

}

async function removeItemFromCart(item) {

}

async function updateItemFromCart(item) {

}