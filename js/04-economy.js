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
    {
      key: "coal",
      label: "Carbo",
      price: CONFIG.coalPrice,
      unlocked: state.tech.advancedMinesUnlocked,
    },
    {
      key: "copper",
      label: "Coure",
      price: CONFIG.copperPrice,
      unlocked: state.tech.advancedMinesUnlocked,
    },
    {
      key: "parts",
      label: "Peces",
      price: CONFIG.partsPrice,
      unlocked: state.tech.forgeUnlocked,
    },
    {
      key: "steel",
      label: "Acer",
      price: CONFIG.steelPrice,
      unlocked: state.tech.forgeUnlocked && state.tech.advancedMinesUnlocked,
    },
    {
      key: "plates",
      label: "Plaques",
      price: CONFIG.platesPrice,
      unlocked: state.tech.forgeUnlocked && state.tech.advancedMinesUnlocked,
    },
    {
      key: "modules",
      label: "Moduls",
      price: CONFIG.modulesPrice,
      unlocked: state.tech.assemblerUnlocked,
    },
    {
      key: "circuits",
      label: "Circuits",
      price: CONFIG.circuitsPrice,
      unlocked: state.tech.assemblerUnlocked,
    },
    {
      key: "frames",
      label: "Bastidors",
      price: CONFIG.framesPrice,
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
      state.resources[resourceKey] = (state.resources[resourceKey] || 0) + amountPerScale * finalScale;
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
  free = Math.max(0, free - storedIron);

  const producedCoal = snapshot.coalRate * dtSec;
  const storedCoal = Math.min(producedCoal, free);
  const lostCoal = producedCoal - storedCoal;
  state.resources.coal += storedCoal;
  state.resources.wastedCoal += lostCoal;
  free = Math.max(0, free - storedCoal);

  const producedCopper = snapshot.copperRate * dtSec;
  const storedCopper = Math.min(producedCopper, free);
  const lostCopper = producedCopper - storedCopper;
  state.resources.copper += storedCopper;
  state.resources.wastedCopper += lostCopper;
  free = Math.max(0, free - storedCopper);

  free = processConnectedRecipes(snapshot, dtSec, free);

  if (state.autoSellEnabled && snapshot.marketConnected && snapshot.marketNode) {
    const autoSellUnits = Math.min(
      totalStoredResources(),
      autoSellRatePerSec(snapshot.marketNode.level) * dtSec
    );
    sellResources(autoSellUnits);
  }
}

