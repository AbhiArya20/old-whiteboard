import { nanoid } from "./nanoid.js";
import { SHAPES } from "./enums.js";

export class Line {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options, id: nanoid(), type: SHAPES.LINE };
  }

  draw = (state) => {
    this.#state = { ...this.#state, ...state };
    this.#tool.beginPath();
    this.#tool.moveTo(this.#state.startX, this.#state.startY);
    this.#tool.lineTo(this.#state.endX, this.#state.endY);
    this.#tool.strokeStyle = this.#state.color;
    this.#tool.lineWidth = this.#state.lineWidth;
    this.#tool.lineCap = "round";
    this.#tool.stroke();
  };

  getState = () => {
    return this.#state;
  };
}
