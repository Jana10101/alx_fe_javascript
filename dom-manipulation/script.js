let quotes = [];
let selectedCategory = "all"; // <--- Required variable
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

// Load quotes from local storage or initialize empty
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "Stay positive.", author: "Unknown", category: "Motivation" },
      { text: "Learn something new every day.", author: "Anonymous", category: "Education" }
    ];
    saveQuotes();
  }
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate categories dynamically
function populateCategories() {
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");

  // restore last selected category
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory && categories.includes(savedCategory)) {
    categoryFilter.value = savedCategory;
    selectedCategory = savedCategory;
  }
}

// Display quotes
function displayQuotes() {
  quoteDisplay.innerHTML = "";
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  filteredQuotes.forEach(q => {
    const div = document.createElement("div");
    div.classList.add("quote-card");
    div.innerHTML = `<p>"${q.text}"</p><small>- ${q.author} (${q.category})</small>`;
    quoteDisplay.appendChild(div);
  });
}

// Filter quotes by category
function filterQuotes() {
  selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  displayQuotes();
}

// Add new quote
function addQuote() {
  const text = document.getElementById("quoteText").value.trim();
  const author = document.getElementById("quoteAuthor").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();

  if (!text || !author || !category) {
    alert("Please fill all fields!");
    return;
  }

  quotes.push({ text, author, category });
  saveQuotes();
  populateCategories();
  displayQuotes();

  document.getElementById("quoteText").value = "";
  document.getElementById("quoteAuthor").value = "";
  document.getElementById("quoteCategory").value = "";
}

// Export quotes to JSON file
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      displayQuotes();
      alert("Quotes imported successfully!");
    } catch (e) {
      alert("Invalid JSON file!");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Simulate syncing with server
async function syncWithServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverData = await response.json();

    // simulate conflict resolution: server takes precedence
    const serverQuotes = serverData.slice(0, 3).map(post => ({
      text: post.title,
      author: "Server",
      category: "Synced"
    }));

    quotes = [...serverQuotes, ...quotes];
    saveQuotes();
    populateCategories();
    displayQuotes();
    alert("Data synced with server. Conflicts resolved (server takes precedence).");
  } catch (error) {
    console.error("Error syncing:", error);
  }
}

// Initialize
window.onload = function() {
  loadQuotes();
  populateCategories();
  displayQuotes();
  setInterval(syncWithServer, 15000); // sync every 15 seconds
};
