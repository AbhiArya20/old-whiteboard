export class Circle {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options }; // Assume options include X, Y, radius, color, etc.
  }

  draw = (state) => {
    this.#state = { ...this.#state, ...state };
    this.#tool.beginPath();
    this.#tool.arc(
      this.#state.X,
      this.#state.Y,
      this.#state.radius,
      0,
      2 * Math.PI
    );
    this.#tool.fillStyle = this.#state.color;
    this.#tool.fill();
  };

  getState = () => {
    return this.#state;
  };
}
