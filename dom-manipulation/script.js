// 🌟 Dynamic Quote Generator with Local & Session Storage + JSON Import/Export

// Initial array of quotes
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Perseverance" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const categorySelect = document.getElementById("categorySelect");
const newQuoteBtn = document.getElementById("newQuote");

// 🗃️ Save quotes to Local Storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// 📦 Load quotes from Local Storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// 🧠 Initialize the app
function init() {
  loadQuotes(); // Load saved quotes first
  populateCategories();
  createAddQuoteForm();
  createImportExportButtons(); // Add import/export buttons
  showRandomQuote();

  // 🔁 Restore last viewed quote from sessionStorage
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const parsed = JSON.parse(lastQuote);
    quoteDisplay.textContent = `"${parsed.text}" — ${parsed.category}`;
  }
}

// 📚 Populate category dropdown dynamically
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "All";
  allOption.textContent = "All Categories";
  categorySelect.appendChild(allOption);

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// 💬 Show a random quote (filtered by category)
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  let filteredQuotes =
    selectedCategory && selectedCategory !== "All"
      ? quotes.filter(q => q.category === selectedCategory)
      : quotes;

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category yet.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${randomQuote.text}" — ${randomQuote.category}`;

  // 🧠 Save last viewed quote to sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

// ➕ Dynamically create the Add Quote form in the DOM
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.id = "addQuoteForm";
  formContainer.style.marginTop = "30px";

  const title = document.createElement("h3");
  title.textContent = "Add a New Quote";

  const inputText = document.createElement("input");
  inputText.type = "text";
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";
  inputText.style.margin = "5px";

  const inputCategory = document.createElement("input");
  inputCategory.type = "text";
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter quote category";
  inputCategory.style.margin = "5px";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.style.margin = "5px";
  addButton.onclick = addQuote;

  formContainer.appendChild(title);
  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// ➕ Add a new quote dynamically
function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!newText || !newCategory) {
    alert("Please fill in both fields before adding a quote!");
    return;
  }

  quotes.push({ text: newText, category: newCategory });
  saveQuotes(); // ✅ Save after adding

  populateCategories();
  quoteDisplay.textContent = `"${newText}" — ${newCategory}`;

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// 📁 Create Import & Export buttons dynamically
function createImportExportButtons() {
  const container = document.createElement("div");
  container.style.marginTop = "20px";

  // Export button
  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export Quotes (JSON)";
  exportBtn.onclick = exportToJsonFile;

  // Import input
  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.id = "importFile";
  importInput.accept = ".json";
  importInput.style.marginLeft = "10px";
  importInput.onchange = importFromJsonFile;

  container.appendChild(exportBtn);
  container.appendChild(importInput);

  document.body.appendChild(container);
}

// 💾 Export quotes to JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();

  URL.revokeObjectURL(url);
}

// 📥 Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");

      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Failed to import JSON file. Please check the format.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// 🎯 Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
categorySelect.addEventListener("change", showRandomQuote);

// 🚀 Run the app
init();
