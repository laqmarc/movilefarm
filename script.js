const SAVE_KEY = "movile-farm-save-v4";

const CONFIG = {
  gridRows: 18,
  gridCols: 18,
  cellSizePx: 62,
  panDragThresholdPx: 10,
  minZoom: 0.7,
  maxZoom: 2.2,
  autosaveMs: 4000,
  stonePrice: 1,
  woodPrice: 2,
  ironPrice: 4,
  ironUnlockCost: 380,
  autoSellRatePerSec: 8,
  initialMoney: 170,
  minerBaseCost: 30,
  minerCostScale: 1.45,
  woodMinerBaseCost: 52,
  woodMinerCostScale: 1.48,
  ironMinerBaseCost: 85,
  ironMinerCostScale: 1.52,
  poleBaseCost: 18,
  poleCostScale: 1.22,
  cableCost: 6,
  cableMaxDistance: 3,
  cableMaintenancePerSec: 0.06,
  dragSnapRadiusPx: 54,
  minerUpgradeBaseCost: 65,
  minerUpgradeScale: 1.8,
  warehouseUpgradeBaseCost: 70,
  warehouseUpgradeScale: 1.75,
  marketUpgradeBaseCost: 60,
  marketUpgradeScale: 1.65,
  baseCapacity: 140,
  capacityPerWarehouseLevel: 110,
};

const dom = {
  moneyValue: document.getElementById("moneyValue"),
  stoneValue: document.getElementById("stoneValue"),
  productionValue: document.getElementById("productionValue"),
  resourceStrip: document.getElementById("resourceStrip"),
  resourcePanel: document.getElementById("resourcePanel"),
  minerCostValue: document.getElementById("minerCostValue"),
  woodMinerCostValue: document.getElementById("woodMinerCostValue"),
  ironMinerCostValue: document.getElementById("ironMinerCostValue"),
  poleCostValue: document.getElementById("poleCostValue"),
  cableCostValue: document.getElementById("cableCostValue"),
  cableRangeValue: document.getElementById("cableRangeValue"),
  autoSellValue: document.getElementById("autoSellValue"),
  maintenanceValue: document.getElementById("maintenanceValue"),
  modeLabel: document.getElementById("modeLabel"),
  mapBoard: document.getElementById("mapBoard"),
  mapWorld: document.getElementById("mapWorld"),
  gridCells: document.getElementById("gridCells"),
  cableLayer: document.getElementById("cableLayer"),
  toolBuyModeBtn: document.getElementById("toolBuyModeBtn"),
  toolCableModeBtn: document.getElementById("toolCableModeBtn"),
  toolInspectModeBtn: document.getElementById("toolInspectModeBtn"),
  toolUpgradeBtn: document.getElementById("toolUpgradeBtn"),
  toolDeleteBtn: document.getElementById("toolDeleteBtn"),
  techUnlockIronBtn: document.getElementById("techUnlockIronBtn"),
  toolSellBtn: document.getElementById("toolSellBtn"),
  buyMinerTypeBtn: document.getElementById("buyMinerTypeBtn"),
  buyWoodMinerTypeBtn: document.getElementById("buyWoodMinerTypeBtn"),
  buyIronMinerTypeBtn: document.getElementById("buyIronMinerTypeBtn"),
  buyPoleTypeBtn: document.getElementById("buyPoleTypeBtn"),
  toggleAutoSellBtn: document.getElementById("toggleAutoSellBtn"),
  sell10Btn: document.getElementById("sell10Btn"),
  sellAllBtn: document.getElementById("sellAllBtn"),
  selectedTypeValue: document.getElementById("selectedTypeValue"),
  selectedLevelValue: document.getElementById("selectedLevelValue"),
  selectedUpgradeCostValue: document.getElementById("selectedUpgradeCostValue"),
  clearSelectionBtn: document.getElementById("clearSelectionBtn"),
  contractOffer: document.getElementById("contractOffer"),
  acceptContractBtn: document.getElementById("acceptContractBtn"),
  deliverContractBtn: document.getElementById("deliverContractBtn"),
  rerollContractBtn: document.getElementById("rerollContractBtn"),
  toast: document.getElementById("toast"),
};

