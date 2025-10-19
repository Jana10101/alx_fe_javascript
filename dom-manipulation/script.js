let quotes = [];
let currentFilter = 'all';

// Load quotes from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
      { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" },
    ];
    saveQuotes();
  }

  currentFilter = localStorage.getItem('lastFilter') || 'all';
  populateCategories();
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Show random quote based on filter
function showRandomQuote() {
  let filteredQuotes = quotes;
  if (currentFilter !== 'all') {
    filteredQuotes = quotes.filter(q => q.category === currentFilter);
  }

  if (filteredQuotes.length === 0) {
    document.getElementById('quoteText').textContent = "No quotes in this category yet!";
    document.getElementById('quoteCategory').textContent = "";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];

  document.getElementById('quoteText').textContent = randomQuote.text;
  document.getElementById('quoteCategory').textContent = `— ${randomQuote.category}`;

  sessionStorage.setItem('lastQuote', randomQuote.text);
}

// Add a new quote
document.getElementById('addQuoteForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const text = document.getElementById('newQuote').value.trim();
  const category = document.getElementById('newCategory').value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    document.getElementById('newQuote').value = '';
    document.getElementById('newCategory').value = '';
    alert('Quote added successfully!');
  }
});

// Populate category dropdown
function populateCategories() {
  const categorySelect = document.getElementById('categoryFilter');
  categorySelect.innerHTML = `<option value="all">All Categories</option>`;

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    if (cat === currentFilter) option.selected = true;
    categorySelect.appendChild(option);
  });
}

// Filter quotes when category changes
function filterQuotes() {
  const selected = document.getElementById('categoryFilter').value;
  currentFilter = selected;
  localStorage.setItem('lastFilter', selected);
  showRandomQuote();
}

// Export quotes
document.getElementById('exportBtn').addEventListener('click', function() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'quotes.json';
  link.click();
  URL.revokeObjectURL(url);
});

// Import quotes
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert('Quotes imported successfully!');
    } catch (err) {
      alert('Invalid JSON file!');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// On page load
document.getElementById('newQuoteBtn').addEventListener('click', showRandomQuote);
window.onload = function() {
  loadQuotes();
  const lastQuote = sessionStorage.getItem('lastQuote');
  if (lastQuote) {
    document.getElementById('quoteText').textContent = lastQuote;
  } else {
    showRandomQuote();
  }
};
