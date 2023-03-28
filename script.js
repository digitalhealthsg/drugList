
let cart = [];
let drugs = [];
let hiddenRows = [];

// Parse CSV file and convert to array of objects
Papa.parse("https://raw.githubusercontent.com/digitalhealthsg/drugList/cc66c33417acb7cbe08dda58dbbe1d76ab647a76/drugs.csv", {
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
    const drug = drugs.find(d => d.drugName === item.medicine && d.drugBrand === item.brand);
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
        brand: brand,
        quantity: 1,
        price: price
      };
      cart.push(item);
    }
    // Hide the row in the search list
    const tableContainers = document.querySelectorAll("#drugList tbody .drug-table-container");
    tableContainers.forEach(container => {
      const drugNameSpan = container.querySelector("td span");
      if (drugNameSpan && drugNameSpan.textContent === medicine) {
        container.style.display = "none";
        hiddenRows.push(container);
      }
    });
    showCart();
  }
}




function removeFromCart(medicine) {
  let itemIndex = cart.findIndex(item => item.medicine === medicine);
  if (itemIndex !== -1) {
    cart.splice(itemIndex, 1);

    // Unhide rows in the search list with the same name as the removed item
    hiddenRows.forEach(container => {
      const drugNameSpan = container.querySelector("td span");
      if (drugNameSpan.textContent === medicine) {
        container.style.display = "";
      }
    });
    hiddenRows = hiddenRows.filter(container => {
      const drugNameSpan = container.querySelector("td span");
      return drugNameSpan.textContent !== medicine;
    });
  }
  showCart();
}


function populateDrugTable() {
  const tableBody = document.querySelector("#drugList tbody");

  drugs.forEach(drug => {
    const container = document.createElement("div"); // create a container for each drug table
    container.classList.add("drug-table-container");
    
    const table = document.createElement("table"); // create a separate table for each drug

    // create the first row of the drug table
    const nameRow = document.createElement("tr");
    nameRow.classList.add("drug-row");
    
    const nameCell = document.createElement("td");
    nameCell.colSpan = 3; // set the name cell to span 2 columns
    nameCell.style.backgroundColor = "#f5f5f5";

    
    const nameSpan = document.createElement("span");
    nameSpan.textContent = drug.drugName;
    nameSpan.style.fontWeight = "bold";

    const brandSpan = document.createElement("span");
    brandSpan.textContent = drug.drugBrand;
    brandSpan.style.fontSize = "12px";
    brandSpan.style.display = "block"; // make brandSpan a block element

    // create drug name + brand cell
    nameCell.appendChild(nameSpan);
    nameCell.appendChild(brandSpan);
    nameRow.appendChild(nameCell);
    table.appendChild(nameRow);

    // create the second row of the drug table
    const row = document.createElement("tr");
    row.classList.add("drug-row");

    // Creating the Dosage Table Cell (1 Column) + Styling
    const doseQuantityCell = document.createElement("td");
    doseQuantityCell.classList.add("dose-quantity-cell");


    // Dose Quantity Input Field (Picker)
    const doseQuantityInput = document.createElement("input");
    doseQuantityInput.classList.add("dose-pickers");
    doseQuantityInput.style.maxWidth = "25px";
    doseQuantityInput.type = "number";
    doseQuantityInput.min = "1";
    doseQuantityInput.max = "9";
    doseQuantityInput.value = drug.drugDoseQuantity;
    doseQuantityInput.addEventListener("change", () => updateDoseQuantity(drug.drugName, doseQuantityInput.value));
    
    // Dose Units (e.g. Tablets/Capsules)
    const doseUnitSpan = document.createElement("span");
    doseUnitSpan.textContent = drug.drugDoseUnit;
    
    // Dose Frequency Drop-down Picker (e.g. Daily / Every Morning)
    const doseFrequencySelect = document.createElement("select");
    doseFrequencySelect.classList.add("dose-pickers");
    doseFrequencySelect.style.maxWidth = "115px";
    doseFrequencySelect.style.height = "22px";

    frequencyOptions.forEach(option => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.text = option.label;
      doseFrequencySelect.add(optionElement);
    });
    doseFrequencySelect.value = drug.drugDoseFrequencyFactor;
    doseFrequencySelect.addEventListener("change", () => updateDoseFrequencyFactor(drug.drugName, doseFrequencySelect.value));
    

    // Creating the Cell Structure 
    doseQuantityCell.appendChild(document.createTextNode("Take "));
    doseQuantityCell.appendChild(doseQuantityInput);
    doseQuantityCell.appendChild(document.createTextNode("\u00a0")); // add a non-breaking space
    doseQuantityCell.appendChild(doseUnitSpan);
    doseQuantityCell.appendChild(document.createTextNode("\u00a0")); // add a non-breaking space
    doseQuantityCell.appendChild(doseFrequencySelect);

    // Appending to a new Row in Table
    row.appendChild(doseQuantityCell);


    const actionCell = document.createElement("td");
    actionCell.classList.add("action-cell");


    const addButton = document.createElement("button");
    addButton.textContent = "Add";
    addButton.classList.add("add-button");


    addButton.addEventListener("click", () => addToCart(drug.drugName, drug.drugPrice, drug.drugBrand));
    actionCell.appendChild(addButton);
    row.appendChild(actionCell);

    table.appendChild(row);

    container.appendChild(table);
    tableBody.appendChild(container);
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

    // let price = document.createElement("td");
    // const totalQuantity = drug.drugDoseQuantity * parseInt(drug.drugDoseFrequencyFactor.charAt(0)) * drug.drugMinOrderQty;
    // const totalPrice = drug.drugPrice * totalQuantity;
    // price.textContent = "$" + totalPrice.toFixed(2);
    // row.appendChild(price);

    let remove = document.createElement("td");
    remove.style.textAlign = "right"; // set a fixed width for the cell
    remove.style.width = "10px"; // set a fixed width for the cell

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
  const tableContainers = document.querySelectorAll("#drugList tbody .drug-table-container");

  tableContainers.forEach(container => {
    const drugNameSpan = container.querySelector("td span:first-child");
    const drugBrandSpan = container.querySelector("td span:last-child");
    const drugName = drugNameSpan.textContent.toLowerCase();
    const drugBrand = drugBrandSpan.textContent.toLowerCase();
    const isInCart = cart.some(item => item.medicine.toLowerCase() === drugName);

    const searchWords = searchText.split(' ');

    const isMatch = searchWords.every(word => drugName.includes(word) || drugBrand.includes(word));

    if (!isInCart) {
      if (searchText && !isMatch) {
        container.style.display = "none";
      } else {
        container.style.display = "";
      }
    } else {
      container.style.display = "none";
    }
  });
}


function clearSearch() {
  const tableContainers = document.querySelectorAll("#drugList tbody .drug-table-container");
  tableContainers.forEach(container => {
    const drugNameSpan = container.querySelector("td span:first-child");
    const drugName = drugNameSpan.textContent;
    const isInCart = cart.some(item => item.medicine === drugName);
    const isHidden = hiddenRows.some(hiddenRow => hiddenRow === container);

    if (!isInCart && !isHidden) {
      container.style.display = "";
    } else {
      container.style.display = "none"; // Hide the container if the item is in the cart or in hiddenRows
    }
  });
  document.getElementById("searchBar").value = "";
}

// Initialize cart and show cart contents


document.addEventListener("DOMContentLoaded", function () {
populateDrugTable();
showCart();
});