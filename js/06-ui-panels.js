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

function renderResearchTree() {
  const points = Math.floor(state.research.points || 0);
  const rows = RESEARCH_TREE.map((node) => {
    const done = hasResearch(node.id);
    const missingPrereq = node.prereqs.filter((id) => !hasResearch(id));
    const unlockable = canUnlockResearch(node);
    const css = done ? "research-row done" : missingPrereq.length > 0 ? "research-row locked" : "research-row";
    const status = done
      ? "OK"
      : missingPrereq.length > 0
        ? `Pre: ${missingPrereq.length}`
        : `${node.cost} RP`;

    return `
      <div class="${css}">
        <div>
          <strong>${node.name}</strong>
          <small>${node.desc}</small>
        </div>
        <button type="button" data-research-id="${node.id}" ${done || !unlockable ? "disabled" : ""}>${status}</button>
      </div>
    `;
  }).join("");

  dom.researchTree.innerHTML = `
    <div class="contract-line"><span>Punts</span><strong>${formatInt(points)} RP</strong></div>
    ${rows}
  `;
}

function renderObjectivesPanel() {
  const rows = OBJECTIVES.map((objective) => {
    const current = Math.floor(objectiveProgress(objective));
    const done = !!state.progression.objectivesCompleted[objective.id];
    const css = done ? "objective-row done" : "objective-row";
    return `
      <div class="${css}">
        <span>${objective.label}</span>
        <strong>${done ? "OK" : `${formatInt(Math.min(objective.target, current))} / ${formatInt(objective.target)}`}</strong>
      </div>
    `;
  }).join("");

  const completed = completedObjectivesCount();
  const total = OBJECTIVES.length;
  const bonus = `${Math.round((prestigeProductionMultiplier() - 1) * 100)}%`;

  dom.objectivesPanel.innerHTML = `
    <div class="contract-line"><span>Completats</span><strong>${completed} / ${total}</strong></div>
    <div class="contract-line"><span>Bonus prestigi</span><strong>${bonus}</strong></div>
    ${rows}
  `;
}

function renderTutorialOverlay() {
  if (state.tutorial.completed || state.tutorial.dismissed) {
    dom.tutorialOverlay.classList.add("hidden");
    dom.tutorialOverlay.innerHTML = "";
    return;
  }

  const step = tutorialStepData(state.tutorial.step);
  if (!step) {
    dom.tutorialOverlay.classList.add("hidden");
    dom.tutorialOverlay.innerHTML = "";
    return;
  }

  dom.tutorialOverlay.classList.remove("hidden");
  dom.tutorialOverlay.innerHTML = `
    <h3>${step.title}</h3>
    <p>${step.body}</p>
    <div class="tutorial-actions">
      <button type="button" data-tutorial-action="next">Seguent</button>
      <button type="button" data-tutorial-action="skip">Tancar</button>
    </div>
  `;
}
