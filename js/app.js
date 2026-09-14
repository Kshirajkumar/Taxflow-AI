/* Taxflow AI — Core App Controller, Router & Services */

// Navigation Router
function goToPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".navitem").forEach(n => n.classList.remove("active"));
  
  const target = document.getElementById("page-" + pageId);
  const nav = document.querySelector(`.navitem[data-page="${pageId}"]`);
  
  if (target) target.classList.add("active");
  if (nav) nav.classList.add("active");
  
  // Save active page tab
  try { localStorage.setItem("taxflow-last-page", pageId); } catch(e){}
}

// Toast Notification Manager
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  document.getElementById("toast-text").textContent = msg;
  toast.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.classList.remove("show"); }, 2600);
}

// Helper Badge Converter
function badgeFor(st) {
  if (st === "ok" || st === "Ready to file" || st === "Delivered" || st === "Read" || st === "Matched") return "ok";
  if (st === "warn" || st === "Recon pending" || st === "3 bills pending" || st === "Bank st. missing" || st === "Pending" || st === "Onboarding" || st === "Partial") return "warn";
  if (st === "bad" || st === "Docs overdue" || st === "Overdue 2d" || st === "Unmatched") return "bad";
  return "neutral";
}

// Application Initialization
document.addEventListener("DOMContentLoaded", () => {
  // Sidebar Navigation Click Event Listener
  document.querySelectorAll(".navitem").forEach(item => {
    item.addEventListener("click", () => {
      const page = item.dataset.page;
      if (page) goToPage(page);
    });
  });

  // Action links with data-goto
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-goto]");
    if (btn) {
      goToPage(btn.dataset.goto);
    }
  });

  // Global search input handling
  const searchBox = document.getElementById("global-search");
  if (searchBox) {
    searchBox.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && searchBox.value.trim()) {
        const query = searchBox.value.trim().toLowerCase();
        showToast(`Searching for "${query}" across practice records...`);
        goToPage("clients");
        const clientSearchInput = document.getElementById("client-search");
        if (clientSearchInput) {
          clientSearchInput.value = query;
          clientSearchInput.dispatchEvent(new Event("input"));
        }
      }
    });
  }

  // Restore Theme on load
  try {
    const savedTheme = localStorage.getItem("taxflow-theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  } catch(e){}

  // Draggable Resizers & Topbar Toggles
  initLayoutResizers();
  initPanelToggles();

  // Practice Agent Chat logic
  initPracticeAgent();
});

// Practice Assistant Chat Implementation
function initPracticeAgent() {
  const chatBody = document.getElementById("chat-body");
  const chatInput = document.getElementById("chat-input");
  const chatChips = document.getElementById("chat-chips");
  const chatSend = document.getElementById("chat-send");

  if (!chatBody || !chatInput) return;

  const AGENT_ANSWERS = {
    pending: "Clients still pending for GSTR-3B (Aug): <b>Om Sai Traders</b> (no docs), <b>Ramesh Textiles</b> (bank statement), and <b>Green Leaf Exports</b> (3 purchase bills). Want me to open Reminders?",
    reminders: "I can route you to Reminders, but I won't send messages myself. Open Reminders and use <b>Send all pending reminders</b> — there are 5 clients waiting.",
    vault: "<b>Nimbus Retail Pvt Ltd</b> vault for Aug 2026: 9 raw files, 8 extracted. Latest: INV-2291 at ₹1,84,200 (98% confidence). Jul is fully filed (11/11).",
    recon: "Nimbus Aug bank recon: <b>3 unmatched</b> and <b>5 partial</b> lines need review — bank charges ₹350, interest ₹640, and amount mismatches on Shivam Industries and Anand Traders. Open Reconciliation to resolve them."
  };

  function agentReply(text) {
    const typing = document.createElement("div");
    typing.className = "msg bot typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    chatBody.appendChild(typing);
    chatBody.scrollTop = chatBody.scrollHeight;
    setTimeout(() => {
      typing.remove();
      const msg = document.createElement("div");
      msg.className = "msg bot";
      msg.innerHTML = text;
      chatBody.appendChild(msg);
      chatBody.scrollTop = chatBody.scrollHeight;
    }, 700);
  }

  function askAgent(q, chipKey) {
    if (!q.trim()) return;
    const user = document.createElement("div");
    user.className = "msg user";
    user.textContent = q;
    chatBody.appendChild(user);
    chatBody.scrollTop = chatBody.scrollHeight;

    let answer = AGENT_ANSWERS[chipKey];
    if (!answer) {
      const lower = q.toLowerCase();
      if (lower.includes("gstr") || lower.includes("pending")) answer = AGENT_ANSWERS.pending;
      else if (lower.includes("remind")) answer = AGENT_ANSWERS.reminders;
      else if (lower.includes("vault") || lower.includes("nimbus")) answer = AGENT_ANSWERS.vault;
      else if (lower.includes("recon") || lower.includes("bank") || lower.includes("unmatch")) answer = AGENT_ANSWERS.recon;
      else answer = "I can help with filing status, pending documents, vault contents, and reconciliation exceptions. Try one of the suggested questions below.";
    }
    agentReply(answer);
    if (chipKey === "reminders") setTimeout(() => goToPage("reminders"), 900);
    if (chipKey === "recon") setTimeout(() => goToPage("recon"), 900);
    if (chipKey === "vault") setTimeout(() => goToPage("vault"), 900);
    if (chipKey === "pending") setTimeout(() => goToPage("reminders"), 1100);
  }

  if (chatChips) {
    chatChips.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      askAgent(chip.textContent, chip.dataset.q);
    });
  }

  if (chatSend) {
    chatSend.addEventListener("click", () => {
      const q = chatInput.value;
      chatInput.value = "";
      askAgent(q);
    });
  }

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const q = chatInput.value;
      chatInput.value = "";
      askAgent(q);
    }
  });
}

