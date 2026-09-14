/* Taxflow AI — Vault Tree & File Explorer Controller */

const treeIcons = {
  folder: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>`,
  chev: `<svg class="chev" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M9 6l6 6-6 6"/></svg>`
};

document.addEventListener("DOMContentLoaded", () => {
  const treeRoot = document.getElementById("tree-root");
  if (!treeRoot) return;

  treeRoot.innerHTML = `<div class="tree">${buildTree(VAULT_TREE)}</div>`;
  renderFiles("Clients / Nimbus Retail Pvt Ltd / Data / 2026 / Aug / Extracted");

  treeRoot.addEventListener("click", (e) => {
    const node = e.target.closest(".node");
    if (!node) return;
    const li = node.parentElement;
    if (li.querySelector(":scope > ul")) {
      li.classList.toggle("open");
    }
    document.querySelectorAll(".tree .node").forEach(n => n.classList.remove("selected"));
    node.classList.add("selected");
    if (node.dataset.path) {
      renderFiles(node.dataset.path);
      showToast("Opened " + node.dataset.path.split(" / ").slice(-1)[0]);
    }
  });
});

function buildTree(obj, path = [], depth = 0) {
  let html = "<ul>";
  for (const key in obj) {
    const val = obj[key];
    const fullPath = [...path, key];
    const isLeafCount = typeof val === "number";
    const openAttr = depth < 2 ? "open" : "";
    if (isLeafCount) {
      html += `<li><div class="node" data-path="${fullPath.join(' / ')}">${treeIcons.folder}<span>${key}</span><span class="count">${val} files</span></div></li>`;
    } else {
      html += `<li class="${openAttr}"><div class="node" data-path="${fullPath.join(' / ')}">${treeIcons.chev}${treeIcons.folder}<span>${key}</span></div>${buildTree(val, fullPath, depth + 1)}</li>`;
    }
  }
  html += "</ul>";
  return html;
}

function renderFiles(pathLabel) {
  const crumb = document.getElementById("vault-crumb");
  const grid = document.getElementById("file-grid");
  if (crumb) {
    crumb.innerHTML = pathLabel.split(" / ").map((p, i, a) => i === a.length - 1 ? `<b>${p}</b>` : p).join(" / ");
  }
  if (!grid) return;

  grid.innerHTML = "";
  FILES_EXAMPLE.forEach(f => {
    const icoClass = f.type === "pdf" ? "pdf" : f.type === "xls" ? "xls" : "";
    grid.insertAdjacentHTML("beforeend", `
      <div class="file-card">
        <div class="ico ${icoClass}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
        </div>
        <div class="name">${f.name}</div>
        <div class="meta">Auto-filed · Aug 2026</div>
      </div>`);
  });
}
