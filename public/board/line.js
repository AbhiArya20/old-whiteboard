import { nanoid } from "./nanoid.js";
import { SHAPES } from "./enums.js";

export class Line {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options, id: nanoid(), type: SHAPES.LINE };
  }

  draw = (state, toScreenX, toScreenY, scale) => {
    this.#state = { ...this.#state, ...state };
    this.#tool.beginPath();
    this.#tool.moveTo(toScreenX(this.#state.startX), toScreenY(this.#state.startY));
    this.#tool.lineTo(toScreenX(this.#state.endX), toScreenY(this.#state.endY));
    this.#tool.strokeStyle = this.#state.color;
    this.#tool.lineWidth = this.#state.lineWidth * (scale || 1);
    this.#tool.lineCap = "round";
    this.#tool.stroke();
  };

  getState = () => {
    return this.#state;
  };
}
