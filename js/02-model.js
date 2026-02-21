function edgeKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function cellKey(row, col) {
  return `${row}:${col}`;
}

function parseCellKey(key) {
  if (!key) return null;
  const [row, col] = key.split(":").map(Number);
  if (!Number.isFinite(row) || !Number.isFinite(col)) return null;
  return { row, col };
}

function worldWidthPx() {
  return CONFIG.gridCols * CONFIG.cellSizePx;
}

function worldHeightPx() {
  return CONFIG.gridRows * CONFIG.cellSizePx;
}

function clampCamera() {
  state.camera.zoom = Math.min(CONFIG.maxZoom, Math.max(CONFIG.minZoom, state.camera.zoom));

  const viewportW = dom.mapBoard.clientWidth;
  const viewportH = dom.mapBoard.clientHeight;
  const scaledWorldW = worldWidthPx() * state.camera.zoom;
  const scaledWorldH = worldHeightPx() * state.camera.zoom;
  const minX = Math.min(0, viewportW - scaledWorldW);
  const minY = Math.min(0, viewportH - scaledWorldH);
  const maxX = 0;
  const maxY = 0;

  state.camera.x = Math.min(maxX, Math.max(minX, state.camera.x));
  state.camera.y = Math.min(maxY, Math.max(minY, state.camera.y));
}

function applyCameraTransform() {
  dom.mapWorld.style.transform = `translate3d(${state.camera.x}px, ${state.camera.y}px, 0) scale(${state.camera.zoom})`;
}

function distanceBetweenNodes(a, b) {
  return Math.hypot(a.row - b.row, a.col - b.col);
}

function getNodeById(id) {
  return state.nodes.find((node) => node.id === id) || null;
}

function getNodeAt(row, col) {
  return state.nodes.find((node) => node.row === row && node.col === col) || null;
}

function getWarehouseNode() {
  return state.nodes.find((node) => node.type === "warehouse") || null;
}

function getMarketNode() {
  return state.nodes.find((node) => node.type === "market") || null;
}

function minerNodes() {
  return state.nodes.filter((node) => node.type === "miner");
}

function woodMinerNodes() {
  return state.nodes.filter((node) => node.type === "wood_miner");
}

function ironMinerNodes() {
  return state.nodes.filter((node) => node.type === "iron_miner");
}

function coalMinerNodes() {
  return state.nodes.filter((node) => node.type === "coal_miner");
}

function copperMinerNodes() {
  return state.nodes.filter((node) => node.type === "copper_miner");
}

function forgeNodes() {
  return state.nodes.filter((node) => node.type === "forge");
}

function assemblerNodes() {
  return state.nodes.filter((node) => node.type === "assembler");
}

function poleNodes() {
  return state.nodes.filter((node) => node.type === "pole");
}

const RESEARCH_TREE = [
  {
    id: "rs_mining_drill",
    name: "Drill Eficient",
    cost: 36,
    prereqs: [],
    desc: "+15% produccio miners",
  },
  {
    id: "rs_logistics",
    name: "Logistica",
    cost: 44,
    prereqs: [],
    desc: "+1 rang de cable",
  },
  {
    id: "rs_market_analytics",
    name: "Analitica Mercat",
    cost: 52,
    prereqs: [],
    desc: "Mercat mes estable",
  },
  {
    id: "rs_forge_mastery",
    name: "Farga Pro",
    cost: 78,
    prereqs: ["rs_mining_drill"],
    desc: "+20% produccio farga",
  },
  {
    id: "rs_assembler_efficiency",
    name: "Assembler Pro",
    cost: 95,
    prereqs: ["rs_forge_mastery"],
    desc: "+20% produccio assembler",
  },
  {
    id: "rs_premium_contracts",
    name: "Contractes Premium",
    cost: 110,
    prereqs: ["rs_market_analytics", "rs_assembler_efficiency"],
    desc: "Desbloqueja contractes de cadena",
  },
];

const OBJECTIVES = [
  { id: "obj_stock_140", label: "Omple 140u de stock", target: 140, kind: "stock" },
  { id: "obj_sell_200", label: "Ven 200u totals", target: 200, kind: "sold_units" },
  { id: "obj_unlock_forge", label: "Desbloqueja Farga", target: 1, kind: "unlock_forge" },
  { id: "obj_research_3", label: "Desbloqueja 3 recerques", target: 3, kind: "research_count" },
  { id: "obj_contract_3", label: "Completa 3 contractes", target: 3, kind: "contracts_done" },
  { id: "obj_modules_60", label: "Produeix 60 moduls", target: 60, kind: "produced_modules" },
  { id: "obj_circuits_60", label: "Produeix 60 circuits", target: 60, kind: "produced_circuits" },
  { id: "obj_money_5000", label: "Guanya 5.000$", target: 5000, kind: "money_earned" },
];

