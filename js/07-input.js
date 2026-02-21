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
  if (state.ui.mode !== "connect" && state.ui.mode !== "disconnect") return false;

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
    applyCableAction(sourceId, targetNode.id);
    state.ui.selectedNodeId = targetNode.id;
    state.ui.pendingSourceId = targetNode.id;
  }

  resetDrag();
  render();
  return true;
}

