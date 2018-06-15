const Utilities = require("./Utilities");
const QRCode = require("qrcodejs2");

module.exports = class Board {
    constructor(parent) {
        this.parent = parent;
        this.projects = null;
        this.selector = document.getElementById("project");
        this.projectBar = document.querySelector(".project-bar");
        this.qrcode = null;
        this.qrcodeElem = document.getElementById("qrcode");
        this.projectNameElem = document.querySelector(".project-name");
        this.projectAddressElem = document.querySelector(".project-address");
        this.pixelMessageElem = document.querySelector(".pixel-message");

        this.selector.addEventListener("change", this.refreshProjectBar.bind(this));

        fetch(`${process.env.API_HTTP_SCHEME}://${process.env.API_ENDPOINT}/projects`)
            .then(response => {
                return response.json();
            })
            .then(projects => {
                this.projects = projects;
                this.updateProjects();
            })
        ;
    }

    updateProjects() {
        this.projects = Utilities.shuffleArray(this.projects);
        this.projects.forEach((item) => {
            let elem = document.createElement("option");
            elem.value = item.address;
            elem.innerText = item.project;
            this.selector.appendChild(elem);
        });
        this.selector.classList.remove("hidden");
    }

    refreshProjectBar() {
        if (!this.projects) return;
        if (!this.parent.previewPixel.classList.contains('locked')) {
            this.projectBar.classList.add("hidden");
            return;
        }

        const pixelID = `pixiota ${this.getPixelID()}`;
        const selectedProject = this.projects.filter(elem => {
            return elem.address === this.selector.value;
        })[0];
        this.projectNameElem.innerText = selectedProject.project;
        this.projectAddressElem.innerText = selectedProject.address;
        this.pixelMessageElem.innerText = pixelID;
        this.projectBar.classList.remove("hidden");
        this.makeQrCode(JSON.stringify({
            address: selectedProject.address,
            message: pixelID,
        }));
    }

    makeQrCode(text) {
        if (!this.qrcode) {
            this.qrcode = new QRCode(this.qrcodeElem, {
                text,
                width: 220,
                height: 220,
                colorDark: "#2f3a43",
                correctLevel: 1 // L
            });
        } else {
            this.qrcode.makeCode(text);
        }
    }

    /**
     * PixelID is made this following way, where parts are separated with a dot:
     * First part (0-f) is hex representation of the color
     * Second part represents the position on the board (0-9a-z)
     */
    getPixelID() {
        const pixelPt = this.parent.previewPixelLockBoardPos;
        const color = parseInt(this.parent.board.currentColor.getAttribute("data-color-index"));
        return `${color.toString(16)}.${pixelPt.x.toString(36)}.${pixelPt.y.toString(36)}`;
    }
};