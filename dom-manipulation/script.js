// Default quotes if none exist in localStorage
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein", category: "Inspiration" },
  { text: "Happiness depends upon ourselves.", author: "Aristotle", category: "Philosophy" }
];

// Display element
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

// Populate categories dynamically
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore saved category filter
  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) {
    categoryFilter.value = savedFilter;
    filterQuotes();
  } else {
    displayQuotes(quotes);
  }
}

// Display quotes on the page
function displayQuotes(filteredQuotes) {
  quoteDisplay.innerHTML = "";
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }
  filteredQuotes.forEach(q => {
    const div = document.createElement("div");
    div.innerHTML = `<p>"${q.text}" — <strong>${q.author}</strong> (${q.category})</p>`;
    quoteDisplay.appendChild(div);
  });
}

// Filter quotes by category
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);
  displayQuotes(filtered);
}

// Add new quote and update categories
function addQuote(event) {
  event.preventDefault();
  const text = document.getElementById("quoteText").value.trim();
  const author = document.getElementById("quoteAuthor").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();

  if (!text || !author || !category) return alert("All fields are required!");

  quotes.push({ text, author, category });
  localStorage.setItem("quotes", JSON.stringify(quotes));

  // Update categories and re-display
  populateCategories();
  filterQuotes();

  document.getElementById("addQuoteForm").reset();
}

// Initialize
populateCategories();
