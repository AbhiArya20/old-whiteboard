import { nanoid } from "./nanoid.js";
import { SHAPES } from "./enums.js";

export class Triangle {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options, id: nanoid(), type: SHAPES.TRIANGLE };
  }

  draw = (state, toScreenX, toScreenY, scale) => {
    this.#state = { ...this.#state, ...state };
    this.#tool.save();
    const x = toScreenX(this.#state.X);
    const y = toScreenY(this.#state.Y);
    const w = this.#state.width * (scale || 1);
    const h = this.#state.height * (scale || 1);
    this.#tool.translate(x, y);
    this.#tool.strokeStyle = this.#state.color;
    this.#tool.lineWidth = this.#state.lineWidth * (scale || 1);
    this.#tool.beginPath();
    this.#tool.moveTo(0, -h);
    this.#tool.lineTo(w, h);
    this.#tool.lineTo(-w, h);
    this.#tool.closePath();
    this.#tool.lineJoin = "round";
    this.#tool.stroke();
    this.#tool.restore();
  };

  getState = () => {
    return this.#state;
  };
}
