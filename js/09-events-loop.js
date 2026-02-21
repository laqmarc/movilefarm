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

    if (state.ui.mode !== "connect" && state.ui.mode !== "disconnect") return;

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

  dom.toolCableDeleteModeBtn.addEventListener("click", () => {
    setMode("disconnect");
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

  dom.buySandMinerTypeBtn.addEventListener("click", () => {
    setBuildType("sand_miner");
    render();
  });

  dom.buyWaterMinerTypeBtn.addEventListener("click", () => {
    setBuildType("water_miner");
    render();
  });

  dom.buyIronMinerTypeBtn.addEventListener("click", () => {
    setBuildType("iron_miner");
    render();
  });

  dom.buyCoalMinerTypeBtn.addEventListener("click", () => {
    setBuildType("coal_miner");
    render();
  });

  dom.buyCopperMinerTypeBtn.addEventListener("click", () => {
    setBuildType("copper_miner");
    render();
  });

  dom.buyOilMinerTypeBtn.addEventListener("click", () => {
    setBuildType("oil_miner");
    render();
  });

  dom.buyAluminumMinerTypeBtn.addEventListener("click", () => {
    setBuildType("aluminum_miner");
    render();
  });

  dom.buyForgeTypeBtn.addEventListener("click", () => {
    setBuildType("forge");
    render();
  });

  dom.buyAssemblerTypeBtn.addEventListener("click", () => {
    setBuildType("assembler");
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

  dom.cycleFlowFilterBtn.addEventListener("click", () => {
    cycleFlowFilter();
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

  dom.toolRecipeBtn.addEventListener("click", () => {
    cycleSelectedRecipe();
  });

  dom.toolRecipeListBtn.addEventListener("click", () => {
    toggleRecipePanel();
  });

  dom.toolDeleteBtn.addEventListener("click", () => {
    removeSelectedNode();
  });

  dom.toolSellBtn.addEventListener("click", () => {
    sellAllResources();
  });

  dom.techUnlockIronBtn.addEventListener("click", () => {
    unlockNextTechnology();
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

  dom.recipePanel.addEventListener("click", (event) => {
    if (event.target && event.target.id === "closeRecipePanelBtn") {
      toggleRecipePanel(false);
    }
  });

  dom.clearSelectionBtn.addEventListener("click", () => {
    state.ui.selectedNodeId = null;
    state.ui.pendingSourceId = null;
    resetDrag();
    render();
  });

  dom.openTutorialBtn.addEventListener("click", () => {
    tutorialOpen();
  });

  dom.resetPersistenceBtn.addEventListener("click", () => {
    resetPersistence();
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

  dom.researchTree.addEventListener("click", (event) => {
    const button = event.target ? event.target.closest("[data-research-id]") : null;
    if (!button) return;
    const researchId = button.dataset.researchId;
    if (!researchId) return;
    unlockResearch(researchId);
  });

  dom.prestigeBtn.addEventListener("click", () => {
    prestigeReset();
  });

  dom.tutorialOverlay.addEventListener("click", (event) => {
    const button = event.target ? event.target.closest("[data-tutorial-action]") : null;
    if (!button) return;
    const action = button.dataset.tutorialAction;
    if (action === "next") {
      tutorialNext();
      return;
    }
    if (action === "skip") {
      tutorialDismiss();
    }
  });

  window.addEventListener("resize", () => {
    render();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (state.ui.resourcePanelOpen) {
        toggleResourcePanel(false);
        return;
      }
      if (state.ui.recipePanelOpen) {
        toggleRecipePanel(false);
      }
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

state = loadState();
lastTick = performance.now();
elapsedSinceSave = 0;

initGrid();
bindEvents();
render();
window.requestAnimationFrame(step);
