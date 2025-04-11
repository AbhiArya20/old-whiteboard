class Context {
  #canvas;

  #context;

  constructor(canvas) {
    this.#canvas = canvas;
  }

  fillShape(shape) {}

  _fill(shape) {}

  strokeShape(shape) {}

  _stroke(shape) {}

  fillStrokeShape(shape) {}

  reset() {}

  getCanvas() {
    return this.#canvas;
  }

  clear() {}

  _applyLineCap(shape) {}

  _applyOpacity(shape) {}

  _applyLineJoin(shape) {}

  setAttr(attr, val) {}

  arcTo(x1, y1, x2, y2, radius) {}

  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {}

  clearRect(x, y, width, height) {}

  clip(fillRule) {}
  clip(path, fillRule) {}
  clip(...args) {}

  closePath() {}

  createImageData(width, height) {}

  createLinearGradient(x0, y0, x1, y1) {}

  createPattern(image, repetition) {}

  createRadialGradient(x0, y0, r0, x1, y1, r1) {}

  drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh) {}

  ellipse(
    x,
    y,
    radiusX,
    radiusY,
    rotation,
    startAngle,
    endAngle,
    anticlockwise
  ) {}

  isPointInPath(x, y, path, fillRule) {}

  fill(fillRule) {}
  fill(path, fillRule) {}
  fill(...args) {}

  fillRect(x, y, width, height) {}

  strokeRect(x, y, width, height) {}

  fillText(text, x, y, maxWidth) {}

  measureText(text) {}

  getImageData(sx, sy, sw, sh) {}

  lineTo(x, y) {}
  moveTo(x, y) {}

  rect(x, y, width, height) {}

  roundRect(x, y, width, height, radius) {}

  putImageData(imagedata, dx, dy) {}

  quadraticCurveTo(cpx, cpy, x, y) {}

  restore() {}

  rotate(angle) {}

  save() {}

  scale(x, y) {}

  setLineDash(segments) {}

  getLineDash() {}

  setTransform(m11, m12, m21, m22, dx, dy) {}

  stroke() {}

  strokeText(text, x, y, maxWidth) {}

  transform(m11, m12, m21, m22, dx, dy) {}
  translate(x, y) {}
}

export class SceneContext extends Context {
  #context;

  constructor(canvas, config = { willReadFrequently: false }) {
    super(canvas, { willReadFrequently: false });
    this.#context = canvas.getCanvas().getContext("2d", { willReadFrequently });
  }

  _fillColor(shape) {}

  _fillPattern(shape) {}

  _fillLinearGradient(shape) {}

  _fillRadialGradient(shape) {}

  _fill(shape) {}

  _strokeLinearGradient(shape) {}

  _stroke(shape) {}

  _applyShadow(shape) {}
}

export class HitContext extends Context {
  #context;
  constructor(canvas) {
    super(canvas);

    this.#context = canvas.getCanvas().getContext("2d", {
      willReadFrequently: true,
    });
  }

  getCanvas() {
    return this.#context;
  }

  _fill(shape) {}

  strokeShape(shape) {}

  _stroke(shape) {}
}
