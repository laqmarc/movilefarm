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
    (type === "coal_miner" || type === "copper_miner") &&
    !state.tech.advancedMinesUnlocked
  ) {
    showToast("Desbloqueja mines avancades");
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
    state.ui.mode === "build_iron_miner" ||
    state.ui.mode === "build_coal_miner" ||
    state.ui.mode === "build_copper_miner" ||
    state.ui.mode === "build_forge" ||
    state.ui.mode === "build_assembler" ||
    state.ui.mode === "build_pole"
  ) {
    if (type === "pole") setMode("build_pole");
    else if (type === "assembler") setMode("build_assembler");
    else if (type === "forge") setMode("build_forge");
    else if (type === "copper_miner") setMode("build_copper_miner");
    else if (type === "coal_miner") setMode("build_coal_miner");
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

function updateObjectivesProgress() {
  let newlyCompleted = 0;
  for (const objective of OBJECTIVES) {
    if (state.progression.objectivesCompleted[objective.id]) continue;
    const current = objectiveProgress(objective);
    if (current < objective.target) continue;
    state.progression.objectivesCompleted[objective.id] = true;
    newlyCompleted += 1;
    state.research.points += 12;
  }
  if (newlyCompleted > 0) {
    showToast(`Objectiu completat x${newlyCompleted}`);
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
  if (step === 0) return {
    title: "Tutorial 1/6",
    body: "Arrossega el mapa amb el dit i fes pinch per zoom.",
    manual: true,
    done: false,
  };
  if (step === 1) return {
    title: "Tutorial 2/6",
    body: "Col.loca una maquina de Pedra des de Comprar.",
    manual: false,
    done: () => minerNodes().length >= 2,
  };
  if (step === 2) return {
    title: "Tutorial 3/6",
    body: "Connecta nodes amb Cables (o Tallar per eliminar).",
    manual: false,
    done: () => state.cables.length >= 2,
  };
  if (step === 3) return {
    title: "Tutorial 4/6",
    body: "Ven recursos al mercat (botons Tot/+10u).",
    manual: false,
    done: () => (state.progression.totalSoldUnits || 0) >= 20,
  };
  if (step === 4) return {
    title: "Tutorial 5/6",
    body: "Desbloqueja Fe amb el botó Tech.",
    manual: false,
    done: () => state.tech.ironUnlocked,
  };
  if (step === 5) return {
    title: "Tutorial 6/6",
    body: "Obre Recerca i desbloqueja la primera millora.",
    manual: false,
    done: () => unlockedResearchCount() >= 1,
  };
  return null;
}

function updateTutorialProgress() {
  if (state.tutorial.completed) return;
  let safety = 12;
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
  state.tutorial.dismissed = false;
  render();
}

function canCycleRecipe(node) {
  const cfg = processorConfig(node);
  return !!(cfg && cfg.recipeIds.length > 1);
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

  if (cfg.recipeIds.length <= 1) {
    showToast("Nomes hi ha una recepta");
    return;
  }

  const currentId = nodeRecipeId(node);
  const currentIndex = cfg.recipeIds.indexOf(currentId);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % cfg.recipeIds.length : 0;
  const nextId = cfg.recipeIds[nextIndex];
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
  render();
}

