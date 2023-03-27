
let cart = [];
let drugs = [];
let hiddenRows = [];

// Parse CSV file and convert to array of objects
Papa.parse("https://099a9f3d-7218-4373-b1f1-bae69f5b1a92.usrfiles.com/ugd/099a9f_951399d95857433a9f03a2eb1b0f97eb.csv", {
  header: ["drugName", "drugBrand", "drugDoseQuantity", "drugDoseUnit", "drugDoseFrequencyFactor", "drugPrice", "drugMinOrderQty"],
  download: true,
  complete: function(results) {
    if (results.errors.length > 0) {
      console.error("Failed to load drugs.csv:", results.errors[0].message);
      return;
    }
    drugs = results.data;
    if (drugs.length === 0) {
      console.error("No drugs found in drugs.csv");
      return;
    }
    console.log(drugs);
    populateDrugTable();
    showCart();
  }
});



const frequencyOptions = [
  { label: "Daily", value: "1a" },
  { label: "Every Morning", value: "1b" },
  { label: "Every Afternoon", value: "1c" },
  { label: "Every Evening", value: "1d" },
  { label: "Before Sleep", value: "1e" },
  { label: "2 times/day", value: "2a" },
  { label: "3 times/day", value: "3a" },
  { label: "4 times/day", value: "4a" },
  { label: "5 times/day", value: "5a" },
  { label: "Use as instructed", value: "1f" },
  { label: "Weekly", value: "1g" },
  { label: "2 times/week", value: "2b" },
  { label: "3 times/week", value: "3c" },
  { label: "4 times/week", value: "4d" },
  { label: "5 times/week", value: "5e" },
  { label: "Every other day", value: "1h" },
];

// Function to calculate total quantity of drugs in cart
function getCartTotalQuantity() {
  let total = 0;
  cart.forEach(item => {
    const drug = drugs.find(d => d.drugName === item.medicine);
    const quantity = item.quantity;
    total += quantity;
  });
  return total;
}

// Function to calculate total price of drugs in cart
function getCartTotalPrice() {
  let total = 0;
  cart.forEach(item => {
    const drug = drugs.find(d => d.drugName === item.medicine);
    const quantity = item.quantity;
    const frequency = parseInt(drug.drugDoseFrequencyFactor.charAt(0));
    const price = drug.drugPrice * drug.drugDoseQuantity * frequency * drug.drugMinOrderQty;
    total += price * quantity;
  });
  return total.toFixed(2);
}


function addToCart(medicine, price, brand) {
  let drug = drugs.find(d => d.drugName === medicine);
  if (drug) {
    let item = cart.find(item => item.medicine === medicine);
    if (item) {
      // Item already exists in the cart, update its quantity
      item.quantity++;
    } else {
      // Add the item to the cart
      item = {
        medicine: medicine,
        brand: brand, // add brand parameter to item object
        quantity: 1,
        price: price
      };
      cart.push(item);
    }
    // Hide the row in the search list
    const tableRows = document.querySelectorAll("#drugList tbody tr");
    tableRows.forEach(row => {
      const drugNameSpan = row.querySelector("td span");
      if (drugNameSpan && drugNameSpan.textContent === medicine) {
        row.style.display = "none";
        hiddenRows.push(row);
      }
    });
    showCart();
  }
}




function removeFromCart(medicine) {
  let itemIndex = cart.findIndex(item => item.medicine === medicine);
  if (itemIndex !== -1) {
    cart.splice(itemIndex, 1);

    // Unhide rows in the search list with same name as removed item
    hiddenRows.forEach(row => {
      const drugNameSpan = row.cells[0].querySelector("span:first-child");
      if (drugNameSpan.textContent === medicine) {
        row.style.display = "";
      }
    });
    hiddenRows = hiddenRows.filter(row => {
      const drugNameSpan = row.cells[0].querySelector("span:first-child");
      return drugNameSpan.textContent !== medicine;
    });
  }
  showCart();
}



// function populateDrugTable() {
//   const tableBody = document.querySelector("#drugList tbody");

//   drugs.forEach(drug => {

//     const row = document.createElement("tr"); //first row
//     const nameCell = document.createElement("td");
//     nameCell.textContent = drug.drugName;
//     row.appendChild(nameCell);

//     const brandCell = document.createElement("td");
//     brandCell.textContent = drug.drugBrand; // add brand text to cell
//     brandCell.style.verticalAlign = "center";
//     brandCell.style.fontSize = "12px";
//     brandCell.style.textAlign = "center";
//     brandCell.style.lineHeight = "1.5";
//     row.appendChild(brandCell);

