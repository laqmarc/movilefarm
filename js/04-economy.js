function basePriceByKey(resourceKey) {
  if (resourceKey === "stone") return CONFIG.stonePrice;
  if (resourceKey === "wood") return CONFIG.woodPrice;
  if (resourceKey === "iron") return CONFIG.ironPrice;
  if (resourceKey === "coal") return CONFIG.coalPrice;
  if (resourceKey === "copper") return CONFIG.copperPrice;
  if (resourceKey === "parts") return CONFIG.partsPrice;
  if (resourceKey === "steel") return CONFIG.steelPrice;
  if (resourceKey === "plates") return CONFIG.platesPrice;
  if (resourceKey === "modules") return CONFIG.modulesPrice;
  if (resourceKey === "circuits") return CONFIG.circuitsPrice;
  if (resourceKey === "frames") return CONFIG.framesPrice;
  return 1;
}

function getMarketMultiplier(resourceKey) {
  if (!state.market.multipliers[resourceKey]) {
    state.market.multipliers[resourceKey] = 1;
  }
  return state.market.multipliers[resourceKey];
}

function currentResourcePrice(resourceKey) {
  const base = basePriceByKey(resourceKey);
  const dynamic = getMarketMultiplier(resourceKey);
  return Math.max(1, Math.round(base * dynamic * marketSellBonusMultiplier()));
}

function updateMarketTick(dtSec) {
  const hasAnalytics = hasResearch("rs_market_analytics");
  const volatility = CONFIG.marketVolatility * (hasAnalytics ? 0.62 : 1);
  const reversion = CONFIG.marketReversion * (hasAnalytics ? 1.18 : 1);
  const warehouse = getWarehouseNode();
  const stockCap = warehouse ? capacity(warehouse.level) : 200;

  const keys = [
    "stone", "wood", "iron", "coal", "copper",
    "parts", "steel", "plates", "modules", "circuits", "frames",
  ];
  for (const key of keys) {
    const current = getMarketMultiplier(key);
    const stockRatio = Math.min(1.5, (state.resources[key] || 0) / Math.max(1, stockCap));
    const pressure = -stockRatio * 0.08 * dtSec;
    const drift = (1 - current) * reversion * dtSec;
    const jitter = (Math.random() - 0.5) * volatility * dtSec;
    const next = current + drift + jitter + pressure;
    state.market.multipliers[key] = Math.max(
      CONFIG.marketMinMultiplier,
      Math.min(CONFIG.marketMaxMultiplier, next)
    );
  }

  const unlocked = unlockedResources();
  if (unlocked.length > 0) {
    const avg = unlocked.reduce((sum, res) => sum + getMarketMultiplier(res.key), 0) / unlocked.length;
    state.market.averageMultiplier = avg;
    state.market.trend = avg - 1;
  } else {
    state.market.averageMultiplier = 1;
    state.market.trend = 0;
  }
}

