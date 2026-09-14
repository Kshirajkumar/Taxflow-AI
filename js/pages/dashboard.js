/* Taxflow AI — Dashboard Controller */

document.addEventListener("DOMContentLoaded", () => {
  renderAttentionTable();
});

function renderAttentionTable() {
  const tbody = document.getElementById("attention-body");
  if (!tbody) return;

  tbody.innerHTML = "";
  CLIENTS.forEach(c => {
    const bClass = badgeFor(c.health);
    tbody.insertAdjacentHTML("beforeend", `
      <tr class="tr-hover">
        <td>
          <div class="row-flex">
            <div class="avatar-sm">${c.name.split(" ").map(w=>w[0]).slice(0,2).join("")}</div>
            <div><div class="cell-strong">${c.name}</div><div class="cell-sub">${c.gstin}</div></div>
          </div>
        </td>
        <td>${c.status}</td>
        <td>18 Sep (GSTR-3B)</td>
        <td><span class="badge ${bClass}">${c.status}</span></td>
        <td><button class="btn btn-ghost btn-sm" data-goto="${c.health==='bad'?'reminders':'vision'}">Action</button></td>
      </tr>`);
  });
}
