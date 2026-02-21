function resetDrag() {
  state.ui.drag.active = false;
  state.ui.drag.sourceId = null;
  state.ui.drag.pointerX = 0;
  state.ui.drag.pointerY = 0;
  state.ui.drag.hoverCellKey = null;
  state.ui.drag.snapTargetId = null;
}

function resetPointerState() {
  pointerState.activePointerId = null;
  pointerState.points.clear();
  pointerState.pointerDown = false;
  pointerState.panActive = false;
  pointerState.moved = false;
  pointerState.pinchActive = false;
  pointerState.startX = 0;
  pointerState.startY = 0;
  pointerState.startCameraX = state.camera.x;
  pointerState.startCameraY = state.camera.y;
  pointerState.pinchStartDistance = 0;
  pointerState.pinchStartZoom = state.camera.zoom;
  pointerState.pinchAnchorWorldX = 0;
  pointerState.pinchAnchorWorldY = 0;
}

function setMode(mode) {
  state.ui.mode = mode;
  state.ui.pendingSourceId = null;
  resetDrag();
}

function setBuildType(type) {
  if (type === "iron_miner" && !state.tech.ironUnlocked) {
    showToast("Desbloqueja ferro a Tech");
    return;
  }

  if (
    (
      type === "coal_miner" ||
      type === "copper_miner" ||
      type === "oil_miner" ||
      type === "aluminum_miner"
    ) &&
    !state.tech.advancedMinesUnlocked
  ) {
    showToast("Desbloqueja mines avancades");
    return;
  }

  if ((type === "quartz_miner" || type === "sulfur_miner") && !state.tech.materialsUnlocked) {
    showToast("Desbloqueja tecnologia Materials");
    return;
  }

  if ((type === "gold_miner" || type === "lithium_miner") && !state.tech.endgameUnlocked) {
    showToast("Desbloqueja tecnologia Endgame");
    return;
  }

  if (type === "forge" && !state.tech.forgeUnlocked) {
    showToast("Desbloqueja farga a Tech");
    return;
  }

  if (type === "assembler" && !state.tech.assemblerUnlocked) {
    showToast("Desbloqueja assembler a Tech");
    return;
  }

  state.ui.buyType = type;
  if (
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
    state.ui.mode === "build_pole"
  ) {
    if (type === "pole") setMode("build_pole");
    else if (type === "assembler") setMode("build_assembler");
    else if (type === "forge") setMode("build_forge");
    else if (type === "aluminum_miner") setMode("build_aluminum_miner");
    else if (type === "quartz_miner") setMode("build_quartz_miner");
    else if (type === "sulfur_miner") setMode("build_sulfur_miner");
    else if (type === "gold_miner") setMode("build_gold_miner");
    else if (type === "lithium_miner") setMode("build_lithium_miner");
    else if (type === "oil_miner") setMode("build_oil_miner");
    else if (type === "copper_miner") setMode("build_copper_miner");
    else if (type === "coal_miner") setMode("build_coal_miner");
    else if (type === "water_miner") setMode("build_water_miner");
    else if (type === "sand_miner") setMode("build_sand_miner");
    else if (type === "wood_miner") setMode("build_wood_miner");
    else if (type === "iron_miner") setMode("build_iron_miner");
    else setMode("build_miner");
  }
}

function enterBuyMode() {
  if (state.ui.buyType === "pole") {
    setMode("build_pole");
    return;
  }

  if (state.ui.buyType === "wood_miner") {
    setMode("build_wood_miner");
    return;
  }

  if (state.ui.buyType === "sand_miner") {
    setMode("build_sand_miner");
    return;
  }

  if (state.ui.buyType === "water_miner") {
    setMode("build_water_miner");
    return;
  }

  if (state.ui.buyType === "assembler" && state.tech.assemblerUnlocked) {
    setMode("build_assembler");
    return;
  }

  if (state.ui.buyType === "forge" && state.tech.forgeUnlocked) {
    setMode("build_forge");
    return;
  }

  if (state.ui.buyType === "copper_miner" && state.tech.advancedMinesUnlocked) {
    setMode("build_copper_miner");
    return;
  }

  if (state.ui.buyType === "oil_miner" && state.tech.advancedMinesUnlocked) {
    setMode("build_oil_miner");
    return;
  }

  if (state.ui.buyType === "aluminum_miner" && state.tech.advancedMinesUnlocked) {
    setMode("build_aluminum_miner");
    return;
  }

  if (state.ui.buyType === "quartz_miner" && state.tech.materialsUnlocked) {
    setMode("build_quartz_miner");
    return;
  }

  if (state.ui.buyType === "sulfur_miner" && state.tech.materialsUnlocked) {
    setMode("build_sulfur_miner");
    return;
  }

  if (state.ui.buyType === "gold_miner" && state.tech.endgameUnlocked) {
    setMode("build_gold_miner");
    return;
  }

  if (state.ui.buyType === "lithium_miner" && state.tech.endgameUnlocked) {
    setMode("build_lithium_miner");
    return;
  }

  if (state.ui.buyType === "coal_miner" && state.tech.advancedMinesUnlocked) {
    setMode("build_coal_miner");
    return;
  }

  if (state.ui.buyType === "iron_miner" && state.tech.ironUnlocked) {
    setMode("build_iron_miner");
    return;
  }

  setMode("build_miner");
}