const state = loadState();
let lastTick = performance.now();
let elapsedSinceSave = 0;
let toastTimer = null;
const cellRefs = new Map();
const pointerState = {
  activePointerId: null,
  points: new Map(),
  pointerDown: false,
  panActive: false,
  moved: false,
  pinchActive: false,
  startX: 0,
  startY: 0,
  startCameraX: 0,
  startCameraY: 0,
  pinchStartDistance: 0,
  pinchStartZoom: 1,
  pinchAnchorWorldX: 0,
  pinchAnchorWorldY: 0,
};

function createDefaultState() {
  return {
    money: CONFIG.initialMoney,
    resources: {
      stone: 0,
      wood: 0,
      iron: 0,
      wastedStone: 0,
      wastedWood: 0,
      wastedIron: 0,
    },
    nodes: [
      { id: "warehouse-1", type: "warehouse", row: 3, col: 2, level: 1, fixed: true },
      { id: "market-1", type: "market", row: 3, col: 5, level: 1, fixed: true },
      { id: "miner-1", type: "miner", row: 1, col: 1, level: 1, fixed: false },
    ],
    cables: [edgeKey("miner-1", "warehouse-1")],
    nextMinerId: 2,
    nextWoodMinerId: 1,
    nextIronMinerId: 1,
    nextPoleId: 1,
    autoSellEnabled: false,
    tech: {
      ironUnlocked: false,
    },
    camera: {
      x: 0,
      y: 0,
      zoom: 1,
    },
    economy: {
      lastMaintenancePerSec: 0,
    },
    contract: {
      offer: createContractOffer(1),
      active: null,
      lastId: 1,
    },
    ui: {
      mode: "inspect",
      buyType: "miner",
      resourcePanelOpen: false,
      selectedNodeId: null,
      pendingSourceId: null,
      drag: {
        active: false,
        sourceId: null,
        pointerX: 0,
        pointerY: 0,
        hoverCellKey: null,
        snapTargetId: null,
      },
    },
  };
}

function defaultUi() {
  return createDefaultState().ui;
}

