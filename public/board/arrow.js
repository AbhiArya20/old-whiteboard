import { nanoid } from "./nanoid.js";
import { SHAPES } from "./enums.js";

export class Arrow {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options, id: nanoid(), type: SHAPES.ARROW };
  }

  draw = (state, toScreenX, toScreenY, scale) => {
    this.#state = { ...this.#state, ...state };
    const sx = toScreenX(this.#state.startX);
    const sy = toScreenY(this.#state.startY);
    const ex = toScreenX(this.#state.endX);
    const ey = toScreenY(this.#state.endY);
    const angle = Math.atan2(ey - sy, ex - sx);
    const arrowSize = Math.min(
      this.#state.lineWidth * 2.5 * (scale || 1),
      0.4 * Math.sqrt(Math.pow(ex - sx, 2) + Math.pow(ey - sy, 2))
    );

    this.#tool.beginPath();
    this.#tool.moveTo(sx, sy);
    this.#tool.lineTo(ex, ey);
    this.#tool.strokeStyle = this.#state.color;
    this.#tool.lineWidth = this.#state.lineWidth * (scale || 1);
    this.#tool.lineCap = "round";
    this.#tool.stroke();

    this.#tool.beginPath();
    this.#tool.moveTo(ex, ey);
    this.#tool.lineTo(
      ex - arrowSize * Math.cos(angle - Math.PI / 6),
      ey - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    this.#tool.moveTo(ex, ey);
    this.#tool.lineTo(
      ex - arrowSize * Math.cos(angle + Math.PI / 6),
      ey - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    this.#tool.stroke();
  };

  getState = () => {
    return this.#state;
  };
}
