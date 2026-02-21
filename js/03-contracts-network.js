function defaultTechState() {
  return {
    ironUnlocked: false,
    forgeUnlocked: false,
    advancedMinesUnlocked: false,
    assemblerUnlocked: false,
    materialsUnlocked: false,
    endgameUnlocked: false,
  };
}

function contractResourcePool(techState = defaultTechState()) {
  const tech = { ...defaultTechState(), ...(techState || {}) };
  const list = [
    { key: "stone", label: "Pedra", price: CONFIG.stonePrice, unlocked: true },
    { key: "wood", label: "Fusta", price: CONFIG.woodPrice, unlocked: true },
    { key: "sand", label: "Sorra", price: CONFIG.sandPrice, unlocked: true },
    { key: "water", label: "Aigua", price: CONFIG.waterPrice, unlocked: true },
    { key: "iron", label: "Ferro", price: CONFIG.ironPrice, unlocked: tech.ironUnlocked },
    { key: "coal", label: "Carbo", price: CONFIG.coalPrice, unlocked: tech.advancedMinesUnlocked },
    { key: "copper", label: "Coure", price: CONFIG.copperPrice, unlocked: tech.advancedMinesUnlocked },
    { key: "oil", label: "Petroli", price: CONFIG.oilPrice, unlocked: tech.advancedMinesUnlocked },
    { key: "aluminum", label: "Alumini", price: CONFIG.aluminumPrice, unlocked: tech.advancedMinesUnlocked },
    { key: "quartz", label: "Quars", price: CONFIG.quartzPrice, unlocked: tech.materialsUnlocked },
    { key: "sulfur", label: "Sofre", price: CONFIG.sulfurPrice, unlocked: tech.materialsUnlocked },
    { key: "gold", label: "Or", price: CONFIG.goldPrice, unlocked: tech.endgameUnlocked },
    { key: "lithium", label: "Liti", price: CONFIG.lithiumPrice, unlocked: tech.endgameUnlocked },
    { key: "parts", label: "Peces", price: CONFIG.partsPrice, unlocked: tech.forgeUnlocked },
    {
      key: "steel",
      label: "Acer",
      price: CONFIG.steelPrice,
      unlocked: tech.forgeUnlocked && tech.advancedMinesUnlocked,
    },
    {
      key: "plates",
      label: "Plaques",
      price: CONFIG.platesPrice,
      unlocked: tech.forgeUnlocked && tech.advancedMinesUnlocked,
    },
    { key: "silicon", label: "Silici", price: CONFIG.siliconPrice, unlocked: tech.forgeUnlocked && tech.advancedMinesUnlocked },
    { key: "plastic", label: "Plastic", price: CONFIG.plasticPrice, unlocked: tech.forgeUnlocked && tech.advancedMinesUnlocked },
    { key: "steam", label: "Vapor", price: CONFIG.steamPrice, unlocked: tech.forgeUnlocked && tech.advancedMinesUnlocked },
    { key: "glass", label: "Vidre", price: CONFIG.glassPrice, unlocked: tech.forgeUnlocked && tech.materialsUnlocked },
    { key: "acid", label: "Acid", price: CONFIG.acidPrice, unlocked: tech.forgeUnlocked && tech.materialsUnlocked },
    { key: "superalloy", label: "Superaliatge", price: CONFIG.superalloyPrice, unlocked: tech.forgeUnlocked && tech.endgameUnlocked },
    { key: "modules", label: "Moduls", price: CONFIG.modulesPrice, unlocked: tech.assemblerUnlocked },
    { key: "circuits", label: "Circuits", price: CONFIG.circuitsPrice, unlocked: tech.assemblerUnlocked },
    { key: "frames", label: "Bastidors", price: CONFIG.framesPrice, unlocked: tech.assemblerUnlocked },
    { key: "rubber", label: "Goma", price: CONFIG.rubberPrice, unlocked: tech.assemblerUnlocked && tech.advancedMinesUnlocked },
    { key: "wiring", label: "Cablejat", price: CONFIG.wiringPrice, unlocked: tech.assemblerUnlocked && tech.advancedMinesUnlocked },
    { key: "microchips", label: "Microxips", price: CONFIG.microchipsPrice, unlocked: tech.assemblerUnlocked && tech.advancedMinesUnlocked },
    { key: "batteries", label: "Bateries", price: CONFIG.batteriesPrice, unlocked: tech.assemblerUnlocked && tech.advancedMinesUnlocked },
    { key: "fiber", label: "Fibra", price: CONFIG.fiberPrice, unlocked: tech.assemblerUnlocked && tech.materialsUnlocked },
    { key: "composites", label: "Compostos", price: CONFIG.compositesPrice, unlocked: tech.assemblerUnlocked && tech.materialsUnlocked },
    { key: "quantumchips", label: "Quantum Xips", price: CONFIG.quantumchipsPrice, unlocked: tech.assemblerUnlocked && tech.endgameUnlocked },
  ];
  return list.filter((item) => item.unlocked);
}

