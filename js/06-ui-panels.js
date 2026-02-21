function resourceDisplayEntries() {
  return resourceCatalog().map((res) => ({
    ...res,
    amount: state.resources[res.key],
  }));
}

function renderResourceStrip() {
  const entries = resourceDisplayEntries();
  const hiddenCount = entries.length;
  const chips = [];

  const resourcesLabel = hiddenCount > 0 ? `Recursos +${hiddenCount}` : "Recursos";
  chips.push(
    `<button class="res-strip-btn" type="button" data-action="open-resource-panel">${resourcesLabel}</button>`
  );
  chips.push(
    `<button class="res-strip-btn" type="button" data-action="open-recipe-panel">Receptes</button>`
  );

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

function renderRecipePanel() {
  if (!state.ui.recipePanelOpen) {
    dom.recipePanel.classList.add("hidden");
    dom.recipePanel.innerHTML = "";
    return;
  }

  const groups = unlockedRecipeGroups();
  const content =
    groups.length > 0
      ? groups
          .map((group) => {
            const rows = group.recipes
              .map((recipe) => {
                return `
                  <div class="recipe-row">
                    <strong>${recipe.label}</strong>
                    <span>In: ${recipeAmountsLine(recipe.inputs)}</span>
                    <span>Out: ${recipeAmountsLine(recipe.outputs)}</span>
                  </div>
                `;
              })
              .join("");
            return `
              <div class="recipe-group">
                <h4>${group.label}</h4>
                ${rows}
              </div>
            `;
          })
          .join("")
      : `<div class="recipe-empty">Desbloqueja Farga o Assembler per veure receptes.</div>`;

  dom.recipePanel.classList.remove("hidden");
  dom.recipePanel.innerHTML = `
    <div class="res-panel-head">
      <h3>Receptes</h3>
      <button type="button" id="closeRecipePanelBtn">Tancar</button>
    </div>
    ${content}
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
    const rewardLabel = objectiveRewardText(objective.reward);
    return `
      <div class="${css}">
        <div>
          <span>${objective.label}</span>
          <small>${rewardLabel}</small>
        </div>
        <strong>${done ? "OK" : `${formatInt(Math.min(objective.target, current))} / ${formatInt(objective.target)}`}</strong>
      </div>
    `;
  }).join("");

  const completed = completedObjectivesCount();
  const total = OBJECTIVES.length;
  const prestigeLevel = state.progression.prestigeLevel || 0;
  const currentBonus = `${Math.round((prestigeProductionMultiplier() - 1) * 100)}%`;
  const nextBonus = `${Math.round((1 + (prestigeLevel + 1) * 0.12 - 1) * 100)}%`;
  const premiumDone = state.progression.contractsPremiumCompleted || 0;
  const requiredObjectives = 5;
  const requiredMoney = 5000;
  const moneyEarned = Math.floor(state.progression.totalMoneyEarned || 0);
  const reqObjOk = completed >= requiredObjectives;
  const reqMoneyOk = moneyEarned >= requiredMoney;
  const buffs = activeBuffEntries();
  const buffRows =
    buffs.length > 0
      ? buffs
          .map((buff) => {
            return `<div class="contract-line"><span>${buff.label}</span><strong>${buff.remainingSec}s</strong></div>`;
          })
          .join("")
      : `<div class="contract-line"><span>Buffs actius</span><strong>Cap</strong></div>`;

  dom.objectivesPanel.innerHTML = `
    <div class="contract-line"><span>Completats</span><strong>${completed} / ${total}</strong></div>
    <div class="contract-line"><span>Prestigi</span><strong>${formatInt(prestigeLevel)}</strong></div>
    <div class="contract-line"><span>Bonus actual</span><strong>${currentBonus}</strong></div>
    <div class="contract-line"><span>Bonus seguent</span><strong>${nextBonus}</strong></div>
    <div class="contract-line"><span>Premium fets</span><strong>${formatInt(premiumDone)}</strong></div>
    <div class="contract-line"><span>Req Obj</span><strong>${reqObjOk ? "OK" : `${completed}/${requiredObjectives}`}</strong></div>
    <div class="contract-line"><span>Req Diners</span><strong>${reqMoneyOk ? "OK" : `${formatInt(Math.min(requiredMoney, moneyEarned))}/${formatInt(requiredMoney)}`}</strong></div>
    ${buffRows}
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
