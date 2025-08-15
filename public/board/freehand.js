import { nanoid } from "./nanoid.js";
import { SHAPES } from "./enums.js";

export class Freehand {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options, id: nanoid(), type: SHAPES.FREEHAND };
  }

  draw = (state, toScreenX, toScreenY, scale) => {
    this.#state.points.push(state);
    const n = this.#state.points.length;
    this.#tool.beginPath();
    this.#tool.moveTo(toScreenX(this.#state.points[n - 2].X), toScreenY(this.#state.points[n - 2].Y));
    this.#tool.lineTo(toScreenX(this.#state.points[n - 1].X), toScreenY(this.#state.points[n - 1].Y));
    this.#tool.strokeStyle = this.#state.color;
    this.#tool.lineWidth = this.#state.lineWidth * (scale || 1);
    this.#tool.lineCap = "round";
    this.#tool.lineJoin = "round";
    this.#tool.stroke();
  };

  drawPoints = (state, toScreenX, toScreenY, scale) => {
    this.#state = { ...this.#state, ...state, points: [state.points[0]] };
    let i = 0;
    for (let point of state.points) {
      if (i === 0) {
        i++;
        continue;
      }
      this.draw(point, toScreenX, toScreenY, scale);
    }
  };

  getState = () => {
    return this.#state;
  };

  
}
