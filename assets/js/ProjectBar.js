const Utilities = require("./Utilities");

module.exports = class Board {
    constructor(parent) {
        this.parent = parent;
        this.projects = null;
        this.selector = document.getElementById("project");
        this.projectBar = document.querySelector(".project-bar");
        this.projectNameElem = document.querySelector(".project-name");
        this.projectAddressElem = document.querySelector(".project-address");
        this.pixelMessageElem = document.querySelector(".pixel-message");

        this.selector.addEventListener("change", this.refreshProjectBar.bind(this));

        // mock API call
        setTimeout(() => {
            this.projects = [
                {
                    address: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                    project: "PixIOTA Test 1",
                },
                {
                    address: "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
                    project: "PixIOTA Test 2, creator of FGPAs dedicated to writing super long texts just for testing purposes"
                },
                {
                    address: "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
                    project: "PixIOTA Test 3",
                },
                {
                    address: "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
                    project: "PixIOTA Test 4",
                },
                {
                    address: "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
                    project: "PixIOTA Test 5",
                },
            ];
            this.updateProjects();
        }, 500);
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
        if (!this.parent.previewPixel.classList.contains('locked')) {
            this.projectBar.classList.add("hidden");
            return;
        }

        const selectedProject = this.projects.filter(elem => {
            return elem.address === this.selector.value;
        })[0];
        this.projectNameElem.innerText = selectedProject.project;
        this.projectAddressElem.innerText = selectedProject.address;
        this.projectBar.classList.remove("hidden");
    }

};