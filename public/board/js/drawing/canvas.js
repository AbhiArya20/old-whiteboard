import { HitContext, SceneContext } from "./context.js";

class Canvas {
  #canvas;
  #context;

  #width = 0;
  #height = 0;

  #pixelRatio = 1;

  #isCache = false;

  constructor(config = {}) {
    // this.#pixelRatio = config.pixelRatio || getDevicePixelRatio();

    this.#canvas = document.createElement("canvas");
    this.#canvas.style.padding = "0";
    this.#canvas.style.margin = "0";
    this.#canvas.style.border = "0";
    this.#canvas.style.background = "transparent";
    this.#canvas.style.position = "absolute";
    this.#canvas.style.top = "0";
    this.#canvas.style.left = "0";
  }

  getContext() {
    return this.#context;
  }

  setContext(context) {
    this.#context = context;
  }

  getPixelRatio() {
    return this.#pixelRatio;
  }

  getWidth() {
    return this.#width;
  }

  getHeight() {
    return this.#height;
  }

  setWidth(width) {
    this.#width = this.#canvas.width = width * this.#pixelRatio;
    this.#canvas.style.width = `${width}px`;

    this.getContext().getContext().scale(this.#pixelRatio, this.#pixelRatio);
  }

  setHeight(height) {
    this.#height = this.#canvas.height = height * this.#pixelRatio;
    this.#canvas.style.height = `${height}px`;

    this.getContext().getContext().scale(this.#pixelRatio, this.#pixelRatio);
  }

  setSize(width, height) {
    this.setWidth(width);
    this.setHeight(height);
  }

  toDataURL(mineType = "image/png", quality = 1) {
    try {
      return this.#canvas.toDataURL(mineType, quality);
    } catch (e) {
      console.log(e);
    }

    try {
      return this.#canvas.toDataURL();
    } catch (e) {
      console.log(e);
    }
  }
}

export class SceneCanvas extends Canvas {
  constructor(config = { width: 0, height: 0, willReadFrequently: false }) {
    super(config);

    const context = new SceneContext(this, {
      willReadFrequently: config.willReadFrequently,
    });

    this.setContext(context);

    this.setSize(config.width, config.height);
  }
}

export class HitCanvas extends Canvas {
  constructor(config = { width: 0, height: 0 }) {
    super(config);

    const context = new HitContext(this);

    this.setContext(context);

    this.setSize(config.width, config.height);
  }
}