function researchNodeById(id) {
  return RESEARCH_TREE.find((node) => node.id === id) || null;
}

function hasResearch(id, researchState = state.research) {
  return !!(researchState && researchState.unlocked && researchState.unlocked[id]);
}

function unlockedResearchCount() {
  return Object.values(state.research.unlocked || {}).filter(Boolean).length;
}

function researchPointsMultiplier() {
  const prestigeBonus = 1 + (state.progression.prestigeLevel || 0) * 0.06;
  return prestigeBonus;
}

function premiumContractsUnlocked(researchState = state.research) {
  return hasResearch("rs_premium_contracts", researchState);
}

function prestigeProductionMultiplier() {
  return 1 + (state.progression.prestigeLevel || 0) * 0.12;
}

function productionMultiplierFor(type) {
  let multiplier = prestigeProductionMultiplier();

  const isMiner =
    type === "miner" ||
    type === "wood_miner" ||
    type === "iron_miner" ||
    type === "coal_miner" ||
    type === "copper_miner";

  if (isMiner && hasResearch("rs_mining_drill")) {
    multiplier *= 1.15;
  }
  if (type === "forge" && hasResearch("rs_forge_mastery")) {
    multiplier *= 1.2;
  }
  if (type === "assembler" && hasResearch("rs_assembler_efficiency")) {
    multiplier *= 1.2;
  }

  return multiplier;
}

function cableMaxDistance() {
  const researchBonus = hasResearch("rs_logistics") ? 1 : 0;
  const prestigeBonus = Math.floor((state.progression.prestigeLevel || 0) / 3);
  return CONFIG.cableMaxDistance + researchBonus + prestigeBonus;
}

function minerRatePerSec(level) {
  return 1 * (1 + (level - 1) * 0.35) * productionMultiplierFor("miner");
}

function woodMinerRatePerSec(level) {
  return 0.8 * (1 + (level - 1) * 0.32) * productionMultiplierFor("wood_miner");
}

function ironMinerRatePerSec(level) {
  return 0.55 * (1 + (level - 1) * 0.28) * productionMultiplierFor("iron_miner");
}

function coalMinerRatePerSec(level) {
  return 0.62 * (1 + (level - 1) * 0.27) * productionMultiplierFor("coal_miner");
}

function copperMinerRatePerSec(level) {
  return 0.52 * (1 + (level - 1) * 0.29) * productionMultiplierFor("copper_miner");
}

function forgeRatePerSec(level) {
  return 0.36 * (1 + (level - 1) * 0.24) * productionMultiplierFor("forge");
}

function assemblerRatePerSec(level) {
  return 0.24 * (1 + (level - 1) * 0.23) * productionMultiplierFor("assembler");
}

const PROCESSOR_NODE_TYPES = {
  forge: {
    defaultRecipeId: "forge_parts",
    recipeIds: ["forge_parts", "forge_steel", "forge_plates"],
    ratePerSec: forgeRatePerSec,
  },
  assembler: {
    defaultRecipeId: "assembler_modules",
    recipeIds: ["assembler_modules", "assembler_circuits", "assembler_frames"],
    ratePerSec: assemblerRatePerSec,
  },
};

const RECIPES = {
  forge_parts: {
    label: "Peces",
    inputs: {
      wood: CONFIG.forgeWoodPerUnit,
      iron: CONFIG.forgeIronPerUnit,
    },
    outputs: {
      parts: CONFIG.forgePartsPerUnit,
    },
  },
  forge_steel: {
    label: "Acer",
    inputs: {
      iron: CONFIG.forgeSteelIronPerUnit,
      coal: CONFIG.forgeSteelCoalPerUnit,
    },
    outputs: {
      steel: CONFIG.forgeSteelPerUnit,
    },
  },
  forge_plates: {
    label: "Plaques",
    inputs: {
      copper: CONFIG.forgePlatesCopperPerUnit,
      coal: CONFIG.forgePlatesCoalPerUnit,
    },
    outputs: {
      plates: CONFIG.forgePlatesPerUnit,
    },
  },
  assembler_modules: {
    label: "Moduls",
    inputs: {
      parts: CONFIG.assemblerPartsPerUnit,
      plates: CONFIG.assemblerPlatesPerUnit,
    },
    outputs: {
      modules: CONFIG.assemblerModulesPerUnit,
    },
  },
  assembler_circuits: {
    label: "Circuits",
    inputs: {
      parts: CONFIG.assemblerCircuitPartsPerUnit,
      copper: CONFIG.assemblerCircuitCopperPerUnit,
    },
    outputs: {
      circuits: CONFIG.assemblerCircuitsPerUnit,
    },
  },
  assembler_frames: {
    label: "Bastidors",
    inputs: {
      steel: CONFIG.assemblerFrameSteelPerUnit,
      plates: CONFIG.assemblerFramePlatesPerUnit,
    },
    outputs: {
      frames: CONFIG.assemblerFramesPerUnit,
    },
  },
};

