export class Star {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options }; // Assume options include X, Y, radius, points, color, etc.
  }

  draw = (state) => {
    this.#state = { ...this.#state, ...state };
    const { X, Y, radius, points, color } = this.#state;
    const step = (Math.PI * 2) / points;
    const outerRadius = radius;
    const innerRadius = radius / 2;

    this.#tool.beginPath();
    for (let i = 0; i < points; i++) {
      let angle = i * step;
      this.#tool.lineTo(
        X + Math.cos(angle) * outerRadius,
        Y + Math.sin(angle) * outerRadius
      );
      angle += step / 2;
      this.#tool.lineTo(
        X + Math.cos(angle) * innerRadius,
        Y + Math.sin(angle) * innerRadius
      );
    }
    this.#tool.closePath();
    this.#tool.fillStyle = color;
    this.#tool.fill();
  };

  getState = () => {
    return this.#state;
  };
}