function loadState() {
  const fallback = createDefaultState();
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return fallback;

    return {
      ...fallback,
      ...parsed,
      resources: { ...fallback.resources, ...(parsed.resources || {}) },
      nodes: Array.isArray(parsed.nodes) ? parsed.nodes : fallback.nodes,
      cables: Array.isArray(parsed.cables) ? parsed.cables : fallback.cables,
      camera: { ...fallback.camera, ...(parsed.camera || {}) },
      tech: { ...fallback.tech, ...(parsed.tech || {}) },
      economy: { ...fallback.economy, ...(parsed.economy || {}) },
      contract: { ...fallback.contract, ...(parsed.contract || {}) },
      ui: {
        ...defaultUi(),
        ...(parsed.ui || {}),
        drag: {
          ...defaultUi().drag,
          ...((parsed.ui && parsed.ui.drag) || {}),
        },
      },
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

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

function poleNodes() {
  return state.nodes.filter((node) => node.type === "pole");
}

function minerRatePerSec(level) {
  return 1 * (1 + (level - 1) * 0.35);
}

function woodMinerRatePerSec(level) {
  return 0.8 * (1 + (level - 1) * 0.32);
}

function ironMinerRatePerSec(level) {
  return 0.55 * (1 + (level - 1) * 0.28);
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

function polePlacementCost() {
  return Math.round(CONFIG.poleBaseCost * CONFIG.poleCostScale ** poleNodes().length);
}

function ironUnlockCost() {
  return CONFIG.ironUnlockCost;
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
  if (type === "miner") return "Miner";
  if (type === "wood_miner") return "Miner fusta";
  if (type === "iron_miner") return "Miner ferro";
  if (type === "warehouse") return "Magatzem";
  if (type === "market") return "Mercat";
  if (type === "pole") return "Connector";
  return type;
}

function tileLabel(node) {
  if (node.type === "miner") return `M${node.level}`;
  if (node.type === "wood_miner") return `Wd${node.level}`;
  if (node.type === "iron_miner") return `F${node.level}`;
  if (node.type === "warehouse") return `W${node.level}`;
  if (node.type === "market") return `S${node.level}`;
  if (node.type === "pole") return "C";
  return "?";
}

function modeLabel(mode) {
  if (mode === "build_miner") return "Comprar: Miner";
  if (mode === "build_wood_miner") return "Comprar: Fusta";
  if (mode === "build_iron_miner") return "Comprar: Fe";
  if (mode === "build_pole") return "Comprar: Conn";
  if (mode === "connect") return "Cables";
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

function createContractOffer(id) {
  const required = Math.floor(35 + Math.random() * 100);
  const durationSec = Math.floor(75 + Math.random() * 100);
  const rewardMultiplier = 1.8 + Math.random() * 1.2;
  const reward = Math.round(required * rewardMultiplier);
  const penalty = Math.max(12, Math.round(reward * 0.22));
  return {
    id,
    requiredStone: required,
    durationSec,
    reward,
    penalty,
  };
}

function nextContractOffer() {
  state.contract.lastId += 1;
  state.contract.offer = createContractOffer(state.contract.lastId);
}

function acceptContract() {
  if (!state.contract.offer || state.contract.active) return;
  const now = Date.now();
  state.contract.active = {
    ...state.contract.offer,
    acceptedAt: now,
    deadlineAt: now + state.contract.offer.durationSec * 1000,
    deliveredStone: 0,
  };
  state.contract.offer = null;
}

function deliverToContract() {
  const active = state.contract.active;
  if (!active) return;

  const pending = active.requiredStone - active.deliveredStone;
  if (pending <= 0) return;

  const amount = Math.floor(Math.min(pending, state.resources.stone));
  if (amount <= 0) return;

  state.resources.stone -= amount;
  active.deliveredStone += amount;

  if (active.deliveredStone >= active.requiredStone) {
    state.money += active.reward;
    state.contract.active = null;
    nextContractOffer();
    showToast("Contracte completat");
  }
}

function failContract() {
  const active = state.contract.active;
  if (!active) return;
  state.money = Math.max(0, state.money - active.penalty);
  state.contract.active = null;
  nextContractOffer();
  showToast("Contracte fallit");
}

function updateContractTick() {
  const active = state.contract.active;
  if (!active) return;
  if (Date.now() >= active.deadlineAt) {
    failContract();
  }
}

function buildAdjacency() {
  const adjacency = new Map();
  for (const node of state.nodes) {
    adjacency.set(node.id, new Set());
  }

  for (const cable of state.cables) {
    const [a, b] = cable.split("|");
    if (!adjacency.has(a) || !adjacency.has(b)) continue;
    adjacency.get(a).add(b);
    adjacency.get(b).add(a);
  }

  return adjacency;
}

function reachableFrom(startId, adjacency) {
  const visited = new Set();
  if (!startId || !adjacency.has(startId)) return visited;

  const queue = [startId];
  visited.add(startId);

  while (queue.length > 0) {
    const current = queue.shift();
    for (const next of adjacency.get(current)) {
      if (visited.has(next)) continue;
      visited.add(next);
      queue.push(next);
    }
  }

  return visited;
}

function getNetworkSnapshot() {
  const warehouseNode = getWarehouseNode();
  const marketNode = getMarketNode();
  const adjacency = buildAdjacency();
  const reachableFromWarehouse = warehouseNode
    ? reachableFrom(warehouseNode.id, adjacency)
    : new Set();

  const connectedStoneMiners = minerNodes().filter((node) =>
    reachableFromWarehouse.has(node.id)
  );
  const connectedWoodMiners = woodMinerNodes().filter((node) =>
    reachableFromWarehouse.has(node.id)
  );
  const connectedIronMiners = ironMinerNodes().filter((node) =>
    reachableFromWarehouse.has(node.id)
  );
  const stoneRate = connectedStoneMiners.reduce(
    (sum, miner) => sum + minerRatePerSec(miner.level),
    0
  );
  const woodRate = connectedWoodMiners.reduce(
    (sum, miner) => sum + woodMinerRatePerSec(miner.level),
    0
  );
  const ironRate = connectedIronMiners.reduce(
    (sum, miner) => sum + ironMinerRatePerSec(miner.level),
    0
  );

  return {
    warehouseNode,
    marketNode,
    reachableFromWarehouse,
    connectedRate: stoneRate + woodRate + ironRate,
    stoneRate,
    woodRate,
    ironRate,
    marketConnected: !!(marketNode && reachableFromWarehouse.has(marketNode.id)),
    nodeMap: new Map(state.nodes.map((node) => [node.id, node])),
  };
}

function resourceCatalog() {
  return [
    {
      key: "stone",
      label: "Pedra",
      price: CONFIG.stonePrice,
      unlocked: true,
    },
    {
      key: "wood",
      label: "Fusta",
      price: CONFIG.woodPrice,
      unlocked: true,
    },
    {
      key: "iron",
      label: "Ferro",
      price: CONFIG.ironPrice,
      unlocked: state.tech.ironUnlocked,
    },
  ];
}

function unlockedResources() {
  return resourceCatalog().filter((res) => res.unlocked);
}

function totalStoredResources() {
  return unlockedResources().reduce((sum, res) => sum + state.resources[res.key], 0);
}

function sellResources(units = Number.POSITIVE_INFINITY) {
  let remaining = Math.max(0, units);
  if (remaining <= 0) return { sold: 0, earned: 0 };

  const sellOrder = [...unlockedResources()].sort((a, b) => b.price - a.price);
  let sold = 0;
  let earned = 0;

  for (const res of sellOrder) {
    if (remaining <= 0) break;
    const available = Math.max(0, state.resources[res.key]);
    if (available <= 0) continue;

    const qty = Math.min(available, remaining);
    state.resources[res.key] -= qty;
    sold += qty;
    earned += qty * res.price;
    remaining -= qty;
  }

  if (earned > 0) {
    state.money += earned;
  }

  return { sold, earned };
}

function gameTick(dtSec) {
  updateContractTick();
  const snapshot = getNetworkSnapshot();
  const upkeep = maintenancePerSec();
  state.economy.lastMaintenancePerSec = upkeep;

  if (upkeep > 0) {
    state.money = Math.max(0, state.money - upkeep * dtSec);
  }

  if (!snapshot.warehouseNode) return;

  const maxCapacity = capacity(snapshot.warehouseNode.level);
  let free = Math.max(0, maxCapacity - totalStoredResources());

  const producedStone = snapshot.stoneRate * dtSec;
  const storedStone = Math.min(producedStone, free);
  const lostStone = producedStone - storedStone;
  state.resources.stone += storedStone;
  state.resources.wastedStone += lostStone;
  free = Math.max(0, free - storedStone);

  const producedWood = snapshot.woodRate * dtSec;
  const storedWood = Math.min(producedWood, free);
  const lostWood = producedWood - storedWood;
  state.resources.wood += storedWood;
  state.resources.wastedWood += lostWood;
  free = Math.max(0, free - storedWood);

  const producedIron = snapshot.ironRate * dtSec;
  const storedIron = Math.min(producedIron, free);
  const lostIron = producedIron - storedIron;
  state.resources.iron += storedIron;
  state.resources.wastedIron += lostIron;

  if (state.autoSellEnabled && snapshot.marketConnected && snapshot.marketNode) {
    const autoSellUnits = Math.min(
      totalStoredResources(),
      autoSellRatePerSec(snapshot.marketNode.level) * dtSec
    );
    sellResources(autoSellUnits);
  }
}

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

  state.ui.buyType = type;
  if (
    state.ui.mode === "build_miner" ||
    state.ui.mode === "build_wood_miner" ||
    state.ui.mode === "build_iron_miner" ||
    state.ui.mode === "build_pole"
  ) {
    if (type === "pole") setMode("build_pole");
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
    state.ui.selectedNodeId = id;
    showToast("Miner colocat");
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
    state.ui.selectedNodeId = id;
    showToast("Miner ferro colocat");
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
    state.ui.selectedNodeId = id;
    showToast("Connector colocat");
  }
}

function canCreateCable(source, target) {
  const distance = distanceBetweenNodes(source, target);
  if (distance > CONFIG.cableMaxDistance) {
    showToast("Cable massa llarg");
    return false;
  }

  if (!spendMoney(CONFIG.cableCost)) {
    showToast("No tens prou diners per cable");
    return false;
  }

  return true;
}

function toggleCable(aId, bId) {
  if (aId === bId) return;

  const source = getNodeById(aId);
  const target = getNodeById(bId);
  if (!source || !target) return;

  const key = edgeKey(aId, bId);
  const idx = state.cables.indexOf(key);

  if (idx >= 0) {
    state.cables.splice(idx, 1);
    showToast("Cable eliminat");
    return;
  }

  if (!canCreateCable(source, target)) {
    return;
  }

  state.cables.push(key);
  showToast(`Cable +${CONFIG.cableCost}$`);
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

  if (state.ui.mode === "build_pole") {
    placeNode("pole", row, col);
    render();
    return;
  }

  if (state.ui.mode === "connect") {
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

    toggleCable(state.ui.pendingSourceId, node.id);
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
      showToast("Has de mantenir almenys 1 miner");
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

function unlockIronTechnology() {
  if (state.tech.ironUnlocked) {
    showToast("Ferro ja desbloquejat");
    return;
  }

  const cost = ironUnlockCost();
  if (!spendMoney(cost)) {
    showToast("No tens prou diners per Tech");
    return;
  }

  state.tech.ironUnlocked = true;
  if (state.ui.buyType === "iron_miner") {
    enterBuyMode();
  }
  showToast("Tecnologia ferro desbloquejada");
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

function getCellFromPointer(clientX, clientY) {
  const element = document.elementFromPoint(clientX, clientY);
  const cell = element ? element.closest(".grid-cell") : null;
  if (!cell) return null;
  return {
    row: Number(cell.dataset.row),
    col: Number(cell.dataset.col),
    key: cellKey(Number(cell.dataset.row), Number(cell.dataset.col)),
  };
}

function pointerDistanceAndCenter() {
  const points = Array.from(pointerState.points.values());
  if (points.length < 2) return null;

  const a = points[0];
  const b = points[1];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return {
    distance: Math.hypot(dx, dy),
    centerX: (a.x + b.x) / 2,
    centerY: (a.y + b.y) / 2,
  };
}

function startPinchGesture() {
  const geometry = pointerDistanceAndCenter();
  if (!geometry) return;

  pointerState.pinchActive = true;
  pointerState.pointerDown = false;
  pointerState.panActive = false;
  pointerState.moved = true;
  pointerState.activePointerId = null;
  pointerState.pinchStartDistance = Math.max(1, geometry.distance);
  pointerState.pinchStartZoom = state.camera.zoom;

  const rect = dom.mapBoard.getBoundingClientRect();
  const boardX = geometry.centerX - rect.left;
  const boardY = geometry.centerY - rect.top;
  pointerState.pinchAnchorWorldX = (boardX - state.camera.x) / state.camera.zoom;
  pointerState.pinchAnchorWorldY = (boardY - state.camera.y) / state.camera.zoom;
}

function updatePinchGesture() {
  const geometry = pointerDistanceAndCenter();
  if (!geometry) return;

  const rect = dom.mapBoard.getBoundingClientRect();
  const boardX = geometry.centerX - rect.left;
  const boardY = geometry.centerY - rect.top;
  const ratio = geometry.distance / Math.max(1, pointerState.pinchStartDistance);
  const nextZoom = pointerState.pinchStartZoom * ratio;

  state.camera.zoom = nextZoom;
  state.camera.x = boardX - pointerState.pinchAnchorWorldX * nextZoom;
  state.camera.y = boardY - pointerState.pinchAnchorWorldY * nextZoom;
  clampCamera();
  applyCameraTransform();
}

function nodeCenterPx(node) {
  const cellW = CONFIG.cellSizePx;
  const cellH = CONFIG.cellSizePx;
  return {
    x: (node.col + 0.5) * cellW,
    y: (node.row + 0.5) * cellH,
  };
}

function findSnapTargetId(sourceId) {
  const sourceNode = getNodeById(sourceId);
  if (!sourceNode) return null;

  let winner = null;
  let bestDistancePx = Number.POSITIVE_INFINITY;

  for (const node of state.nodes) {
    if (node.id === sourceId) continue;
    if (distanceBetweenNodes(sourceNode, node) > CONFIG.cableMaxDistance) continue;

    const center = nodeCenterPx(node);
    const dx = state.ui.drag.pointerX - center.x;
    const dy = state.ui.drag.pointerY - center.y;
    const distancePx = Math.hypot(dx, dy);
    if (distancePx > CONFIG.dragSnapRadiusPx) continue;
    if (distancePx >= bestDistancePx) continue;

    bestDistancePx = distancePx;
    winner = node.id;
  }

  return winner;
}

function updateDragPointer(clientX, clientY) {
  if (!state.ui.drag.active) return;

  const rect = dom.mapBoard.getBoundingClientRect();
  const worldX = (clientX - rect.left - state.camera.x) / state.camera.zoom;
  const worldY = (clientY - rect.top - state.camera.y) / state.camera.zoom;
  state.ui.drag.pointerX = Math.min(Math.max(0, worldX), worldWidthPx());
  state.ui.drag.pointerY = Math.min(Math.max(0, worldY), worldHeightPx());

  const snapTargetId = findSnapTargetId(state.ui.drag.sourceId);
  state.ui.drag.snapTargetId = snapTargetId;

  if (snapTargetId) {
    const snapNode = getNodeById(snapTargetId);
    state.ui.drag.hoverCellKey = snapNode ? cellKey(snapNode.row, snapNode.col) : null;
    return;
  }

  const hovered = getCellFromPointer(clientX, clientY);
  if (!hovered) {
    state.ui.drag.hoverCellKey = null;
    return;
  }

  const hoveredNode = getNodeAt(hovered.row, hovered.col);
  state.ui.drag.hoverCellKey = hoveredNode ? hovered.key : null;
}

function beginDragConnect(row, col, event) {
  if (state.ui.mode !== "connect") return false;

  const node = getNodeAt(row, col);
  if (!node) return false;

  state.ui.drag.active = true;
  state.ui.drag.sourceId = node.id;
  state.ui.pendingSourceId = node.id;
  state.ui.selectedNodeId = node.id;
  updateDragPointer(event.clientX, event.clientY);

  render();
  return true;
}

function finishDragConnect(event) {
  if (!state.ui.drag.active) return false;

  updateDragPointer(event.clientX, event.clientY);

  const sourceId = state.ui.drag.sourceId;
  let targetNode = null;

  if (state.ui.drag.snapTargetId) {
    targetNode = getNodeById(state.ui.drag.snapTargetId);
  } else {
    const hover = parseCellKey(state.ui.drag.hoverCellKey);
    if (hover) {
      targetNode = getNodeAt(hover.row, hover.col);
    }
  }

  if (sourceId && targetNode && targetNode.id !== sourceId) {
    toggleCable(sourceId, targetNode.id);
    state.ui.selectedNodeId = targetNode.id;
    state.ui.pendingSourceId = targetNode.id;
  }

  resetDrag();
  render();
  return true;
}

function renderContract() {
  const { offer, active } = state.contract;

  if (active) {
    const remainingSec = Math.max(0, Math.ceil((active.deadlineAt - Date.now()) / 1000));
    dom.contractOffer.innerHTML = `
      <div class="contract-line"><span>Estat</span><strong>Actiu</strong></div>
      <div class="contract-line"><span>Entrega</span><strong>${formatInt(active.deliveredStone)} / ${formatInt(active.requiredStone)} pedra</strong></div>
      <div class="contract-line"><span>Temps restant</span><strong>${remainingSec}s</strong></div>
      <div class="contract-line"><span>Recompensa</span><strong>${formatInt(active.reward)}$</strong></div>
      <div class="contract-line"><span>Penalitzacio</span><strong>${formatInt(active.penalty)}$</strong></div>
    `;
    return;
  }

  if (offer) {
    dom.contractOffer.innerHTML = `
      <div class="contract-line"><span>Estat</span><strong>Pendent</strong></div>
      <div class="contract-line"><span>Requerit</span><strong>${formatInt(offer.requiredStone)} pedra</strong></div>
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

    lines.push(
      `<line class="cable-line ${active ? "active" : ""}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`
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
  dom.poleCostValue.textContent = `${formatInt(polePlacementCost())}$`;
  dom.cableCostValue.textContent = `${formatInt(CONFIG.cableCost)}$`;
  dom.cableRangeValue.textContent = `${formatCompact(CONFIG.cableMaxDistance)} cel.les`;
  dom.autoSellValue.textContent = state.autoSellEnabled ? "ON" : "OFF";
  dom.maintenanceValue.textContent = `${formatCompact(state.economy.lastMaintenancePerSec)}$/s`;
  dom.modeLabel.textContent = modeLabel(state.ui.mode);
  dom.toggleAutoSellBtn.textContent = state.autoSellEnabled ? "Auto Tot ON" : "Auto Tot OFF";
  dom.techUnlockIronBtn.textContent = state.tech.ironUnlocked
    ? "Tech Fe OK"
    : `Tech Fe ${formatInt(ironUnlockCost())}$`;

  const inBuyMode =
    state.ui.mode === "build_miner" ||
    state.ui.mode === "build_wood_miner" ||
    state.ui.mode === "build_iron_miner" ||
    state.ui.mode === "build_pole";
  dom.toolBuyModeBtn.classList.toggle("active", inBuyMode);
  dom.toolCableModeBtn.classList.toggle("active", state.ui.mode === "connect");
  dom.toolInspectModeBtn.classList.toggle("active", state.ui.mode === "inspect");
  dom.buyMinerTypeBtn.classList.toggle("active", state.ui.buyType === "miner");
  dom.buyWoodMinerTypeBtn.classList.toggle("active", state.ui.buyType === "wood_miner");
  dom.buyIronMinerTypeBtn.classList.toggle("active", state.ui.buyType === "iron_miner");
  dom.buyPoleTypeBtn.classList.toggle("active", state.ui.buyType === "pole");

  dom.selectedTypeValue.textContent = selected ? formatNodeType(selected.type) : "-";
  dom.selectedLevelValue.textContent = selected ? formatInt(selected.level) : "-";
  dom.selectedUpgradeCostValue.textContent =
    selectedCost !== null ? `${formatInt(selectedCost)}$` : "-";

  dom.toolUpgradeBtn.disabled = !selected || selectedCost === null || state.money < selectedCost;
  dom.toolDeleteBtn.disabled = !isRemovableNode(selected);
  dom.toolSellBtn.disabled = totalStored < 1;
  dom.techUnlockIronBtn.disabled = state.tech.ironUnlocked || state.money < ironUnlockCost();
  dom.buyIronMinerTypeBtn.disabled = !state.tech.ironUnlocked;
  dom.sell10Btn.disabled = totalStored < 1;
  dom.sellAllBtn.disabled = totalStored < 1;
  dom.acceptContractBtn.disabled = !state.contract.offer || !!state.contract.active;
  dom.deliverContractBtn.disabled = !state.contract.active || state.resources.stone < 1;
  dom.rerollContractBtn.disabled = !!state.contract.active;

  renderContract();
  renderResourcePanel();
  renderGrid(snapshot);
}

function initGrid() {
  dom.mapWorld.style.width = `${worldWidthPx()}px`;
  dom.mapWorld.style.height = `${worldHeightPx()}px`;
  dom.gridCells.style.gridTemplateColumns = `repeat(${CONFIG.gridCols}, minmax(0, 1fr))`;
  dom.gridCells.style.gridTemplateRows = `repeat(${CONFIG.gridRows}, minmax(0, 1fr))`;

  for (let row = 0; row < CONFIG.gridRows; row += 1) {
    for (let col = 0; col < CONFIG.gridCols; col += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "grid-cell";
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);
      dom.gridCells.appendChild(cell);
      cellRefs.set(cellKey(row, col), cell);
    }
  }
}

function bindEvents() {
  dom.mapBoard.addEventListener("pointerdown", (event) => {
    dom.mapBoard.setPointerCapture(event.pointerId);
    pointerState.points.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointerState.points.size === 2) {
      if (state.ui.drag.active) {
        resetDrag();
      }
      startPinchGesture();
      render();
      return;
    }

    if (pointerState.points.size > 2 || pointerState.pinchActive) {
      return;
    }

    pointerState.activePointerId = event.pointerId;
    pointerState.pointerDown = true;
    pointerState.panActive = false;
    pointerState.moved = false;
    pointerState.startX = event.clientX;
    pointerState.startY = event.clientY;
    pointerState.startCameraX = state.camera.x;
    pointerState.startCameraY = state.camera.y;

    if (state.ui.mode !== "connect") return;

    const touchedCell = getCellFromPointer(event.clientX, event.clientY);
    if (!touchedCell) return;

    const started = beginDragConnect(touchedCell.row, touchedCell.col, event);
    if (started) {
      event.preventDefault();
    }
  });

  dom.mapBoard.addEventListener("pointermove", (event) => {
    if (!pointerState.points.has(event.pointerId)) {
      return;
    }
    pointerState.points.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointerState.pinchActive) {
      if (pointerState.points.size >= 2) {
        updatePinchGesture();
        render();
      }
      return;
    }

    if (!pointerState.pointerDown || pointerState.activePointerId !== event.pointerId) {
      return;
    }

    if (state.ui.drag.active) {
      updateDragPointer(event.clientX, event.clientY);
      render();
      return;
    }

    const dx = event.clientX - pointerState.startX;
    const dy = event.clientY - pointerState.startY;
    const movedDistance = Math.hypot(dx, dy);
    if (!pointerState.panActive && movedDistance < CONFIG.panDragThresholdPx) {
      return;
    }

    pointerState.panActive = true;
    pointerState.moved = true;
    state.camera.x = pointerState.startCameraX + dx;
    state.camera.y = pointerState.startCameraY + dy;
    clampCamera();
    applyCameraTransform();
    render();
  });

  dom.mapBoard.addEventListener("pointerup", (event) => {
    if (dom.mapBoard.hasPointerCapture(event.pointerId)) {
      dom.mapBoard.releasePointerCapture(event.pointerId);
    }
    if (!pointerState.points.has(event.pointerId)) return;

    if (pointerState.pinchActive) {
      pointerState.points.delete(event.pointerId);
      if (pointerState.points.size < 2) {
        resetDrag();
        resetPointerState();
      }
      return;
    }

    if (pointerState.activePointerId !== event.pointerId) {
      pointerState.points.delete(event.pointerId);
      return;
    }

    pointerState.points.delete(event.pointerId);

    if (state.ui.drag.active) {
      finishDragConnect(event);
      resetPointerState();
      return;
    }

    const isPanRelease = pointerState.panActive || pointerState.moved;
    resetPointerState();
    if (isPanRelease) {
      return;
    }

    const touchedCell = getCellFromPointer(event.clientX, event.clientY);
    if (!touchedCell) return;
    onGridTap(touchedCell.row, touchedCell.col);
  });

  dom.mapBoard.addEventListener("pointercancel", (event) => {
    if (dom.mapBoard.hasPointerCapture(event.pointerId)) {
      dom.mapBoard.releasePointerCapture(event.pointerId);
    }
    pointerState.points.delete(event.pointerId);
    resetDrag();
    if (pointerState.points.size === 0) {
      resetPointerState();
    }
    render();
  });

  dom.toolBuyModeBtn.addEventListener("click", () => {
    enterBuyMode();
    render();
  });

  dom.toolCableModeBtn.addEventListener("click", () => {
    setMode("connect");
    render();
  });

  dom.toolInspectModeBtn.addEventListener("click", () => {
    setMode("inspect");
    render();
  });

  dom.buyMinerTypeBtn.addEventListener("click", () => {
    setBuildType("miner");
    render();
  });

  dom.buyWoodMinerTypeBtn.addEventListener("click", () => {
    setBuildType("wood_miner");
    render();
  });

  dom.buyIronMinerTypeBtn.addEventListener("click", () => {
    setBuildType("iron_miner");
    render();
  });

  dom.buyPoleTypeBtn.addEventListener("click", () => {
    setBuildType("pole");
    render();
  });

  dom.toggleAutoSellBtn.addEventListener("click", () => {
    state.autoSellEnabled = !state.autoSellEnabled;
    render();
  });

  dom.sell10Btn.addEventListener("click", () => {
    sellResourceUnits(10);
  });

  dom.sellAllBtn.addEventListener("click", () => {
    sellAllResources();
  });

  dom.toolUpgradeBtn.addEventListener("click", () => {
    upgradeSelected();
  });

  dom.toolDeleteBtn.addEventListener("click", () => {
    removeSelectedNode();
  });

  dom.toolSellBtn.addEventListener("click", () => {
    sellAllResources();
  });

  dom.techUnlockIronBtn.addEventListener("click", () => {
    unlockIronTechnology();
  });

  dom.resourceStrip.addEventListener("click", (event) => {
    const action = event.target?.dataset?.action;
    if (action === "open-resource-panel") {
      toggleResourcePanel();
    }
  });

  dom.resourcePanel.addEventListener("click", (event) => {
    if (event.target && event.target.id === "closeResourcePanelBtn") {
      toggleResourcePanel(false);
    }
  });

  dom.clearSelectionBtn.addEventListener("click", () => {
    state.ui.selectedNodeId = null;
    state.ui.pendingSourceId = null;
    resetDrag();
    render();
  });

  dom.acceptContractBtn.addEventListener("click", () => {
    acceptContract();
    render();
  });

  dom.deliverContractBtn.addEventListener("click", () => {
    deliverToContract();
    render();
  });

  dom.rerollContractBtn.addEventListener("click", () => {
    if (state.contract.active) return;
    nextContractOffer();
    render();
  });

  window.addEventListener("resize", () => {
    render();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.ui.resourcePanelOpen) {
      toggleResourcePanel(false);
    }
  });

  window.addEventListener("beforeunload", saveState);
}

function step(now) {
  const dtMs = Math.max(0, now - lastTick);
  lastTick = now;
  const dtSec = Math.min(0.5, dtMs / 1000);

  gameTick(dtSec);
  render();

  elapsedSinceSave += dtMs;
  if (elapsedSinceSave >= CONFIG.autosaveMs) {
    saveState();
    elapsedSinceSave = 0;
  }

  window.requestAnimationFrame(step);
}

initGrid();
bindEvents();
render();
window.requestAnimationFrame(step);