function placeNode(type, row, col) {
  if (getNodeAt(row, col)) {
    showToast("La cel.la ja esta ocupada");
    return;
  }

  if (type === "miner") {
    const cost = minerPlacementCost();
    if (!spendMoney(cost)) {
      showToast("No tens prou diners");
      return;
    }

    const id = `miner-${state.nextMinerId}`;
    state.nextMinerId += 1;
    state.nodes.push({ id, type: "miner", row, col, level: 1, fixed: false });
    state.progression.nodesBuilt += 1;
    state.ui.selectedNodeId = id;
    showToast("Pedra colocada");
    return;
  }

  if (type === "wood_miner") {
    const cost = woodMinerPlacementCost();
    if (!spendMoney(cost)) {
      showToast("No tens prou diners");
      return;
    }

    const id = `wood-miner-${state.nextWoodMinerId}`;
    state.nextWoodMinerId += 1;
    state.nodes.push({ id, type: "wood_miner", row, col, level: 1, fixed: false });
    state.progression.nodesBuilt += 1;
    state.ui.selectedNodeId = id;
    showToast("Miner fusta colocat");
    return;
  }

  if (type === "sand_miner") {
    const cost = sandMinerPlacementCost();
    if (!spendMoney(cost)) {
      showToast("No tens prou diners");
      return;
    }

    const id = `sand-miner-${state.nextSandMinerId}`;
    state.nextSandMinerId += 1;
    state.nodes.push({ id, type: "sand_miner", row, col, level: 1, fixed: false });
    state.progression.nodesBuilt += 1;
    state.ui.selectedNodeId = id;
    showToast("Miner sorra colocat");
    return;
  }

  if (type === "water_miner") {
    const cost = waterMinerPlacementCost();
    if (!spendMoney(cost)) {
      showToast("No tens prou diners");
      return;
    }

    const id = `water-miner-${state.nextWaterMinerId}`;
    state.nextWaterMinerId += 1;
    state.nodes.push({ id, type: "water_miner", row, col, level: 1, fixed: false });
    state.progression.nodesBuilt += 1;
    state.ui.selectedNodeId = id;
    showToast("Extractor aigua colocat");
    return;
  }

  if (type === "iron_miner") {
    if (!state.tech.ironUnlocked) {
      showToast("Ferro no desbloquejat");
      return;
    }

    const cost = ironMinerPlacementCost();
    if (!spendMoney(cost)) {
      showToast("No tens prou diners");
      return;
    }

    const id = `iron-miner-${state.nextIronMinerId}`;
    state.nextIronMinerId += 1;
    state.nodes.push({ id, type: "iron_miner", row, col, level: 1, fixed: false });
    state.progression.nodesBuilt += 1;
    state.ui.selectedNodeId = id;
    showToast("Miner ferro colocat");
    return;
  }

  if (type === "coal_miner") {
    if (!state.tech.advancedMinesUnlocked) {
      showToast("Mines avancades no desbloquejades");
      return;
    }

    const cost = coalMinerPlacementCost();
    if (!spendMoney(cost)) {
      showToast("No tens prou diners");
      return;
    }

    const id = `coal-miner-${state.nextCoalMinerId}`;
    state.nextCoalMinerId += 1;
    state.nodes.push({ id, type: "coal_miner", row, col, level: 1, fixed: false });
    state.progression.nodesBuilt += 1;
    state.ui.selectedNodeId = id;
    showToast("Miner carbo colocat");
    return;
  }

  if (type === "copper_miner") {
    if (!state.tech.advancedMinesUnlocked) {
      showToast("Mines avancades no desbloquejades");
      return;
    }

    const cost = copperMinerPlacementCost();
    if (!spendMoney(cost)) {
      showToast("No tens prou diners");
      return;
    }

    const id = `copper-miner-${state.nextCopperMinerId}`;
    state.nextCopperMinerId += 1;
    state.nodes.push({ id, type: "copper_miner", row, col, level: 1, fixed: false });
    state.progression.nodesBuilt += 1;
    state.ui.selectedNodeId = id;
    showToast("Miner coure colocat");
    return;
  }

  if (type === "oil_miner") {
    if (!state.tech.advancedMinesUnlocked) {
      showToast("Mines avancades no desbloquejades");
      return;
    }

    const cost = oilMinerPlacementCost();
    if (!spendMoney(cost)) {
      showToast("No tens prou diners");
      return;
    }

    const id = `oil-miner-${state.nextOilMinerId}`;
    state.nextOilMinerId += 1;
    state.nodes.push({ id, type: "oil_miner", row, col, level: 1, fixed: false });
    state.progression.nodesBuilt += 1;
    state.ui.selectedNodeId = id;
    showToast("Pou petroli colocat");
    return;
  }

  if (type === "aluminum_miner") {
    if (!state.tech.advancedMinesUnlocked) {
      showToast("Mines avancades no desbloquejades");
      return;
    }

    const cost = aluminumMinerPlacementCost();
    if (!spendMoney(cost)) {
      showToast("No tens prou diners");
      return;
    }

    const id = `aluminum-miner-${state.nextAluminumMinerId}`;
    state.nextAluminumMinerId += 1;
    state.nodes.push({ id, type: "aluminum_miner", row, col, level: 1, fixed: false });
    state.progression.nodesBuilt += 1;
    state.ui.selectedNodeId = id;
    showToast("Miner alumini colocat");
    return;
  }

  if (type === "quartz_miner") {
    if (!state.tech.materialsUnlocked) {
      showToast("Materials no desbloquejats");
      return;
    }

    const cost = quartzMinerPlacementCost();
    if (!spendMoney(cost)) {
      showToast("No tens prou diners");
      return;
    }

    const id = `quartz-miner-${state.nextQuartzMinerId}`;
    state.nextQuartzMinerId += 1;
    state.nodes.push({ id, type: "quartz_miner", row, col, level: 1, fixed: false });
    state.progression.nodesBuilt += 1;
    state.ui.selectedNodeId = id;
    showToast("Miner quars colocat");
    return;
  }

  if (type === "sulfur_miner") {
    if (!state.tech.materialsUnlocked) {
      showToast("Materials no desbloquejats");
      return;
    }

    const cost = sulfurMinerPlacementCost();
    if (!spendMoney(cost)) {
      showToast("No tens prou diners");
      return;
    }

    const id = `sulfur-miner-${state.nextSulfurMinerId}`;
    state.nextSulfurMinerId += 1;
    state.nodes.push({ id, type: "sulfur_miner", row, col, level: 1, fixed: false });
    state.progression.nodesBuilt += 1;
    state.ui.selectedNodeId = id;
    showToast("Miner sofre colocat");
    return;
  }

  if (type === "gold_miner") {
    if (!state.tech.endgameUnlocked) {
      showToast("Endgame no desbloquejat");
      return;
    }

    const cost = goldMinerPlacementCost();
    if (!spendMoney(cost)) {
      showToast("No tens prou diners");
      return;
    }

    const id = `gold-miner-${state.nextGoldMinerId}`;
    state.nextGoldMinerId += 1;
    state.nodes.push({ id, type: "gold_miner", row, col, level: 1, fixed: false });
    state.progression.nodesBuilt += 1;
    state.ui.selectedNodeId = id;
    showToast("Miner or colocat");
    return;
  }

  if (type === "lithium_miner") {
    if (!state.tech.endgameUnlocked) {
      showToast("Endgame no desbloquejat");
      return;
    }

    const cost = lithiumMinerPlacementCost();
    if (!spendMoney(cost)) {
      showToast("No tens prou diners");
      return;
    }

    const id = `lithium-miner-${state.nextLithiumMinerId}`;
    state.nextLithiumMinerId += 1;
    state.nodes.push({ id, type: "lithium_miner", row, col, level: 1, fixed: false });
    state.progression.nodesBuilt += 1;
    state.ui.selectedNodeId = id;
    showToast("Miner liti colocat");
    return;
  }

  if (type === "forge") {
    if (!state.tech.forgeUnlocked) {
      showToast("Farga no desbloquejada");
      return;
    }

    const cost = forgePlacementCost();
    if (!spendMoney(cost)) {
      showToast("No tens prou diners");
      return;
    }

    const id = `forge-${state.nextForgeId}`;
    state.nextForgeId += 1;
    state.nodes.push({
      id,
      type: "forge",
      row,
      col,
      level: 1,
      recipeId: PROCESSOR_NODE_TYPES.forge.defaultRecipeId,
      fixed: false,
    });
    state.progression.nodesBuilt += 1;
    state.ui.selectedNodeId = id;
    showToast("Farga colocada");
    return;
  }

  if (type === "assembler") {
    if (!state.tech.assemblerUnlocked) {
      showToast("Assembler no desbloquejat");
      return;
    }

    const cost = assemblerPlacementCost();
    if (!spendMoney(cost)) {
      showToast("No tens prou diners");
      return;
    }

    const id = `assembler-${state.nextAssemblerId}`;
    state.nextAssemblerId += 1;
    state.nodes.push({
      id,
      type: "assembler",
      row,
      col,
      level: 1,
      recipeId: PROCESSOR_NODE_TYPES.assembler.defaultRecipeId,
      fixed: false,
    });
    state.progression.nodesBuilt += 1;
    state.ui.selectedNodeId = id;
    showToast("Assembler colocat");
    return;
  }

  if (type === "pole") {
    const cost = polePlacementCost();
    if (!spendMoney(cost)) {
      showToast("No tens prou diners");
      return;
    }

    const id = `pole-${state.nextPoleId}`;
    state.nextPoleId += 1;
    state.nodes.push({ id, type: "pole", row, col, level: 1, fixed: false });
    state.progression.nodesBuilt += 1;
    state.ui.selectedNodeId = id;
    showToast("Connector colocat");
  }
}