const PREMIUM_CONTRACT_CHAINS = [
  {
    id: "chain_plates_circuits",
    label: "Plaques + Circuits",
    requires: (tech) => tech.forgeUnlocked && tech.advancedMinesUnlocked && tech.assemblerUnlocked,
    steps: ["Mines Coure/Carbo", "Farga: Plaques", "Assembler: Circuits"],
    requirements: [
      { key: "plates", min: 18, max: 32 },
      { key: "circuits", min: 16, max: 30 },
      { key: "parts", min: 18, max: 34 },
    ],
    baseDurationSec: 170,
    rewardMin: 2.6,
    rewardMax: 3.45,
  },
  {
    id: "chain_steel_frames",
    label: "Acer + Bastidors",
    requires: (tech) => tech.forgeUnlocked && tech.advancedMinesUnlocked && tech.assemblerUnlocked,
    steps: ["Mines Ferro/Carbo/Coure", "Farga: Acer + Plaques", "Assembler: Bastidors"],
    requirements: [
      { key: "steel", min: 18, max: 30 },
      { key: "frames", min: 14, max: 24 },
      { key: "plates", min: 14, max: 26 },
    ],
    baseDurationSec: 185,
    rewardMin: 2.75,
    rewardMax: 3.55,
  },
  {
    id: "chain_parts_modules",
    label: "Peces + Moduls",
    requires: (tech) => tech.forgeUnlocked && tech.advancedMinesUnlocked && tech.assemblerUnlocked,
    steps: ["Mines Fusta/Ferro/Coure", "Farga: Peces + Plaques", "Assembler: Moduls"],
    requirements: [
      { key: "parts", min: 24, max: 42 },
      { key: "modules", min: 14, max: 26 },
      { key: "plates", min: 14, max: 28 },
    ],
    baseDurationSec: 165,
    rewardMin: 2.55,
    rewardMax: 3.35,
  },
  {
    id: "chain_glass_composites",
    label: "Vidre + Compostos",
    requires: (tech) => tech.forgeUnlocked && tech.materialsUnlocked && tech.assemblerUnlocked,
    steps: ["Mines Sorra/Quars/Sofre", "Farga: Vidre + Acid", "Assembler: Fibra + Compostos"],
    requirements: [
      { key: "glass", min: 18, max: 32 },
      { key: "acid", min: 14, max: 28 },
      { key: "composites", min: 12, max: 22 },
    ],
    baseDurationSec: 190,
    rewardMin: 2.85,
    rewardMax: 3.7,
  },
  {
    id: "chain_superalloy_quantum",
    label: "Superaliatge + Quantum",
    requires: (tech) => tech.forgeUnlocked && tech.assemblerUnlocked && tech.endgameUnlocked,
    steps: ["Mines Or/Liti", "Farga: Superaliatge", "Assembler: Quantum Xips"],
    requirements: [
      { key: "superalloy", min: 10, max: 18 },
      { key: "quantumchips", min: 8, max: 14 },
      { key: "gold", min: 14, max: 24 },
    ],
    baseDurationSec: 220,
    rewardMin: 3.2,
    rewardMax: 4.05,
  },
];

function premiumChainsForTech(techState = defaultTechState()) {
  const tech = { ...defaultTechState(), ...(techState || {}) };
  return PREMIUM_CONTRACT_CHAINS.filter((chain) => chain.requires(tech));
}