//     const doseQuantityCell = document.createElement("td");

//     const doseQuantityInput = document.createElement("input");
//     doseQuantityInput.type = "number";
//     doseQuantityInput.min = "1";
//     doseQuantityInput.value = drug.drugDoseQuantity;
//     // doseQuantityInput.style.maxWidth = "40px"; // set max-width property
//     // doseQuantityInput.style.height = "22px"; // set height property
//     // doseQuantityInput.style.fontSize = "14px"; // set font-size property
//     // doseQuantityInput.style.textAlign = "center"; // set font-align to centre
//     doseQuantityInput.addEventListener("change", () => updateDoseQuantity(drug.drugName, doseQuantityInput.value));


//     // Add drugDoseQuantity input to cell
//     doseQuantityCell.appendChild(doseQuantityInput);

//     row.appendChild(doseQuantityCell);

//     const doseFrequencyCell = document.createElement("td");
//     const doseFrequencySelect = document.createElement("select");
//     frequencyOptions.forEach(option => {
//       const optionElement = document.createElement("option");
//       optionElement.value = option.value;
//       optionElement.text = option.label;
//       doseFrequencySelect.add(optionElement);
//     });
//     // doseFrequencySelect.style.maxWidth = "160px"; // set max-width property
//     // doseFrequencySelect.style.height = "28px"; // set height property
//     // doseFrequencySelect.style.verticalAlign = "top";

//     doseFrequencySelect.value = drug.drugDoseFrequencyFactor;
//     doseFrequencySelect.addEventListener("change", () => updateDoseFrequencyFactor(drug.drugName, doseFrequencySelect.value));
//     doseFrequencyCell.appendChild(doseFrequencySelect);
//     row.appendChild(doseFrequencyCell);

//     const actionCell = document.createElement("td");
//     const addButton = document.createElement("button");
//     addButton.textContent = "Add";
//     addButton.classList.add("add-button"); // button colour
//     addButton.addEventListener("click", () => addToCart(drug.drugName, drug.drugPrice, drug.drugBrand));
//     actionCell.appendChild(addButton);
//     row.appendChild(actionCell);

//     tableBody.appendChild(row);
//   });
// }


function populateDrugTable() {
  const tableBody = document.querySelector("#drugList tbody");

  drugs.forEach(drug => {
    const row = document.createElement("tr");
    
    const nameCell = document.createElement("td");
    const nameSpan = document.createElement("span");
    const brandSpan = document.createElement("span");

    nameSpan.textContent = drug.drugName;
    brandSpan.textContent = drug.drugBrand;
    brandSpan.style.fontSize = "12px";
    brandSpan.style.display = "block"; // make brandSpan a block element
    nameCell.appendChild(nameSpan);
    nameCell.appendChild(brandSpan);
    row.appendChild(nameCell);

    const doseQuantityCell = document.createElement("td");
    doseQuantityCell.style.width = "180px"; // set a fixed width for the cell


    const doseQuantityInput = document.createElement("input");
    doseQuantityInput.type = "number";
    doseQuantityInput.min = "1";
    doseQuantityInput.value = drug.drugDoseQuantity;
    doseQuantityInput.style.maxWidth = "40px";
    doseQuantityInput.addEventListener("change", () => updateDoseQuantity(drug.drugName, doseQuantityInput.value));

    const doseUnitSpan = document.createElement("span");
    doseUnitSpan.textContent = drug.drugDoseUnit;

    doseQuantityCell.style.fontSize = "14px";
    doseQuantityCell.style.textAlign = "left";
    doseQuantityCell.style.lineHeight = "1.5";

    doseQuantityCell.appendChild(document.createTextNode("Take "));
    doseQuantityCell.appendChild(doseQuantityInput);
    doseQuantityCell.appendChild(document.createTextNode("\u00a0")); // add a non-breaking space
    doseQuantityCell.appendChild(doseUnitSpan);
    row.appendChild(doseQuantityCell);

    const doseFrequencyCell = document.createElement("td");
    const doseFrequencySelect = document.createElement("select");
    frequencyOptions.forEach(option => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.text = option.label;
      doseFrequencySelect.add(optionElement);
    });

    doseFrequencySelect.value = drug.drugDoseFrequencyFactor;
    doseFrequencySelect.addEventListener("change", () => updateDoseFrequencyFactor(drug.drugName, doseFrequencySelect.value));
    doseFrequencyCell.appendChild(doseFrequencySelect);
    row.appendChild(doseFrequencyCell);

    const actionCell = document.createElement("td");
    const addButton = document.createElement("button");
    addButton.textContent = "Add";
    addButton.classList.add("add-button");
    addButton.addEventListener("click", () => addToCart(drug.drugName, drug.drugPrice, drug.drugBrand));
    actionCell.appendChild(addButton);
    row.appendChild(actionCell);

    tableBody.appendChild(row);
  });
}



