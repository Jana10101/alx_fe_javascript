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

// 🧠 Initialize the app
function init() {
  populateCategories();
  showRandomQuote();
}

// 📚 Populate category dropdown dynamically
function populateCategories() {
  // Get unique categories from quotes
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = "";

  // Add an "All" option
  const allOption = document.createElement("option");
  allOption.value = "All";
  allOption.textContent = "All Categories";
  categorySelect.appendChild(allOption);

  // Add each category
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
}

// ➕ Add a new quote dynamically
function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!newText || !newCategory) {
    alert("Please fill in both fields before adding a quote!");
    return;
  }

  // Add to the quotes array
  quotes.push({ text: newText, category: newCategory });

  // Update dropdown and show the new quote
  populateCategories();
  quoteDisplay.textContent = `"${newText}" — ${newCategory}`;

  // Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
categorySelect.addEventListener("change", showRandomQuote);

// Run app
init();
