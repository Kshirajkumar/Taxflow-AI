/* Taxflow AI — Clients Directory Controller */

document.addEventListener("DOMContentLoaded", () => {
  renderClients();

  const searchInput = document.getElementById("client-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderClients(e.target.value);
    });
  }

  const addBtn = document.getElementById("add-client-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      CLIENTS.unshift({
        name: "New Client " + (CLIENTS.length + 1),
        gstin: "27NEWCL" + String(1000 + CLIENTS.length) + "Z1Z9",
        category: "Proprietorship · Trading",
        docs: 0,
        status: "Onboarding",
        health: "warn"
      });
      renderClients(searchInput ? searchInput.value : "");
      showToast("Client added — vault folders provisioned");
    });
  }
});

function renderClients(filterText = "") {
  const tbody = document.getElementById("clients-body");
  if (!tbody) return;

  tbody.innerHTML = "";
  const filtered = CLIENTS.filter(c => 
    c.name.toLowerCase().includes(filterText.toLowerCase()) || 
    c.gstin.toLowerCase().includes(filterText.toLowerCase())
  );

  filtered.forEach(c => {
    const bClass = badgeFor(c.health);
    tbody.insertAdjacentHTML("beforeend", `
      <tr class="tr-hover">
        <td>
          <div class="row-flex">
            <div class="avatar-sm">${c.name.split(" ").map(w=>w[0]).slice(0,2).join("")}</div>
            <div><div class="cell-strong">${c.name}</div><div class="cell-sub">${c.gstin}</div></div>
          </div>
        </td>
        <td>${c.category}</td>
        <td><b>${c.docs}</b> files</td>
        <td><span class="badge ${bClass}">${c.status}</span></td>
        <td><button class="btn btn-ghost btn-sm" data-goto="vault">Open vault</button></td>
      </tr>`);
  });
}
