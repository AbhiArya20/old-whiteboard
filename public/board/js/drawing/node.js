import { nanoid } from "../../js/nanoid.js";

// const ATTRIBUTES = {
//   ABSOLUTE_OPACITY: "absoluteOpacity",
//   ALL_LISTENERS: "allEventListeners",
//   ABSOLUTE_TRANSFORM: "absoluteTransform",
//   ABSOLUTE_SCALE: "absoluteScale",
//   CANVAS: "canvas",
//   CHANGE: "Change",
//   CHILDREN: "children",
//   KONVA: "konva",
//   LISTENING: "listening",
//   MOUSEENTER: "mouseenter",
//   MOUSELEAVE: "mouseleave",
//   NAME: "name",
//   SET: "set",
//   SHAPE: "Shape",
//   SPACE: " ",
//   STAGE: "stage",
//   TRANSFORM: "transform",
//   UPPER_STAGE: "Stage",
//   VISIBLE: "visible",
//   TRANSFORM_CHANGE_STR: [
//     "xChange.konva",
//     "yChange.konva",
//     "scaleXChange.konva",
//     "scaleYChange.konva",
//     "skewXChange.konva",
//     "skewYChange.konva",
//     "rotationChange.konva",
//     "offsetXChange.konva",
//     "offsetYChange.konva",
//     "transformsEnabledChange.konva",
//   ].join(SPACE),
// };

export class Node {
  #id;

  #attributes;

  #shouldFireChangeEvent = false;
  constructor(config) {
    this.#id = nanoid();

    this.setAttributes(config);
    this.#shouldFireChangeEvent = true;
  }

  hasChildren() {
    return false;
  }

  setAttribute(attribute, value) {
    // const method = this[]
  }

  setAttributes(config) {
    this.#transformChanges(() => {
      if (!config) return this;

      let key, method;

      for (key in config) {
        if (key === CHILDREN) {
          continue;
        }

        method;
      }
    });
  }

  _setAttributes(key, value) {}

  #transformChanges(cb) {}
}