function canCreateCable(source, target) {
  const distance = distanceBetweenNodes(source, target);
  if (distance > cableMaxDistance()) {
    showToast("Cable massa llarg");
    return false;
  }

  if (!spendMoney(CONFIG.cableCost)) {
    showToast("No tens prou diners per cable");
    return false;
  }

  return true;
}

function addCableBetween(aId, bId) {
  if (aId === bId) return;

  const source = getNodeById(aId);
  const target = getNodeById(bId);
  if (!source || !target) return;

  const key = edgeKey(aId, bId);
  const idx = state.cables.indexOf(key);

  if (idx >= 0) {
    showToast("Ja estan connectats");
    return;
  }

  if (!canCreateCable(source, target)) {
    return;
  }

  state.cables.push(key);
  state.progression.cablesBuilt += 1;
  showToast(`Cable +${CONFIG.cableCost}$`);
}

function removeCableBetween(aId, bId) {
  if (aId === bId) return;

  const key = edgeKey(aId, bId);
  const idx = state.cables.indexOf(key);
  if (idx < 0) {
    showToast("No hi ha cable");
    return;
  }

  state.cables.splice(idx, 1);
  showToast("Cable eliminat");
}

function applyCableAction(aId, bId) {
  if (state.ui.mode === "disconnect") {
    removeCableBetween(aId, bId);
    return;
  }
  addCableBetween(aId, bId);
}

