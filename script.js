const sendBtn = document.getElementById("sendRequest");
const themeToggle = document.getElementById("themeToggle");
const responseBox = document.getElementById("responseBox");
const historyList = document.getElementById("historyList");

function updateTheme() {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "🌙" : "☀️";
}

themeToggle.addEventListener("click", updateTheme);

function addToHistory(method, url, time) {
  const history = JSON.parse(localStorage.getItem("reqScopeHistory")) || [];
  history.unshift({ method, url, time, date: new Date().toLocaleString() });
  localStorage.setItem("reqScopeHistory", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("reqScopeHistory")) || [];
  historyList.innerHTML = "";
  history.slice(0, 10).forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = `[${entry.method}] ${entry.url} — ${entry.time}ms at ${entry.date}`;
    historyList.appendChild(li);
  });
}

sendBtn.addEventListener("click", async () => {
  const url = document.getElementById("apiUrl").value;
  const method = document.getElementById("httpMethod").value;
  const headersRaw = document.getElementById("requestHeaders").value;
  const bodyRaw = document.getElementById("requestBody").value;

  try {
    const headers = headersRaw ? JSON.parse(headersRaw) : {};
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers
      }
    };

    if (method !== "GET" && bodyRaw) {
      options.body = bodyRaw;
    }

    const start = performance.now();
    const response = await fetch(url, options);
    const end = performance.now();
    const time = (end - start).toFixed(2);

    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
      responseBox.textContent = `⏱ ${time} ms\n📦 Status: ${response.status}\n\n${JSON.stringify(data, null, 2)}`;
    } else {
      const text = await response.text();
      responseBox.textContent = `⏱ ${time} ms\n📦 Status: ${response.status}\n\n${text}`;
    }

    addToHistory(method, url, time);
  } catch (err) {
    responseBox.textContent = `❌ Error:\n${err}`;
  }
});

// On Load
renderHistory();
