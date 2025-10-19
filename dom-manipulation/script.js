// ====== Dynamic Quote Generator with Server Sync & Blob Export ======

// Local data
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Perseverance" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteBtn = document.getElementById("newQuote");
const syncStatus = document.getElementById("syncStatus");

// 🧠 Initialize App
function init() {
  populateCategories();
  createAddQuoteForm();
  restoreLastFilter();
  showRandomQuote();
  createExportButton(); // Add export feature
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
}

// 💬 Show random quote based on filter
function showRandomQuote() {
  const selected = categoryFilter.value;
  let filtered = selected === "all" ? quotes : quotes.filter(q => q.category === selected);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category yet.";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${random.text}" — ${random.category}`;
}

// ➕ Add Quote Form
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.id = "addQuoteForm";
  formContainer.style.marginTop = "30px";

  const title = document.createElement("h3");
  title.textContent = "Add a New Quote";

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter quote text";
  textInput.style.margin = "5px";

  const catInput = document.createElement("input");
  catInput.type = "text";
  catInput.id = "newQuoteCategory";
  catInput.placeholder = "Enter quote category";
  catInput.style.margin = "5px";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.onclick = addQuote;

  formContainer.append(title, textInput, catInput, addBtn);
  document.body.appendChild(formContainer);
}

// ➕ Add new quote
function addQuote() {
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

  // Simulate posting to server
  syncWithServer("POST", newQuote);
}

// 🧩 Filter quotes and save filter preference
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("lastCategory", selected);
  showRandomQuote();
}

// 🔁 Restore last selected category
function restoreLastFilter() {
  const lastCategory = localStorage.getItem("lastCategory");
  if (lastCategory) categoryFilter.value = lastCategory;
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

// ⚔️ Conflict Resolution (Server Wins)
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
  }, 15000); // every 15 seconds
}

// 🪧 Show sync or conflict messages
function showSyncStatus(message) {
  if (!syncStatus) return;
  syncStatus.textContent = message;
  syncStatus.style.display = "block";
  setTimeout(() => (syncStatus.textContent = ""), 4000);
}

// 📤 Export quotes to JSON using Blob
function createExportButton() {
  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export Quotes (JSON)";
  exportBtn.style.margin = "10px";
  exportBtn.onclick = exportQuotesAsJSON;
  document.body.appendChild(exportBtn);
}

function exportQuotesAsJSON() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes_backup.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showSyncStatus("💾 Quotes exported as JSON file!");
}

// 🎬 Event Listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
categoryFilter.addEventListener("change", filterQuotes);

// 🏁 Run app
init();
