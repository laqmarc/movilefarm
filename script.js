const SAVE_KEY = "movile-farm-save-v1";

const CONFIG = {
  tickMs: 200,
  autosaveMs: 4000,
  stonePrice: 1,
  autoSellRatePerSec: 8,
  initialMoney: 120,
  minerBaseCost: 25,
  minerCostScale: 1.4,
  minerUpgradeBaseCost: 60,
  minerUpgradeScale: 1.8,
  warehouseUpgradeBaseCost: 45,
  warehouseUpgradeScale: 1.7,
  baseCapacity: 120,
  capacityPerWarehouseLevel: 90,
};

const dom = {
  moneyValue: document.getElementById("moneyValue"),
  stoneValue: document.getElementById("stoneValue"),
  productionValue: document.getElementById("productionValue"),
  minerCount: document.getElementById("minerCount"),
  minerLevel: document.getElementById("minerLevel"),
  warehouseLevel: document.getElementById("warehouseLevel"),
  capacityValue: document.getElementById("capacityValue"),
  flowStatus: document.getElementById("flowStatus"),
  stonePriceValue: document.getElementById("stonePriceValue"),
  contractOffer: document.getElementById("contractOffer"),
  buyMinerBtn: document.getElementById("buyMinerBtn"),
  upgradeMinerBtn: document.getElementById("upgradeMinerBtn"),
  upgradeWarehouseBtn: document.getElementById("upgradeWarehouseBtn"),
  sell10Btn: document.getElementById("sell10Btn"),
  sellAllBtn: document.getElementById("sellAllBtn"),
  acceptContractBtn: document.getElementById("acceptContractBtn"),
  deliverContractBtn: document.getElementById("deliverContractBtn"),
  rerollContractBtn: document.getElementById("rerollContractBtn"),
  minerToWarehouseToggle: document.getElementById("minerToWarehouseToggle"),
  warehouseToMarketToggle: document.getElementById("warehouseToMarketToggle"),
};

const state = loadState();
let lastTick = performance.now();
let elapsedSinceSave = 0;

function createDefaultState() {
  return {
    money: CONFIG.initialMoney,
    resources: {
      stone: 0,
      wastedStone: 0,
    },
    machines: {
      minerCount: 1,
      minerLevel: 1,
      warehouseLevel: 1,
    },
    links: {
      minerToWarehouse: true,
      warehouseToMarket: false,
    },
    contract: {
      offer: createContractOffer(1),
      active: null,
      lastId: 1,
    },
  };
}

function loadState() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return createDefaultState();

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return createDefaultState();
    return {
      ...createDefaultState(),
      ...parsed,
      resources: { ...createDefaultState().resources, ...parsed.resources },
      machines: { ...createDefaultState().machines, ...parsed.machines },
      links: { ...createDefaultState().links, ...parsed.links },
      contract: {
        ...createDefaultState().contract,
        ...parsed.contract,
      },
    };
  } catch {
    return createDefaultState();
  }
}

function saveState() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function capacity() {
  return (
    CONFIG.baseCapacity +
    (state.machines.warehouseLevel - 1) * CONFIG.capacityPerWarehouseLevel
  );
}

function minerRatePerSec() {
  if (state.machines.minerCount <= 0) return 0;
  const levelBonus = 1 + (state.machines.minerLevel - 1) * 0.35;
  return state.machines.minerCount * levelBonus;
}

function minerBuyCost() {
  return Math.round(
    CONFIG.minerBaseCost * CONFIG.minerCostScale ** state.machines.minerCount
  );
}

function minerUpgradeCost() {
  return Math.round(
    CONFIG.minerUpgradeBaseCost *
      CONFIG.minerUpgradeScale ** (state.machines.minerLevel - 1)
  );
}

function warehouseUpgradeCost() {
  return Math.round(
    CONFIG.warehouseUpgradeBaseCost *
      CONFIG.warehouseUpgradeScale ** (state.machines.warehouseLevel - 1)
  );
}

