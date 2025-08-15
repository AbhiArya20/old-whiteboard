import { nanoid } from "./nanoid.js";
import { SHAPES } from "./enums.js";

export class Star {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options, id: nanoid(), type: SHAPES.STAR };
  }

  draw = (state, toScreenX, toScreenY, scale) => {
    this.#state = { ...this.#state, ...state };
    this.#tool.save();
    const x = toScreenX(this.#state.X);
    const y = toScreenY(this.#state.Y);
    const outerRadius = this.#state.radius * (scale || 1);
    const innerRadius = outerRadius / 2;
    const step = (Math.PI * 2) / this.#state.points;
    this.#tool.strokeStyle = this.#state.color;
    this.#tool.lineWidth = this.#state.lineWidth * (scale || 1);
    this.#tool.beginPath();
    for (let i = 0; i < this.#state.points; i++) {
      let angle = i * step;
      this.#tool.lineTo(
        x + Math.cos(angle) * outerRadius,
        y + Math.sin(angle) * outerRadius
      );
      angle += step / 2;
      this.#tool.lineTo(
        x + Math.cos(angle) * innerRadius,
        y + Math.sin(angle) * innerRadius
      );
    }
    this.#tool.closePath();
    this.#tool.lineJoin = "round";
    this.#tool.stroke();
    this.#tool.restore();
  };

  getState = () => {
    return this.#state;
  };
}
