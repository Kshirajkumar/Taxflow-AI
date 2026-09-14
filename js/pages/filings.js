/* Taxflow AI — ITR / GSTR Studio Controller */

document.addEventListener("DOMContentLoaded", () => {
  const autofillBtn = document.getElementById("autofill-btn");
  const generateFilingBtn = document.getElementById("generate-filing-btn");

  if (autofillBtn) {
    autofillBtn.addEventListener("click", () => {
      const client = document.getElementById("fl-client").value;
      const type = document.getElementById("fl-type").value.split("—")[0].trim();
      
      const emptyEl = document.getElementById("filing-empty");
      const contentEl = document.getElementById("filing-content");
      const hintEl = document.getElementById("filing-hint");
      const kvEl = document.getElementById("filing-kv");

      if (emptyEl) emptyEl.style.display = "none";
      if (contentEl) contentEl.style.display = "block";
      if (hintEl) hintEl.textContent = "Draft from vault · review required";
      if (kvEl) {
        kvEl.innerHTML = `
          <div class="kv"><div class="k">Client</div><div class="v">${client}</div></div>
          <div class="kv"><div class="k">Return</div><div class="v">${type}</div></div>
          <div class="kv"><div class="k">Taxable value</div><div class="v">₹18,42,600</div></div>
          <div class="kv"><div class="k">Output tax</div><div class="v">₹3,31,668</div></div>
          <div class="kv"><div class="k">ITC claimed</div><div class="v">₹1,12,440</div></div>
          <div class="kv"><div class="k">Net payable</div><div class="v">₹2,19,228</div></div>
          <div class="kv"><div class="k">Source documents</div><div class="v">14 confirmed</div></div>
          <div class="kv"><div class="k">Avg. confidence</div><div class="v">96.8%</div></div>
        `;
      }
      showToast("Return draft auto-filled from vault");
    });
  }

  if (generateFilingBtn) {
    generateFilingBtn.addEventListener("click", () => {
      showToast("Draft downloaded — review before filing");
    });
  }
});
