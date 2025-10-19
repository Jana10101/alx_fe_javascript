// === Dynamic Quote Generator with Storage, Filtering & Server Sync ===

let quotes = JSON.parse(localStorage.getItem("quotes")) || [];
let selectedCategory = localStorage.getItem("selectedCategory") || "all";

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

// === Save Quotes to Local Storage ===
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// === Display Quotes ===
function displayQuotes() {
  quoteDisplay.innerHTML = "";
  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter((q) => q.category === selectedCategory);

  filteredQuotes.forEach((quote) => {
    const quoteEl = document.createElement("div");
    quoteEl.className = "quote-item";
    quoteEl.innerHTML = `
      <p>"${quote.text}"</p>
      <small>— ${quote.author || "Unknown"} [${quote.category || "General"}]</small>
    `;
    quoteDisplay.appendChild(quoteEl);
  });
}

// === Create Add Quote Form Dynamically ===
function createAddQuoteForm() {
  const container = document.createElement("div");
  container.id = "addQuoteForm";

  container.innerHTML = `
    <input id="quoteText" placeholder="Enter quote" />
    <input id="quoteAuthor" placeholder="Author" />
    <input id="quoteCategory" placeholder="Category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;

  document.body.insertBefore(container, quoteDisplay);

  document.getElementById("addQuoteBtn").addEventListener("click", () => {
    const text = document.getElementById("quoteText").value.trim();
    const author = document.getElementById("quoteAuthor").value.trim();
    const category =
      document.getElementById("quoteCategory").value.trim() || "General";

    if (!text) {
      alert("Please enter a quote!");
      return;
    }

    quotes.push({ text, author, category });
    saveQuotes();
    populateCategories();
    displayQuotes();
    syncQuotesToServer();

    document.getElementById("quoteText").value = "";
    document.getElementById("quoteAuthor").value = "";
    document.getElementById("quoteCategory").value = "";
  });
}

// === Populate Category Dropdown ===
function populateCategories() {
  const categories = ["all", ...new Set(quotes.map((q) => q.category))];
  categoryFilter.innerHTML = categories
    .map((cat) => `<option value="${cat}">${cat}</option>`)
    .join("");
  categoryFilter.value = selectedCategory;
}

// === Filter Quotes ===
function filterQuotes() {
  selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  displayQuotes();
}

// === Export Quotes as JSON File ===
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// === Import Quotes from JSON File ===
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      displayQuotes();
      alert("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// === Simulated Server Sync ===
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/posts?_limit=5"
    );
    const data = await response.json();
    return data.map((post) => ({
      text: post.title,
      author: "Server",
      category: "Fetched",
    }));
  } catch (error) {
    console.error("Error fetching from server:", error);
    return [];
  }
}

async function syncQuotesToServer() {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify(quotes),
      headers: { "Content-Type": "application/json" },
    });
    console.log("Quotes synced to server.");
  } catch (error) {
    console.error("Error syncing quotes:", error);
  }
}

async function periodicSync() {
  const serverQuotes = await fetchQuotesFromServer();
  let conflicts = [];

  serverQuotes.forEach((serverQuote) => {
    const existing = quotes.find((q) => q.text === serverQuote.text);
    if (!existing) {
      quotes.push(serverQuote);
    } else if (JSON.stringify(existing) !== JSON.stringify(serverQuote)) {
      conflicts.push(serverQuote);
      const index = quotes.findIndex((q) => q.text === existing.text);
      quotes[index] = serverQuote; // server wins
    }
  });

  if (conflicts.length > 0) {
    alert("Some quotes were updated from the server due to conflicts.");
  }

  saveQuotes();
  populateCategories();
  displayQuotes();
}

// Sync every 60 seconds
setInterval(periodicSync, 60000);

// === Initialization ===
window.onload = () => {
  createAddQuoteForm();
  populateCategories();
  displayQuotes();
  periodicSync();
};
