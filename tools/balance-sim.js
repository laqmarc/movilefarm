const fs = require("fs");
const path = require("path");

function extractObject(filePath, key) {
  const src = fs.readFileSync(filePath, "utf8");
  const start = src.indexOf(key);
  if (start < 0) throw new Error(`No trobat: ${key}`);
  const open = src.indexOf("{", start);
  let depth = 0;
  let end = -1;
  for (let i = open; i < src.length; i += 1) {
    if (src[i] === "{") depth += 1;
    if (src[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end < 0) throw new Error("No s'ha pogut tancar objecte");
  return Function(`return (${src.slice(open, end + 1)});`)();
}

function secondsToClock(totalSec) {
  const s = Math.max(0, Math.floor(totalSec));
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

const CONFIG = extractObject(
  path.join(process.cwd(), "js", "01-bootstrap.js"),
  "const CONFIG ="
);

const rates = {
  miner: 1,
  wood_miner: 0.8,
  sand_miner: 0.74,
  water_miner: 0.82,
  iron_miner: 0.55,
  coal_miner: 0.62,
  copper_miner: 0.52,
  oil_miner: 0.45,
  aluminum_miner: 0.42,
  quartz_miner: 0.34,
  sulfur_miner: 0.36,
  gold_miner: 0.22,
  lithium_miner: 0.25,
};

const prices = {
  stone: CONFIG.stonePrice,
  wood: CONFIG.woodPrice,
  sand: CONFIG.sandPrice,
  water: CONFIG.waterPrice,
  iron: CONFIG.ironPrice,
  coal: CONFIG.coalPrice,
  copper: CONFIG.copperPrice,
  oil: CONFIG.oilPrice,
  aluminum: CONFIG.aluminumPrice,
  quartz: CONFIG.quartzPrice,
  sulfur: CONFIG.sulfurPrice,
  gold: CONFIG.goldPrice,
  lithium: CONFIG.lithiumPrice,
  parts: CONFIG.partsPrice,
  steel: CONFIG.steelPrice,
  plates: CONFIG.platesPrice,
  silicon: CONFIG.siliconPrice,
  plastic: CONFIG.plasticPrice,
  steam: CONFIG.steamPrice,
  glass: CONFIG.glassPrice,
  acid: CONFIG.acidPrice,
  superalloy: CONFIG.superalloyPrice,
  modules: CONFIG.modulesPrice,
  circuits: CONFIG.circuitsPrice,
  frames: CONFIG.framesPrice,
  rubber: CONFIG.rubberPrice,
  wiring: CONFIG.wiringPrice,
  microchips: CONFIG.microchipsPrice,
  batteries: CONFIG.batteriesPrice,
  fiber: CONFIG.fiberPrice,
  composites: CONFIG.compositesPrice,
  quantumchips: CONFIG.quantumchipsPrice,
};

const miners = {
  miner: {
    resource: "stone",
    baseCost: CONFIG.minerBaseCost,
    scale: CONFIG.minerCostScale,
    upkeep: 0.14,
    unlocked: () => true,
  },
  wood_miner: {
    resource: "wood",
    baseCost: CONFIG.woodMinerBaseCost,
    scale: CONFIG.woodMinerCostScale,
    upkeep: 0.16,
    unlocked: () => true,
  },
  sand_miner: {
    resource: "sand",
    baseCost: CONFIG.sandMinerBaseCost,
    scale: CONFIG.sandMinerCostScale,
    upkeep: 0.17,
    unlocked: () => true,
  },
  water_miner: {
    resource: "water",
    baseCost: CONFIG.waterMinerBaseCost,
    scale: CONFIG.waterMinerCostScale,
    upkeep: 0.15,
    unlocked: () => true,
  },
  iron_miner: {
    resource: "iron",
    baseCost: CONFIG.ironMinerBaseCost,
    scale: CONFIG.ironMinerCostScale,
    upkeep: 0.19,
    unlocked: (s) => s.tech.ironUnlocked,
  },
  coal_miner: {
    resource: "coal",
    baseCost: CONFIG.coalMinerBaseCost,
    scale: CONFIG.coalMinerCostScale,
    upkeep: 0.2,
    unlocked: (s) => s.tech.advancedMinesUnlocked,
  },
  copper_miner: {
    resource: "copper",
    baseCost: CONFIG.copperMinerBaseCost,
    scale: CONFIG.copperMinerCostScale,
    upkeep: 0.22,
    unlocked: (s) => s.tech.advancedMinesUnlocked,
  },
  oil_miner: {
    resource: "oil",
    baseCost: CONFIG.oilMinerBaseCost,
    scale: CONFIG.oilMinerCostScale,
    upkeep: 0.24,
    unlocked: (s) => s.tech.advancedMinesUnlocked,
  },
  aluminum_miner: {
    resource: "aluminum",
    baseCost: CONFIG.aluminumMinerBaseCost,
    scale: CONFIG.aluminumMinerCostScale,
    upkeep: 0.25,
    unlocked: (s) => s.tech.advancedMinesUnlocked,
  },
  quartz_miner: {
    resource: "quartz",
    baseCost: CONFIG.quartzMinerBaseCost,
    scale: CONFIG.quartzMinerCostScale,
    upkeep: 0.24,
    unlocked: (s) => s.tech.materialsUnlocked,
  },
  sulfur_miner: {
    resource: "sulfur",
    baseCost: CONFIG.sulfurMinerBaseCost,
    scale: CONFIG.sulfurMinerCostScale,
    upkeep: 0.23,
    unlocked: (s) => s.tech.materialsUnlocked,
  },
  gold_miner: {
    resource: "gold",
    baseCost: CONFIG.goldMinerBaseCost,
    scale: CONFIG.goldMinerCostScale,
    upkeep: 0.29,
    unlocked: (s) => s.tech.endgameUnlocked,
  },
  lithium_miner: {
    resource: "lithium",
    baseCost: CONFIG.lithiumMinerBaseCost,
    scale: CONFIG.lithiumMinerCostScale,
    upkeep: 0.28,
    unlocked: (s) => s.tech.endgameUnlocked,
  },
};

function mapValue(map) {
  return Object.entries(map).reduce((sum, [key, qty]) => sum + (prices[key] || 0) * qty, 0);
}

const recipes = {
  forge: [
    { inputs: { wood: CONFIG.forgeWoodPerUnit, iron: CONFIG.forgeIronPerUnit }, outputs: { parts: CONFIG.forgePartsPerUnit }, unlocked: (s) => s.tech.forgeUnlocked },
    { inputs: { iron: CONFIG.forgeSteelIronPerUnit, coal: CONFIG.forgeSteelCoalPerUnit }, outputs: { steel: CONFIG.forgeSteelPerUnit }, unlocked: (s) => s.tech.forgeUnlocked && s.tech.advancedMinesUnlocked },
    { inputs: { copper: CONFIG.forgePlatesCopperPerUnit, coal: CONFIG.forgePlatesCoalPerUnit }, outputs: { plates: CONFIG.forgePlatesPerUnit }, unlocked: (s) => s.tech.forgeUnlocked && s.tech.advancedMinesUnlocked },
    { inputs: { sand: CONFIG.forgeSiliconSandPerUnit, coal: CONFIG.forgeSiliconCoalPerUnit }, outputs: { silicon: CONFIG.forgeSiliconPerUnit }, unlocked: (s) => s.tech.forgeUnlocked && s.tech.advancedMinesUnlocked },
    { inputs: { oil: CONFIG.forgePlasticOilPerUnit, coal: CONFIG.forgePlasticCoalPerUnit }, outputs: { plastic: CONFIG.forgePlasticPerUnit }, unlocked: (s) => s.tech.forgeUnlocked && s.tech.advancedMinesUnlocked },
    { inputs: { water: CONFIG.forgeSteamWaterPerUnit, coal: CONFIG.forgeSteamCoalPerUnit }, outputs: { steam: CONFIG.forgeSteamPerUnit }, unlocked: (s) => s.tech.forgeUnlocked && s.tech.advancedMinesUnlocked },
    { inputs: { sand: CONFIG.forgeGlassSandPerUnit, quartz: CONFIG.forgeGlassQuartzPerUnit }, outputs: { glass: CONFIG.forgeGlassPerUnit }, unlocked: (s) => s.tech.forgeUnlocked && s.tech.materialsUnlocked },
    { inputs: { sulfur: CONFIG.forgeAcidSulfurPerUnit, water: CONFIG.forgeAcidWaterPerUnit }, outputs: { acid: CONFIG.forgeAcidPerUnit }, unlocked: (s) => s.tech.forgeUnlocked && s.tech.materialsUnlocked },
    { inputs: { gold: CONFIG.forgeSuperalloyGoldPerUnit, aluminum: CONFIG.forgeSuperalloyAluminumPerUnit }, outputs: { superalloy: CONFIG.forgeSuperalloyPerUnit }, unlocked: (s) => s.tech.forgeUnlocked && s.tech.endgameUnlocked },
  ],
  assembler: [
    { inputs: { parts: CONFIG.assemblerPartsPerUnit, plates: CONFIG.assemblerPlatesPerUnit }, outputs: { modules: CONFIG.assemblerModulesPerUnit }, unlocked: (s) => s.tech.assemblerUnlocked },
    { inputs: { parts: CONFIG.assemblerCircuitPartsPerUnit, copper: CONFIG.assemblerCircuitCopperPerUnit }, outputs: { circuits: CONFIG.assemblerCircuitsPerUnit }, unlocked: (s) => s.tech.assemblerUnlocked },
    { inputs: { steel: CONFIG.assemblerFrameSteelPerUnit, plates: CONFIG.assemblerFramePlatesPerUnit }, outputs: { frames: CONFIG.assemblerFramesPerUnit }, unlocked: (s) => s.tech.assemblerUnlocked },
    { inputs: { oil: CONFIG.assemblerRubberOilPerUnit, wood: CONFIG.assemblerRubberWoodPerUnit }, outputs: { rubber: CONFIG.assemblerRubberPerUnit }, unlocked: (s) => s.tech.assemblerUnlocked && s.tech.advancedMinesUnlocked },
    { inputs: { copper: CONFIG.assemblerWiringCopperPerUnit, rubber: CONFIG.assemblerWiringRubberPerUnit }, outputs: { wiring: CONFIG.assemblerWiringPerUnit }, unlocked: (s) => s.tech.assemblerUnlocked && s.tech.advancedMinesUnlocked },
    { inputs: { silicon: CONFIG.assemblerMicrochipsSiliconPerUnit, plastic: CONFIG.assemblerMicrochipsPlasticPerUnit, circuits: CONFIG.assemblerMicrochipsCircuitsPerUnit }, outputs: { microchips: CONFIG.assemblerMicrochipsPerUnit }, unlocked: (s) => s.tech.assemblerUnlocked && s.tech.advancedMinesUnlocked },
    { inputs: { aluminum: CONFIG.assemblerBatteriesAluminumPerUnit, copper: CONFIG.assemblerBatteriesCopperPerUnit, plastic: CONFIG.assemblerBatteriesPlasticPerUnit }, outputs: { batteries: CONFIG.assemblerBatteriesPerUnit }, unlocked: (s) => s.tech.assemblerUnlocked && s.tech.advancedMinesUnlocked },
    { inputs: { glass: CONFIG.assemblerFiberGlassPerUnit, plastic: CONFIG.assemblerFiberPlasticPerUnit }, outputs: { fiber: CONFIG.assemblerFiberPerUnit }, unlocked: (s) => s.tech.assemblerUnlocked && s.tech.materialsUnlocked },
    { inputs: { fiber: CONFIG.assemblerCompositesFiberPerUnit, aluminum: CONFIG.assemblerCompositesAluminumPerUnit }, outputs: { composites: CONFIG.assemblerCompositesPerUnit }, unlocked: (s) => s.tech.assemblerUnlocked && s.tech.materialsUnlocked },
    { inputs: { lithium: CONFIG.assemblerQuantumchipsLithiumPerUnit, microchips: CONFIG.assemblerQuantumchipsMicrochipsPerUnit, gold: CONFIG.assemblerQuantumchipsGoldPerUnit }, outputs: { quantumchips: CONFIG.assemblerQuantumchipsPerUnit }, unlocked: (s) => s.tech.assemblerUnlocked && s.tech.endgameUnlocked },
  ],
};

for (const kind of Object.keys(recipes)) {
  for (const r of recipes[kind]) {
    r.margin = mapValue(r.outputs) - mapValue(r.inputs);
  }
}

function newState() {
  return {
    money: CONFIG.initialMoney,
    counts: Object.fromEntries(Object.keys(miners).map((k) => [k, k === "miner" ? 1 : 0])),
    forges: 0,
    assemblers: 0,
    cables: 1,
    tech: {
      ironUnlocked: false,
      forgeUnlocked: false,
      advancedMinesUnlocked: false,
      assemblerUnlocked: false,
      materialsUnlocked: false,
      endgameUnlocked: false,
    },
    unlockAt: {},
  };
}

function nodeUpkeep(state) {
  let upkeep = 0.2 + 0.18 + state.cables * CONFIG.cableMaintenancePerSec;
  for (const [type, count] of Object.entries(state.counts)) {
    upkeep += miners[type].upkeep * count;
  }
  upkeep += state.forges * 0.24;
  upkeep += state.assemblers * 0.27;
  return upkeep;
}

function minerCost(state, type) {
  const meta = miners[type];
  const current = state.counts[type] || 0;
  return Math.round(meta.baseCost * meta.scale ** current) + CONFIG.cableCost;
}

function forgeCost(state) {
  return Math.round(CONFIG.forgeBaseCost * CONFIG.forgeCostScale ** state.forges) + CONFIG.cableCost;
}

function assemblerCost(state) {
  return (
    Math.round(CONFIG.assemblerBaseCost * CONFIG.assemblerCostScale ** state.assemblers) +
    CONFIG.cableCost
  );
}

function produceTick(state, dtSec) {
  const bag = {};
  for (const [type, count] of Object.entries(state.counts)) {
    if (count <= 0) continue;
    const key = miners[type].resource;
    bag[key] = (bag[key] || 0) + count * rates[type] * dtSec;
  }

  const forgeScale = 0.36 * dtSec;
  for (let i = 0; i < state.forges; i += 1) {
    let best = null;
    for (const recipe of recipes.forge) {
      if (!recipe.unlocked(state)) continue;
      let scale = forgeScale;
      for (const [key, amount] of Object.entries(recipe.inputs)) {
        scale = Math.min(scale, (bag[key] || 0) / amount);
      }
      if (scale <= 0) continue;
      if (!best || recipe.margin > best.recipe.margin) {
        best = { recipe, scale };
      }
    }
    if (!best) continue;
    for (const [key, amount] of Object.entries(best.recipe.inputs)) bag[key] -= amount * best.scale;
    for (const [key, amount] of Object.entries(best.recipe.outputs)) {
      bag[key] = (bag[key] || 0) + amount * best.scale;
    }
  }

  const assemblerScale = 0.24 * dtSec;
  for (let i = 0; i < state.assemblers; i += 1) {
    let best = null;
    for (const recipe of recipes.assembler) {
      if (!recipe.unlocked(state)) continue;
      let scale = assemblerScale;
      for (const [key, amount] of Object.entries(recipe.inputs)) {
        scale = Math.min(scale, (bag[key] || 0) / amount);
      }
      if (scale <= 0) continue;
      if (!best || recipe.margin > best.recipe.margin) {
        best = { recipe, scale };
      }
    }
    if (!best) continue;
    for (const [key, amount] of Object.entries(best.recipe.inputs)) bag[key] -= amount * best.scale;
    for (const [key, amount] of Object.entries(best.recipe.outputs)) {
      bag[key] = (bag[key] || 0) + amount * best.scale;
    }
  }

  let earned = 0;
  for (const [key, qty] of Object.entries(bag)) {
    if (qty <= 0) continue;
    earned += qty * (prices[key] || 0);
  }
  const upkeep = nodeUpkeep(state) * dtSec;
  state.money += earned - upkeep;
  return { netPerSec: (earned - upkeep) / dtSec };
}

const unlockPath = [
  ["ironUnlocked", CONFIG.ironUnlockCost],
  ["forgeUnlocked", CONFIG.forgeUnlockCost],
  ["advancedMinesUnlocked", CONFIG.advancedMinesUnlockCost],
  ["assemblerUnlocked", CONFIG.assemblerUnlockCost],
  ["materialsUnlocked", CONFIG.materialsUnlockCost],
  ["endgameUnlocked", CONFIG.endgameUnlockCost],
];

function canUnlock(state, key) {
  if (key === "ironUnlocked") return !state.tech.ironUnlocked;
  if (key === "forgeUnlocked") return state.tech.ironUnlocked && !state.tech.forgeUnlocked;
  if (key === "advancedMinesUnlocked")
    return state.tech.forgeUnlocked && !state.tech.advancedMinesUnlocked;
  if (key === "assemblerUnlocked")
    return state.tech.advancedMinesUnlocked && !state.tech.assemblerUnlocked;
  if (key === "materialsUnlocked")
    return state.tech.assemblerUnlocked && !state.tech.materialsUnlocked;
  if (key === "endgameUnlocked") return state.tech.materialsUnlocked && !state.tech.endgameUnlocked;
  return false;
}

function tryUnlock(state, tSec) {
  for (const [key, cost] of unlockPath) {
    if (!canUnlock(state, key)) continue;
    if (state.money >= cost) {
      state.money -= cost;
      state.tech[key] = true;
      state.unlockAt[key] = tSec;
    }
    break;
  }
}

function tryBuildProcessors(state, tSec) {
  if (state.tech.forgeUnlocked) {
    const target = 1 + Math.floor(tSec / 700);
    while (state.forges < target && state.money >= forgeCost(state)) {
      state.money -= forgeCost(state);
      state.forges += 1;
      state.cables += 1;
    }
  }
  if (state.tech.assemblerUnlocked) {
    const target = Math.max(0, Math.floor((tSec - 720) / 540) + 1);
    while (state.assemblers < target && state.money >= assemblerCost(state)) {
      state.money -= assemblerCost(state);
      state.assemblers += 1;
      state.cables += 1;
    }
  }
}

function bestMiner(state) {
  let best = null;
  for (const [type, meta] of Object.entries(miners)) {
    if (!meta.unlocked(state)) continue;
    const grossPerSec = rates[type] * (prices[meta.resource] || 0);
    const netPerSec = grossPerSec - (meta.upkeep + CONFIG.cableMaintenancePerSec);
    if (netPerSec <= 0) continue;
    const cost = minerCost(state, type);
    const payback = cost / netPerSec;
    if (!best || payback < best.payback) {
      best = { type, cost, payback };
    }
  }
  return best;
}

function tryBuildMiners(state) {
  for (let i = 0; i < 8; i += 1) {
    const pick = bestMiner(state);
    if (!pick || state.money < pick.cost) return;
    state.money -= pick.cost;
    state.counts[pick.type] += 1;
    state.cables += 1;
  }
}

function runSim(durationSec = 1800) {
  const state = newState();
  let lastNet = 0;
  for (let t = 1; t <= durationSec; t += 1) {
    lastNet = produceTick(state, 1).netPerSec;
    tryUnlock(state, t);
    tryBuildProcessors(state, t);
    tryBuildMiners(state);
  }
  return { state, lastNet };
}

const durationArg = Number(process.argv[2]);
const durationSec = Number.isFinite(durationArg) && durationArg > 0 ? Math.floor(durationArg) : 1800;
const { state, lastNet } = runSim(durationSec);

console.log(`Simulacio: ${secondsToClock(durationSec)}`);
for (const [key] of unlockPath) {
  const at = state.unlockAt[key];
  console.log(
    `${key.padEnd(20)} ${Number.isFinite(at) ? `${secondsToClock(at)} (${at}s)` : "no desbloquejat"}`
  );
}
console.log(`Diners finals: ${state.money.toFixed(1)}$`);
console.log(`Net aproximat: ${lastNet.toFixed(2)}$/s`);
console.log(`Fargues: ${state.forges} | Assemblers: ${state.assemblers}`);
