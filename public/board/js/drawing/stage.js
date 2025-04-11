import { Container } from "./container.js";
import { HitCanvas, SceneCanvas } from "./canvas.js";

const EVENTS = Object.freeze({
  MOUSEOUT: "mouseout",
  MOUSELEAVE: "mouseleave",
  MOUSEOVER: "mouseover",
  MOUSEENTER: "mouseenter",
  MOUSEMOVE: "mousemove",
  MOUSEDOWN: "mousedown",
  MOUSEUP: "mouseup",
  POINTERMOVE: "pointermove",
  POINTERDOWN: "pointerdown",
  POINTERUP: "pointerup",
  POINTERCANCEL: "pointercancel",
  LOSTPOINTERCAPTURE: "lostpointercapture",
  POINTEROUT: "pointerout",
  POINTERLEAVE: "pointerleave",
  POINTEROVER: "pointerover",
  POINTERENTER: "pointerenter",
  CONTEXTMENU: "contextmenu",
  TOUCHSTART: "touchstart",
  TOUCHEND: "touchend",
  TOUCHMOVE: "touchmove",
  TOUCHCANCEL: "touchcancel",
  WHEEL: "wheel",
});

const EVENTS_FUNCTION = [
  [EVENTS.MOUSEENTER, "_pointerenter"],
  [EVENTS.MOUSEDOWN, "_pointerdown"],
  [EVENTS.MOUSEMOVE, "_pointermove"],
  [EVENTS.MOUSEUP, "_pointerup"],
  [EVENTS.MOUSELEAVE, "_pointerleave"],
  [EVENTS.TOUCHSTART, "_pointerdown"],
  [EVENTS.TOUCHMOVE, "_pointermove"],
  [EVENTS.TOUCHEND, "_pointerup"],
  [EVENTS.TOUCHCANCEL, "_pointercancel"],
  [EVENTS.MOUSEOVER, "_pointerover"],
  [EVENTS.WHEEL, "_wheel"],
  [EVENTS.CONTEXTMENU, "_contextmenu"],
  [EVENTS.POINTERDOWN, "_pointerdown"],
  [EVENTS.POINTERMOVE, "_pointermove"],
  [EVENTS.POINTERUP, "_pointerup"],
  [EVENTS.POINTERCANCEL, "_pointercancel"],
  [EVENTS.LOSTPOINTERCAPTURE, "_lostpointercapture"],
];

// const STAGE = "Stage",
//   STRING = "string";

// const EVENTS_MAP = {
//   mouse: {
//     [POINTEROUT]: MOUSEOUT,
//     [POINTERLEAVE]: MOUSELEAVE,
//     [POINTEROVER]: MOUSEOVER,
//     [POINTERENTER]: MOUSEENTER,
//     [POINTERMOVE]: MOUSEMOVE,
//     [POINTERDOWN]: MOUSEDOWN,
//     [POINTERUP]: MOUSEUP,
//     [POINTERCANCEL]: "mousecancel",
//     pointerclick: "click",
//     pointerdblclick: "dblclick",
//   },
//   touch: {
//     [POINTEROUT]: "touchout",
//     [POINTERLEAVE]: "touchleave",
//     [POINTEROVER]: "touchover",
//     [POINTERENTER]: "touchenter",
//     [POINTERMOVE]: TOUCHMOVE,
//     [POINTERDOWN]: TOUCHSTART,
//     [POINTERUP]: TOUCHEND,
//     [POINTERCANCEL]: TOUCHCANCEL,
//     pointerclick: "tap",
//     pointerdblclick: "dbltap",
//   },
//   pointer: {
//     [POINTEROUT]: POINTEROUT,
//     [POINTERLEAVE]: POINTERLEAVE,
//     [POINTEROVER]: POINTEROVER,
//     [POINTERENTER]: POINTERENTER,
//     [POINTERMOVE]: POINTERMOVE,
//     [POINTERDOWN]: POINTERDOWN,
//     [POINTERUP]: POINTERUP,
//     [POINTERCANCEL]: POINTERCANCEL,
//     pointerclick: "pointerclick",
//     pointerdblclick: "pointerdblclick",
//   },
// };

