import { nanoid } from "./nanoid.js";
import { SHAPES } from "./enums.js";

export class Circle {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options, id: nanoid(), type: SHAPES.CIRCLE };
  }

  draw = (state, toScreenX, toScreenY, scale) => {
    this.#state = { ...this.#state, ...state };
    this.#tool.strokeStyle = this.#state.color;
    this.#tool.lineWidth = this.#state.lineWidth * (scale || 1);
    this.#tool.beginPath();
    this.#tool.ellipse(
      toScreenX(this.#state.X),
      toScreenY(this.#state.Y),
      Math.abs(this.#state.width) * (scale || 1),
      Math.abs(this.#state.height) * (scale || 1),
      0,
      0,
      2 * Math.PI
    );
    this.#tool.stroke();
  };

  getState = () => {
    return this.#state;
  };
}
