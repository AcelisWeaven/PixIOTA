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
            0XFF222222,
            0XFF0015FF,
            0XFF0083FF,
            0XFF00F0FF,
            0XFF00FFA1,
            0XFF00FF34,
            0XFF3AFF00,
            0XFFA7FF00,
            0XFFFFEA00,
            0XFFFF7C00,
            0XFFFF0F00,
            0XFFFF005E,
            0XFFFF00CB,
            0XFFC500FF,
            0XFF5800FF,
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