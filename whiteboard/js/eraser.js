export class Eraser {
    #color;
    #size;

    #isSelected;

    #isDialogOpen;

    #eraser;
    constructor() {
        this.#eraser = document.querySelector(".eraser-action");
        const eraserSizeInput = this.#eraser.querySelector(".eraser-size-input-wrapper input");
        const eraserSizeIndicator = this.#eraser.querySelector(".eraser-size-indicator span");

        this.#color = "white";

        const eraserSizeStorageKey = "eraser-size";
        this.#size = localStorage.getItem(eraserSizeStorageKey) ?? eraserSizeInput.value;
        eraserSizeInput.value = this.#size;
        eraserSizeIndicator.style.height = `${this.#size}px`;
        eraserSizeInput.onchange = (e) => {
            this.#size = e.target.value;
            localStorage.setItem(eraserSizeStorageKey, this.#size);
            eraserSizeIndicator.style.height = `${this.#size}px`;
        };
    }

    open = () => {
        this.openDialog();
        this.#isSelected = true;
        this.#isDialogOpen = true;
    }

    close = () => {
        this.closeDialog();
        this.#isSelected = false;
        this.#isDialogOpen = false;
    }

    openDialog() {
        this.#eraser.classList.add("show");
        this.#isDialogOpen = true;
    }

    closeDialog() {
        this.#eraser.classList.remove("show");
        this.#isDialogOpen = false;
    }

    toggleDialog() {
        if (this.#isDialogOpen) {
            this.closeDialog();
        } else {
            this.openDialog();
        }
    }

    getState() {
        return {
            color: this.#color,
            size: this.#size,
            isSelected: this.#isSelected
        };
    }
}