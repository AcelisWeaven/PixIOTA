const Utilities = require("./Utilities");

module.exports = class Board{
    constructor(size, parent) {
        this.size = size;
        this.parent = parent;

        this.canvas = document.createElement('canvas');
        this.canvas.width = size;
        this.canvas.height = size;

        this.ctx = this.canvas.getContext('2d');

        this.init();
        this.createPicker();

        setInterval(() => {
            // Change a random pixel :)
            for (let i = 0 ; i < 5 ; i++){
                this.data[Math.floor(Math.random() * this.data.length)] = this.colorMap[Math.floor(Math.random() * this.colorMap.length)];
            }
            this.updateCtx();
            this.parent.redraw();
        }, 50)
    }

    init() {
        this.data = new Uint32Array(this.size * this.size);
        this.colorMap = [
            0XFFFCFCFC,
            0XFF000000,
            0XFF1010FF,
            0XFF1088FF,
            0XFF10FFFF,
            0XFF10FF88,
            0XFF10FF10,
            0XFF88FF10,
            0XFFFFFF10,
            0XFFFFA308,
            0XFFFF4700,
            0XFFFF2C80,
            0XFFFF10FF,
            0XFF8810FF,
        ];

        for (let i = 0; i < this.size * this.size; ++i) {
            this.data[i] = this.colorMap[0];
        }
        this.updateCtx();
    }

    createPicker() {
        this.picker = document.querySelector('.color-picker-container');
        this.colorMap.forEach((color, colorIndex) => {
            let colorPicker = document.createElement("div");
            colorPicker.className = "color-picker";
            colorPicker.style.backgroundColor = Utilities.hexColorToString(color);
            colorPicker.setAttribute("data-color-index", colorIndex);
            this.picker.appendChild(colorPicker);
        });
    }

    updateCtx() {
        const iData = new Uint8ClampedArray(this.data.buffer);
        const imageData = new ImageData(iData, this.size, this.size);
        this.ctx.putImageData(imageData, 0, 0);
    }
};