export class Circle {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options }; // Assume options include X, Y, radius, color, etc.
  }

  draw = (state) => {
    this.#state = { ...this.#state, ...state };
    this.#tool.strokeStyle = this.#state.color;
    this.#tool.lineWidth = this.#state.lineWidth;
    this.#tool.beginPath();
    this.#tool.ellipse(
      this.#state.X,
      this.#state.Y,
      Math.abs(this.#state.width),
      Math.abs(this.#state.height),
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
