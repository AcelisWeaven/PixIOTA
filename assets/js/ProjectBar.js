const Utilities = require("./Utilities");

module.exports = class Board {
    constructor(parent) {
        this.parent = parent;
        this.projects = null;
        this.selector = document.getElementById("project");

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
        console.log(this.projects);
        this.projects = Utilities.shuffleArray(this.projects);
        console.log(this.projects);
        this.projects.forEach((item) => {
            console.log(item);
            let elem = document.createElement("option");
            elem.value = item.address;
            elem.innerText = item.project;
            this.selector.appendChild(elem);
        });
        this.selector.classList.remove("hidden");
    }

};