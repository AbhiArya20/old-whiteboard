export class Star {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options };
  }

  draw = (state) => {
    this.#state = { ...this.#state, ...state };

    this.#tool.save();

    this.#tool.translate(0, 0);

    const step = (Math.PI * 2) / this.#state.points;
    const outerRadius = this.#state.radius;
    const innerRadius = this.#state.radius / 2;

    this.#tool.strokeStyle = this.#state.color;
    this.#tool.lineWidth = this.#state.lineWidth;
    this.#tool.beginPath();
    for (let i = 0; i < this.#state.points; i++) {
      let angle = i * step;
      this.#tool.lineTo(
        this.#state.X + Math.cos(angle) * outerRadius,
        this.#state.Y + Math.sin(angle) * outerRadius
      );
      angle += step / 2;
      this.#tool.lineTo(
        this.#state.X + Math.cos(angle) * innerRadius,
        this.#state.Y + Math.sin(angle) * innerRadius
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
