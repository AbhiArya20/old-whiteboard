import { ACTIONS } from "./enums.js";

export class Actions {
    #actions;

    #pencil;
    #shape;
    #eraser;
    #canvas;
    constructor(options) {
        this.#canvas = options.canvas;
        this.#pencil = options.pencil;
        this.#shape = options.shape;
        this.#eraser = options.eraser;

        this.#actions = document.querySelector(".actions");
        this.#actions.children[1].classList.add("background-highlight");

        this.#actions.addEventListener("click", (event) => {
            if (event.target.classList.contains("actions")) return;
            const action = event.target.attributes["data-action"].value;
            switch (action) {
                case ACTIONS.MENU: return this.#toggleMenu();
                case ACTIONS.PENCIL: return this.#handlePencil(event);
                case ACTIONS.SHAPE: return this.#handleShape(event);
                case ACTIONS.ERASER: return this.#handleEraser(event);
                case ACTIONS.DOWNLOAD: return this.#handleDownload(event);
                case ACTIONS.IMAGE: return this.#handleImage();
                case ACTIONS.NOTE: return this.#handleNote();
                case ACTIONS.REDO: return this.#handleRedo();
                case ACTIONS.UNDO: return this.#handleUndo();
                case ACTIONS.CLEAR: return this.#handleClear();
            };
        });
    }

    #toggleMenu = () => {
        this.#actions.classList.toggle("show");
    }

    #handlePencil = (event) => {
        if (this.#pencil.getState().isSelected) {
            this.#pencil.toggleDialog();
        } else {
            this.#reset();
            event.target.classList.add("background-highlight");
            this.#shape.close();
            this.#eraser.close();
            this.#pencil.open();
        }

    }

    #handleShape = (event) => {
        if (this.#shape.getState().isSelected) {
            this.#shape.toggleDialog();
        } else {
            this.#reset();
            event.target.classList.add("background-highlight");
            this.#pencil.close();
            this.#eraser.close();
            this.#shape.open();
        }
    }

    #handleEraser = (event) => {
        if (this.#eraser.getState().isSelected) {
            this.#eraser.toggleDialog();
        } else {
            this.#reset();
            event.target.classList.add("background-highlight");
            this.#pencil.close();
            this.#shape.close();
            this.#eraser.open();
        }
    }

    #handleDownload = () => {
        const imageURL = this.#canvas.toDataURL();
        const a = document.createElement("a");
        a.href = imageURL;
        a.download = "image.jpg";
        a.style.backgroundColor = "white";
        a.click();
    }

    #handleImage = () => {

    }

    #handleNote = () => {

    }

    #handleRedo = () => {
        this.#canvas.redo();
    }

    #handleUndo = () => {
        this.#canvas.undo();
    }

    #handleClear = () => {
        this.#canvas.clear();
    }

    #reset = () => {
        for (const action of this.#actions.children) {
            action.classList.remove("background-highlight");
        }
    }
}
