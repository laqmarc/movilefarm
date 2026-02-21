function contractTierLabel(tier) {
  return tier === "premium" ? "Premium" : "Normal";
}

const FLOW_RESOURCE_LABELS = {
  all: "Tot",
  stone: "Pedra",
  wood: "Fusta",
  sand: "Sorra",
  water: "Aigua",
  iron: "Ferro",
  coal: "Carbo",
  copper: "Coure",
  oil: "Petroli",
  aluminum: "Alumini",
  quartz: "Quars",
  sulfur: "Sofre",
  gold: "Or",
  lithium: "Liti",
  parts: "Peces",
  steel: "Acer",
  plates: "Plaques",
  silicon: "Silici",
  plastic: "Plastic",
  steam: "Vapor",
  glass: "Vidre",
  acid: "Acid",
  modules: "Moduls",
  circuits: "Circuits",
  frames: "Bastidors",
  rubber: "Goma",
  wiring: "Cablejat",
  microchips: "Microxips",
  batteries: "Bateries",
  fiber: "Fibra",
  composites: "Compostos",
  superalloy: "Superaliatge",
  quantumchips: "Quantum Xips",
};

function flowResourceLabel(resourceKey) {
  return FLOW_RESOURCE_LABELS[resourceKey] || resourceKey;
}

function flowEdgeLabel(edge, nodeMap) {
  const [aId, bId] = edge.split("|");
  const aNode = nodeMap.get(aId);
  const bNode = nodeMap.get(bId);
  if (!aNode || !bNode) return edge;
  const aLabel = `${tileLabel(aNode)}(${aNode.row + 1},${aNode.col + 1})`;
  const bLabel = `${tileLabel(bNode)}(${bNode.row + 1},${bNode.col + 1})`;
  return `${aLabel}<->${bLabel}`;
}

function renderFlowLegend(flowResource, edgeIntensity, maxIntensity, snapshot) {
  if (!dom.flowLegend) return;

  const entries = [...edgeIntensity.entries()].sort((a, b) => b[1] - a[1]);
  const topEntries = entries.slice(0, 4);
  const totalRate = entries.reduce((sum, [, rate]) => sum + rate, 0);
  const title = flowResource === "all" ? "Flux Total" : `Flux ${flowResourceLabel(flowResource)}`;

  if (topEntries.length < 1 || maxIntensity <= 0) {
    dom.flowLegend.innerHTML = `
      <div class="legend-head"><span>${title}</span><strong>0.0 u/s</strong></div>
      <div class="legend-sub">Sense flux actiu</div>
    `;
    return;
  }

  const rows = topEntries
    .map(([edge, rate]) => {
      const ratio = maxIntensity > 0 ? Math.max(0, Math.min(1, rate / maxIntensity)) : 0;
      const pct = Math.round(ratio * 100);
      const edgeLabel = flowEdgeLabel(edge, snapshot.nodeMap);
      return `
        <div class="legend-row">
          <span class="legend-label">${edgeLabel}</span>
          <strong class="legend-rate">${formatCompact(rate)} u/s</strong>
        </div>
        <div class="legend-bar"><div class="legend-fill" style="width:${pct}%"></div></div>
      `;
    })
    .join("");

  dom.flowLegend.innerHTML = `
    <div class="legend-head"><span>${title}</span><strong>${formatCompact(totalRate)} u/s</strong></div>
    <div class="legend-sub">Top cables</div>
    ${rows}
  `;
}

