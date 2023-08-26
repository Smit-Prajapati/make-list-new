import {
  realItemsList,
  realItemsListGujarati,
  gokulItemsList,
} from "./data.js";

//--------------------------------------------get url params------------------------------------------------------------
const urlParams = new URLSearchParams(window.location.search);
const searchQuery = urlParams.get("list");

//-------------------------------------------get items-------------------------------------------------------------------
const listContainer = document.getElementById("list-container");
const topbar = document.getElementById("topbar");
const downloadButton = document.getElementById("download-button");
const addItemButton = document.getElementById("add-item-button");

const popupBox = document.getElementById("popup-container");
const addItemForm = document.getElementById("add-item-form");
const popupCloseButton = document.getElementById("cancel-button");
let checkboxList;

//-------------------------------------------variables-------------------------------------------------------------------
let items;
let selectedCompany;

//-----------------------------------------on load generate list -----------------------------------------------------

window.addEventListener("load", function () {
  if (searchQuery === "real") {
    items = realItemsList;
    selectedCompany = "real";
    generateUI("real");
  } else {
    items = gokulItemsList;
    selectedCompany = "gokul";
    generateUI("gokul");
  }




})

function createLable(data) {
  const lable = document.createElement("label");

  lable.innerHTML = `
    <input type="checkbox" name="checkbox" value=${data.name}>
    <div class="text">${data.name}</div>
    <input type="number" name="amount" step="0.5" min="0">`;

  return lable;
}

function generateTopbar(companyName) {
  if (companyName === "real") {
    topbar.innerHTML = `<img src="images/real.png" alt="REAL" id="company-logo">
        <div class="gujarati-div">
            <input type="checkbox" id="gujarati"> <span class="gujarati-text">ગુજરાતી</span>
        </div>`;
  } else {
    topbar.innerHTML = `<img src="images/gokul.png" alt="GOKUL" id="company-logo">`;
  }
}

//---------------------------------------------------popup----------------------------------------
addItemButton.addEventListener("click", function () {
  popupBox.style.display = "flex";

  const formNameInput = document.getElementById("form-name-input");
  formNameInput.focus();
});

popupCloseButton.addEventListener("click", function () {
  popupBox.style.display = "none";
});

addItemForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const formNameInput = document.getElementById("form-name-input");
  const formPriceInput = document.getElementById("form-price-input");

  const newItem = formNameInput.value;
  const price = formPriceInput.value;

  items.push({ name: newItem, price: price });

  generateListUI();
  formNameInput.value = "";
  formPriceInput.value = "";
  popupBox.style.display = "none";
});

//---------------------------update selected items list------------------------------------------

function updateSelectedItems() {
  let selectedItems = [];
  checkboxList.forEach((checkbox, index) => {
    if (checkbox.checked) {
      selectedItems.push(items[index]);
    }
  });
  displaySelectedItems(selectedItems);
}

function displaySelectedItems(items) {
  const downloadPicDiv = document.getElementById("download-pic");
  downloadPicDiv.innerHTML = "";
  
  let downloadPicDivTopBar  = document.createElement("div");
  downloadPicDivTopBar.classList.add("top-bar");
  downloadPicDivTopBar.innerHTML = `<img src="images/gokul.png"  alt="Gokul">
  <div class="details">
      <p class="person-name">Dipakkumar Prajapai</p>
      <p class="date">(25/08/2023)</p>
  </div>`

  let downloadPicDivList = document.createElement("ul");
  downloadPicDivList.id = "selected-items-list";
  downloadPicDivList.classList.add("selected-items-list");

  items.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML =  `
    <span class="item-number">1</span>
    <span class="item-name">${item.name}</span>
    <span class="item-price">${item.price}</span>`

    downloadPicDivList.appendChild(li);

  });


  let downloadPicDivBottomBar = document.createElement("div");
  downloadPicDivBottomBar.classList.add("bottom-bar");

  downloadPicDivBottomBar.innerHTML = `<span class="total-items">Total Items : 54</span>
  <span class="total-price">₹5205</span>`

  downloadPicDiv.appendChild(downloadPicDivTopBar);
  downloadPicDiv.appendChild(downloadPicDivList);
  downloadPicDiv.appendChild(downloadPicDivBottomBar);
}

function getDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth();
  var yyyy = today.getFullYear();

  return (
    " (" +
    ("0" + dd).slice(-2) +
    "/" +
    ("0" + (mm + 1)).slice(-2) +
    "/" +
    yyyy +
    ") "
  );
}

//-----------------------------------------download-----------------------------------------
downloadButton.addEventListener("click", () => {
  console.log("downloading");
})