function createPremiumContractOffer(id, techState, pool) {
  const chains = premiumChainsForTech(techState);
  if (chains.length < 1) return null;

  const chain = chains[Math.floor(Math.random() * chains.length)];
  const scale = 0.9 + Math.random() * 0.8;
  const requirements = chain.requirements.map((item) => {
    const base = item.min + Math.random() * (item.max - item.min);
    return {
      key: item.key,
      required: Math.max(8, Math.round(base * scale)),
    };
  });

  const priceMap = new Map(pool.map((item) => [item.key, item.price]));
  const totalValue = requirements.reduce((sum, req) => {
    return sum + req.required * (priceMap.get(req.key) || 1);
  }, 0);
  const rewardRoll = chain.rewardMin + Math.random() * (chain.rewardMax - chain.rewardMin);
  const reward = Math.round(totalValue * rewardRoll * contractRewardBonusMultiplier());
  const penalty = Math.max(22, Math.round(reward * 0.31));
  const durationSec = Math.floor(
    chain.baseDurationSec +
      totalValue * 0.56 +
      requirements.length * 16 +
      Math.random() * 60
  );

  return {
    id,
    tier: "premium",
    chainId: chain.id,
    chainLabel: chain.label,
    chainSteps: [...chain.steps],
    requirements,
    durationSec,
    reward,
    penalty,
  };
}

function normalizeContract(contract) {
  if (!contract || typeof contract !== "object") return null;

  const requirements = Array.isArray(contract.requirements)
    ? contract.requirements
        .map((req) => ({
          key: req?.key,
          required: Math.max(0, Math.floor(Number(req?.required) || 0)),
        }))
        .filter((req) => typeof req.key === "string" && req.required > 0)
    : Number.isFinite(contract.requiredStone)
      ? [{ key: "stone", required: Math.max(0, Math.floor(contract.requiredStone)) }]
      : [];

  const deliveredMap = { ...(contract.delivered || {}) };
  if (Number.isFinite(contract.deliveredStone)) {
    deliveredMap.stone = Math.max(0, Math.floor(contract.deliveredStone));
  }

  return {
    ...contract,
    chainId: typeof contract.chainId === "string" ? contract.chainId : null,
    chainLabel: typeof contract.chainLabel === "string" ? contract.chainLabel : "",
    chainSteps: Array.isArray(contract.chainSteps)
      ? contract.chainSteps.filter((item) => typeof item === "string")
      : [],
    requirements,
    delivered: deliveredMap,
  };
}

function createContractOffer(id, context = null) {
  const techState = context && context.tech ? context.tech : defaultTechState();
  const researchState = context && context.research ? context.research : { unlocked: {} };
  const pool = contractResourcePool(techState || defaultTechState());
  const totalUnlocked = pool.length;
  const premiumChance = 0.3 + contractPremiumChanceBonus();
  const canTryPremium =
    premiumContractsUnlocked(researchState) &&
    premiumChainsForTech(techState).length > 0 &&
    Math.random() < premiumChance;

  if (canTryPremium) {
    const premiumOffer = createPremiumContractOffer(id, techState, pool);
    if (premiumOffer) {
      return premiumOffer;
    }
  }

  const maxReq = totalUnlocked >= 5 ? 3 : totalUnlocked >= 3 ? 2 : 1;
  const minReq = totalUnlocked >= 2 ? 2 : 1;
  const reqCount = Math.max(1, Math.min(maxReq, minReq + Math.floor(Math.random() * maxReq)));
  const picks = [...pool].sort(() => Math.random() - 0.5).slice(0, reqCount);
  const requirements = picks.map((res) => {
    const baseUnits = 28 + Math.random() * 60;
    const qtyScale = 1.45 / Math.sqrt(Math.max(1, res.price));
    const required = Math.max(6, Math.round(baseUnits * qtyScale));
    return { key: res.key, required };
  });

  const totalValue = requirements.reduce((sum, req) => {
    const meta = pool.find((res) => res.key === req.key);
    return sum + req.required * (meta ? meta.price : 1);
  }, 0);
  const rewardMultiplier = (1.5 + Math.random() * 0.75) * contractRewardBonusMultiplier();
  const reward = Math.round(totalValue * rewardMultiplier);
  const penalty = Math.max(14, Math.round(reward * 0.24));
  const durationSec = Math.floor(
    85 + totalValue * 0.7 + requirements.length * 18 + Math.random() * 55
  );

  return {
    id,
    tier: "normal",
    chainId: null,
    chainLabel: "",
    chainSteps: [],
    requirements,
    durationSec,
    reward,
    penalty,
  };
}