function onGridTap(row, col) {
  const node = getNodeAt(row, col);

  if (state.ui.mode === "build_miner") {
    placeNode("miner", row, col);
    render();
    return;
  }

  if (state.ui.mode === "build_wood_miner") {
    placeNode("wood_miner", row, col);
    render();
    return;
  }

  if (state.ui.mode === "build_sand_miner") {
    placeNode("sand_miner", row, col);
    render();
    return;
  }

  if (state.ui.mode === "build_water_miner") {
    placeNode("water_miner", row, col);
    render();
    return;
  }

  if (state.ui.mode === "build_iron_miner") {
    placeNode("iron_miner", row, col);
    render();
    return;
  }

  if (state.ui.mode === "build_coal_miner") {
    placeNode("coal_miner", row, col);
    render();
    return;
  }

  if (state.ui.mode === "build_copper_miner") {
    placeNode("copper_miner", row, col);
    render();
    return;
  }

  if (state.ui.mode === "build_oil_miner") {
    placeNode("oil_miner", row, col);
    render();
    return;
  }

  if (state.ui.mode === "build_aluminum_miner") {
    placeNode("aluminum_miner", row, col);
    render();
    return;
  }

  if (state.ui.mode === "build_quartz_miner") {
    placeNode("quartz_miner", row, col);
    render();
    return;
  }

  if (state.ui.mode === "build_sulfur_miner") {
    placeNode("sulfur_miner", row, col);
    render();
    return;
  }

  if (state.ui.mode === "build_gold_miner") {
    placeNode("gold_miner", row, col);
    render();
    return;
  }

  if (state.ui.mode === "build_lithium_miner") {
    placeNode("lithium_miner", row, col);
    render();
    return;
  }

  if (state.ui.mode === "build_forge") {
    placeNode("forge", row, col);
    render();
    return;
  }

  if (state.ui.mode === "build_assembler") {
    placeNode("assembler", row, col);
    render();
    return;
  }

  if (state.ui.mode === "build_pole") {
    placeNode("pole", row, col);
    render();
    return;
  }

  if (state.ui.mode === "connect" || state.ui.mode === "disconnect") {
    if (!node) {
      return;
    }

    if (!state.ui.pendingSourceId) {
      state.ui.pendingSourceId = node.id;
      state.ui.selectedNodeId = node.id;
      showToast("Origen seleccionat");
      render();
      return;
    }

    if (state.ui.pendingSourceId === node.id) {
      state.ui.pendingSourceId = null;
      showToast("Origen netejat");
      render();
      return;
    }

    applyCableAction(state.ui.pendingSourceId, node.id);
    state.ui.selectedNodeId = node.id;
    state.ui.pendingSourceId = node.id;
    render();
    return;
  }

  state.ui.selectedNodeId = node ? node.id : null;
  state.ui.pendingSourceId = null;
  render();
}

function selectedNode() {
  return getNodeById(state.ui.selectedNodeId);
}

function resetPersistence() {
  const confirmed = window.confirm("Vols reiniciar la partida i esborrar el guardat?");
  if (!confirmed) return;

  localStorage.removeItem(SAVE_KEY);
  state = createDefaultState();
  lastTick = performance.now();
  elapsedSinceSave = 0;
  resetPointerState();
  resetDrag();
  showToast("Partida reiniciada");
  render();
}

function flowFilterOptions() {
  const options = [{ key: "all", label: "Tot" }];
  for (const res of unlockedResources()) {
    options.push({ key: res.key, label: res.label });
  }
  return options;
}

function cycleFlowFilter() {
  const options = flowFilterOptions();
  const keys = options.map((item) => item.key);
  const currentIdx = keys.indexOf(state.ui.flowResource);
  const nextIdx = currentIdx < 0 ? 0 : (currentIdx + 1) % keys.length;
  state.ui.flowResource = keys[nextIdx];
  render();
}

