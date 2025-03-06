export class Pencil {
    #color;
    #size;

    #isSelected;

    #isDialogOpen;

    #pencil
    constructor() {
        this.#pencil = document.querySelector(".pencil-action");
        const colors = this.#pencil.querySelector(".pencil-colors");
        const pencilSizeInput = this.#pencil.querySelector(".pencil-size input");
        const pencilSizeIndicator = this.#pencil.querySelector(".pencil-size-indicator span");
        const pencilColorPicker = this.#pencil.querySelector(".pencil-color-input");

        this.#isSelected = true;
        this.#isDialogOpen = false;

        const pencilColorStorageKey = "pencil-color";
        this.#color = localStorage.getItem(pencilColorStorageKey) ?? colors.children[0].classList[0];
        pencilSizeIndicator.style.backgroundColor = this.#color;
        let isContained = false;
        for (let children of colors.children) {
            if (children.classList.contains(this.#color)) {
                children.style.border = "solid 3px salmon";
                isContained = true;
            }
        }

        if (!isContained) {
            pencilColorPicker.style.backgroundColor = this.#color;
            pencilColorPicker.style.border = "solid 3px salmon";
        }

        pencilColorPicker.oninput = (event) => {
            this.#color = event.target.value;
            localStorage.setItem(pencilColorStorageKey, this.#color);
            pencilSizeIndicator.style.backgroundColor = this.#color;
            for (let children of colors.children) {
                children.style.border = "solid 3px transparent";
            }
            pencilColorPicker.style.border = "solid 3px salmon";
            pencilColorPicker.style.backgroundColor = this.#color
        }

        colors.addEventListener("click", (event) => {
            if (event.target.classList.contains("pencil-color-input")) return;
            if (event.target === colors) return;

            const selectedColorElement = event.target;
            this.#color = selectedColorElement.classList[0];
            localStorage.setItem(pencilColorStorageKey, this.#color);
            pencilSizeIndicator.style.backgroundColor = this.#color;
            for (let children of colors.children) {
                children.style.border = "solid 3px transparent";
            }
            selectedColorElement.style.border = "solid 3px salmon";
        });


        const pencilSizeStorageKey = "pencil-size";
        this.#size = localStorage.getItem(pencilSizeStorageKey) ?? pencilSizeInput.value;
        pencilSizeInput.value = this.#size;
        pencilSizeIndicator.style.height = `${this.#size}px`;
        pencilSizeInput.oninput = (e) => {
            this.#size = e.target.value;
            localStorage.setItem(pencilSizeStorageKey, this.#size);
            pencilSizeIndicator.style.height = `${this.#size}px`;
        }
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

    openDialog = () => {
        this.#pencil.classList.add("show");
        this.#isDialogOpen = true;
    }

    closeDialog = () => {
        this.#pencil.classList.remove("show");
        this.#isDialogOpen = false;
    }

    toggleDialog = () => {
        if (this.#isDialogOpen) {
            this.closeDialog();
        } else {
            this.openDialog();
        }
    }

    getState() {
        return {
            size: this.#size,
            color: this.#color,
            isSelected: this.#isSelected
        };
    }
}