function processorConfig(node) {
  if (!node) return null;
  return PROCESSOR_NODE_TYPES[node.type] || null;
}

function nodeRecipeId(node) {
  const cfg = processorConfig(node);
  if (!cfg) return null;

  if (cfg.recipeIds.includes(node.recipeId)) {
    return node.recipeId;
  }

  return cfg.defaultRecipeId;
}

function nodeRecipe(node) {
  const recipeId = nodeRecipeId(node);
  if (!recipeId) return null;
  return RECIPES[recipeId] || null;
}

function nodeRecipeLabel(node) {
  const recipe = nodeRecipe(node);
  return recipe ? recipe.label : "-";
}

function capacity(warehouseLevel) {
  return CONFIG.baseCapacity + (warehouseLevel - 1) * CONFIG.capacityPerWarehouseLevel;
}

function autoSellRatePerSec(marketLevel) {
  return CONFIG.autoSellRatePerSec * (1 + (marketLevel - 1) * 0.25);
}

function minerPlacementCost() {
  return Math.round(CONFIG.minerBaseCost * CONFIG.minerCostScale ** minerNodes().length);
}

function woodMinerPlacementCost() {
  return Math.round(
    CONFIG.woodMinerBaseCost * CONFIG.woodMinerCostScale ** woodMinerNodes().length
  );
}

function ironMinerPlacementCost() {
  return Math.round(
    CONFIG.ironMinerBaseCost * CONFIG.ironMinerCostScale ** ironMinerNodes().length
  );
}

function coalMinerPlacementCost() {
  return Math.round(
    CONFIG.coalMinerBaseCost * CONFIG.coalMinerCostScale ** coalMinerNodes().length
  );
}

function copperMinerPlacementCost() {
  return Math.round(
    CONFIG.copperMinerBaseCost * CONFIG.copperMinerCostScale ** copperMinerNodes().length
  );
}

function forgePlacementCost() {
  return Math.round(CONFIG.forgeBaseCost * CONFIG.forgeCostScale ** forgeNodes().length);
}

function assemblerPlacementCost() {
  return Math.round(
    CONFIG.assemblerBaseCost * CONFIG.assemblerCostScale ** assemblerNodes().length
  );
}

function polePlacementCost() {
  return Math.round(CONFIG.poleBaseCost * CONFIG.poleCostScale ** poleNodes().length);
}

function ironUnlockCost() {
  return CONFIG.ironUnlockCost;
}

function forgeUnlockCost() {
  return CONFIG.forgeUnlockCost;
}

function advancedMinesUnlockCost() {
  return CONFIG.advancedMinesUnlockCost;
}

function assemblerUnlockCost() {
  return CONFIG.assemblerUnlockCost;
}

function nodeMaintenancePerSec(node) {
  if (node.type === "miner") {
    return 0.14 * (1 + (node.level - 1) * 0.2);
  }

  if (node.type === "warehouse") {
    return 0.2 * (1 + (node.level - 1) * 0.18);
  }

  if (node.type === "wood_miner") {
    return 0.16 * (1 + (node.level - 1) * 0.2);
  }

  if (node.type === "iron_miner") {
    return 0.19 * (1 + (node.level - 1) * 0.2);
  }

  if (node.type === "coal_miner") {
    return 0.2 * (1 + (node.level - 1) * 0.2);
  }

  if (node.type === "copper_miner") {
    return 0.22 * (1 + (node.level - 1) * 0.2);
  }

  if (node.type === "forge") {
    return 0.24 * (1 + (node.level - 1) * 0.2);
  }

  if (node.type === "assembler") {
    return 0.27 * (1 + (node.level - 1) * 0.2);
  }

  if (node.type === "market") {
    return 0.18 * (1 + (node.level - 1) * 0.18);
  }

  if (node.type === "pole") {
    return 0.05;
  }

  return 0;
}

