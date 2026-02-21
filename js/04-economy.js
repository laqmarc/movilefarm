function basePriceByKey(resourceKey) {
  if (resourceKey === "stone") return CONFIG.stonePrice;
  if (resourceKey === "wood") return CONFIG.woodPrice;
  if (resourceKey === "sand") return CONFIG.sandPrice;
  if (resourceKey === "water") return CONFIG.waterPrice;
  if (resourceKey === "iron") return CONFIG.ironPrice;
  if (resourceKey === "coal") return CONFIG.coalPrice;
  if (resourceKey === "copper") return CONFIG.copperPrice;
  if (resourceKey === "oil") return CONFIG.oilPrice;
  if (resourceKey === "aluminum") return CONFIG.aluminumPrice;
  if (resourceKey === "quartz") return CONFIG.quartzPrice;
  if (resourceKey === "sulfur") return CONFIG.sulfurPrice;
  if (resourceKey === "gold") return CONFIG.goldPrice;
  if (resourceKey === "lithium") return CONFIG.lithiumPrice;
  if (resourceKey === "parts") return CONFIG.partsPrice;
  if (resourceKey === "steel") return CONFIG.steelPrice;
  if (resourceKey === "plates") return CONFIG.platesPrice;
  if (resourceKey === "modules") return CONFIG.modulesPrice;
  if (resourceKey === "circuits") return CONFIG.circuitsPrice;
  if (resourceKey === "frames") return CONFIG.framesPrice;
  if (resourceKey === "silicon") return CONFIG.siliconPrice;
  if (resourceKey === "plastic") return CONFIG.plasticPrice;
  if (resourceKey === "steam") return CONFIG.steamPrice;
  if (resourceKey === "rubber") return CONFIG.rubberPrice;
  if (resourceKey === "wiring") return CONFIG.wiringPrice;
  if (resourceKey === "microchips") return CONFIG.microchipsPrice;
  if (resourceKey === "batteries") return CONFIG.batteriesPrice;
  if (resourceKey === "glass") return CONFIG.glassPrice;
  if (resourceKey === "acid") return CONFIG.acidPrice;
  if (resourceKey === "fiber") return CONFIG.fiberPrice;
  if (resourceKey === "composites") return CONFIG.compositesPrice;
  if (resourceKey === "superalloy") return CONFIG.superalloyPrice;
  if (resourceKey === "quantumchips") return CONFIG.quantumchipsPrice;
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
    "stone", "wood", "sand", "water", "iron", "coal", "copper", "oil", "aluminum", "quartz", "sulfur", "gold", "lithium",
    "parts", "steel", "plates", "silicon", "plastic", "steam", "glass", "acid",
    "modules", "circuits", "frames", "rubber", "wiring", "microchips", "batteries", "fiber", "composites", "superalloy", "quantumchips",
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
      key: "sand",
      label: "Sorra",
      price: currentResourcePrice("sand"),
      unlocked: true,
    },
    {
      key: "water",
      label: "Aigua",
      price: currentResourcePrice("water"),
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
      key: "oil",
      label: "Petroli",
      price: currentResourcePrice("oil"),
      unlocked: state.tech.advancedMinesUnlocked,
    },
    {
      key: "aluminum",
      label: "Alumini",
      price: currentResourcePrice("aluminum"),
      unlocked: state.tech.advancedMinesUnlocked,
    },
    {
      key: "quartz",
      label: "Quars",
      price: currentResourcePrice("quartz"),
      unlocked: state.tech.materialsUnlocked,
    },
    {
      key: "sulfur",
      label: "Sofre",
      price: currentResourcePrice("sulfur"),
      unlocked: state.tech.materialsUnlocked,
    },
    {
      key: "gold",
      label: "Or",
      price: currentResourcePrice("gold"),
      unlocked: state.tech.endgameUnlocked,
    },
    {
      key: "lithium",
      label: "Liti",
      price: currentResourcePrice("lithium"),
      unlocked: state.tech.endgameUnlocked,
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
      key: "silicon",
      label: "Silici",
      price: currentResourcePrice("silicon"),
      unlocked: state.tech.forgeUnlocked && state.tech.advancedMinesUnlocked,
    },
    {
      key: "plastic",
      label: "Plastic",
      price: currentResourcePrice("plastic"),
      unlocked: state.tech.forgeUnlocked && state.tech.advancedMinesUnlocked,
    },
    {
      key: "steam",
      label: "Vapor",
      price: currentResourcePrice("steam"),
      unlocked: state.tech.forgeUnlocked && state.tech.advancedMinesUnlocked,
    },
    {
      key: "glass",
      label: "Vidre",
      price: currentResourcePrice("glass"),
      unlocked: state.tech.forgeUnlocked && state.tech.materialsUnlocked,
    },
    {
      key: "acid",
      label: "Acid",
      price: currentResourcePrice("acid"),
      unlocked: state.tech.forgeUnlocked && state.tech.materialsUnlocked,
    },
    {
      key: "superalloy",
      label: "Superaliatge",
      price: currentResourcePrice("superalloy"),
      unlocked: state.tech.forgeUnlocked && state.tech.endgameUnlocked,
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
    {
      key: "rubber",
      label: "Goma",
      price: currentResourcePrice("rubber"),
      unlocked: state.tech.assemblerUnlocked && state.tech.advancedMinesUnlocked,
    },
    {
      key: "wiring",
      label: "Cablejat",
      price: currentResourcePrice("wiring"),
      unlocked: state.tech.assemblerUnlocked && state.tech.advancedMinesUnlocked,
    },
    {
      key: "microchips",
      label: "Microxips",
      price: currentResourcePrice("microchips"),
      unlocked: state.tech.assemblerUnlocked && state.tech.advancedMinesUnlocked,
    },
    {
      key: "batteries",
      label: "Bateries",
      price: currentResourcePrice("batteries"),
      unlocked: state.tech.assemblerUnlocked && state.tech.advancedMinesUnlocked,
    },
    {
      key: "fiber",
      label: "Fibra",
      price: currentResourcePrice("fiber"),
      unlocked: state.tech.assemblerUnlocked && state.tech.materialsUnlocked,
    },
    {
      key: "composites",
      label: "Compostos",
      price: currentResourcePrice("composites"),
      unlocked: state.tech.assemblerUnlocked && state.tech.materialsUnlocked,
    },
    {
      key: "quantumchips",
      label: "Quantum Xips",
      price: currentResourcePrice("quantumchips"),
      unlocked: state.tech.assemblerUnlocked && state.tech.endgameUnlocked,
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
  const targetScale = Math.max(0, wantedScale);
  if (!recipe || targetScale <= 0) {
    return {
      freeCapacity,
      byInputsScale: 0,
      finalScale: 0,
      wantedScale: targetScale,
    };
  }

  const byInputsScale = maxRecipeScaleByInputs(recipe, targetScale);
  if (byInputsScale <= 0) {
    return {
      freeCapacity,
      byInputsScale: 0,
      finalScale: 0,
      wantedScale: targetScale,
    };
  }

  const outputPerScale = recipeOutputPerScale(recipe);
  if (outputPerScale <= 0) {
    return {
      freeCapacity,
      byInputsScale,
      finalScale: 0,
      wantedScale: targetScale,
    };
  }

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
  return {
    freeCapacity: Math.max(0, freeCapacity - usedCapacity),
    byInputsScale,
    finalScale,
    wantedScale: targetScale,
  };
}

function processConnectedRecipes(snapshot, dtSec, freeCapacity) {
  let free = freeCapacity;
  const recipeRates = snapshot.processorRates || {};
  const previousActivity = state.economy.recipeActivity || {};
  const nextActivity = {};
  const now = Date.now();

  for (const [recipeId, ratePerSec] of Object.entries(recipeRates)) {
    if (ratePerSec <= 0) continue;
    const recipe = RECIPES[recipeId];
    if (!recipe) continue;
    const wantedScale = ratePerSec * dtSec;
    const result = processRecipeScale(recipe, wantedScale, free);
    free = result.freeCapacity;

    const utilization = result.wantedScale > 0
      ? Math.max(0, Math.min(1, result.finalScale / result.wantedScale))
      : 0;
    const prev = previousActivity[recipeId];
    const previousLastRun = prev && Number.isFinite(prev.lastRunAt) ? prev.lastRunAt : 0;
    nextActivity[recipeId] = {
      utilization,
      lastRunAt: result.finalScale > 0 ? now : previousLastRun,
    };
  }

  state.economy.recipeActivity = nextActivity;
  return free;
}

function sellDirectMarketResources(snapshot, dtSec) {
  if (!snapshot || !snapshot.marketNode) return { sold: 0, earned: 0 };
  const rates = snapshot.directMarketRates || {};
  let sold = 0;
  let earned = 0;

  for (const [resourceKey, ratePerSec] of Object.entries(rates)) {
    if (!Number.isFinite(ratePerSec) || ratePerSec <= 0) continue;
    const qty = ratePerSec * dtSec;
    if (qty <= 0) continue;
    const price = currentResourcePrice(resourceKey);
    sold += qty;
    earned += qty * price;
    state.progression.produced[resourceKey] = (state.progression.produced[resourceKey] || 0) + qty;
  }

  if (earned > 0) {
    state.money += earned;
    state.progression.totalMoneyEarned += earned;
    state.progression.totalSoldUnits += sold;
    state.research.points += (earned / 55) * researchPointsMultiplier();
  }

  return { sold, earned };
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

  if (!snapshot.warehouseNode) {
    state.economy.recipeActivity = {};
    sellDirectMarketResources(snapshot, dtSec);
    updateObjectivesProgress();
    updateTutorialProgress();
    return;
  }

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

  const producedSand = snapshot.sandRate * dtSec;
  const storedSand = Math.min(producedSand, free);
  const lostSand = producedSand - storedSand;
  state.resources.sand += storedSand;
  state.resources.wastedSand += lostSand;
  state.progression.produced.sand = (state.progression.produced.sand || 0) + storedSand;
  free = Math.max(0, free - storedSand);

  const producedWater = snapshot.waterRate * dtSec;
  const storedWater = Math.min(producedWater, free);
  const lostWater = producedWater - storedWater;
  state.resources.water += storedWater;
  state.resources.wastedWater += lostWater;
  state.progression.produced.water = (state.progression.produced.water || 0) + storedWater;
  free = Math.max(0, free - storedWater);

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

  const producedOil = snapshot.oilRate * dtSec;
  const storedOil = Math.min(producedOil, free);
  const lostOil = producedOil - storedOil;
  state.resources.oil += storedOil;
  state.resources.wastedOil += lostOil;
  state.progression.produced.oil = (state.progression.produced.oil || 0) + storedOil;
  free = Math.max(0, free - storedOil);

  const producedAluminum = snapshot.aluminumRate * dtSec;
  const storedAluminum = Math.min(producedAluminum, free);
  const lostAluminum = producedAluminum - storedAluminum;
  state.resources.aluminum += storedAluminum;
  state.resources.wastedAluminum += lostAluminum;
  state.progression.produced.aluminum = (state.progression.produced.aluminum || 0) + storedAluminum;
  free = Math.max(0, free - storedAluminum);

  const producedQuartz = snapshot.quartzRate * dtSec;
  const storedQuartz = Math.min(producedQuartz, free);
  const lostQuartz = producedQuartz - storedQuartz;
  state.resources.quartz += storedQuartz;
  state.resources.wastedQuartz += lostQuartz;
  state.progression.produced.quartz = (state.progression.produced.quartz || 0) + storedQuartz;
  free = Math.max(0, free - storedQuartz);

  const producedSulfur = snapshot.sulfurRate * dtSec;
  const storedSulfur = Math.min(producedSulfur, free);
  const lostSulfur = producedSulfur - storedSulfur;
  state.resources.sulfur += storedSulfur;
  state.resources.wastedSulfur += lostSulfur;
  state.progression.produced.sulfur = (state.progression.produced.sulfur || 0) + storedSulfur;
  free = Math.max(0, free - storedSulfur);

  const producedGold = snapshot.goldRate * dtSec;
  const storedGold = Math.min(producedGold, free);
  const lostGold = producedGold - storedGold;
  state.resources.gold += storedGold;
  state.resources.wastedGold += lostGold;
  state.progression.produced.gold = (state.progression.produced.gold || 0) + storedGold;
  free = Math.max(0, free - storedGold);

  const producedLithium = snapshot.lithiumRate * dtSec;
  const storedLithium = Math.min(producedLithium, free);
  const lostLithium = producedLithium - storedLithium;
  state.resources.lithium += storedLithium;
  state.resources.wastedLithium += lostLithium;
  state.progression.produced.lithium = (state.progression.produced.lithium || 0) + storedLithium;
  free = Math.max(0, free - storedLithium);

  free = processConnectedRecipes(snapshot, dtSec, free);
  sellDirectMarketResources(snapshot, dtSec);

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