function createContractOffer(id) {
  const required = Math.floor(30 + Math.random() * 90);
  const durationSec = Math.floor(60 + Math.random() * 90);
  const rewardMultiplier = 1.7 + Math.random() * 1.4;
  const reward = Math.round(required * rewardMultiplier);
  const penalty = Math.max(12, Math.round(reward * 0.24));
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

function spendMoney(amount) {
  if (state.money < amount) return false;
  state.money -= amount;
  return true;
}

function sellStone(amount) {
  if (!state.links.warehouseToMarket) return;
  const qty = Math.floor(Math.max(0, Math.min(amount, state.resources.stone)));
  if (qty <= 0) return;
  state.resources.stone -= qty;
  state.money += qty * CONFIG.stonePrice;
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

  const deliverAmount = Math.floor(Math.min(pending, state.resources.stone));
  if (deliverAmount <= 0) return;

  state.resources.stone -= deliverAmount;
  active.deliveredStone += deliverAmount;

  if (active.deliveredStone >= active.requiredStone) {
    state.money += active.reward;
    state.contract.active = null;
    nextContractOffer();
  }
}

function failContract() {
  const active = state.contract.active;
  if (!active) return;
  state.money = Math.max(0, state.money - active.penalty);
  state.contract.active = null;
  nextContractOffer();
}

function updateContractTick() {
  const active = state.contract.active;
  if (!active) return;
  if (Date.now() >= active.deadlineAt) {
    failContract();
  }
}

function gameTick(dtSec) {
  updateContractTick();

  if (state.links.minerToWarehouse) {
    const produced = minerRatePerSec() * dtSec;
    const freeCapacity = Math.max(0, capacity() - state.resources.stone);
    const stored = Math.min(produced, freeCapacity);
    const lost = produced - stored;
    state.resources.stone += stored;
    state.resources.wastedStone += lost;
  }

  if (state.links.warehouseToMarket) {
    const autoSold = Math.min(state.resources.stone, CONFIG.autoSellRatePerSec * dtSec);
    state.resources.stone -= autoSold;
    state.money += autoSold * CONFIG.stonePrice;
  }
}

function formatInt(value) {
  return Math.floor(value).toLocaleString("ca-ES");
}

function formatCompact(value) {
  return value.toLocaleString("ca-ES", { maximumFractionDigits: 1 });
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

function render() {
  const currentCapacity = capacity();
  const currentRate = minerRatePerSec();
  const flowActive = state.links.minerToWarehouse && state.links.warehouseToMarket;

  dom.moneyValue.textContent = `${formatCompact(state.money)}$`;
  dom.stoneValue.textContent = `${formatCompact(state.resources.stone)} / ${formatInt(currentCapacity)}`;
  dom.productionValue.textContent = `${formatCompact(currentRate)} pedra/s`;
  dom.minerCount.textContent = formatInt(state.machines.minerCount);
  dom.minerLevel.textContent = formatInt(state.machines.minerLevel);
  dom.warehouseLevel.textContent = formatInt(state.machines.warehouseLevel);
  dom.capacityValue.textContent = `${formatInt(currentCapacity)} u`;
  dom.stonePriceValue.textContent = `${CONFIG.stonePrice}$`;

  dom.buyMinerBtn.textContent = `Comprar miner (${formatInt(minerBuyCost())}$)`;
  dom.upgradeMinerBtn.textContent = `Upgrade miner (${formatInt(minerUpgradeCost())}$)`;
  dom.upgradeWarehouseBtn.textContent = `Upgrade magatzem (${formatInt(warehouseUpgradeCost())}$)`;

  dom.buyMinerBtn.disabled = state.money < minerBuyCost();
  dom.upgradeMinerBtn.disabled = state.money < minerUpgradeCost();
  dom.upgradeWarehouseBtn.disabled = state.money < warehouseUpgradeCost();
  dom.sell10Btn.disabled = !state.links.warehouseToMarket || state.resources.stone < 1;
  dom.sellAllBtn.disabled = !state.links.warehouseToMarket || state.resources.stone < 1;
  dom.acceptContractBtn.disabled = !state.contract.offer || !!state.contract.active;
  dom.deliverContractBtn.disabled = !state.contract.active || state.resources.stone < 1;
  dom.rerollContractBtn.disabled = !!state.contract.active;

  dom.minerToWarehouseToggle.checked = state.links.minerToWarehouse;
  dom.warehouseToMarketToggle.checked = state.links.warehouseToMarket;

  dom.flowStatus.className = `badge ${flowActive ? "ok" : "bad"}`;
  dom.flowStatus.textContent = flowActive ? "Flux complet actiu" : "Flux parcial o aturat";

  renderContract();
}

function bindEvents() {
  dom.buyMinerBtn.addEventListener("click", () => {
    const cost = minerBuyCost();
    if (!spendMoney(cost)) return;
    state.machines.minerCount += 1;
    render();
  });

  dom.upgradeMinerBtn.addEventListener("click", () => {
    const cost = minerUpgradeCost();
    if (!spendMoney(cost)) return;
    state.machines.minerLevel += 1;
    render();
  });

  dom.upgradeWarehouseBtn.addEventListener("click", () => {
    const cost = warehouseUpgradeCost();
    if (!spendMoney(cost)) return;
    state.machines.warehouseLevel += 1;
    render();
  });

  dom.sell10Btn.addEventListener("click", () => {
    sellStone(10);
    render();
  });

  dom.sellAllBtn.addEventListener("click", () => {
    sellStone(state.resources.stone);
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

  dom.minerToWarehouseToggle.addEventListener("change", (e) => {
    state.links.minerToWarehouse = e.target.checked;
    render();
  });

  dom.warehouseToMarketToggle.addEventListener("change", (e) => {
    state.links.warehouseToMarket = e.target.checked;
    render();
  });
}

function step(now) {
  const dtMs = Math.max(0, now - lastTick);
  lastTick = now;
  const dtSec = dtMs / 1000;

  gameTick(dtSec);
  render();

  elapsedSinceSave += dtMs;
  if (elapsedSinceSave >= CONFIG.autosaveMs) {
    saveState();
    elapsedSinceSave = 0;
  }

  window.requestAnimationFrame(step);
}

window.addEventListener("beforeunload", saveState);

bindEvents();
render();
window.requestAnimationFrame(step);
