function contractTierLabel(tier) {
  return tier === "premium" ? "Premium" : "Normal";
}

function renderContract() {
  const { offer, active } = state.contract;
  const labelByKey = {
    stone: "Pedra",
    wood: "Fusta",
    iron: "Ferro",
    coal: "Carbo",
    copper: "Coure",
    parts: "Peces",
    steel: "Acer",
    plates: "Plaques",
    modules: "Moduls",
    circuits: "Circuits",
    frames: "Bastidors",
  };

  const requirementRows = (contract, showDelivered) =>
    (contract.requirements || [])
      .map((req) => {
        const label = labelByKey[req.key] || req.key;
        const done = showDelivered
          ? Math.max(0, Math.floor((contract.delivered && contract.delivered[req.key]) || 0))
          : 0;
        const value = showDelivered
          ? `${formatInt(done)} / ${formatInt(req.required)}`
          : `${formatInt(req.required)}`;
        return `<div class="contract-line"><span>${label}</span><strong>${value}</strong></div>`;
      })
      .join("");

  if (active) {
    const remainingSec = Number.isFinite(active.deadlineAt)
      ? Math.max(0, Math.ceil((active.deadlineAt - Date.now()) / 1000))
      : 0;
    dom.contractOffer.innerHTML = `
      <div class="contract-line"><span>Estat</span><strong>Actiu</strong></div>
      <div class="contract-line"><span>Tipus</span><strong>${contractTierLabel(active.tier)}</strong></div>
      ${requirementRows(active, true)}
      <div class="contract-line"><span>Temps restant</span><strong>${remainingSec}s</strong></div>
      <div class="contract-line"><span>Recompensa</span><strong>${formatInt(active.reward)}$</strong></div>
      <div class="contract-line"><span>Penalitzacio</span><strong>${formatInt(active.penalty)}$</strong></div>
    `;
    return;
  }

  if (offer) {
    dom.contractOffer.innerHTML = `
      <div class="contract-line"><span>Estat</span><strong>Pendent</strong></div>
      <div class="contract-line"><span>Tipus</span><strong>${contractTierLabel(offer.tier)}</strong></div>
      ${requirementRows(offer, false)}
      <div class="contract-line"><span>Temps</span><strong>${offer.durationSec}s</strong></div>
      <div class="contract-line"><span>Recompensa</span><strong>${formatInt(offer.reward)}$</strong></div>
      <div class="contract-line"><span>Penalitzacio</span><strong>${formatInt(offer.penalty)}$</strong></div>
    `;
    return;
  }

  dom.contractOffer.innerHTML = `
    <div class="contract-line"><span>Sense ofertes</span><strong>Generant...</strong></div>
  `;
}

function nodeOutputResources(node) {
  if (!node) return [];
  if (node.type === "miner") return ["stone"];
  if (node.type === "wood_miner") return ["wood"];
  if (node.type === "iron_miner") return ["iron"];
  if (node.type === "coal_miner") return ["coal"];
  if (node.type === "copper_miner") return ["copper"];

  const recipe = nodeRecipe(node);
  if (!recipe) return [];
  return Object.keys(recipe.outputs || {});
}

function shortestPathEdgeKeys(startId, targetId, adjacency) {
  if (!startId || !targetId) return [];
  if (!adjacency.has(startId) || !adjacency.has(targetId)) return [];
  if (startId === targetId) return [];

  const queue = [startId];
  const previous = new Map([[startId, null]]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === targetId) break;

    const linked = adjacency.get(current) || new Set();
    for (const next of linked) {
      if (previous.has(next)) continue;
      previous.set(next, current);
      queue.push(next);
    }
  }

  if (!previous.has(targetId)) {
    return [];
  }

  const edges = [];
  let current = targetId;
  while (current !== startId) {
    const prev = previous.get(current);
    if (!prev) break;
    edges.push(edgeKey(prev, current));
    current = prev;
  }

  return edges;
}

function buildFlowEdgesByResource(snapshot) {
  const map = new Map();
  const warehouse = snapshot.warehouseNode;
  if (!warehouse) return map;

  const adjacency = buildAdjacency();
  for (const node of state.nodes) {
    if (node.id === warehouse.id) continue;
    if (!snapshot.reachableFromWarehouse.has(node.id)) continue;

    const outputs = nodeOutputResources(node);
    if (outputs.length < 1) continue;

    const pathEdges = shortestPathEdgeKeys(node.id, warehouse.id, adjacency);
    if (pathEdges.length < 1) continue;

    for (const resourceKey of outputs) {
      if (!map.has(resourceKey)) {
        map.set(resourceKey, new Set());
      }
      const set = map.get(resourceKey);
      for (const edge of pathEdges) {
        set.add(edge);
      }
    }
  }

  return map;
}

