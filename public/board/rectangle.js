export class Rectangle {
  #tool;
  #state;

  constructor(tool, state) {
    console.log(state);

    this.#tool = tool;
    this.#state = { ...state }; // Initialize state with properties like X, Y, width, height, color.
  }

  draw = (state) => {
    this.#state = { ...this.#state, ...state };
    this.#tool.fillStyle = this.#state.color;
    this.#tool.rotate = this.#state.rotate;
    this.#tool.fillRect(
      this.#state.X,
      this.#state.Y,
      this.#state.width,
      this.#state.height
    );

    console.log(this.#state);
  };

  getState = () => {
    return this.#state;
  };
}
