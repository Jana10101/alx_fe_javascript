// ====== Dynamic Quote Generator with Sync, Blob Export & Conflict Resolution ======

// Load from localStorage or default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Perseverance" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
];

let selectedCategory = localStorage.getItem("lastCategory") || "all";

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteBtn = document.getElementById("newQuote");
const syncStatus = document.getElementById("syncStatus");
const exportBtn = document.getElementById("exportQuotesBtn");
const importInput = document.getElementById("importFile");

// 🧠 Initialize App
function init() {
  populateCategories();
  restoreLastFilter();
  showRandomQuote();
  startAutoSync();
}

// 📚 Populate categories dropdown
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Categories";
  categoryFilter.appendChild(allOption);

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  categoryFilter.value = selectedCategory;
}

// 💬 Show random quote
function showRandomQuote() {
  let filtered =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category yet.";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${random.text}" — ${random.category}`;
}

// ➕ Add new quote
function addQuote(event) {
  event.preventDefault();
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both fields!");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
  showRandomQuote();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  // Simulate sending to server
  syncWithServer("POST", newQuote);
}

// 🧩 Filter quotes and save filter preference
function filterQuotes() {
  selectedCategory = categoryFilter.value;
  localStorage.setItem("lastCategory", selectedCategory);
  showRandomQuote();
}

// 🔁 Restore last selected category
function restoreLastFilter() {
  const lastCategory = localStorage.getItem("lastCategory");
  if (lastCategory) {
    selectedCategory = lastCategory;
    categoryFilter.value = selectedCategory;
  }
}

// 🌐 Simulate Server Interaction
async function syncWithServer(method = "GET", newQuote = null) {
  const apiUrl = "https://jsonplaceholder.typicode.com/posts";

  try {
    if (method === "POST" && newQuote) {
      await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify(newQuote),
        headers: { "Content-Type": "application/json" },
      });
      showSyncStatus("✅ Quote synced to server.");
    } else if (method === "GET") {
      const response = await fetch(apiUrl);
      const serverData = await response.json();

      // Simulate new data from server
      const serverQuotes = serverData.slice(0, 3).map((p, i) => ({
        text: p.title,
        category: ["Motivation", "Life", "Wisdom"][i % 3],
      }));

      handleConflictResolution(serverQuotes);
    }
  } catch (error) {
    showSyncStatus("⚠️ Sync failed: " + error.message);
  }
}

// ⚔️ Conflict Resolution
function handleConflictResolution(serverQuotes) {
  const localData = JSON.parse(localStorage.getItem("quotes")) || [];
  const conflicts = serverQuotes.filter(sq =>
    localData.some(lq => lq.text === sq.text && lq.category !== sq.category)
  );

  if (conflicts.length > 0) {
    showSyncStatus("⚠️ Conflicts detected — server version kept.");
  }

  const mergedQuotes = [
    ...serverQuotes,
    ...localData.filter(lq => !serverQuotes.some(sq => sq.text === lq.text)),
  ];

  quotes = mergedQuotes;
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
}

// 🔄 Periodic Auto Sync
function startAutoSync() {
  setInterval(() => {
    syncWithServer("GET");
  }, 15000);
}

// 🪧 Status Message
function showSyncStatus(message) {
  syncStatus.textContent = message;
  syncStatus.style.display = "block";
  setTimeout(() => (syncStatus.textContent = ""), 4000);
}

// 📤 Export as JSON
exportBtn.addEventListener("click", () => {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes_backup.json";
  a.click();
  URL.revokeObjectURL(url);
  showSyncStatus("💾 Quotes exported!");
});

// 📂 Import from JSON
importInput.addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();

  reader.onload = e => {
    try {
      const importedData = JSON.parse(e.target.result);
      if (Array.isArray(importedData)) {
        quotes = [...quotes, ...importedData];
        localStorage.setItem("quotes", JSON.stringify(quotes));
        populateCategories();
        showSyncStatus("📥 Quotes imported successfully!");
      } else {
        showSyncStatus("❌ Invalid JSON format!");
      }
    } catch (err) {
      showSyncStatus("❌ Error reading file: " + err.message);
    }
  };

  reader.readAsText(file);
});

// 🎬 Event Listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
categoryFilter.addEventListener("change", filterQuotes);

// 🏁 Run App
init();
