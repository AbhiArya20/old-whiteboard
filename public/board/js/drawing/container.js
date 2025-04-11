import { Node } from "./node.js";

export class Container extends Node {
  children = [];

  constructor(config) {
    super(config);
  }

  add(...items) {
    if (items.length === 0) return this;

    if (items.length > 1) {
      for (let item of items) {
        this.children.push(item);
      }
      return true;
    }

    return this;
  }

  getChildren(cb) {
    if (!cb) return this.children;
    return this.children.filter(cb);
  }

  hasChildren() {
    return this.children.length > 0;
  }
}
