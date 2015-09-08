function gotoView(viewId: string) {
    var activeView = <HTMLDivElement>document.getElementsByClassName("active")[0];
    var newView = <HTMLDivElement>document.getElementById(viewId);
    var dialog = <HTMLDivElement>document.getElementById("dialog");
    dialog.style.opacity = "0";
    setTimeout(function () {
        newView.classList.add("active");
        activeView.classList.remove("active");
        dialog.style.opacity = "1";
    }, 250);
}

window.onload = () => {
    var gameView = new Time.GameView(<HTMLCanvasElement>document.getElementById("canvas"));
    gameView.start();
    gameView.gameOverCallback = function () {
        document.getElementById("shadow").style.visibility = "visible";
        document.getElementById("shadow").style.opacity = "1";
    };
    
    document.getElementById("btnStart").addEventListener("click", function () {
        gotoView("level-selection");
    });
    
    var levelsTableBody = <HTMLTableSectionElement>document.getElementById("levels-list").children[0];
    var i = 0;
    Time.getLevels().map(function (level) {
        i++;
        var tds = [level.name, [0, 1, 2, 3, 4].map(star).join(""), "---"].map(function (value) {
            return "<td class='stars star-" + (i % 6) + "'>" + value + "</td>";
        }).join("");
        return "<tr data-id='" + level.id + "'>" + tds + "</tr>";
    }).forEach(function (tr: string) { levelsTableBody.innerHTML += tr });
    
    levelsTableBody.addEventListener("click", function (ev: MouseEvent) {
        var tr = ancestor(<HTMLElement>ev.target, "TR");
        if (!tr) return;
        var id = tr.attributes["data-id"].value;
        document.getElementById("shadow").style.opacity = "0";
        gameView.stop();
        setTimeout(function () {
            gameView.setLevel(id);
            gameView.start();
            document.getElementById("shadow").style.visibility = "hidden";
        }, 500);
    })
};

function star(stars) {
    return "<svg viewBox='0 0 94 90'><polygon points='47,0 76,90 0,34 94,34 17,90'></polygon></svg>";
}

function ancestor(element: HTMLElement, tagName: string) {
    while (element && element.tagName != tagName) {
        element = element.parentElement;
    }
    return element;
}