function renderGrid(snapshot) {
  const nodesByCell = new Map(
    state.nodes.map((node) => [cellKey(node.row, node.col), node])
  );
  const dragSource = getNodeById(state.ui.drag.sourceId);
  const dragSourceKey = dragSource ? cellKey(dragSource.row, dragSource.col) : null;

  for (const [key, cell] of cellRefs) {
    const node = nodesByCell.get(key);
    const isSelected = !!node && node.id === state.ui.selectedNodeId;
    const isPending = !!node && node.id === state.ui.pendingSourceId;
    const isHoverTarget =
      state.ui.drag.active && key === state.ui.drag.hoverCellKey && key !== dragSourceKey;

    cell.classList.toggle("selected", isSelected);
    cell.classList.toggle("pending", isPending);
    cell.classList.toggle("hover-target", isHoverTarget);
    cell.innerHTML = node ? `<div class="tile ${node.type}">${tileLabel(node)}</div>` : "";
  }

  renderCables(snapshot);
}

function renderCables(snapshot) {
  const width = worldWidthPx();
  const height = worldHeightPx();
  const cellW = CONFIG.cellSizePx;
  const cellH = CONFIG.cellSizePx;
  const flowResource = state.ui.flowResource || "all";
  const flowEdgesByResource = buildFlowEdgesByResource(snapshot);
  const selectedFlowEdges =
    flowResource === "all" ? null : flowEdgesByResource.get(flowResource) || new Set();

  dom.cableLayer.setAttribute("viewBox", `0 0 ${width} ${height}`);
  dom.cableLayer.setAttribute("width", width);
  dom.cableLayer.setAttribute("height", height);

  const lines = [];
  for (const cable of state.cables) {
    const [a, b] = cable.split("|");
    const na = snapshot.nodeMap.get(a);
    const nb = snapshot.nodeMap.get(b);
    if (!na || !nb) continue;

    const x1 = (na.col + 0.5) * cellW;
    const y1 = (na.row + 0.5) * cellH;
    const x2 = (nb.col + 0.5) * cellW;
    const y2 = (nb.row + 0.5) * cellH;
    const active =
      snapshot.reachableFromWarehouse.has(a) && snapshot.reachableFromWarehouse.has(b);

    const classList = ["cable-line"];
    if (active) classList.push("active");
    if (flowResource !== "all") {
      if (selectedFlowEdges.has(cable)) {
        classList.push("flow-match", `flow-${flowResource}`);
      } else {
        classList.push("flow-faded");
      }
    }

    lines.push(
      `<line class="${classList.join(" ")}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`
    );
  }

  if (state.ui.drag.active) {
    const source = getNodeById(state.ui.drag.sourceId);
    if (source) {
      const sx = (source.col + 0.5) * cellW;
      const sy = (source.row + 0.5) * cellH;
      let ex = state.ui.drag.pointerX;
      let ey = state.ui.drag.pointerY;

      if (state.ui.drag.snapTargetId) {
        const snapNode = getNodeById(state.ui.drag.snapTargetId);
        if (snapNode) {
          ex = (snapNode.col + 0.5) * cellW;
          ey = (snapNode.row + 0.5) * cellH;
        }
      }

      lines.push(
        `<line class="cable-preview" x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" />`
      );
    }
  }

  dom.cableLayer.innerHTML = lines.join("");
}

