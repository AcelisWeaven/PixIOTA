module.exports = class Board{
    constructor(size) {
        this.size = size;

        this.canvas = document.createElement('canvas');
        this.canvas.width = size;
        this.canvas.height = size;

        this.ctx = this.canvas.getContext('2d');

        this.init();
    }

    init() {
        this.data = new Uint32Array(this.size * this.size);
        this.colorMap = [
            0xfffcfcfc,
            0xff1010ff,
            0xff10ffff,
            0xff10ff10,
            0xffffff10,
            0xffff1010,
            0xffff10ff,
            0xff1010a0,
            0xff10a0a0,
            0xff10a010,
            0xffa0a010,
            0xffa01010,
            0xffa010a0,
            0xff000000,
        ];

        for (let i = 0; i < this.size * this.size; ++i) {
            this.data[i] = this.colorMap[Math.floor(Math.random() * this.colorMap.length)];
        }
        const iData = new Uint8ClampedArray(this.data.buffer);
        const imageData = new ImageData(iData, this.size, this.size);
        this.ctx.putImageData(imageData, 0, 0);
    }
};