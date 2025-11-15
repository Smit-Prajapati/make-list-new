import {
  realItemsList,
  realItemsListGujarati,
  gokulItemsList,
  balajiItemsList,
} from "./data.js";

//--------------------------------------------get url params------------------------------------------------------------
const urlParams = new URLSearchParams(window.location.search);
const searchQuery = urlParams.get("list");


//-----------------------------------------on load generate list -----------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {

  const favicon = document.getElementById("favicon");

  const topbar = document.getElementById("topbar");
  const listContainer = document.getElementById("list-container");
  const downloadPicDiv = document.getElementById("download-pic");

  const addItemButton = document.getElementById("add-item-button");
  const addItemPopupBox = document.getElementById("add-item-popup-container");
  const addItemForm = document.getElementById("add-item-form");
  const addItemPopupCloseButton = document.getElementById("add-item-cancel-button");
  const downloadButton = document.getElementById("download-button");

  const personNamePopupBox = document.getElementById("person-name-popup-container");
  const personNameForm = document.getElementById("person-name-form");
  const personNameInput = document.getElementById("person-name-input");
  const personNameClosePopupButton = document.getElementById("person-name-cancel-button");

  let currentList;
  let selectedCompany;
  let companyLogoUrl;
  let personName = localStorage.getItem("storedPersonName");
  let isDownloading = false;
  let companyName;

  if (searchQuery === "real") {
    currentList = realItemsListGujarati;
    selectedCompany = "real";
    companyLogoUrl = "images/real.png";
    document.title = "Real";
    companyName = "Real";
    favicon.setAttribute("href", "images/real.png");
  } else if (searchQuery === "gokul") {
    currentList = gokulItemsList;
    selectedCompany = "gokul";
    companyLogoUrl = "images/gokul.png";
    document.title = "Gokul";
    companyName = "Gokul";
    favicon.setAttribute("href", "images/gokul.png");
  } else if (searchQuery === "balaji") {
    currentList = balajiItemsList;
    selectedCompany = "balaji";
    companyLogoUrl = "images/balaji.png";
    document.title = "Balaji";
    companyName = "Balaji";
    favicon.setAttribute("href", "images/balaji.png");
  }

  generateTopbar();
  populateList();

  function populateList(previousState) {
    listContainer.innerHTML = "";

    currentList.forEach((item, index) => {
      listContainer.appendChild(createLable(item));
    });

    const checkboxes = document.getElementsByName("checkbox");
    const amountInputs = document.getElementsByName("amount");
    
    // Restore previous state if available
    if (previousState) {
      checkboxes.forEach((item, idx) => {
        if (previousState[idx]) {
          item.checked = previousState[idx].checked;
          amountInputs[idx].value = previousState[idx].amount;
          amountInputs[idx].style.border = previousState[idx].checked ? "2px solid #FCDC4D" : "2px solid grey";
        }
      });
    }
    checkboxes.forEach((item, index) => {
      item.addEventListener("change", function () {
        handleCheckboxChange(index);
      });
    });

    amountInputs.forEach((item, index) => {
      item.addEventListener("input", function () {
        handleInputChange(index);
      });
    });

    function createLable(data) {
      const lable = document.createElement("label");

      lable.innerHTML = `
       <div class="checkbox-container">
            <input type="checkbox"  class="checkbox" name="checkbox" value=${data.name}">
            <div class="checkmark">
                <svg width="23" height="20" viewBox="0 0 23 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M22.7601 1.72837C22.6079 1.91613 8.92915 19.1417 8.79063 19.3192C8.46874 19.7242 8.01793 19.968 7.53726 19.9971C7.05659 20.0261 6.58538 19.8381 6.22719 19.4742C6.15032 19.3945 6.07907 19.3081 6.01408 19.2158L0.267659 10.9475C0.0962799 10.7536 -1.35132e-08 10.4905 0 10.2163C1.35132e-08 9.94201 0.0962799 9.67898 0.267659 9.48505C0.439039 9.29112 0.671479 9.18217 0.913846 9.18217C1.15621 9.18217 1.38865 9.29112 1.56003 9.48505L7.34451 14.6321L21.4647 0.272796C22.3385 -0.572982 23.5106 0.727565 22.7601 1.72837Z"
                        fill="#593F28" />
                </svg>
            </div>
        </div>
        <div class="text">${data.name}</div>
        <input type="number" name="amount" step="0.5" min="0" placeholder="0">`;
      return lable;
    }

    function handleCheckboxChange(index) {
      if (checkboxes[index].checked) {
        amountInputs[index].value = 1;
        amountInputs[index].style.border = "2px solid #FCDC4D";
      } else {
        amountInputs[index].value = null;
        amountInputs[index].style.border = "2px solid grey";
      }
      updateSelectedItemsList();
    }

    function handleInputChange(index) {
      if (amountInputs[index].value > 0) {
        checkboxes[index].checked = true;
        amountInputs[index].style.border = "2px solid #FCDC4D";
      } else {
        checkboxes[index].checked = false;
        amountInputs[index].style.border = "2px solid grey";
      }
      updateSelectedItemsList();
    }

    function updateSelectedItemsList() {
      const listDiv = document.getElementById("selected-items-list");
      const totalItemDiv = document.getElementById("total-items");
      const toatlpriceDiv = document.getElementById("total-price");
      const companyLogoImage = document.getElementById("company-logo-in-list");
      const personNameDiv = document.getElementById("person-name");
      const dateDiv = document.getElementById("date");
      const companyNameDiv = document.getElementById("company-name");

      listDiv.innerHTML = "";
      let number = 1;
      let totalItems = 0;
      let totalPrice = 0;

      companyLogoImage.src = companyLogoUrl;
      companyNameDiv.innerHTML = companyName;
      personNameDiv.innerHTML = personName;
      dateDiv.innerHTML = getDate();

      checkboxes.forEach((item, index) => {
        if (checkboxes[index].checked) {
          const li = document.createElement("li");
          li.innerHTML = `<span class="item-number">${number}</span>
          <span class="item-name">${currentList[index].name} : <span class="item-amount">${amountInputs[index].value
            }</span></span>
          <span class="item-price">₹${currentList[index].price * amountInputs[index].value
            }</span>`;

          number += 1;
          totalItems = totalItems + +amountInputs[index].value;
          totalPrice =
            totalPrice + currentList[index].price * amountInputs[index].value;

          listDiv.appendChild(li);
        }
      });

      totalItemDiv.innerHTML = `Total items : ${totalItems}`;
      toatlpriceDiv.innerHTML = `₹${totalPrice}`;

      if (totalItems > 0) {
        downloadPicDiv.style.display = "block";
      } else {
        downloadPicDiv.style.display = "none";
      }
    }

    function showPersonNamePopup() {
      personNamePopupBox.style.display = "flex";
      personNameInput.focus();
      personNameInput.value = personName;
    }

    personNameForm.addEventListener("submit", function (e) {
      e.preventDefault();
      localStorage.setItem("storedPersonName", personNameInput.value);

      personName = localStorage.getItem("storedPersonName");

      if (personName.trim() !== "") {
        updateSelectedItemsList();
        downloadImage();
        personNamePopupBox.style.display = "none";
      }

    })

    downloadButton.addEventListener("click", function () {
      if (downloadPicDiv.style.display === "block" && !isDownloading) {
        isDownloading = true;
        showPersonNamePopup();
      } else {
        alert("No Item Selected");
      }
    });
    personNameClosePopupButton.addEventListener("click", function () {
      personNamePopupBox.style.display = "none";
      isDownloading = false;
    })
  }

  function generateTopbar(company) {
    if (selectedCompany === "real") {
      topbar.innerHTML = `<img src="images/real.png" alt="REAL" id="company-logo">
      <div class="gujarati-div">
          <label class="checkbox-container">
        <div class="checkbox-container">
            <input type="checkbox" id="gujarati" checked>
            <div class="checkmark">
                <svg width="23" height="20" viewBox="0 0 23 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M22.7601 1.72837C22.6079 1.91613 8.92915 19.1417 8.79063 19.3192C8.46874 19.7242 8.01793 19.968 7.53726 19.9971C7.05659 20.0261 6.58538 19.8381 6.22719 19.4742C6.15032 19.3945 6.07907 19.3081 6.01408 19.2158L0.267659 10.9475C0.0962799 10.7536 -1.35132e-08 10.4905 0 10.2163C1.35132e-08 9.94201 0.0962799 9.67898 0.267659 9.48505C0.439039 9.29112 0.671479 9.18217 0.913846 9.18217C1.15621 9.18217 1.38865 9.29112 1.56003 9.48505L7.34451 14.6321L21.4647 0.272796C22.3385 -0.572982 23.5106 0.727565 22.7601 1.72837Z"
                        fill="#593F28" />
                </svg>
            </div>
        </div>
        <span class="gujarati-text">ગુજરાતી</span>
    </label>
      </div>`;

      const gujaratiCheckbox = document.getElementById("gujarati");

      gujaratiCheckbox.addEventListener("change", function () {
        currentList = this.checked ? realItemsListGujarati : realItemsList;
        populateList();
      });
    } else if (selectedCompany == "gokul") {
      topbar.innerHTML = `<img src="images/gokul.png" alt="REAL" id="company-logo">`;
    } else {
      topbar.innerHTML = `<img src="images/balaji.png" alt="REAL" id="company-logo">`;
    }
  }

  //---------------------------------------------------popup----------------------------------------
  addItemButton.addEventListener("click", function () {
    addItemPopupBox.style.display = "flex";

    const formNameInput = document.getElementById("form-name-input");
    formNameInput.focus();
  });

  addItemPopupCloseButton.addEventListener("click", function () {
    addItemPopupBox.style.display = "none";
  });

  addItemForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const formNameInput = document.getElementById("form-name-input");
    const formPriceInput = document.getElementById("form-price-input");

    // Save current selection and amounts
    const checkboxes = document.getElementsByName("checkbox");
    const amountInputs = document.getElementsByName("amount");
    let selectedState = [];
    checkboxes.forEach((item, idx) => {
      selectedState.push({
        checked: item.checked,
        amount: amountInputs[idx].value
      });
    });

    const newItem = formNameInput.value;
    const price = formPriceInput.value;

    currentList.push({ name: newItem, price: price });
    populateList(selectedState);

    formNameInput.value = "";
    formPriceInput.value = "";
    addItemPopupBox.style.display = "none";
  });





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
  function getPicName() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth();
    var yyyy = today.getFullYear();
    var hour = today.getHours();
    var min = today.getMinutes();
    var sec = today.getSeconds();

    return (
      selectedCompany +
      "_" +
      ("0" + dd).slice(-2) +
      "_" +
      ("0" + (mm + 1)).slice(-2) +
      "_" +
      yyyy +
      "_" +
      ("0" + hour).slice(-2) +
      "-" +
      ("0" + min).slice(-2) +
      "-" +
      ("0" + sec).slice(-2)
    );
  }

  function downloadImage() {
    location.href = "#download-pic";

    html2canvas(downloadPicDiv).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = getPicName() + ".png";
      link.click();
    });
    isDownloading = false;
  }
});
