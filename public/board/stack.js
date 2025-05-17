export class Stack {
  #stack;
  #size;
  #top;
  constructor(...arg) {
    this.#stack = arg || [];
    this.#size = 0;
    this.#top = -1;
  }

  push(...items) {
    for (const item of items) {
      this.#stack[++this.#top] = item;
      this.#size = this.#top + 1;
    }
  }

  prev() {
    if (this.#top === -1) return null;
    this.#top--;
    return this.#stack[this.#top];
  }

  poll() {
    if (this.#top === -1) return null;
    return this.#stack[this.#top];
  }

  next() {
    if (this.#top === this.#size - 1) return null;
    this.#top++;
    return this.#stack[this.#top];
  }

  top(index) {
    if (!index) return this.#top;
    this.#top = index;
  }

  state() {
    return this.#stack.slice(0, this.#top + 1);
  }
}