function initLayoutResizers() {
  const sidebar = document.querySelector(".sidebar");
  const chat = document.querySelector(".chat");
  const resizerLeft = document.getElementById("resizer-sidebar");
  const resizerRight = document.getElementById("resizer-chat");
  const layout = document.querySelector(".layout");

  if (resizerLeft && sidebar) {
    let isDragging = false;
    resizerLeft.addEventListener("mousedown", (e) => {
      isDragging = true;
      resizerLeft.classList.add("dragging");
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const layoutRect = layout.getBoundingClientRect();
      const newWidth = e.clientX - layoutRect.left;
      if (newWidth < 100) {
        sidebar.classList.add("collapsed");
      } else {
        sidebar.classList.remove("collapsed");
        const clampedWidth = Math.max(140, Math.min(newWidth, 400));
        sidebar.style.width = clampedWidth + "px";
        try { localStorage.setItem("taxflow-sidebar-width", clampedWidth); } catch(err){}
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        resizerLeft.classList.remove("dragging");
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      }
    });
  }

  if (resizerRight && chat) {
    let isDragging = false;
    resizerRight.addEventListener("mousedown", (e) => {
      isDragging = true;
      resizerRight.classList.add("dragging");
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const layoutRect = layout.getBoundingClientRect();
      const newWidth = layoutRect.right - e.clientX;
      if (newWidth < 120) {
        chat.classList.add("collapsed");
      } else {
        chat.classList.remove("collapsed");
        const clampedWidth = Math.max(160, Math.min(newWidth, 600));
        chat.style.width = clampedWidth + "px";
        try { localStorage.setItem("taxflow-chat-width", clampedWidth); } catch(err){}
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        resizerRight.classList.remove("dragging");
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      }
    });
  }
}

function initPanelToggles() {
  const toggleSidebarBtn = document.getElementById("toggle-sidebar-btn");
  const toggleChatBtn = document.getElementById("toggle-chat-btn");
  const sidebar = document.querySelector(".sidebar");
  const chat = document.querySelector(".chat");

  if (toggleSidebarBtn && sidebar) {
    toggleSidebarBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      if (!sidebar.classList.contains("collapsed")) {
        const savedW = localStorage.getItem("taxflow-sidebar-width") || 224;
        sidebar.style.width = savedW + "px";
      }
    });
  }

  if (toggleChatBtn && chat) {
    toggleChatBtn.addEventListener("click", () => {
      chat.classList.toggle("collapsed");
      if (!chat.classList.contains("collapsed")) {
        const savedW = localStorage.getItem("taxflow-chat-width") || 318;
        chat.style.width = savedW + "px";
      }
    });
  }
}
