/* Taxflow AI — Vision Extract Controller */

let fileAttached = false;
const RECENT_EXTRACTS = [
  { client: "Nimbus Retail Pvt Ltd", type: "Sales invoice", date: "3 min ago", conf: "98%" },
  { client: "Kaveri Foods LLP", type: "Purchase bill", date: "42 min ago", conf: "96%" },
  { client: "Ramesh Textiles", type: "Expense receipt", date: "2 hr ago", conf: "94%" }
];

document.addEventListener("DOMContentLoaded", () => {
  renderRecentExtracts();

  const dropzone = document.getElementById("dropzone");
  const filechip = document.getElementById("vx-filechip");
  const runBtn = document.getElementById("run-extract-btn");
  const resetBtn = document.getElementById("reset-extract-btn");
  const stepsWrap = document.getElementById("progress-steps");
  const extractEmpty = document.getElementById("extract-empty");
  const extractContent = document.getElementById("extract-content");

  if (dropzone) {
    dropzone.addEventListener("click", () => {
      fileAttached = true;
      filechip.innerHTML = `
        <div class="file-chip">
          <div class="ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></div>
          <div><div style="font-weight:600;">INV-2291_NimbusRetail_Aug2026.pdf</div><div style="font-size:10.5px;color:var(--text-faint);">1.4 MB · Scanned Invoice</div></div>
        </div>`;
      runBtn.disabled = false;
      showToast("Attached document for extraction");
    });
  }

  if (runBtn) {
    runBtn.addEventListener("click", () => {
      runBtn.disabled = true;
      stepsWrap.style.display = "flex";
      extractEmpty.style.display = "none";
      extractContent.style.display = "none";

      const steps = stepsWrap.querySelectorAll(".pstep");
      steps.forEach(s => {
        s.className = "pstep";
        s.querySelector(".dotwrap").innerHTML = "";
      });

      let current = 0;
      function nextStep() {
        if (current > 0) {
          steps[current - 1].className = "pstep done";
          steps[current - 1].querySelector(".dotwrap").innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
        }
        if (current < steps.length) {
          steps[current].className = "pstep active";
          steps[current].querySelector(".dotwrap").innerHTML = `<div class="spinner"></div>`;
          current++;
          setTimeout(nextStep, 600);
        } else {
          extractContent.style.display = "block";
          showToast("Vision extraction complete — 98.4% confidence");
          RECENT_EXTRACTS.unshift({
            client: document.getElementById("vx-client").value,
            type: document.getElementById("vx-doctype").value,
            date: "Just now",
            conf: "98.4%"
          });
          renderRecentExtracts();
        }
      }
      nextStep();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      extractContent.style.display = "none";
      extractEmpty.style.display = "flex";
      stepsWrap.style.display = "none";
      filechip.innerHTML = "";
      fileAttached = false;
      runBtn.disabled = true;
    });
  }
});

function renderRecentExtracts() {
  const tbody = document.getElementById("recent-extract-body");
  if (!tbody) return;

  tbody.innerHTML = "";
  RECENT_EXTRACTS.forEach(r => {
    tbody.insertAdjacentHTML("beforeend", `
      <tr class="tr-hover">
        <td><div class="cell-strong">${r.client}</div><div class="cell-sub">${r.type} · ${r.date}</div></td>
        <td style="text-align:right;"><span class="confidence">${r.conf}</span></td>
      </tr>`);
  });
}