function showCart() {
  let cartItems = document.getElementById("cartItems");
  if (cartItems === null) {
    console.error("cartItems element not found in HTML");
    return;
  }
  cartItems.innerHTML = "";
  cart.forEach(item => {
    let row = document.createElement("tr");
    let medicine = document.createElement("td");
    const drug = drugs.find(d => d.drugName === item.medicine);
    const dose = `Take ${drug.drugDoseQuantity} Tablet(s) `;
    const frequencyOption = frequencyOptions.find(option => option.value === drug.drugDoseFrequencyFactor);
    const frequencyLabel = frequencyOption ? frequencyOption.label : '';
    medicine.innerHTML = `${item.medicine}<br><span style="font-size: smaller">${dose}${frequencyLabel}</span>`;
    row.appendChild(medicine);

    let brand = document.createElement("td");
    brand.textContent = item.brand;
    row.appendChild(brand);
    let price = document.createElement("td");
    const totalQuantity = drug.drugDoseQuantity * parseInt(drug.drugDoseFrequencyFactor.charAt(0)) * drug.drugMinOrderQty;
    const totalPrice = drug.drugPrice * totalQuantity;
    price.textContent = "$" + totalPrice.toFixed(2);
    row.appendChild(price);
    let remove = document.createElement("td");
    let removeButton = document.createElement("button");
    removeButton.classList.add("remove");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => removeFromCart(item.medicine));
    remove.appendChild(removeButton);
    row.appendChild(remove);
    cartItems.appendChild(row);
  });
  let totalElement = document.getElementById("total");
  if (totalElement === null) {
    console.error("total element not found in HTML");
    return;
  }
  totalElement.innerHTML = "Total: <br>$" + getCartTotalPrice() + " <span style='font-size: 14px'>/ month</span>";

}


function updateQuantity(item, newQuantity) {
item.quantity = newQuantity;
showCart();
}

function updateDoseQuantity(drugName, newDoseQuantity) {
let drug = drugs.find(d => d.drugName === drugName);
drug.drugDoseQuantity = newDoseQuantity;
showCart();
}

function updateDoseFrequencyFactor(drugName, newDoseFrequencyFactor) {
let drug = drugs.find(d => d.drugName === drugName);
drug.drugDoseFrequencyFactor = newDoseFrequencyFactor;
showCart();
}


//more advanced serach function

function searchDrugs() {
  const searchBar = document.getElementById("searchBar");
  const searchText = searchBar.value.trim().toLowerCase();
  const tableRows = document.querySelectorAll("#drugList tbody tr");

  tableRows.forEach(row => {
    const drugNameSpan = row.cells[0].querySelector("span:first-child");
    const drugBrandSpan = row.cells[0].querySelector("span:last-child");
    const drugName = drugNameSpan.textContent.toLowerCase();
    const drugBrand = drugBrandSpan.textContent.toLowerCase();
    const isInCart = cart.some(item => item.medicine.toLowerCase() === drugName);

    const searchWords = searchText.split(' ');

    const isMatch = searchWords.every(word => drugName.includes(word) || drugBrand.includes(word));

    if (!isInCart) {
      if (searchText && !isMatch) {
        row.style.display = "none";
      } else {
        row.style.display = "";
      }
    } else {
      row.style.display = "none";
    }
  });
}


function clearSearch() {
  const tableRows = document.querySelectorAll("#drugList tbody tr");
  tableRows.forEach(row => {
    const drugNameSpan = row.cells[0].querySelector("span:first-child");
    const drugName = drugNameSpan.textContent;
    const isInCart = cart.some(item => item.medicine === drugName);
    const isHidden = hiddenRows.some(hiddenRow => hiddenRow === row);
    if (!isInCart && !isHidden) {
      row.style.display = "";
    } else {
      row.style.display = "none"; // Hide the row if the item is in the cart or in hiddenRows
    }
  });
  document.getElementById("searchBar").value = "";
}


// Initialize cart and show cart contents


document.addEventListener("DOMContentLoaded", function () {
populateDrugTable();
showCart();
});