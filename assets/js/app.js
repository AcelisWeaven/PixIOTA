require('../scss/app.scss');

const size = 243;
const canvas = document.getElementById('canvas');
const subcanvas = document.createElement('canvas');
subcanvas.width = size;
subcanvas.height = size;
const ctx = canvas.getContext('2d');
const subctx = subcanvas.getContext('2d');
let currentScale = 10;

canvas.style.width = '100%';
canvas.style.height = '100%';

function initCanvas() {
    if (canvas.offsetWidth !== canvas.width || canvas.offsetHeight !== canvas.height) {
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    currentScale = 10;
}

initCanvas();
window.addEventListener("resize", () => {
    initCanvas();
trackTransforms(ctx);

lastX = canvas.width / 2;
lastY = canvas.height / 2;

zoom(currentScale);
});

const data = new Uint32Array(size * size);
const colorMap = [
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

for (let i = 0; i < size * size; ++i) {
    data[i] = colorMap[Math.floor(Math.random() * colorMap.length)];
}
const iData = new Uint8ClampedArray(data.buffer);
const imageData = new ImageData(iData, size, size);
subctx.putImageData(imageData, 0, 0);

var lastX = canvas.width / 2;
var lastY = canvas.height / 2;
let dragStart;
let dragged;
let scalingStart;
let pinchDist;

function dragStartEvent(evt) {
    const bounds = evt.target.getBoundingClientRect();
    if (evt.touches && evt.touches.length === 2) {
        // Pinch
        scalingStart = true;
        pinchDist = Math.hypot(
            evt.touches[0].pageX - evt.touches[1].pageX,
            evt.touches[0].pageY - evt.touches[1].pageY);

        lastX = (evt.targetTouches[0].clientX - bounds.left + evt.targetTouches[1].clientX - bounds.left) / 2;
        lastY = (evt.targetTouches[0].clientY - bounds.top + evt.targetTouches[1].clientY - bounds.top) / 2;
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
    lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
    lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
    dragStart = ctx.transformedPoint(lastX, lastY);
    dragged = false;
}

function dragMoveEvent(evt) {
    evt.preventDefault();
    if (scalingStart) {
        // Pinch
        const newPinchDist = Math.hypot(
            evt.touches[0].pageX - evt.touches[1].pageX,
            evt.touches[0].pageY - evt.touches[1].pageY);
        zoom(Math.round((newPinchDist - pinchDist) * 100) / 800);
        pinchDist = newPinchDist;
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
    lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
    lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
    dragged = true;
    if (dragStart) {
        const pt = ctx.transformedPoint(lastX, lastY);
        ctx.translate(pt.x - dragStart.x, pt.y - dragStart.y);
        redraw();
    }
}

function dragEndEvent(evt) {
    dragStart = null;
    scalingStart = false;
}

addListeners(canvas, 'mousedown touchstart', dragStartEvent, false);
addListeners(canvas, 'mousemove touchmove', dragMoveEvent, false);
addListeners(canvas, 'mouseup mouseleave touchend touchcancel touchleave', dragEndEvent, false);

/* not sure if I'll keep this part */
const scaleFactor = 1.05;
var zoom = clicks => {
    const pt = ctx.transformedPoint(lastX, lastY);
    ctx.translate(pt.x, pt.y);
    const factor = scaleFactor ** clicks;
    if (currentScale * factor > 16 && currentScale * factor < 512) {
        ctx.scale(factor, factor);
        currentScale *= factor;
    }
    ctx.translate(-pt.x, -pt.y);
    redraw();
};

const handleScroll = evt => {
    const delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
    if (delta) zoom(delta);
    return evt.preventDefault() && false;
};
canvas.addEventListener('DOMMouseScroll', handleScroll, false);
canvas.addEventListener('mousewheel', handleScroll, false);

function trackTransforms(ctx) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    let xform = svg.createSVGMatrix();
    ctx.getTransform = () => xform;

    const savedTransforms = [];
    const save = ctx.save;
    ctx.save = () => {
        savedTransforms.push(xform.translate(0, 0));
        return save.call(ctx);
    };
    const restore = ctx.restore;
    ctx.restore = () => {
        xform = savedTransforms.pop();
        return restore.call(ctx);
    };

    const scale = ctx.scale;
    ctx.scale = (sx, sy) => {
        xform = xform.scaleNonUniform(sx, sy);
        return scale.call(ctx, sx, sy);
    };
    const rotate = ctx.rotate;
    ctx.rotate = radians => {
        xform = xform.rotate(radians * 180 / Math.PI);
        return rotate.call(ctx, radians);
    };
    const translate = ctx.translate;
    ctx.translate = (dx, dy) => {
        xform = xform.translate(dx, dy);
        return translate.call(ctx, dx, dy);
    };
    const transform = ctx.transform;
    ctx.transform = (a, b, c, d, e, f) => {
        const m2 = svg.createSVGMatrix();
        m2.a = a;
        m2.b = b;
        m2.c = c;
        m2.d = d;
        m2.e = e;
        m2.f = f;
        xform = xform.multiply(m2);
        return transform.call(ctx, a, b, c, d, e, f);
    };
    const setTransform = ctx.setTransform;
    ctx.setTransform = (a, b, c, d, e, f) => {
        xform.a = a;
        xform.b = b;
        xform.c = c;
        xform.d = d;
        xform.e = e;
        xform.f = f;
        return setTransform.call(ctx, a, b, c, d, e, f);
    };
    const pt = svg.createSVGPoint();
    ctx.transformedPoint = (x, y) => {
        pt.x = x;
        pt.y = y;
        return pt.matrixTransform(xform.inverse());
    }
}

trackTransforms(ctx);

function redraw() {
    /* Clear the entire canvas */
    const p1 = ctx.transformedPoint(0, 0);
    const p2 = ctx.transformedPoint(canvas.width, canvas.height);
    ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    ctx.drawImage(subcanvas, canvas.width / 2 - subcanvas.width / 2, canvas.height / 2 - subcanvas.height / 2);
}

zoom(currentScale);

/* Add one or more listeners to an element
** @param {DOMElement} element - DOM element to add listeners to
** @param {string} events - space separated list of event names, e.g. 'click change'
** @param {Function} fn - function to attach for each event as a listener
** @param {boolean} useCapture
*/
function addListeners(element, events, fn, useCapture=false) {
    events.split(' ').forEach(e => element.addEventListener(e, fn, useCapture));
}