function nextContractOffer() {
  state.contract.lastId += 1;
  state.contract.offer = createContractOffer(state.contract.lastId, {
    tech: state.tech,
    research: state.research,
  });
}

function acceptContract() {
  if (!state.contract.offer || state.contract.active) return;
  const now = Date.now();
  const offer = normalizeContract(state.contract.offer);
  if (!offer || offer.requirements.length < 1) return;

  state.contract.active = {
    ...offer,
    acceptedAt: now,
    deadlineAt: now + offer.durationSec * 1000,
    delivered: Object.fromEntries(offer.requirements.map((req) => [req.key, 0])),
  };
  state.contract.offer = null;
}

function contractPendingFor(active, key) {
  if (!active) return 0;
  const req = (active.requirements || []).find((item) => item.key === key);
  if (!req) return 0;
  const done = Math.max(0, Math.floor((active.delivered && active.delivered[key]) || 0));
  return Math.max(0, req.required - done);
}

function contractIsComplete(active) {
  if (!active) return false;
  return (active.requirements || []).every((req) => contractPendingFor(active, req.key) <= 0);
}

function canDeliverToContract(active) {
  if (!active) return false;
  return (active.requirements || []).some((req) => {
    const pending = contractPendingFor(active, req.key);
    const available = Math.floor(Math.max(0, state.resources[req.key] || 0));
    return pending > 0 && available > 0;
  });
}