function canUnlockResearch(node) {
  if (!node) return false;
  if (hasResearch(node.id)) return false;
  if (state.research.points < node.cost) return false;
  return node.prereqs.every((id) => hasResearch(id));
}

function unlockResearch(nodeId) {
  const node = researchNodeById(nodeId);
  if (!node) return;

  if (hasResearch(node.id)) {
    showToast("Recerca ja desbloquejada");
    return;
  }

  const missing = node.prereqs.filter((id) => !hasResearch(id));
  if (missing.length > 0) {
    showToast("Falten prerequisits");
    return;
  }

  if (state.research.points < node.cost) {
    showToast("Falten punts de recerca");
    return;
  }

  state.research.points -= node.cost;
  state.research.unlocked[node.id] = true;

  if (node.id === "rs_premium_contracts" && !state.contract.active) {
    nextContractOffer();
  }

  showToast(`Recerca: ${node.name}`);
  render();
}

function objectiveProgress(objective) {
  const produced = state.progression.produced || {};
  if (objective.kind === "stock") {
    return totalStoredResources();
  }
  if (objective.kind === "sold_units") {
    return state.progression.totalSoldUnits || 0;
  }
  if (objective.kind === "unlock_forge") {
    return state.tech.forgeUnlocked ? 1 : 0;
  }
  if (objective.kind === "research_count") {
    return unlockedResearchCount();
  }
  if (objective.kind === "contracts_done") {
    return state.progression.contractsCompleted || 0;
  }
  if (objective.kind === "produced_modules") {
    return produced.modules || 0;
  }
  if (objective.kind === "produced_circuits") {
    return produced.circuits || 0;
  }
  if (objective.kind === "money_earned") {
    return state.progression.totalMoneyEarned || 0;
  }
  return 0;
}

function completedObjectivesCount() {
  return Object.values(state.progression.objectivesCompleted || {}).filter(Boolean).length;
}

function objectiveRewardText(reward) {
  const safe = reward || {};
  const parts = [];
  const rp = Math.max(0, Math.floor(Number(safe.rp) || 0));
  const money = Math.max(0, Math.floor(Number(safe.money) || 0));
  if (rp > 0) parts.push(`+${formatInt(rp)} RP`);
  if (money > 0) parts.push(`+${formatInt(money)}$`);

  const buffs = Array.isArray(safe.buffs) ? safe.buffs : [];
  for (const buff of buffs) {
    const key = typeof buff?.key === "string" ? buff.key : "";
    const seconds = Math.max(1, Math.floor(Number(buff?.seconds) || 0));
    const meta = buffDefinition(key);
    if (!meta) continue;
    parts.push(`${meta.label} ${seconds}s`);
  }

  if (parts.length < 1) {
    return "+12 RP";
  }
  return parts.join(" | ");
}

function grantObjectiveReward(reward) {
  const safe = reward || {};
  const granted = {
    rp: 0,
    money: 0,
    buffs: [],
  };

  const rp = Math.max(0, Math.floor(Number(safe.rp) || 0));
  const money = Math.max(0, Math.floor(Number(safe.money) || 0));
  if (rp > 0) {
    state.research.points += rp;
    granted.rp += rp;
  }
  if (money > 0) {
    state.money += money;
    state.progression.totalMoneyEarned += money;
    granted.money += money;
  }

  const buffs = Array.isArray(safe.buffs) ? safe.buffs : [];
  const now = Date.now();
  for (const buff of buffs) {
    const key = typeof buff?.key === "string" ? buff.key : "";
    const seconds = Math.max(1, Math.floor(Number(buff?.seconds) || 0));
    const meta = buffDefinition(key);
    if (!meta) continue;
    const currentEndAt = buffEndAt(key);
    const nextEndAt = now + seconds * 1000;
    buffState()[key] = Math.max(currentEndAt, nextEndAt);
    granted.buffs.push({ key, seconds });
  }

  if (granted.rp < 1 && granted.money < 1 && granted.buffs.length < 1) {
    state.research.points += 12;
    granted.rp = 12;
  }

  return granted;
}

function updateObjectivesProgress() {
  let newlyCompleted = 0;
  let totalRp = 0;
  let totalMoney = 0;
  const buffSummary = new Map();

  for (const objective of OBJECTIVES) {
    if (state.progression.objectivesCompleted[objective.id]) continue;
    const current = objectiveProgress(objective);
    if (current < objective.target) continue;
    state.progression.objectivesCompleted[objective.id] = true;
    newlyCompleted += 1;
    const granted = grantObjectiveReward(objective.reward);
    totalRp += granted.rp;
    totalMoney += granted.money;
    for (const buff of granted.buffs) {
      buffSummary.set(buff.key, Math.max(buffSummary.get(buff.key) || 0, buff.seconds));
    }
  }

  if (newlyCompleted > 0) {
    const parts = [`Objectiu x${newlyCompleted}`];
    if (totalRp > 0) parts.push(`+${formatInt(totalRp)} RP`);
    if (totalMoney > 0) parts.push(`+${formatInt(totalMoney)}$`);
    for (const [key, sec] of buffSummary.entries()) {
      const meta = buffDefinition(key);
      if (!meta) continue;
      parts.push(`${meta.label} ${sec}s`);
    }
    showToast(parts.join(" | "));
  }
}

