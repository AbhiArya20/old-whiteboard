import { nanoid } from "./nanoid.js";
import { SHAPES } from "./enums.js";

export class Rhombus {
  #tool;
  #state;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options, id: nanoid(), type: SHAPES.RHOMBUS };
  }

  draw = (state) => {
    this.#state = { ...this.#state, ...state };

    this.#tool.save();

    this.#tool.translate(this.#state.X, this.#state.Y);

    this.#tool.strokeStyle = this.#state.color;
    this.#tool.lineWidth = this.#state.lineWidth;

    this.#tool.beginPath();
    this.#tool.moveTo(0, -this.#state.height);
    this.#tool.lineTo(this.#state.width, 0);
    this.#tool.lineTo(0, this.#state.height);
    this.#tool.lineTo(-this.#state.width, 0);
    this.#tool.closePath();
    this.#tool.lineJoin = "round";
    this.#tool.stroke();
    this.#tool.restore();
  };

  getState = () => {
    return this.#state;
  };
}