function render() {
  const snapshot = getNetworkSnapshot();
  const warehouse = snapshot.warehouseNode;
  const selected = selectedNode();
  const maxCapacity = warehouse ? capacity(warehouse.level) : 0;
  const totalStored = totalStoredResources();
  const selectedCost = selected ? upgradeCost(selected) : null;
  const selectedRecipe = selected ? nodeRecipeLabel(selected) : "-";
  const canChangeRecipe = canCycleRecipe(selected);
  const marketShift = Number(state.market.averageMultiplier) || 1;
  const completedObjectives = completedObjectivesCount();
  const flowOption =
    flowFilterOptions().find((option) => option.key === state.ui.flowResource) || {
      key: "all",
      label: "Tot",
    };
  clampCamera();
  applyCameraTransform();

  dom.moneyValue.textContent = `${formatCompact(state.money)}$`;
  dom.stoneValue.textContent = `${formatCompact(totalStored)} / ${formatInt(maxCapacity)}`;
  dom.productionValue.textContent = `${formatCompact(snapshot.connectedRate)} u/s`;
  renderResourceStrip();
  dom.minerCostValue.textContent = `${formatInt(minerPlacementCost())}$`;
  dom.woodMinerCostValue.textContent = `${formatInt(woodMinerPlacementCost())}$`;
  dom.ironMinerCostValue.textContent = state.tech.ironUnlocked
    ? `${formatInt(ironMinerPlacementCost())}$`
    : "Bloc";
  dom.coalMinerCostValue.textContent = state.tech.advancedMinesUnlocked
    ? `${formatInt(coalMinerPlacementCost())}$`
    : "Bloc";
  dom.copperMinerCostValue.textContent = state.tech.advancedMinesUnlocked
    ? `${formatInt(copperMinerPlacementCost())}$`
    : "Bloc";
  dom.forgeCostValue.textContent = state.tech.forgeUnlocked
    ? `${formatInt(forgePlacementCost())}$`
    : "Bloc";
  dom.assemblerCostValue.textContent = state.tech.assemblerUnlocked
    ? `${formatInt(assemblerPlacementCost())}$`
    : "Bloc";
  dom.poleCostValue.textContent = `${formatInt(polePlacementCost())}$`;
  dom.cableCostValue.textContent = `${formatInt(CONFIG.cableCost)}$`;
  dom.cableRangeValue.textContent = `${formatCompact(cableMaxDistance())} cel.les`;
  dom.autoSellValue.textContent = state.autoSellEnabled ? "ON" : "OFF";
  dom.maintenanceValue.textContent = `${formatCompact(state.economy.lastMaintenancePerSec)}$/s`;
  dom.marketShiftValue.textContent = `x${marketShift.toFixed(2)}`;
  dom.researchPointsValue.textContent = formatInt(Math.floor(state.research.points || 0));
  dom.prestigeValue.textContent = formatInt(state.progression.prestigeLevel || 0);
  dom.objectivesValue.textContent = `${completedObjectives}/${OBJECTIVES.length}`;
  dom.modeLabel.textContent = modeLabel(state.ui.mode);
  dom.toggleAutoSellBtn.textContent = state.autoSellEnabled ? "Auto Tot ON" : "Auto Tot OFF";
  dom.cycleFlowFilterBtn.textContent = `Flux ${flowOption.label}`;
  const nextTech = nextTechnologyToUnlock();
  dom.techUnlockIronBtn.textContent = nextTech
    ? `Tech ${nextTech.label} ${formatInt(nextTech.cost)}$`
    : "Tech OK";

  const inBuyMode =
    state.ui.mode === "build_miner" ||
    state.ui.mode === "build_wood_miner" ||
    state.ui.mode === "build_iron_miner" ||
    state.ui.mode === "build_coal_miner" ||
    state.ui.mode === "build_copper_miner" ||
    state.ui.mode === "build_forge" ||
    state.ui.mode === "build_assembler" ||
    state.ui.mode === "build_pole";
  dom.toolBuyModeBtn.classList.toggle("active", inBuyMode);
  dom.toolCableModeBtn.classList.toggle("active", state.ui.mode === "connect");
  dom.toolCableDeleteModeBtn.classList.toggle("active", state.ui.mode === "disconnect");
  dom.toolInspectModeBtn.classList.toggle("active", state.ui.mode === "inspect");
  dom.buyMinerTypeBtn.classList.toggle("active", state.ui.buyType === "miner");
  dom.buyWoodMinerTypeBtn.classList.toggle("active", state.ui.buyType === "wood_miner");
  dom.buyIronMinerTypeBtn.classList.toggle("active", state.ui.buyType === "iron_miner");
  dom.buyCoalMinerTypeBtn.classList.toggle("active", state.ui.buyType === "coal_miner");
  dom.buyCopperMinerTypeBtn.classList.toggle("active", state.ui.buyType === "copper_miner");
  dom.buyForgeTypeBtn.classList.toggle("active", state.ui.buyType === "forge");
  dom.buyAssemblerTypeBtn.classList.toggle("active", state.ui.buyType === "assembler");
  dom.buyPoleTypeBtn.classList.toggle("active", state.ui.buyType === "pole");

  dom.selectedTypeValue.textContent = selected ? formatNodeType(selected.type) : "-";
  dom.selectedLevelValue.textContent = selected ? formatInt(selected.level) : "-";
  dom.selectedUpgradeCostValue.textContent =
    selectedCost !== null ? `${formatInt(selectedCost)}$` : "-";
  dom.selectedRecipeValue.textContent = selectedRecipe;

  dom.toolUpgradeBtn.disabled = !selected || selectedCost === null || state.money < selectedCost;
  dom.toolRecipeBtn.disabled = !selected || !canChangeRecipe;
  dom.toolDeleteBtn.disabled = !isRemovableNode(selected);
  dom.toolSellBtn.disabled = totalStored < 1;
  dom.techUnlockIronBtn.disabled = !nextTech || state.money < nextTech.cost;
  dom.buyIronMinerTypeBtn.disabled = !state.tech.ironUnlocked;
  dom.buyCoalMinerTypeBtn.disabled = !state.tech.advancedMinesUnlocked;
  dom.buyCopperMinerTypeBtn.disabled = !state.tech.advancedMinesUnlocked;
  dom.buyForgeTypeBtn.disabled = !state.tech.forgeUnlocked;
  dom.buyAssemblerTypeBtn.disabled = !state.tech.assemblerUnlocked;
  dom.sell10Btn.disabled = totalStored < 1;
  dom.sellAllBtn.disabled = totalStored < 1;
  dom.acceptContractBtn.disabled = !state.contract.offer || !!state.contract.active;
  dom.deliverContractBtn.disabled =
    !state.contract.active || !canDeliverToContract(state.contract.active);
  dom.rerollContractBtn.disabled = !!state.contract.active;
  dom.prestigeBtn.disabled = !canPrestigeNow();

  renderContract();
  renderResourcePanel();
  renderResearchTree();
  renderObjectivesPanel();
  renderTutorialOverlay();
  renderGrid(snapshot);
}
