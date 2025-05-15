export class Zoom {
  #zoomValue;
  constructor() {
    this.zoomAction = document.querySelector(".zoom-actions");
    this.#zoomValue = this.zoomAction.querySelector(".zoom-value");

    this.zoomAction.addEventListener("click", (event) => {
      if (event.target.classList.contains("zoom-actions")) return;
      const targetClass = event.target.classList[0];
      switch (targetClass) {
        case "zoom-in":
          return this.#zoomIn();
        case "zoom-out":
          return this.#zoomOut();
        default:
          return this.#reset();
      }
    });
  }

  #zoomIn = () => {};

  #zoomOut = () => {};

  #reset = () => {};

  update(scale) {
    this.#zoomValue.innerText = `${(scale * 100).toFixed(0)}%`;
  }
}
