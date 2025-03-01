import { SHAPES } from "./enums.js"
export class Shape {
    #color;
    #size;

    #isSelected;

    #isDialogOpen;

    #shape;
    #shapeIcons;

    #selectedShape;
    constructor() {
        this.#shape = document.querySelector(".shape-action");
        this.#shapeIcons = this.#shape.querySelector(".shape-action-icons");
        const shapeSizeInput = this.#shape.querySelector(".shape-size-input-wrapper input");
        const shapeSizeIndicator = this.#shape.querySelector(".shape-size-indicator span");
        const colors = this.#shape.querySelector(".shape-colors");
        const shapeColorPicker = this.#shape.querySelector(".shape-color-input");

        this.#isSelected = false;
        this.#selectedShape = SHAPES.RECTANGLE;
        this.#shapeIcons.children[1].classList.add("background-highlight");

        this.#shapeIcons.addEventListener("click", (event) => {
            if (event.target.classList.contains("shape-action-icons")) return;
            this.#selectedShape = event.target.attributes["data-shape"].value;
            this.#reset();
            event.target.classList.add("background-highlight");
        });

        const shapeSizeStorageKey = "shape-size";
        this.#size = localStorage.getItem(shapeSizeStorageKey) ?? shapeSizeInput.value;
        shapeSizeInput.value = this.#size;
        shapeSizeIndicator.style.height = `${this.#size}px`;
        shapeSizeInput.onchange = (e) => {
            this.#size = e.target.value;
            localStorage.setItem(shapeSizeStorageKey, this.#size);
            shapeSizeIndicator.style.height = `${this.#size}px`;
        }

        const shapeColorStorageKey = "shape-color";
        this.#color = localStorage.getItem(shapeColorStorageKey) ?? colors.children[0].classList[0];
        shapeSizeIndicator.style.backgroundColor = this.#color;
        let isContained = false;
        for (let children of colors.children) {
            if (children.classList.contains(this.#color)) {
                children.style.border = "solid 3px salmon";
                isContained = true;
            }
        }

        if (!isContained) {
            shapeColorPicker.style.backgroundColor = this.#color;
            shapeColorPicker.style.border = "solid 3px salmon";
        }

        shapeColorPicker.onchange = (event) => {
            this.color = event.target.value;
            localStorage.setItem(shapeColorStorageKey, this.color);
            shapeSizeIndicator.style.backgroundColor = this.color;
            for (let children of colors.children) {
                children.style.border = "solid 3px transparent";
            }
            shapeColorPicker.style.border = "solid 3px salmon";
            shapeColorPicker.style.backgroundColor = this.color;
        };

        colors.addEventListener("click", (event) => {
            if (event.target.classList.contains("shape-color-input")) return;
            if (event.target === colors) return;

            const selectedColorElement = event.target;
            this.color = selectedColorElement.classList[0];
            localStorage.setItem(shapeColorStorageKey, this.color);
            shapeSizeIndicator.style.backgroundColor = this.color;
            for (let children of colors.children) {
                children.style.border = "solid 3px transparent";
            }
            selectedColorElement.style.border = "solid 3px salmon";
        });
    }

    open = () => {
        this.openDialog();
        this.#isSelected = true;
        this.#isDialogOpen = true;
    }

    close = () => {
        this.closeDialog()
        this.#isSelected = false;
        this.#isDialogOpen = false;
    }

    openDialog() {
        this.#shape.classList.add("show");
        this.#isDialogOpen = true;
    }

    closeDialog() {
        this.#shape.classList.remove("show");
        this.#isDialogOpen = false;
    }

    toggleDialog() {
        if (this.#isDialogOpen) {
            this.closeDialog();
        } else {
            this.openDialog();
        }
    }

    #reset = () => {
        for (const shape of this.#shapeIcons.children) {
            shape.classList.remove("background-highlight");
        }
    }

    getState = () => {
        return {
            selectedShape: this.#selectedShape,
            isSelected: this.#isSelected,
            color: this.#color,
            size: this.#size,
        };
    }
}