const stages = [];

export class Stage extends Container {
  #content;

  #bufferCanvas;
  #bufferHitCanvas;

  constructor(config) {
    super(config);
    this._buildDOM();
    this._bindContentEvent();
    stages.push(this);

    // TODO: implement when it needs
    // this.on("x", funxtion(){})

    this._checkVisibility();
  }

  _validateAdd(child) {
    const isLayer = child.getType() === "Layer";
    const isFastLayer = child.getType() === "FastLayer";
    const valid = isLayer || isFastLayer;
    if (!valid) {
      throw Error("You may only add layers to the stage");
    }
  }

  _checkVisibility() {
    if (!this.#content) return;
    const style = this.visible() ? "" : "none";
    this.#content.style.display = style;
  }

  setContainer(container) {}

  shouldDrawHit() {
    return true;
  }

  clear() {
    for (let layer of this.getLayers()) {
      layer.clear();
    }
    return this;
  }

  clone(obj) {}

  destroy() {}

  getPointerPosition() {}

  _getPointerPosition(id) {}

  getPointerPositions() {}

  getStage() {
    return this;
  }

  getContent() {
    return this.#content;
  }

  // TODO: implement when it needs
  // _toMYCanvas(config){}

  getIntersection() {}

  _resizeDOM() {
    const width = this.getWidth();
    const height = this.getHeight();

    if (this.#content) {
      this.#content.style.width = `${width}px`;
      this.#content.style.height = `${height}px`;
    }

    this.bufferCanvas.setSize(width, height);
    this.bufferHitCanvas.setSize(width, height);

    this.children.forEach((layer) => {
      layer.setSize(width, height);
      layer.draw();
    });
  }

  add(layer, ...layers) {
    super.add(layer);

    for (let layer of layers) {
      this.add(layer);
    }

    layer.setSize({ width: this.width(), height: this.height() });
    layer.draw();
    this.#content.appendChild(layer.getCanvas());

    return this;
  }

  getParent() {
    return null;
  }

  getLayer() {
    return null;
  }

  getLayers() {
    return this.children;
  }

  hasPointerCapture(pointerId) {}

  setPointerCapture(pointerId) {}

  releaseCapture(pointerId) {}

  getLayer() {}

  _bindContentEvent() {
    EVENTS_FUNCTION.forEach(([event, method]) => {
      this.#content.addEventListener(event, this[method], {
        passive: false,
      });
    });
  }

  _pointerenter(e) {}

  _pointerover(evt) {}

  _getTargetShape(eventType) {}

  _pointerLeave(evt) {}

  _pointerdown(evt) {}

  _pointermove(evt) {}

  _pointerup(evt) {}

  _contextmenu(evt) {}

  _wheel(evt) {}

  _pointercancel(evt) {}

  _lostpointercapture(evt) {}

  setPointersPosition(evt) {}

  _setPointerPosition(evt) {}

  _getContentPosition(evt) {}

  _buildDOM() {
    this.#bufferCanvas = new SceneCanvas({
      // width: this.getWidth(),
      // height: this.getHeight(),
    });
    this.#bufferHitCanvas = new HitCanvas({
      // width: this.getWidth(),
      // height: this.getHeight(),
      pixelRatio: 1,
    });

    const container = this.container();

    container.innerHTML = "";

    this.#content = document.createElement("div");
    this.#content.style.position = "relative";
    this.#content.style.userSelect = "none";

    this.#content.setAttribute("role", "presentation");

    container.appendChild(this.#content);

    this._resizeDOM();
  }

  cache() {}
  clearCache() {}

  batchDraw() {}
}
