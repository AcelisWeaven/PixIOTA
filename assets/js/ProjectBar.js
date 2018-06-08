module.exports = class Board {
    constructor(parent) {
        this.parent = parent;
        this.projects = null;
        this.selector = document.getElementById("project");

        // mock API call
        setTimeout(() => {
            this.projects = {
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA": "PixIOTA Test 1",
                "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB": "Pixel Brawl, creator of FGPAs dedicated to writing super long texts just for testing purposes",
            };
            this.updateProjects();
        }, 1000);
    }

    updateProjects() {
        console.log(this.projects);

        Object.entries(this.projects).forEach(([project, address]) => {
            console.log(project, address);

            let elem = document.createElement("option");
            elem.value = project;
            elem.innerText = address;
            this.selector.appendChild(elem);
        })
    }

};