function canPrestigeNow() {
  return completedObjectivesCount() >= 5 && (state.progression.totalMoneyEarned || 0) >= 5000;
}

function prestigeReset() {
  if (!canPrestigeNow()) {
    showToast("Completa mes objectius per fer prestigi");
    return;
  }

  const nextLevel = (state.progression.prestigeLevel || 0) + 1;
  const previousTutorialDone = !!state.tutorial.completed;
  const previousTutorialDismissed = !!state.tutorial.dismissed;
  const confirmed = window.confirm(`Fer prestigi i reiniciar mapa? Bonus produccio +${Math.round(nextLevel * 12)}%`);
  if (!confirmed) return;

  localStorage.removeItem(SAVE_KEY);
  state = createDefaultState();
  state.progression.prestigeLevel = nextLevel;
  state.progression.prestigeCount = nextLevel;
  state.tutorial.completed = previousTutorialDone;
  state.tutorial.dismissed = previousTutorialDismissed;
  state.tutorial.step = previousTutorialDone ? 999 : 0;
  nextContractOffer();
  resetPointerState();
  resetDrag();
  lastTick = performance.now();
  elapsedSinceSave = 0;
  showToast(`Prestigi ${nextLevel} aplicat`);
  render();
}

function tutorialStepData(step) {
  const steps = [
    {
      title: "Tutorial 1/10",
      body: "Navega el mapa amb 1 dit i fes zoom amb 2 dits (pinch). Quan ho tinguis clar, prem Seguent.",
      manual: true,
      done: false,
    },
    {
      title: "Tutorial 2/10",
      body: "En mode compra ($), col.loca una altra maquina de Pedra a la graella.",
      manual: false,
      done: () => minerNodes().length >= 2,
    },
    {
      title: "Tutorial 3/10",
      body: "Connecta maquines i magatzem amb Cables. Si t'equivoques, usa Tallar.",
      manual: false,
      done: () => state.cables.length >= 2,
    },
    {
      title: "Tutorial 4/10",
      body: "Ven produccio al mercat amb Tot o +10u fins arribar a 20 unitats venudes.",
      manual: false,
      done: () => (state.progression.totalSoldUnits || 0) >= 20,
    },
    {
      title: "Tutorial 5/10",
      body: "Compra la teva primera maquina de Fusta per ampliar la cadena de recursos.",
      manual: false,
      done: () => woodMinerNodes().length >= 1,
    },
    {
      title: "Tutorial 6/10",
      body: "Obre Recursos o Receptes des de la barra superior per consultar l'estat de la fabrica.",
      manual: false,
      done: () => state.ui.resourcePanelOpen || state.ui.recipePanelOpen,
    },
    {
      title: "Tutorial 7/10",
      body: "Desbloqueja Ferro amb el botó Tech per obrir noves maquines i receptes.",
      manual: false,
      done: () => state.tech.ironUnlocked,
    },
    {
      title: "Tutorial 8/10",
      body: "Col.loca com a minim una maquina de Ferro.",
      manual: false,
      done: () => ironMinerNodes().length >= 1,
    },
    {
      title: "Tutorial 9/10",
      body: "Obre Recerca i desbloqueja una millora per accelerar la progressio.",
      manual: false,
      done: () => unlockedResearchCount() >= 1,
    },
    {
      title: "Tutorial 10/10",
      body: "Accepta un contracte des del panell de Contracte. A partir d'aqui ja pots escalar la teva xarxa.",
      manual: false,
      done: () => !!state.contract.active || (state.progression.contractsCompleted || 0) >= 1,
    },
  ];

  return steps[step] || null;
}

function updateTutorialProgress() {
  if (state.tutorial.completed) return;
  let safety = 24;
  while (safety > 0) {
    safety -= 1;
    const step = tutorialStepData(state.tutorial.step);
    if (!step) {
      state.tutorial.completed = true;
      state.tutorial.dismissed = true;
      break;
    }
    if (step.manual) break;
    if (!step.done || !step.done()) break;
    state.tutorial.step += 1;
  }

  if (!tutorialStepData(state.tutorial.step)) {
    state.tutorial.completed = true;
    state.tutorial.dismissed = true;
  }
}

function tutorialNext() {
  const step = tutorialStepData(state.tutorial.step);
  if (!step) {
    state.tutorial.completed = true;
    state.tutorial.dismissed = true;
    render();
    return;
  }

  if (step.manual) {
    state.tutorial.step += 1;
  } else if (step.done && step.done()) {
    state.tutorial.step += 1;
  } else {
    showToast("Fes primer l'accio del pas");
    return;
  }

  updateTutorialProgress();
  render();
}

function tutorialDismiss() {
  state.tutorial.dismissed = true;
  render();
}

