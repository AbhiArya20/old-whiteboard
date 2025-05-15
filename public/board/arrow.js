export class Arrow {
  #state;
  #tool;

  constructor(tool, options) {
    this.#tool = tool;
    this.#state = { ...options }; // Assume options include startX, startY, endX, endY, color, lineWidth, arrowSize, etc.
  }

  draw = (state) => {
    this.#state = { ...this.#state, ...state };
    const angle = Math.atan2(
      this.#state.endY - this.#state.startY,
      this.#state.endX - this.#state.startX
    );
    const arrowSize = this.#state.arrowSize || 10;

    this.#tool.beginPath();
    this.#tool.moveTo(this.#state.startX, this.#state.startY);
    this.#tool.lineTo(this.#state.endX, this.#state.endY);
    this.#tool.strokeStyle = this.#state.color;
    this.#tool.lineWidth = this.#state.lineWidth;
    this.#tool.stroke();

    // Draw the arrowhead
    this.#tool.beginPath();
    this.#tool.moveTo(this.#state.endX, this.#state.endY);
    this.#tool.lineTo(
      this.#state.endX - arrowSize * Math.cos(angle - Math.PI / 6),
      this.#state.endY - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    this.#tool.moveTo(this.#state.endX, this.#state.endY);
    this.#tool.lineTo(
      this.#state.endX - arrowSize * Math.cos(angle + Math.PI / 6),
      this.#state.endY - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    this.#tool.stroke();
  };

  getState = () => {
    return this.#state;
  };
}
