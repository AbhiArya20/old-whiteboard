import { nanoid } from "./nanoid.js";
import { SHAPES } from "./enums.js";

export class Text {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options, id: nanoid(), type: SHAPES.TEXT };
  }

  draw = (state, toScreenX, toScreenY, scale) => {
    this.#state = { ...this.#state, ...state };
    this.#tool.font = `${this.#state.fontSize * (scale || 1)}px ${this.#state.fontFamily}`;
    this.#tool.fillStyle = this.#state.color;
    this.#tool.fillText(this.#state.text, toScreenX(this.#state.X), toScreenY(this.#state.Y));
  };

  getState = () => {
    return this.#state;
  };
}
