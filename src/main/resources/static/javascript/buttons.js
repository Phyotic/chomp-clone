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

burgersMenuButton.addEventListener("click", populateMenu("menu-grid", "burgers"));
sidesMenuButton.addEventListener("click", populateMenu("menu-grid", "sides"));
drinksMenuButton.addEventListener("click", populateMenu("menu-grid", "drinks"));

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
    //TODO: call fillCart();
} else {
    loadCartEmpty();
}

// Fetch the menu and load it into local storage.
fetchMenuToStorage()
.then(() => populateMenu("menu-grid", "burgers")
    .catch(error => console.error("Could not populate menu.", error)))
.catch(error => console.error("Could not load/retrieve menu: ", error));

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
function loadCartContains() {
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

//TODO: Fill cart with stored items
function fillCart() {

}

//Load empty cart element
function loadCartEmpty() {
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
    fetch("menu.json")
    .then((response) => response.text())
    .then((ccMenu) => {
        localStorage.setItem("cc-menu", ccMenu);
    })
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
    
        fetch("../templates/MenuItem.html")
        .then((response) => response.text())
        .then((template) => {
            for(const item of itemsArray) {
                let copyTemp = template.slice();
                let newItem = copyTemp
                    .replace("{{itemName}}", item.name)
                    .replace("{{itemPrice}}", item.price.toFixed(2))
                    .replace("{{imageSource}}", item.imageUrl);
    
                parent.innerHTML += newItem;
            }
        })
        .catch(error => {
            console.error("Could not retrieve template resource.", error);
        });
    } else {
        console.error("Could not retrieve sub menu from storage.")
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