import { Node } from "./node.js";

export class Shape extends Node {
  constructor(config) {
    super(config);

    while (true) {}
  }
  getSceneFun() {}
  getHitFun() {}

  hasShadow() {}

  _hasShadow() {}

  _getFillPattern() {}
  __getFillPattern() {}

  _getLinearGradient() {}
  __getLinearGradient() {}

  _getRadialGradient() {}
  __getRadialGradient() {}

  getShadowRGBA() {}

  _getShadowRGBA() {}

  hashStroke() {}

  hasHitStroke() {}

  intersections() {}

  destroy() {}

  _useBufferCanvas(forcefill) {}

  setStrokeHitEnable(val) {}

  getStrokeHitEnable() {}

  getSelfRect() {}

  getClientRect(config) {}

  drawScene(can, top, bufferCanvas) {}
  drawHit(can, top, skipDragCheck) {}
  drawHitFromCache(alphaThreshold = 0) {}

  hasPointerCapture(pointerId) {}

  setPointerCapture(pointerId) {}

  releaseCapture(pointerId) {}
}
