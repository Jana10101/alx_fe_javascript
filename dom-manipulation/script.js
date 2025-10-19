// ================================
// DOM Manipulation & Initialization
// ================================
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein", category: "Inspiration" },
  { text: "Happiness depends upon ourselves.", author: "Aristotle", category: "Philosophy" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const syncStatus = document.getElementById("syncStatus");

// ================================
// DOM Manipulation Functions
// ================================
function displayQuotes(filteredQuotes) {
  quoteDisplay.innerHTML = "";
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }
  filteredQuotes.forEach(q => {
    const div = document.createElement("div");
    div.classList.add("quote-card");
    div.innerHTML = `
      <p>"${q.text}"</p>
      <p><strong>${q.author}</strong> — <em>${q.category}</em></p>
    `;
    quoteDisplay.appendChild(div);
  });
}

// Show random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  displayQuotes([randomQuote]);
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(randomQuote));
}

// Populate category dropdown
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) {
    categoryFilter.value = savedFilter;
    filterQuotes();
  } else {
    displayQuotes(quotes);
  }
}

// Filter by category
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);
  displayQuotes(filtered);
}

// ================================
// Add Quote + Web Storage
// ================================
function addQuote(event) {
  event.preventDefault();
  const text = document.getElementById("newQuoteText").value.trim();
  const author = document.getElementById("newQuoteAuthor").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !author || !category) {
    alert("All fields are required!");
    return;
  }

  quotes.push({ text, author, category });
  saveQuotes();
  populateCategories();
  filterQuotes();
  document.getElementById("addQuoteForm").reset();
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ================================
// JSON Import / Export
// ================================
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file!");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ================================
// Simulated Server Sync
// ================================
async function syncWithServer() {
  try {
    syncStatus.textContent = "Syncing with server...";
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverQuotes = await res.json();

    // Simulate conflict resolution
    const merged = [...quotes];
    serverQuotes.slice(0, 3).forEach(post => {
      const existing = merged.find(q => q.text === post.title);
      if (!existing) {
        merged.push({
          text: post.title,
          author: "Server User",
          category: "Server"
        });
      }
    });

    quotes = merged;
    saveQuotes();
    populateCategories();
    filterQuotes();
    syncStatus.textContent = "Sync complete ✅";
  } catch (err) {
    syncStatus.textContent = "Sync failed ❌";
    console.error(err);
  }
}

// Periodic sync every 30 seconds
setInterval(syncWithServer, 30000);

// ================================
// Initialize
// ================================
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
populateCategories();

// Load last viewed quote from session storage
const lastViewed = sessionStorage.getItem("lastViewedQuote");
if (lastViewed) displayQuotes([JSON.parse(lastViewed)]);
