/* Taxflow AI — Pain Points Controller */

document.addEventListener("DOMContentLoaded", () => {
  renderPainPoints();
});

function renderPainPoints() {
  const container = document.getElementById("pp-list");
  if (!container) return;

  container.innerHTML = "";
  PAIN_POINTS.forEach(p => {
    container.insertAdjacentHTML("beforeend", `
      <div class="pp-item">
        <div class="pp-num">${p.num}</div>
        <div>
          <h4>${p.title}</h4>
          <div class="desc">${p.desc}</div>
        </div>
        <div class="fix">${p.fix}</div>
        <div class="goto">
          <button class="btn btn-sm" data-goto="${p.page}">${p.btn}</button>
        </div>
      </div>`);
  });
}
