import { nanoid } from "./nanoid.js";
import { SHAPES } from "./enums.js";

export class Rectangle {
  #tool;
  #state;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options, id: nanoid(), type: SHAPES.RECTANGLE };
  }

  draw = (state) => {
    this.#state = { ...this.#state, ...state };
    this.#tool.strokeStyle = this.#state.color;
    this.#tool.lineWidth = this.#state.lineWidth;
    this.#tool.beginPath();
    this.#tool.roundRect(
      this.#state.X,
      this.#state.Y,
      this.#state.width,
      this.#state.height,
      Math.max(Math.min(this.#state.width, this.#state.height) * 0.1, 5)
    );
    this.#tool.stroke();
  };

  getState = () => {
    return this.#state;
  };
}