function renderContract() {
  const { offer, active } = state.contract;
  const labelByKey = {
    stone: "Pedra",
    wood: "Fusta",
    sand: "Sorra",
    water: "Aigua",
    iron: "Ferro",
    coal: "Carbo",
    copper: "Coure",
    oil: "Petroli",
    aluminum: "Alumini",
    quartz: "Quars",
    sulfur: "Sofre",
    gold: "Or",
    lithium: "Liti",
    parts: "Peces",
    steel: "Acer",
    plates: "Plaques",
    silicon: "Silici",
    plastic: "Plastic",
    steam: "Vapor",
    glass: "Vidre",
    acid: "Acid",
    modules: "Moduls",
    circuits: "Circuits",
    frames: "Bastidors",
    rubber: "Goma",
    wiring: "Cablejat",
    microchips: "Microxips",
    batteries: "Bateries",
    fiber: "Fibra",
    composites: "Compostos",
    superalloy: "Superaliatge",
    quantumchips: "Quantum Xips",
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

  const chainRows = (contract) => {
    if (!contract || contract.tier !== "premium") return "";
    const hasLabel = typeof contract.chainLabel === "string" && contract.chainLabel.length > 0;
    const steps = Array.isArray(contract.chainSteps) ? contract.chainSteps : [];
    const rows = [];
    if (hasLabel) {
      rows.push(
        `<div class="contract-line"><span>Cadena</span><strong>${contract.chainLabel}</strong></div>`
      );
    }
    if (steps.length > 0) {
      rows.push(
        `<div class="contract-line"><span>Passos</span><strong>${steps.length}</strong></div>`
      );
      for (const step of steps) {
        rows.push(`<div class="contract-line"><span>- ${step}</span></div>`);
      }
    }
    return rows.join("");
  };

  if (active) {
    const remainingSec = Number.isFinite(active.deadlineAt)
      ? Math.max(0, Math.ceil((active.deadlineAt - Date.now()) / 1000))
      : 0;
    dom.contractOffer.innerHTML = `
      <div class="contract-line"><span>Estat</span><strong>Actiu</strong></div>
      <div class="contract-line"><span>Tipus</span><strong>${contractTierLabel(active.tier)}</strong></div>
      ${chainRows(active)}
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
      ${chainRows(offer)}
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
  if (node.type === "sand_miner") return ["sand"];
  if (node.type === "water_miner") return ["water"];
  if (node.type === "iron_miner") return ["iron"];
  if (node.type === "coal_miner") return ["coal"];
  if (node.type === "copper_miner") return ["copper"];
  if (node.type === "oil_miner") return ["oil"];
  if (node.type === "aluminum_miner") return ["aluminum"];
  if (node.type === "quartz_miner") return ["quartz"];
  if (node.type === "sulfur_miner") return ["sulfur"];
  if (node.type === "gold_miner") return ["gold"];
  if (node.type === "lithium_miner") return ["lithium"];

  const recipe = nodeRecipe(node);
  if (!recipe) return [];
  return Object.keys(recipe.outputs || {});
}

function nodeOutputRatesPerSec(node) {
  if (!node) return {};
  if (node.type === "miner") return { stone: minerRatePerSec(node.level) };
  if (node.type === "wood_miner") return { wood: woodMinerRatePerSec(node.level) };
  if (node.type === "sand_miner") return { sand: sandMinerRatePerSec(node.level) };
  if (node.type === "water_miner") return { water: waterMinerRatePerSec(node.level) };
  if (node.type === "iron_miner") return { iron: ironMinerRatePerSec(node.level) };
  if (node.type === "coal_miner") return { coal: coalMinerRatePerSec(node.level) };
  if (node.type === "copper_miner") return { copper: copperMinerRatePerSec(node.level) };
  if (node.type === "oil_miner") return { oil: oilMinerRatePerSec(node.level) };
  if (node.type === "aluminum_miner") return { aluminum: aluminumMinerRatePerSec(node.level) };
  if (node.type === "quartz_miner") return { quartz: quartzMinerRatePerSec(node.level) };
  if (node.type === "sulfur_miner") return { sulfur: sulfurMinerRatePerSec(node.level) };
  if (node.type === "gold_miner") return { gold: goldMinerRatePerSec(node.level) };
  if (node.type === "lithium_miner") return { lithium: lithiumMinerRatePerSec(node.level) };

  const cfg = processorConfig(node);
  const recipe = nodeRecipe(node);
  if (!cfg || !recipe) return {};

  const scalePerSec = cfg.ratePerSec(node.level);
  const out = {};
  for (const [resourceKey, amountPerScale] of Object.entries(recipe.outputs || {})) {
    out[resourceKey] = amountPerScale * scalePerSec;
  }
  return out;
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
  const totalByEdge = new Map();
  const warehouse = snapshot.warehouseNode;
  if (!warehouse) {
    return { byResource: map, totalByEdge };
  }

  const adjacency = buildAdjacency();
  for (const node of state.nodes) {
    if (node.id === warehouse.id) continue;
    if (!snapshot.reachableFromWarehouse.has(node.id)) continue;

    const outputs = nodeOutputRatesPerSec(node);
    const outputEntries = Object.entries(outputs).filter(([, rate]) => rate > 0);
    if (outputEntries.length < 1) continue;

    const pathEdges = shortestPathEdgeKeys(node.id, warehouse.id, adjacency);
    if (pathEdges.length < 1) continue;

    for (const [resourceKey, ratePerSec] of outputEntries) {
      if (!map.has(resourceKey)) {
        map.set(resourceKey, new Map());
      }
      const edgeFlow = map.get(resourceKey);
      for (const edge of pathEdges) {
        edgeFlow.set(edge, (edgeFlow.get(edge) || 0) + ratePerSec);
        totalByEdge.set(edge, (totalByEdge.get(edge) || 0) + ratePerSec);
      }
    }
  }

  return { byResource: map, totalByEdge };
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
  const flowIntensity = buildFlowEdgesByResource(snapshot);
  const edgeIntensity =
    flowResource === "all"
      ? flowIntensity.totalByEdge
      : flowIntensity.byResource.get(flowResource) || new Map();
  const maxIntensity = Math.max(0, ...edgeIntensity.values());

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
    const intensity = edgeIntensity.get(cable) || 0;
    const ratio = maxIntensity > 0 ? intensity / maxIntensity : 0;

    const classList = ["cable-line"];
    if (active) classList.push("active");
    let widthPx = active ? 4.8 : 4.2;
    let opacity = active ? 0.95 : 0.62;

    if (flowResource !== "all") {
      if (intensity > 0) {
        classList.push("flow-match", `flow-${flowResource}`);
        widthPx = 4.8 + ratio * 5.4;
        opacity = 0.5 + ratio * 0.5;
      } else {
        classList.push("flow-faded");
        widthPx = 3.4;
        opacity = 0.15;
      }
    } else if (maxIntensity > 0) {
      widthPx = (active ? 4.4 : 3.8) + ratio * 4.2;
      opacity = active ? 0.45 + ratio * 0.55 : 0.26 + ratio * 0.38;
    }

    lines.push(
      `<line class="${classList.join(" ")}" style="stroke-width:${widthPx.toFixed(2)}px;opacity:${opacity.toFixed(2)};" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`
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
  renderFlowLegend(flowResource, edgeIntensity, maxIntensity, snapshot);
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
  const prestigeLevel = state.progression.prestigeLevel || 0;
  const nextPrestigeBonusPct = Math.round((1 + (prestigeLevel + 1) * 0.12 - 1) * 100);
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
  dom.sandMinerCostValue.textContent = `${formatInt(sandMinerPlacementCost())}$`;
  dom.waterMinerCostValue.textContent = `${formatInt(waterMinerPlacementCost())}$`;
  dom.ironMinerCostValue.textContent = state.tech.ironUnlocked
    ? `${formatInt(ironMinerPlacementCost())}$`
    : "Bloc";
  dom.coalMinerCostValue.textContent = state.tech.advancedMinesUnlocked
    ? `${formatInt(coalMinerPlacementCost())}$`
    : "Bloc";
  dom.copperMinerCostValue.textContent = state.tech.advancedMinesUnlocked
    ? `${formatInt(copperMinerPlacementCost())}$`
    : "Bloc";
  dom.oilMinerCostValue.textContent = state.tech.advancedMinesUnlocked
    ? `${formatInt(oilMinerPlacementCost())}$`
    : "Bloc";
  dom.aluminumMinerCostValue.textContent = state.tech.advancedMinesUnlocked
    ? `${formatInt(aluminumMinerPlacementCost())}$`
    : "Bloc";
  dom.sulfurMinerCostValue.textContent = state.tech.materialsUnlocked
    ? `${formatInt(sulfurMinerPlacementCost())}$`
    : "Bloc";
  dom.goldMinerCostValue.textContent = state.tech.endgameUnlocked
    ? `${formatInt(goldMinerPlacementCost())}$`
    : "Bloc";
  dom.lithiumMinerCostValue.textContent = state.tech.endgameUnlocked
    ? `${formatInt(lithiumMinerPlacementCost())}$`
    : "Bloc";
  dom.quartzMinerCostValue.textContent = state.tech.materialsUnlocked
    ? `${formatInt(quartzMinerPlacementCost())}$`
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
  dom.prestigeValue.textContent = formatInt(prestigeLevel);
  dom.objectivesValue.textContent = `${completedObjectives}/${OBJECTIVES.length}`;
  dom.modeLabel.textContent = modeLabel(state.ui.mode);
  dom.toggleAutoSellBtn.textContent = state.autoSellEnabled ? "Auto Tot ON" : "Auto Tot OFF";
  dom.cycleFlowFilterBtn.textContent = `Flux ${flowOption.label}`;
  dom.prestigeBtn.textContent = `Prestigi +1 (${nextPrestigeBonusPct}%)`;
  const nextTech = nextTechnologyToUnlock();
  dom.techUnlockIronBtn.textContent = nextTech
    ? `Tech ${nextTech.label} ${formatInt(nextTech.cost)}$`
    : "Tech OK";

  const inBuyMode =
    state.ui.mode === "build_miner" ||
    state.ui.mode === "build_wood_miner" ||
    state.ui.mode === "build_sand_miner" ||
    state.ui.mode === "build_water_miner" ||
    state.ui.mode === "build_iron_miner" ||
    state.ui.mode === "build_coal_miner" ||
    state.ui.mode === "build_copper_miner" ||
    state.ui.mode === "build_oil_miner" ||
    state.ui.mode === "build_aluminum_miner" ||
    state.ui.mode === "build_quartz_miner" ||
    state.ui.mode === "build_sulfur_miner" ||
    state.ui.mode === "build_gold_miner" ||
    state.ui.mode === "build_lithium_miner" ||
    state.ui.mode === "build_forge" ||
    state.ui.mode === "build_assembler" ||
    state.ui.mode === "build_pole";
  dom.toolBuyModeBtn.classList.toggle("active", inBuyMode);
  dom.toolCableModeBtn.classList.toggle("active", state.ui.mode === "connect");
  dom.toolCableDeleteModeBtn.classList.toggle("active", state.ui.mode === "disconnect");
  dom.toolInspectModeBtn.classList.toggle("active", state.ui.mode === "inspect");
  if (dom.toolRecipeListBtn) {
    dom.toolRecipeListBtn.classList.toggle("active", state.ui.recipePanelOpen);
  }
  dom.buyMinerTypeBtn.classList.toggle("active", state.ui.buyType === "miner");
  dom.buyWoodMinerTypeBtn.classList.toggle("active", state.ui.buyType === "wood_miner");
  dom.buySandMinerTypeBtn.classList.toggle("active", state.ui.buyType === "sand_miner");
  dom.buyWaterMinerTypeBtn.classList.toggle("active", state.ui.buyType === "water_miner");
  dom.buyIronMinerTypeBtn.classList.toggle("active", state.ui.buyType === "iron_miner");
  dom.buyCoalMinerTypeBtn.classList.toggle("active", state.ui.buyType === "coal_miner");
  dom.buyCopperMinerTypeBtn.classList.toggle("active", state.ui.buyType === "copper_miner");
  dom.buyOilMinerTypeBtn.classList.toggle("active", state.ui.buyType === "oil_miner");
  dom.buyAluminumMinerTypeBtn.classList.toggle("active", state.ui.buyType === "aluminum_miner");
  dom.buyQuartzMinerTypeBtn.classList.toggle("active", state.ui.buyType === "quartz_miner");
  dom.buySulfurMinerTypeBtn.classList.toggle("active", state.ui.buyType === "sulfur_miner");
  dom.buyGoldMinerTypeBtn.classList.toggle("active", state.ui.buyType === "gold_miner");
  dom.buyLithiumMinerTypeBtn.classList.toggle("active", state.ui.buyType === "lithium_miner");
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
  if (dom.toolRecipeListBtn) {
    dom.toolRecipeListBtn.disabled = false;
  }
  dom.toolDeleteBtn.disabled = !isRemovableNode(selected);
  dom.toolSellBtn.disabled = totalStored < 1;
  dom.techUnlockIronBtn.disabled = !nextTech || state.money < nextTech.cost;
  dom.buyIronMinerTypeBtn.disabled = !state.tech.ironUnlocked;
  dom.buyCoalMinerTypeBtn.disabled = !state.tech.advancedMinesUnlocked;
  dom.buyCopperMinerTypeBtn.disabled = !state.tech.advancedMinesUnlocked;
  dom.buyOilMinerTypeBtn.disabled = !state.tech.advancedMinesUnlocked;
  dom.buyAluminumMinerTypeBtn.disabled = !state.tech.advancedMinesUnlocked;
  dom.buyQuartzMinerTypeBtn.disabled = !state.tech.materialsUnlocked;
  dom.buySulfurMinerTypeBtn.disabled = !state.tech.materialsUnlocked;
  dom.buyGoldMinerTypeBtn.disabled = !state.tech.endgameUnlocked;
  dom.buyLithiumMinerTypeBtn.disabled = !state.tech.endgameUnlocked;
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
  renderRecipePanel();
  renderResearchTree();
  renderObjectivesPanel();
  renderTutorialOverlay();
  renderGrid(snapshot);
}
