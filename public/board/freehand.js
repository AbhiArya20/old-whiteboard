import { nanoid } from "./nanoid.js";
import { SHAPES } from "./enums.js";

export class Freehand {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options, id: nanoid(), type: SHAPES.FREEHAND };
  }

  draw = (state) => {
    this.#state.points.push(state);
    const n = this.#state.points.length;
    this.#tool.beginPath();
    this.#tool.moveTo(this.#state.points[n - 2].X, this.#state.points[n - 2].Y);
    this.#tool.lineTo(this.#state.points[n - 1].X, this.#state.points[n - 1].Y);
    this.#tool.strokeStyle = this.#state.color;
    this.#tool.lineWidth = this.#state.lineWidth;
    this.#tool.lineCap = "round";
    this.#tool.lineJoin = "round";
    this.#tool.stroke();
  };

  drawPoints = (state) => {
    this.#state = { ...this.#state, ...state, points: [state.points[0]] };
    let i = 0;
    for (let point of state.points) {
      if (i === 0) {
        i++;
        continue;
      }
      this.draw(point);
    }
  };

  getState = () => {
    return this.#state;
  };
}