function resourceCatalog() {
  return [
    {
      key: "stone",
      label: "Pedra",
      price: currentResourcePrice("stone"),
      unlocked: true,
    },
    {
      key: "wood",
      label: "Fusta",
      price: currentResourcePrice("wood"),
      unlocked: true,
    },
    {
      key: "iron",
      label: "Ferro",
      price: currentResourcePrice("iron"),
      unlocked: state.tech.ironUnlocked,
    },
    {
      key: "coal",
      label: "Carbo",
      price: currentResourcePrice("coal"),
      unlocked: state.tech.advancedMinesUnlocked,
    },
    {
      key: "copper",
      label: "Coure",
      price: currentResourcePrice("copper"),
      unlocked: state.tech.advancedMinesUnlocked,
    },
    {
      key: "parts",
      label: "Peces",
      price: currentResourcePrice("parts"),
      unlocked: state.tech.forgeUnlocked,
    },
    {
      key: "steel",
      label: "Acer",
      price: currentResourcePrice("steel"),
      unlocked: state.tech.forgeUnlocked && state.tech.advancedMinesUnlocked,
    },
    {
      key: "plates",
      label: "Plaques",
      price: currentResourcePrice("plates"),
      unlocked: state.tech.forgeUnlocked && state.tech.advancedMinesUnlocked,
    },
    {
      key: "modules",
      label: "Moduls",
      price: currentResourcePrice("modules"),
      unlocked: state.tech.assemblerUnlocked,
    },
    {
      key: "circuits",
      label: "Circuits",
      price: currentResourcePrice("circuits"),
      unlocked: state.tech.assemblerUnlocked,
    },
    {
      key: "frames",
      label: "Bastidors",
      price: currentResourcePrice("frames"),
      unlocked: state.tech.assemblerUnlocked,
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
    state.progression.totalMoneyEarned += earned;
    state.progression.totalSoldUnits += sold;
    state.research.points += (earned / 55) * researchPointsMultiplier();
  }

  return { sold, earned };
}

function wasteKeyFor(resourceKey) {
  return `wasted${resourceKey.charAt(0).toUpperCase()}${resourceKey.slice(1)}`;
}

function recipeOutputPerScale(recipe) {
  return Object.values(recipe.outputs).reduce((sum, amount) => sum + amount, 0);
}

function maxRecipeScaleByInputs(recipe, wantedScale) {
  let maxScale = wantedScale;

  for (const [resourceKey, amountPerScale] of Object.entries(recipe.inputs)) {
    if (amountPerScale <= 0) continue;
    const available = Math.max(0, state.resources[resourceKey] || 0);
    maxScale = Math.min(maxScale, available / amountPerScale);
  }

  return Math.max(0, maxScale);
}

function processRecipeScale(recipe, wantedScale, freeCapacity) {
  if (!recipe || wantedScale <= 0) return freeCapacity;

  const byInputsScale = maxRecipeScaleByInputs(recipe, wantedScale);
  if (byInputsScale <= 0) return freeCapacity;

  const outputPerScale = recipeOutputPerScale(recipe);
  if (outputPerScale <= 0) return freeCapacity;

  const byCapacityScale = Math.max(0, freeCapacity / outputPerScale);
  const finalScale = Math.max(0, Math.min(byInputsScale, byCapacityScale));

  if (finalScale > 0) {
    for (const [resourceKey, amountPerScale] of Object.entries(recipe.inputs)) {
      const nextAmount = (state.resources[resourceKey] || 0) - amountPerScale * finalScale;
      state.resources[resourceKey] = Math.max(0, nextAmount);
    }

    for (const [resourceKey, amountPerScale] of Object.entries(recipe.outputs)) {
      const produced = amountPerScale * finalScale;
      state.resources[resourceKey] = (state.resources[resourceKey] || 0) + produced;
      state.progression.produced[resourceKey] = (state.progression.produced[resourceKey] || 0) + produced;
    }
  }

  const missedScale = Math.max(0, byInputsScale - finalScale);
  if (missedScale > 0) {
    for (const [resourceKey, amountPerScale] of Object.entries(recipe.outputs)) {
      const wastedKey = wasteKeyFor(resourceKey);
      const wastedAmount = amountPerScale * missedScale;
      state.resources[wastedKey] = (state.resources[wastedKey] || 0) + wastedAmount;
    }
  }

  const usedCapacity = outputPerScale * finalScale;
  return Math.max(0, freeCapacity - usedCapacity);
}

function processConnectedRecipes(snapshot, dtSec, freeCapacity) {
  let free = freeCapacity;
  const recipeRates = snapshot.processorRates || {};

  for (const [recipeId, ratePerSec] of Object.entries(recipeRates)) {
    if (ratePerSec <= 0) continue;
    const recipe = RECIPES[recipeId];
    if (!recipe) continue;
    const wantedScale = ratePerSec * dtSec;
    free = processRecipeScale(recipe, wantedScale, free);
  }

  return free;
}

function gameTick(dtSec) {
  updateContractTick();
  updateMarketTick(dtSec);
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
  state.progression.produced.stone = (state.progression.produced.stone || 0) + storedStone;
  free = Math.max(0, free - storedStone);

  const producedWood = snapshot.woodRate * dtSec;
  const storedWood = Math.min(producedWood, free);
  const lostWood = producedWood - storedWood;
  state.resources.wood += storedWood;
  state.resources.wastedWood += lostWood;
  state.progression.produced.wood = (state.progression.produced.wood || 0) + storedWood;
  free = Math.max(0, free - storedWood);

  const producedIron = snapshot.ironRate * dtSec;
  const storedIron = Math.min(producedIron, free);
  const lostIron = producedIron - storedIron;
  state.resources.iron += storedIron;
  state.resources.wastedIron += lostIron;
  state.progression.produced.iron = (state.progression.produced.iron || 0) + storedIron;
  free = Math.max(0, free - storedIron);

  const producedCoal = snapshot.coalRate * dtSec;
  const storedCoal = Math.min(producedCoal, free);
  const lostCoal = producedCoal - storedCoal;
  state.resources.coal += storedCoal;
  state.resources.wastedCoal += lostCoal;
  state.progression.produced.coal = (state.progression.produced.coal || 0) + storedCoal;
  free = Math.max(0, free - storedCoal);

  const producedCopper = snapshot.copperRate * dtSec;
  const storedCopper = Math.min(producedCopper, free);
  const lostCopper = producedCopper - storedCopper;
  state.resources.copper += storedCopper;
  state.resources.wastedCopper += lostCopper;
  state.progression.produced.copper = (state.progression.produced.copper || 0) + storedCopper;
  free = Math.max(0, free - storedCopper);

  free = processConnectedRecipes(snapshot, dtSec, free);

  if (state.autoSellEnabled && snapshot.marketConnected && snapshot.marketNode) {
    const autoSellUnits = Math.min(
      totalStoredResources(),
      autoSellRatePerSec(snapshot.marketNode.level) * dtSec
    );
    sellResources(autoSellUnits);
  }

  updateObjectivesProgress();
  updateTutorialProgress();
}
