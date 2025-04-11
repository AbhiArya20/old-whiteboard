import { SceneCanvas, HitCanvas } from "./canvas.js";
import { Container } from "./container.js";

class Layer extends Container {
  canvas = new SceneCanvas();
  HitCanvas = new HitCanvas({ pixelRatio: 1 });

  constructor(config) {
    super(config);
    // Todo: implement when it needs
    // this.on("x", funxtion(){})
    this._checkVisibility();

    // TODO: implement when it needs
    // this.on("x", funxtion(){})

    this._setSmoothEnabled();
  }

  createPNGStream() {}

  getCanvas() {}

  getNativeCanvas() {}

  getHitCanvas() {}

  getContext() {}

  clear() {}

  setZIndex(zIndex) {}

  moveToTOp() {}

  moveUp() {}

  moveDown() {}

  moveToBottom() {}

  getLayer() {}

  remove() {}

  getStage() {}

  setSize({ width, height }) {}

  _validateAdd(child) {}

  _toMYCanvas(config) {}

  _checkVisibility() {}

  _setSmoothEnabled() {}

  getWidth() {}

  setWidth(width) {}

  getHeight() {}

  setHeight(height) {}

  batchDraw() {}

  getIntersection(pos) {}
  _getIntersection(pos) {}
  drawScene(can, top, bufferCanvas) {}
  drawHit(can, top) {}
  enableHitGraph() {}
  disableHitGraph() {}

  setHitGraphEnabled(val) {}

  getHitGraphEnabled() {}

  toggleHitGraph() {}

  destroy() {}
}
