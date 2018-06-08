const Utilities = require("./Utilities");
const Board = require("./Board.js");
const ProjectBar = require("./ProjectBar.js");

module.exports = class Canvas {
    constructor() {
        const size = 256;
        this.board = new Board(size, this);
        this.projectBar = new ProjectBar(this);
        this.resetCurrentScale();

        this.canvas = this.initCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.resetCanvas();

        // global variables, needs to be renamed
        this.lastX = Math.round(this.canvas.width / 2);
        this.lastY = Math.round(this.canvas.height / 2);
        this.dragStart = false;
        this.dragStartedPos = null;
        this.scalingStart = false;
        this.pinchDist = 0;

        this.registerEvents();
        this.trackTransforms(this.ctx);
        this.zoom(this.currentScale);

        this.previewPixel = document.querySelector(".preview-pixel");
        this.previewPixelLockBoardPos = null;
        this.updatePixelPreview();

        this.contentElem = document.querySelector(".content");

        // Keeping this here for debug purposes: draws a full-rainbowed canvas
        // for (let i = 0; i < size * size; ++i) {
        //     this.board.drawPixel(i % size, Math.trunc(i / size), i % this.board.colorMap.length, i === size * size - 1);
        // }
    }

    initCanvas() {
        let canvas = document.getElementById('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';

        return canvas;
    }

    resetCanvas() {
        if (this.canvas.offsetWidth !== this.canvas.width ||
            this.canvas.offsetHeight !== this.canvas.height) {
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
        }

        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;

        this.lineWidth = 1;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.lineJoin = "round";
        this.ctx.strokeStyle = "#FFFFFF33";

        this.previousDraw = {
            x1: Math.round(this.canvas.width / 2) - this.board.canvas.width / 2,
            y1: Math.round(this.canvas.height / 2) - this.board.canvas.height / 2,
            x2: Math.round(this.canvas.width / 2) - this.board.canvas.width / 2 + this.board.canvas.width,
            y2: Math.round(this.canvas.height / 2) - this.board.canvas.height / 2 + this.board.canvas.height,
        };

        this.resetCurrentScale();
    }

    resetCurrentScale() {
        this.lastCurrentScale = 1;
        this.currentScale = 2;
    }

    resizeEvent() {
        this.resetCanvas();
        this.trackTransforms(this.ctx);
        this.resetCurrentScale();

        this.lastX = Math.round(this.canvas.width / 2);
        this.lastY = Math.round(this.canvas.height / 2);

        this.zoom(this.currentScale);
        this.updatePixelPreview();
    }

    registerEvents() {
        // FIXME: There is a bug when a resize is triggered by android (when hiding address bar)
        window.addEventListener("resize", this.resizeEvent.bind(this));

        Utilities.addListeners(this.canvas, 'DOMMouseScroll mousewheel', this.handleScroll.bind(this), false);

        Utilities.addListeners(this.canvas, 'mousedown touchstart', this.dragStartEvent.bind(this), false);
        Utilities.addListeners(this.canvas, 'mousemove touchmove', this.dragMoveEvent.bind(this), false);
        Utilities.addListeners(this.canvas, 'mouseleave touchcancel touchleave', this.dragEndEvent.bind(this), false);
        Utilities.addListeners(this.canvas, 'mouseup touchend', this.touchEndEvent.bind(this), false);
    }

    trackTransforms(ctx) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        let xform = svg.createSVGMatrix();

        const scale = ctx.scale;
        ctx.scale = (sx, sy) => {
            xform = xform.scaleNonUniform(sx, sy);
            return scale.call(ctx, sx, sy);
        };
        const translate = ctx.translate;
        ctx.translate = (dx, dy) => {
            xform = xform.translate(dx, dy);
            return translate.call(ctx, dx, dy);
        };
        const pt = svg.createSVGPoint();
        ctx.transformedPoint = (x, y) => {
            pt.x = x;
            pt.y = y;
            return pt.matrixTransform(xform.inverse());
        };
        ctx.reverseTransformedPoint = (x, y) => {
            pt.x = x;
            pt.y = y;
            return pt.matrixTransform(xform);
        };
    }

    zoom(clicks) {
        const scaleFactor = 1.05;
        const pt = this.ctx.transformedPoint(this.lastX, this.lastY);
        this.ctx.translate(pt.x, pt.y);
        const factor = scaleFactor ** clicks;
        if (this.currentScale * factor >= 1 && this.currentScale * factor < 256) {
            this.ctx.scale(1 / this.lastCurrentScale, 1 / this.lastCurrentScale);
            this.currentScale *= factor;
            this.lastCurrentScale = Math.round(this.currentScale);
            this.ctx.scale(this.lastCurrentScale, this.lastCurrentScale);

            if (this.previewPixel) {
                // temporary disable transitions on previewPixel
                this.previewPixel.classList.add("no-transition");
                setTimeout(() => {
                    this.previewPixel.classList.remove("no-transition");
                }, 50);
            }
        }
        this.ctx.translate(-pt.x, -pt.y);
        this.redraw();
    }

    redraw() {
        /* Clear the entire canvas */
        const op1 = this.ctx.transformedPoint(this.previousDraw.x1, this.previousDraw.y1);
        const op2 = this.ctx.transformedPoint(this.previousDraw.x2, this.previousDraw.y2);
        this.ctx.clearRect(op1.x, op1.y, op2.x - op1.x, op2.y - op1.y);
        this.ctx.drawImage(this.board.canvas, Math.round(this.canvas.width / 2) - this.board.canvas.width / 2, Math.round(this.canvas.height / 2) - this.board.canvas.height / 2);

        const p1 = this.ctx.reverseTransformedPoint(Math.round(this.canvas.width / 2) - this.board.canvas.width / 2 - this.lineWidth * 2, Math.round(this.canvas.height / 2) - this.board.canvas.height / 2 - this.lineWidth * 2);
        const p2 = this.ctx.reverseTransformedPoint(Math.round(this.canvas.width / 2) + this.board.canvas.width / 2 + this.lineWidth * 2, Math.round(this.canvas.height / 2) + this.board.canvas.height / 2 + this.lineWidth * 2);
        this.previousDraw.x1 = p1.x;
        this.previousDraw.y1 = p1.y;
        this.previousDraw.x2 = p2.x;
        this.previousDraw.y2 = p2.y;

        // small stroke around the canvas
        this.ctx.strokeRect(Math.round(this.canvas.width / 2) - this.board.canvas.width / 2 - this.lineWidth / 2, Math.round(this.canvas.height / 2) - this.board.canvas.height / 2 - this.lineWidth / 2, this.board.canvas.width + this.lineWidth, this.board.canvas.height + this.lineWidth);
    }

    dragStartEvent(evt) {
        const bounds = evt.target.getBoundingClientRect();
        if (evt.touches && evt.touches.length === 2) {
            // Pinch
            this.scalingStart = true;
            this.pinchDist = Math.hypot(
                evt.touches[0].pageX - evt.touches[1].pageX,
                evt.touches[0].pageY - evt.touches[1].pageY);

            this.lastX = (evt.targetTouches[0].clientX - bounds.left + evt.targetTouches[1].clientX - bounds.left) / 2;
            this.lastY = (evt.targetTouches[0].clientY - bounds.top + evt.targetTouches[1].clientY - bounds.top) / 2;
            return;
        }
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        if (evt.targetTouches) {
            evt = {
                offsetX: evt.targetTouches[0].clientX - bounds.left,
                offsetY: evt.targetTouches[0].clientY - bounds.top,
                pageX: evt.targetTouches[0].pageX,
                pageY: evt.targetTouches[0].pageY,
            }
        }
        this.lastX = evt.offsetX || (evt.pageX - this.canvas.offsetLeft);
        this.lastY = evt.offsetY || (evt.pageY - this.canvas.offsetTop);
        this.dragStart = this.ctx.transformedPoint(this.lastX, this.lastY);
        this.dragStartedPos = {x: evt.pageX, y: evt.pageY};
    }

    dragMoveEvent(evt) {
        evt.preventDefault();
        if (this.scalingStart) {
            // Pinch
            const newPinchDist = Math.hypot(
                evt.touches[0].pageX - evt.touches[1].pageX,
                evt.touches[0].pageY - evt.touches[1].pageY);
            this.zoom(Math.round((newPinchDist - this.pinchDist) * 100) / 800);
            this.updatePixelPreview();
            this.pinchDist = newPinchDist;
            return;
        }

        if (evt.targetTouches) {
            const bounds = evt.target.getBoundingClientRect();
            evt = {
                offsetX: evt.targetTouches[0].clientX - bounds.left,
                offsetY: evt.targetTouches[0].clientY - bounds.top,
                pageX: evt.targetTouches[0].pageX,
                pageY: evt.targetTouches[0].pageY,
            }
        }
        this.lastX = evt.offsetX || (evt.pageX - this.canvas.offsetLeft);
        this.lastY = evt.offsetY || (evt.pageY - this.canvas.offsetTop);
        if (this.dragStart) {
            this.contentElem.classList.add("dragged");
            const pt = this.ctx.transformedPoint(this.lastX, this.lastY);
            this.ctx.translate(pt.x - this.dragStart.x, pt.y - this.dragStart.y);
            this.redraw();
        }
        this.updatePixelPreview();
    }

    dragEndEvent(evt) {
        this.contentElem.classList.remove("dragged");
        this.dragStartedPos = null;
        this.dragStart = null;
        this.scalingStart = false;
    }

    touchEndEvent(evt) {
        if (this.dragStartedPos &&
            Utilities.getDistance(this.dragStartedPos.x, this.dragStartedPos.y, evt.pageX, evt.pageY) < 10
        ) {
            // Lock the previewColor at the clicked position
            if (this.previewPixel.style.display) {
                this.previewPixelLockBoardPos = ((pt) => {
                    const boardPt = {
                        x: Math.round(pt.x + this.board.canvas.width / 2 - Math.round(this.canvas.width / 2) - this.lineWidth / 2),
                        y: Math.round(pt.y + this.board.canvas.height / 2 - Math.round(this.canvas.height / 2) - this.lineWidth / 2),
                    };
                    if (boardPt.x < 0 || boardPt.x >= this.board.size || boardPt.y < 0 || boardPt.y >= this.board.size)
                        return null;
                    return boardPt;
                })(this.ctx.transformedPoint(this.lastX, this.lastY));

                if (this.previewPixelLockBoardPos) {
                    // TODO: This line is for debug purposes, remove me later
                    this.board.drawPixel(this.previewPixelLockBoardPos.x, this.previewPixelLockBoardPos.y, this.board.currentColor.getAttribute("data-color-index"));

                    this.previewPixel.classList.remove('bump');
                    setTimeout(() => {
                        this.previewPixel.classList.add('bump');
                    }, 10);
                    this.previewPixel.classList.add('locked');
                } else {
                    this.previewPixel.classList.remove('locked');
                }
                this.updatePixelPreview();
            }
        }
        this.dragEndEvent(evt);
    }

    handleScroll(evt) {
        const delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        if (delta) this.zoom(delta);
        this.updatePixelPreview();
        return evt.preventDefault() && false;
    };

    setPreviewPixelColor(rgbaColor) {
        this.previewPixel.style.display = "block";
        this.previewPixel.style.backgroundColor = rgbaColor;
    }

    updatePixelPreview() {
        const cursorPos = ((pointerPt) => {
            return {
                begin: this.ctx.reverseTransformedPoint(Math.round(pointerPt.x + this.lineWidth / 2) - 1, Math.round(pointerPt.y + this.lineWidth / 2) - 1),
                end: this.ctx.reverseTransformedPoint(Math.round(pointerPt.x + this.lineWidth / 2), Math.round(pointerPt.y + this.lineWidth / 2))
            };
        })((() => {
            if (this.previewPixelLockBoardPos) {
                return {
                    x: this.previewPixelLockBoardPos.x + Math.round(this.canvas.width / 2) - this.board.canvas.width / 2,
                    y: this.previewPixelLockBoardPos.y + Math.round(this.canvas.height / 2) - this.board.canvas.height / 2
                };
            } else {
                return this.ctx.transformedPoint(this.lastX, this.lastY)
            }
        })());
        this.previewPixel.style.left = `${Math.round(cursorPos.begin.x)}px`;
        this.previewPixel.style.top = `${Math.round(cursorPos.begin.y)}px`;
        this.previewPixel.style.width = `${Math.round(cursorPos.end.x - cursorPos.begin.x)}px`
        this.previewPixel.style.height = `${Math.round(cursorPos.end.y - cursorPos.begin.y)}px`
    }
};