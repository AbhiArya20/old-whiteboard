export class Triangle {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options }; // Assume options include X, Y, base, height, color, etc.
  }

  draw = (state) => {
    this.#state = { ...this.#state, ...state };
    const halfBase = this.#state.base / 2;

    this.#tool.beginPath();
    this.#tool.moveTo(this.#state.X, this.#state.Y); // Starting point (top vertex)
    this.#tool.lineTo(
      this.#state.X - halfBase,
      this.#state.Y + this.#state.height
    ); // Left vertex
    this.#tool.lineTo(
      this.#state.X + halfBase,
      this.#state.Y + this.#state.height
    ); // Right vertex
    this.#tool.closePath();
    this.#tool.fillStyle = this.#state.color;
    this.#tool.fill();
  };

  getState = () => {
    return this.#state;
  };
}
