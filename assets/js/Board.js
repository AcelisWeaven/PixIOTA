const Utilities = require("./Utilities");
const WebSocketClient = require("./WebSocketClient");

module.exports = class Board {
    constructor(size, parent) {
        this.size = size;
        this.parent = parent;

        this.ready = false;
        this.pixelBuffer = [];
        this.canvas = document.createElement('canvas');
        this.canvas.width = size;
        this.canvas.height = size;

        this.ctx = this.canvas.getContext('2d');

        this.init();
        this.createPicker();

        this.ws = new WebSocketClient(`${process.env.API_WS_SCHEME}://${process.env.API_ENDPOINT}`);
        this.ws.onmessage = this.webSocketMessageEvent.bind(this);
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
        fetch(`${process.env.API_HTTP_SCHEME}://${process.env.API_ENDPOINT}/map`)
            .then(response => {
                return response.arrayBuffer();
            })
            .then(data => {
                const uint8arr = new Uint8Array(data);
                uint8arr.forEach((e, i) => {
                    const px1 = Math.floor(uint8arr[i] / 16) % 16;
                    const px2 = uint8arr[i] % 16;
                    this.data[i * 2] = this.colorMap[px1];
                    this.data[i * 2 + 1] = this.colorMap[px2];
                });
                // apply all buffered pixels
                this.pixelBuffer.forEach(px => {
                    this.setPixel(px.x, px.y, px.c);
                });
                this.pixelBuffer = [];
                this.updateCtx();
                this.ready = true;
                this.parent.redraw();
            })
        ;
    }

    createPicker() {
        this.picker = document.querySelector('.color-picker-container');
        this.currentColor = null;
        this.colorMap.forEach((color, colorIndex) => {
            let colorPicker = document.createElement("div");
            colorPicker.classList.add("color-picker");
            colorPicker.setAttribute("data-color-index", colorIndex);
            this.picker.appendChild(colorPicker);

            let _this = this;
            Utilities.addListeners(colorPicker, "mouseup touchend", (e) => {
                if (_this.currentColor) {
                    _this.currentColor.classList.remove("active");
                }
                _this.currentColor = e.target;
                _this.currentColor.classList.add("active");
                _this.parent.setPreviewPixelColor(Utilities.hexColorToString(color));
                _this.parent.projectBar.refreshProjectBar();
            });
        });
    }

    updateCtx() {
        const iData = new Uint8ClampedArray(this.data.buffer);
        const imageData = new ImageData(iData, this.size, this.size);
        this.ctx.putImageData(imageData, 0, 0);
    }

    webSocketMessageEvent(event) {
        const pixelData = JSON.parse(event.data);

        // if map hasn't been fetched yet, we buffer newly-received pixels
        if (this.ready === false) {
            if (pixelData.type === "transaction") {
                this.pixelBuffer.push(pixelData);
            } else if (pixelData.type === "latest_transactions") {
                this.pixelBuffer.unshift(...pixelData.transactions);
            }
            return;
        }

        if (pixelData.type === "transaction") {
            this.setPixel(pixelData.x, pixelData.y, pixelData.c);
            this.updateCtx();
            this.parent.redraw();
        } else if (pixelData.type === "latest_transactions") {
            pixelData.transactions.forEach(px => {
                this.setPixel(px.x, px.y, px.c);
            });
            this.updateCtx();
            this.parent.redraw();
        }
    }

    setPixel(x, y, color) {
        this.data[y * this.size + x] = this.colorMap[color];
    }
};