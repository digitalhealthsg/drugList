
let cart = [];
let drugs = [];
let hiddenRows = [];

// Parse CSV file and convert to array of objects
Papa.parse("https://099a9f3d-7218-4373-b1f1-bae69f5b1a92.usrfiles.com/ugd/099a9f_951399d95857433a9f03a2eb1b0f97eb.csv", {
  header: true,
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
        brand: brand,
        quantity: 1,
        price: price
      };
      cart.push(item);
    }
    // Hide the row in the search list
    const tableRows = document.querySelectorAll("#drugList tbody tr");
    tableRows.forEach(row => {
      if (row.cells[0].textContent === medicine) {
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
      if (row.cells[0].textContent === medicine) {
        row.style.display = "";
      }
    });
    hiddenRows = hiddenRows.filter(row => row.cells[0].textContent !== medicine);
  }
  showCart();
}




function populateDrugTable() {
  const tableBody = document.querySelector("#drugList tbody");

  drugs.forEach(drug => {

    const row = document.createElement("tr"); //first row
    const nameCell = document.createElement("td");
    nameCell.textContent = drug.drugName;
    row.appendChild(nameCell);

    const brandCell = document.createElement("td");

    const brandText = document.createTextNode(drug.drugBrand);


    brandCell.appendChild(brandText);
    brandCell.style.verticalAlign = "center";
    brandCell.style.fontSize = "12px"; // set font-size 
    brandCell.style.textAlign = "center"; // set font-align to centre
    brandCell.style.lineHeight = "1.5";

    row.appendChild(brandCell);

    const doseQuantityCell = document.createElement("td");

    const doseQuantityInput = document.createElement("input");
    doseQuantityInput.type = "number";
    doseQuantityInput.min = "1";
    doseQuantityInput.value = drug.drugDoseQuantity;
    doseQuantityInput.style.maxWidth = "40px"; // set max-width property
    doseQuantityInput.style.height = "22px"; // set height property
    doseQuantityInput.style.fontSize = "14px"; // set font-size property
    doseQuantityInput.style.textAlign = "center"; // set font-align to centre
    doseQuantityInput.addEventListener("change", () => updateDoseQuantity(drug.drugName, doseQuantityInput.value));


    // Add drugDoseQuantity input to cell
    doseQuantityCell.appendChild(doseQuantityInput);

    row.appendChild(doseQuantityCell);

    const doseFrequencyCell = document.createElement("td");
    const doseFrequencySelect = document.createElement("select");
    frequencyOptions.forEach(option => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.text = option.label;
      doseFrequencySelect.add(optionElement);
    });
    doseFrequencySelect.style.maxWidth = "160px"; // set max-width property
    doseFrequencySelect.style.height = "28px"; // set height property
    doseFrequencySelect.style.verticalAlign = "top";

    doseFrequencySelect.value = drug.drugDoseFrequencyFactor;
    doseFrequencySelect.addEventListener("change", () => updateDoseFrequencyFactor(drug.drugName, doseFrequencySelect.value));
    doseFrequencyCell.appendChild(doseFrequencySelect);
    row.appendChild(doseFrequencyCell);

    const actionCell = document.createElement("td");
    const addButton = document.createElement("button");
    addButton.textContent = "Add";
    addButton.classList.add("add-button"); // button colour
    addButton.addEventListener("click", () => addToCart(drug.drugName, drug.drugPrice));
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
    brand.textContent = drug.drugBrand;
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


// function searchDrugs() {
//   var input, filter, table, tr, tdName, tdBrand, i, txtValueName, txtValueBrand;
//   input = document.getElementById("searchBar");
//   filter = input.value.toUpperCase();
//   table = document.getElementById("drugList");
//   tr = table.getElementsByTagName("tr");

//   for (i = 0; i < tr.length; i++) {
//     if (i === 0) {
//       continue;
//     }
//     tdName = tr[i].getElementsByTagName("td")[0];
//     tdBrand = tr[i].getElementsByTagName("td")[1];
//     if (tdName && tdBrand) {
//       txtValueName = tdName.textContent || tdName.innerText;
//       txtValueBrand = tdBrand.textContent || tdBrand.innerText;
//       const isInCart = cart.some(item => item.medicine === txtValueName);
//       if ((txtValueName.toUpperCase().indexOf(filter) > -1 || txtValueBrand.toUpperCase().indexOf(filter) > -1) && !isInCart) {
//         tr[i].style.display = "";
//       } else {
//         tr[i].style.display = "none";
//       }
//     }
//   }
// }

//more advanced serach function

function searchDrugs() {
  var input, filter, table, tr, tdName, tdBrand, i, txtValueName, txtValueBrand, words;
  input = document.getElementById("searchBar");
  filter = input.value.toUpperCase();
  table = document.getElementById("drugList");
  tr = table.getElementsByTagName("tr");
  words = filter.split(" ").filter(w => w.length > 0);

  for (i = 0; i < tr.length; i++) {
    if (i === 0) {
      continue;
    }
    tdName = tr[i].getElementsByTagName("td")[0];
    tdBrand = tr[i].getElementsByTagName("td")[1];
    if (tdName && tdBrand) {
      txtValueName = tdName.textContent || tdName.innerText;
      txtValueBrand = tdBrand.textContent || tdBrand.innerText;
      const isInCart = cart.some(item => item.medicine === txtValueName);
      if (words.every(word => (txtValueName.toUpperCase().indexOf(word) > -1 || txtValueBrand.toUpperCase().indexOf(word) > -1)) && !isInCart) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}


function clearSearch() {
  const tableRows = document.querySelectorAll("#drugList tbody tr");
  tableRows.forEach(row => {
    const drugName = row.cells[0].textContent;
    const isInCart = cart.some(item => item.medicine === drugName);
    if (!isInCart) {
      row.style.display = "";
    }
  });
  document.getElementById("searchBar").value = "";
}


// Initialize cart and show cart contents

document.addEventListener("DOMContentLoaded", function () {
populateDrugTable();
showCart();
});