function tutorialOpen() {
  if (state.tutorial.completed) {
    state.tutorial.completed = false;
    state.tutorial.step = 0;
  }
  state.tutorial.dismissed = false;
  state.ui.tutorialExpanded = true;
  render();
  const bottomPanel = dom.tutorialBox ? dom.tutorialBox.closest(".hud-bottom") : null;
  if (bottomPanel) {
    bottomPanel.scrollTop = bottomPanel.scrollHeight;
  }
}

function canCycleRecipe(node) {
  const cfg = processorConfig(node);
  if (!cfg) return false;
  return availableRecipeIdsForNodeType(node.type).length > 1;
}

function recipeResourceLabel(resourceKey) {
  if (resourceKey === "stone") return "Pedra";
  if (resourceKey === "wood") return "Fusta";
  if (resourceKey === "sand") return "Sorra";
  if (resourceKey === "water") return "Aigua";
  if (resourceKey === "iron") return "Ferro";
  if (resourceKey === "coal") return "Carbo";
  if (resourceKey === "copper") return "Coure";
  if (resourceKey === "oil") return "Petroli";
  if (resourceKey === "aluminum") return "Alumini";
  if (resourceKey === "quartz") return "Quars";
  if (resourceKey === "sulfur") return "Sofre";
  if (resourceKey === "gold") return "Or";
  if (resourceKey === "lithium") return "Liti";
  if (resourceKey === "parts") return "Peces";
  if (resourceKey === "steel") return "Acer";
  if (resourceKey === "plates") return "Plaques";
  if (resourceKey === "silicon") return "Silici";
  if (resourceKey === "plastic") return "Plastic";
  if (resourceKey === "steam") return "Vapor";
  if (resourceKey === "glass") return "Vidre";
  if (resourceKey === "acid") return "Acid";
  if (resourceKey === "modules") return "Moduls";
  if (resourceKey === "circuits") return "Circuits";
  if (resourceKey === "frames") return "Bastidors";
  if (resourceKey === "rubber") return "Goma";
  if (resourceKey === "wiring") return "Cablejat";
  if (resourceKey === "microchips") return "Microxips";
  if (resourceKey === "batteries") return "Bateries";
  if (resourceKey === "fiber") return "Fibra";
  if (resourceKey === "composites") return "Compostos";
  if (resourceKey === "superalloy") return "Superaliatge";
  if (resourceKey === "quantumchips") return "Quantum Xips";
  return resourceKey;
}

function recipeAmountsLine(amounts) {
  const entries = Object.entries(amounts || {});
  if (entries.length < 1) return "-";
  return entries
    .map(([resourceKey, amount]) => `${recipeResourceLabel(resourceKey)} ${formatCompact(amount)}`)
    .join(" + ");
}

function recipeBuildingLabel(nodeType) {
  if (nodeType === "forge") return "Farga";
  if (nodeType === "assembler") return "Assembler";
  return formatNodeType(nodeType);
}

function recipeBuildingUnlocked(nodeType) {
  if (nodeType === "forge") return !!state.tech.forgeUnlocked;
  if (nodeType === "assembler") return !!state.tech.assemblerUnlocked;
  return true;
}

function unlockedRecipeGroups() {
  const groups = [];
  for (const [nodeType, cfg] of Object.entries(PROCESSOR_NODE_TYPES || {})) {
    if (!recipeBuildingUnlocked(nodeType)) continue;
    const recipeIds = availableRecipeIdsForNodeType(nodeType);
    if (recipeIds.length < 1) continue;

    const recipes = recipeIds
      .map((recipeId) => {
        const recipe = RECIPES[recipeId];
        if (!recipe) return null;
        return {
          id: recipeId,
          label: recipe.label || recipeId,
          inputs: recipe.inputs || {},
          outputs: recipe.outputs || {},
        };
      })
      .filter(Boolean);

    if (recipes.length < 1) continue;
    groups.push({
      nodeType,
      label: recipeBuildingLabel(nodeType),
      recipes,
    });
  }
  return groups;
}

function toggleRecipePanel(forceOpen) {
  if (typeof forceOpen === "boolean") {
    state.ui.recipePanelOpen = forceOpen;
  } else {
    state.ui.recipePanelOpen = !state.ui.recipePanelOpen;
  }
  if (state.ui.recipePanelOpen) {
    state.ui.resourcePanelOpen = false;
  }
  render();
}

function cycleSelectedRecipe() {
  const node = selectedNode();
  if (!node) {
    showToast("Selecciona una maquina");
    return;
  }

  const cfg = processorConfig(node);
  if (!cfg) {
    showToast("Aquest node no te receptes");
    return;
  }

  const recipeIds = availableRecipeIdsForNodeType(node.type);
  if (recipeIds.length <= 1) {
    showToast("Nomes hi ha una recepta");
    return;
  }

  const currentId = nodeRecipeId(node);
  const currentIndex = recipeIds.indexOf(currentId);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % recipeIds.length : 0;
  const nextId = recipeIds[nextIndex];
  node.recipeId = nextId;
  const label = RECIPES[nextId]?.label || nextId;
  showToast(`Recepta: ${label}`);
  render();
}

