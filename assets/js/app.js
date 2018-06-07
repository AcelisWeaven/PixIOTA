require('../scss/app.scss');
const Canvas = require('./Canvas.js');
let loaded = false;

window.runPixIOTA = () => {
    if (loaded)
        return;

    new Canvas();
    loaded = true;
};
window.addEventListener("load", () => {
    runPixIOTA();
});