function maintenancePerSec() {
  const nodeCost = state.nodes.reduce((sum, node) => sum + nodeMaintenancePerSec(node), 0);
  const cableCost = state.cables.length * CONFIG.cableMaintenancePerSec;
  return nodeCost + cableCost;
}

function isRemovableNode(node) {
  if (!node) return false;
  if (node.fixed) return false;
  if (node.type === "miner" && minerNodes().length <= 1) return false;
  return true;
}

function upgradeCost(node) {
  if (!node) return null;

  if (node.type === "miner") {
    return Math.round(
      CONFIG.minerUpgradeBaseCost * CONFIG.minerUpgradeScale ** (node.level - 1)
    );
  }

  if (node.type === "wood_miner") {
    return Math.round(
      (CONFIG.minerUpgradeBaseCost * 1.15) * CONFIG.minerUpgradeScale ** (node.level - 1)
    );
  }

  if (node.type === "iron_miner") {
    return Math.round(
      (CONFIG.minerUpgradeBaseCost * 1.3) * CONFIG.minerUpgradeScale ** (node.level - 1)
    );
  }

  if (node.type === "coal_miner") {
    return Math.round(
      (CONFIG.minerUpgradeBaseCost * 1.34) * CONFIG.minerUpgradeScale ** (node.level - 1)
    );
  }

  if (node.type === "copper_miner") {
    return Math.round(
      (CONFIG.minerUpgradeBaseCost * 1.4) * CONFIG.minerUpgradeScale ** (node.level - 1)
    );
  }

  if (node.type === "forge") {
    return Math.round(
      (CONFIG.minerUpgradeBaseCost * 1.45) * CONFIG.minerUpgradeScale ** (node.level - 1)
    );
  }

  if (node.type === "assembler") {
    return Math.round(
      (CONFIG.minerUpgradeBaseCost * 1.6) * CONFIG.minerUpgradeScale ** (node.level - 1)
    );
  }

  if (node.type === "warehouse") {
    return Math.round(
      CONFIG.warehouseUpgradeBaseCost * CONFIG.warehouseUpgradeScale ** (node.level - 1)
    );
  }

  if (node.type === "market") {
    return Math.round(
      CONFIG.marketUpgradeBaseCost * CONFIG.marketUpgradeScale ** (node.level - 1)
    );
  }

  return null;
}

function spendMoney(amount) {
  if (state.money < amount) return false;
  state.money -= amount;
  return true;
}

function formatInt(value) {
  return Math.floor(value).toLocaleString("ca-ES");
}

function formatCompact(value) {
  return value.toLocaleString("ca-ES", { maximumFractionDigits: 1 });
}

function formatNodeType(type) {
  if (type === "miner") return "Pedra";
  if (type === "wood_miner") return "Miner fusta";
  if (type === "iron_miner") return "Miner ferro";
  if (type === "coal_miner") return "Miner carbo";
  if (type === "copper_miner") return "Miner coure";
  if (type === "forge") return "Farga";
  if (type === "assembler") return "Assembler";
  if (type === "warehouse") return "Magatzem";
  if (type === "market") return "Mercat";
  if (type === "pole") return "Connector";
  return type;
}

function tileLabel(node) {
  if (node.type === "miner") return `P${node.level}`;
  if (node.type === "wood_miner") return `Wd${node.level}`;
  if (node.type === "iron_miner") return `F${node.level}`;
  if (node.type === "coal_miner") return `Ca${node.level}`;
  if (node.type === "copper_miner") return `Cu${node.level}`;
  if (node.type === "forge") return `Fg${node.level}`;
  if (node.type === "assembler") return `As${node.level}`;
  if (node.type === "warehouse") return `W${node.level}`;
  if (node.type === "market") return `S${node.level}`;
  if (node.type === "pole") return "C";
  return "?";
}

function modeLabel(mode) {
  if (mode === "build_miner") return "Comprar: Pedra";
  if (mode === "build_wood_miner") return "Comprar: Fusta";
  if (mode === "build_iron_miner") return "Comprar: Fe";
  if (mode === "build_coal_miner") return "Comprar: Carbo";
  if (mode === "build_copper_miner") return "Comprar: Coure";
  if (mode === "build_forge") return "Comprar: Farga";
  if (mode === "build_assembler") return "Comprar: Asm";
  if (mode === "build_pole") return "Comprar: Conn";
  if (mode === "connect") return "Cables";
  if (mode === "disconnect") return "Tallar cable";
  return "Seleccio";
}

function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.remove("hidden");

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastTimer = setTimeout(() => {
    dom.toast.classList.add("hidden");
  }, 1300);
}

