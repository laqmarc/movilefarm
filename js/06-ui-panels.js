function resourceDisplayEntries() {
  return resourceCatalog().map((res) => ({
    ...res,
    amount: state.resources[res.key],
  }));
}

function renderResourceStrip() {
  const entries = resourceDisplayEntries();
  const maxVisible = 1;
  const visible = entries.slice(0, maxVisible);
  const hiddenCount = Math.max(0, entries.length - visible.length);
  const chips = visible.map((res) => {
    const value = res.unlocked ? formatCompact(res.amount) : "Bloc";
    const css = res.unlocked ? "res-chip" : "res-chip locked";
    return `<span class="${css}"><span>${res.label}</span><strong>${value}</strong></span>`;
  });

  if (hiddenCount > 0) {
    chips.push(
      `<button class="res-more" type="button" data-action="open-resource-panel">+${hiddenCount}</button>`
    );
  }

  dom.resourceStrip.innerHTML = chips.join("");
}

function renderResourcePanel() {
  if (!state.ui.resourcePanelOpen) {
    dom.resourcePanel.classList.add("hidden");
    dom.resourcePanel.innerHTML = "";
    return;
  }

  const rows = resourceDisplayEntries()
    .map((res) => {
      const qty = res.unlocked ? formatCompact(res.amount) : "Bloc";
      const price = res.unlocked ? `${formatInt(res.price)}$` : "-";
      return `<div class="res-row"><span>${res.label}</span><strong>${qty}</strong><span>${price}</span></div>`;
    })
    .join("");

  dom.resourcePanel.classList.remove("hidden");
  dom.resourcePanel.innerHTML = `
    <div class="res-panel-head">
      <h3>Recursos</h3>
      <button type="button" id="closeResourcePanelBtn">Tancar</button>
    </div>
    ${rows}
  `;
}

