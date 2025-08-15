import { nanoid } from "./nanoid.js";
import { SHAPES } from "./enums.js";

export class Rectangle {
  #tool;
  #state;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options, id: nanoid(), type: SHAPES.RECTANGLE };
  }

  draw = (state, toScreenX, toScreenY, scale) => {
    this.#state = { ...this.#state, ...state };
    this.#tool.strokeStyle = this.#state.color;
    this.#tool.lineWidth = this.#state.lineWidth * (scale || 1);
    this.#tool.beginPath();
    const x = toScreenX(this.#state.X);
    const y = toScreenY(this.#state.Y);
    const w = this.#state.width * (scale || 1);
    const h = this.#state.height * (scale || 1);
    this.#tool.roundRect(
      x,
      y,
      w,
      h,
      Math.max(Math.min(w, h) * 0.1, 5)
    );
    this.#tool.stroke();
  };

  getState = () => {
    return this.#state;
  };
}
