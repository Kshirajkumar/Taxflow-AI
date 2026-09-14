/* Taxflow AI — Reconciliation Controller */

document.addEventListener("DOMContentLoaded", () => {
  renderRecon();

  const autoreconBtn = document.getElementById("autorecon-btn");
  if (autoreconBtn) {
    autoreconBtn.addEventListener("click", () => {
      let newly = 0;
      RECON_ROWS.forEach(r => {
        if (r.status === "warn") { r.status = "ok"; newly++; }
      });
      renderRecon();
      showToast(newly ? `Auto-reconcile matched ${newly} more line${newly === 1 ? "" : "s"}` : "No new matches found");
    });
  }
});

function statusLabel(s) { return s === "ok" ? "Matched" : s === "warn" ? "Partial" : "Unmatched"; }

function renderRecon() {
  const tbody = document.getElementById("recon-body");
  if (!tbody) return;

  tbody.innerHTML = "";
  RECON_ROWS.forEach(r => {
    tbody.insertAdjacentHTML("beforeend", `
      <tr class="tr-hover">
        <td>${r.date}</td>
        <td class="cell-strong">${r.desc}</td>
        <td>${r.bank}</td>
        <td>${r.book}</td>
        <td><span class="badge ${badgeFor(r.status)}">${statusLabel(r.status)}</span></td>
      </tr>`);
  });

  const matched = RECON_ROWS.filter(r => r.status === "ok").length;
  const partial = RECON_ROWS.filter(r => r.status === "warn").length;
  const unmatched = RECON_ROWS.filter(r => r.status === "bad").length;

  const matchedEl = document.getElementById("recon-matched");
  const partialEl = document.getElementById("recon-partial");
  const unmatchedEl = document.getElementById("recon-unmatched");

  if (matchedEl) matchedEl.textContent = matched;
  if (partialEl) partialEl.textContent = partial;
  if (unmatchedEl) unmatchedEl.textContent = unmatched;
}
