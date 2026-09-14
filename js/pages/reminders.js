/* Taxflow AI — Reminders Controller */

document.addEventListener("DOMContentLoaded", () => {
  renderReminders();
  
  const sendAllBtn = document.getElementById("send-all-btn");
  if (sendAllBtn) {
    sendAllBtn.addEventListener("click", () => {
      const pendingCount = REMINDERS_CLIENTS.length;
      showToast(`Sent ${pendingCount} reminders via WhatsApp & Email API`);
      const log = document.getElementById("reminder-log");
      if (log) {
        log.insertAdjacentHTML("afterbegin", `
          <li><span class="dot"></span><div><div class="t">Batch reminders sent to <b>5 clients</b></div><div class="m">Just now · WhatsApp + Email API</div></div></li>`);
      }
    });
  }
});

function renderReminders() {
  const tbody = document.getElementById("reminders-body");
  if (!tbody) return;

  tbody.innerHTML = "";
  REMINDERS_CLIENTS.forEach(r => {
    tbody.insertAdjacentHTML("beforeend", `
      <tr class="tr-hover">
        <td class="cell-strong">${r.name}</td>
        <td>${r.missing}</td>
        <td>${r.last}</td>
        <td><span class="badge brass">${r.channel}</span></td>
        <td><span class="badge ${r.statusClass}">${r.status}</span></td>
        <td><button class="btn btn-ghost btn-sm" onclick="showToast('Nudged ${r.name}')">Nudge now</button></td>
      </tr>`);
  });
}