function upgradeSelected() {
  const node = selectedNode();
  if (!node) {
    showToast("No hi ha cap node seleccionat");
    return;
  }

  const cost = upgradeCost(node);
  if (cost === null) {
    showToast("Aquest item no es pot millorar");
    return;
  }

  if (!spendMoney(cost)) {
    showToast("No tens prou diners");
    return;
  }

  node.level += 1;
  showToast("Upgrade aplicat");
  render();
}

function removeSelectedNode() {
  const node = selectedNode();
  if (!node) {
    showToast("No hi ha cap node seleccionat");
    return;
  }

  if (!isRemovableNode(node)) {
    if (node.fixed) {
      showToast("Aquest node es estructural i no es pot eliminar");
      return;
    }

    if (node.type === "miner") {
      showToast("Has de mantenir almenys 1 pedra");
      return;
    }

    showToast("No es pot eliminar aquest node");
    return;
  }

  const cablesBefore = state.cables.length;
  state.nodes = state.nodes.filter((item) => item.id !== node.id);
  state.cables = state.cables.filter((edge) => {
    const [a, b] = edge.split("|");
    return a !== node.id && b !== node.id;
  });

  if (state.ui.selectedNodeId === node.id) {
    state.ui.selectedNodeId = null;
  }

  if (state.ui.pendingSourceId === node.id) {
    state.ui.pendingSourceId = null;
  }

  if (state.ui.drag.sourceId === node.id || state.ui.drag.snapTargetId === node.id) {
    resetDrag();
  }

  const removedCables = cablesBefore - state.cables.length;
  showToast(
    removedCables > 0
      ? `Node eliminat (-${removedCables} cables)`
      : "Node eliminat"
  );
  render();
}

function sellResourceUnits(amount) {
  const snapshot = getNetworkSnapshot();
  if (!snapshot.marketConnected) {
    showToast("Connecta magatzem amb mercat");
    return { sold: 0, earned: 0 };
  }

  const units = Math.max(0, amount);
  if (units <= 0) return { sold: 0, earned: 0 };
  const result = sellResources(units);
  if (result.sold <= 0) return result;
  render();
  return result;
}

function sellAllResources() {
  const units = totalStoredResources();
  if (units <= 0) return { sold: 0, earned: 0 };
  return sellResourceUnits(units);
}

function nextTechnologyToUnlock() {
  if (!state.tech.ironUnlocked) {
    return {
      key: "ironUnlocked",
      label: "Fe",
      cost: ironUnlockCost(),
      toast: "Tecnologia ferro desbloquejada",
    };
  }

  if (!state.tech.forgeUnlocked) {
    return {
      key: "forgeUnlocked",
      label: "Farga",
      cost: forgeUnlockCost(),
      toast: "Tecnologia farga desbloquejada",
    };
  }

  if (!state.tech.advancedMinesUnlocked) {
    return {
      key: "advancedMinesUnlocked",
      label: "Mines+",
      cost: advancedMinesUnlockCost(),
      toast: "Mines avancades desbloquejades",
    };
  }

  if (!state.tech.assemblerUnlocked) {
    return {
      key: "assemblerUnlocked",
      label: "Asm",
      cost: assemblerUnlockCost(),
      toast: "Tecnologia assembler desbloquejada",
    };
  }

  if (!state.tech.materialsUnlocked) {
    return {
      key: "materialsUnlocked",
      label: "Materials",
      cost: CONFIG.materialsUnlockCost,
      toast: "Familia Materials desbloquejada",
    };
  }

  if (!state.tech.endgameUnlocked) {
    return {
      key: "endgameUnlocked",
      label: "Endgame",
      cost: CONFIG.endgameUnlockCost,
      toast: "Familia Endgame desbloquejada",
    };
  }

  return null;
}

function unlockNextTechnology() {
  const next = nextTechnologyToUnlock();
  if (!next) {
    showToast("No hi ha mes tecnologia");
    return;
  }

  if (!spendMoney(next.cost)) {
    showToast("No tens prou diners per Tech");
    return;
  }

  state.tech[next.key] = true;
  if (
    state.ui.buyType === "iron_miner" ||
    state.ui.buyType === "coal_miner" ||
    state.ui.buyType === "copper_miner" ||
    state.ui.buyType === "oil_miner" ||
    state.ui.buyType === "aluminum_miner" ||
    state.ui.buyType === "quartz_miner" ||
    state.ui.buyType === "sulfur_miner" ||
    state.ui.buyType === "gold_miner" ||
    state.ui.buyType === "lithium_miner" ||
    state.ui.buyType === "forge" ||
    state.ui.buyType === "assembler"
  ) {
    enterBuyMode();
  }
  showToast(next.toast);
  render();
}

function toggleResourcePanel(forceOpen) {
  if (typeof forceOpen === "boolean") {
    state.ui.resourcePanelOpen = forceOpen;
  } else {
    state.ui.resourcePanelOpen = !state.ui.resourcePanelOpen;
  }
  if (state.ui.resourcePanelOpen) {
    state.ui.recipePanelOpen = false;
  }
  render();
}