function deliverToContract() {
  const active = normalizeContract(state.contract.active);
  if (!active) return;

  let deliveredAny = 0;
  for (const req of active.requirements) {
    const pending = contractPendingFor(active, req.key);
    if (pending <= 0) continue;
    const available = Math.floor(Math.max(0, state.resources[req.key] || 0));
    if (available <= 0) continue;
    const amount = Math.min(pending, available);
    if (amount <= 0) continue;
    state.resources[req.key] -= amount;
    active.delivered[req.key] = (active.delivered[req.key] || 0) + amount;
    deliveredAny += amount;
  }

  state.contract.active = active;

  if (deliveredAny <= 0) return;

  if (contractIsComplete(active)) {
    state.money += active.reward;
    state.progression.totalMoneyEarned += active.reward;
    state.progression.contractsCompleted += 1;
    if (active.tier === "premium") {
      state.progression.contractsPremiumCompleted += 1;
      state.research.points += 12;
    } else {
      state.research.points += 4;
    }
    state.contract.active = null;
    nextContractOffer();
    showToast(active.tier === "premium" ? "Contracte premium completat" : "Contracte completat");
    return;
  }

  showToast(`Entrega +${formatInt(deliveredAny)}u`);
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
  const connectedSandMiners = sandMinerNodes().filter((node) =>
    reachableFromWarehouse.has(node.id)
  );
  const connectedWaterMiners = waterMinerNodes().filter((node) =>
    reachableFromWarehouse.has(node.id)
  );
  const connectedIronMiners = ironMinerNodes().filter((node) =>
    reachableFromWarehouse.has(node.id)
  );
  const connectedCoalMiners = coalMinerNodes().filter((node) =>
    reachableFromWarehouse.has(node.id)
  );
  const connectedCopperMiners = copperMinerNodes().filter((node) =>
    reachableFromWarehouse.has(node.id)
  );
  const connectedOilMiners = oilMinerNodes().filter((node) =>
    reachableFromWarehouse.has(node.id)
  );
  const connectedAluminumMiners = aluminumMinerNodes().filter((node) =>
    reachableFromWarehouse.has(node.id)
  );
  const connectedQuartzMiners = quartzMinerNodes().filter((node) =>
    reachableFromWarehouse.has(node.id)
  );
  const connectedSulfurMiners = sulfurMinerNodes().filter((node) =>
    reachableFromWarehouse.has(node.id)
  );
  const connectedGoldMiners = goldMinerNodes().filter((node) =>
    reachableFromWarehouse.has(node.id)
  );
  const connectedLithiumMiners = lithiumMinerNodes().filter((node) =>
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
  const sandRate = connectedSandMiners.reduce(
    (sum, miner) => sum + sandMinerRatePerSec(miner.level),
    0
  );
  const waterRate = connectedWaterMiners.reduce(
    (sum, miner) => sum + waterMinerRatePerSec(miner.level),
    0
  );
  const ironRate = connectedIronMiners.reduce(
    (sum, miner) => sum + ironMinerRatePerSec(miner.level),
    0
  );
  const coalRate = connectedCoalMiners.reduce(
    (sum, miner) => sum + coalMinerRatePerSec(miner.level),
    0
  );
  const copperRate = connectedCopperMiners.reduce(
    (sum, miner) => sum + copperMinerRatePerSec(miner.level),
    0
  );
  const oilRate = connectedOilMiners.reduce(
    (sum, miner) => sum + oilMinerRatePerSec(miner.level),
    0
  );
  const aluminumRate = connectedAluminumMiners.reduce(
    (sum, miner) => sum + aluminumMinerRatePerSec(miner.level),
    0
  );
  const quartzRate = connectedQuartzMiners.reduce(
    (sum, miner) => sum + quartzMinerRatePerSec(miner.level),
    0
  );
  const sulfurRate = connectedSulfurMiners.reduce(
    (sum, miner) => sum + sulfurMinerRatePerSec(miner.level),
    0
  );
  const goldRate = connectedGoldMiners.reduce(
    (sum, miner) => sum + goldMinerRatePerSec(miner.level),
    0
  );
  const lithiumRate = connectedLithiumMiners.reduce(
    (sum, miner) => sum + lithiumMinerRatePerSec(miner.level),
    0
  );
  const processorRates = {};
  for (const node of state.nodes) {
    if (!reachableFromWarehouse.has(node.id)) continue;
    const processor = PROCESSOR_NODE_TYPES[node.type];
    if (!processor) continue;
    const recipeId = nodeRecipeId(node);
    if (!recipeId) continue;
    const rate = processor.ratePerSec(node.level);
    processorRates[recipeId] = (processorRates[recipeId] || 0) + rate;
  }

  const processingRate = Object.values(processorRates).reduce((sum, rate) => sum + rate, 0);
  const forgeRate =
    (processorRates.forge_parts || 0) +
    (processorRates.forge_steel || 0) +
    (processorRates.forge_plates || 0) +
    (processorRates.forge_silicon || 0) +
    (processorRates.forge_plastic || 0) +
    (processorRates.forge_steam || 0) +
    (processorRates.forge_glass || 0) +
    (processorRates.forge_acid || 0) +
    (processorRates.forge_superalloy || 0);
  const assemblerRate =
    (processorRates.assembler_modules || 0) +
    (processorRates.assembler_circuits || 0) +
    (processorRates.assembler_frames || 0) +
    (processorRates.assembler_rubber || 0) +
    (processorRates.assembler_wiring || 0) +
    (processorRates.assembler_microchips || 0) +
    (processorRates.assembler_batteries || 0) +
    (processorRates.assembler_fiber || 0) +
    (processorRates.assembler_composites || 0) +
    (processorRates.assembler_quantumchips || 0);

  return {
    warehouseNode,
    marketNode,
    reachableFromWarehouse,
    connectedRate:
      stoneRate +
      woodRate +
      sandRate +
      waterRate +
      ironRate +
      coalRate +
      copperRate +
      oilRate +
      aluminumRate +
      quartzRate +
      sulfurRate +
      goldRate +
      lithiumRate +
      processingRate,
    stoneRate,
    woodRate,
    sandRate,
    waterRate,
    ironRate,
    coalRate,
    copperRate,
    oilRate,
    aluminumRate,
    quartzRate,
    sulfurRate,
    goldRate,
    lithiumRate,
    forgeRate,
    assemblerRate,
    processorRates,
    marketConnected: !!(marketNode && reachableFromWarehouse.has(marketNode.id)),
    nodeMap: new Map(state.nodes.map((node) => [node.id, node])),
  };
}

