interface LevelStorageData {
    time: number;
    stars: number;
}

window.onload = () => {
    var currentLevel;
    
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
    
    var starsHTML = [0, 0, 0, 0, 0].map(function () {
        return"<svg viewBox='0 0 94 90'><polygon points='47,0 76,90 0,34 94,34 17,90'></polygon></svg>";
    }).join("");
        
    
    function createTree(data: Array<any>) : Node {
        var element = document.createElement(data[0]);
        if (data[1]) {
            for (var key in data[1]) {
                element.setAttribute(key, data[1][key]);
            }
        }
        if (typeof(data[2]) == "string") {
            element.innerHTML = data[2];
        } else if (data[2]) {
            data[2].forEach(function (child) { element.appendChild(createTree(child)) });
        }
        return element;
    }
    
    function ancestor(element: HTMLElement, tagName: string) {
        while (element && element.tagName != tagName) {
            element = element.parentElement;
        }
        return element;
    }

    function registerScore(levelId: number, time: number, stars: number) {
        var currentData = getLevelStorageData(levelId);
        if (currentData.time < time) return;
        
        localStorage.setItem("score-level-" + levelId, JSON.stringify({
            time: time,
            stars: stars
        }));
        var levelTr = <HTMLTableRowElement>document.querySelector("tr[data-id='" + levelId + "']");
        var starsTd = <HTMLTableDataCellElement>levelTr.children[1];
        starsTd.className = "stars star-" + stars;
        
        var timeTd = <HTMLTableDataCellElement>levelTr.children[2];
        timeTd.innerHTML = formatTime(time);
    }
    
    function formatTime(time: number) {
        if (time == Infinity) return "---";
        return time.toFixed(2) + "s";
    }
    
    function getLevelStorageData(levelId: number) : LevelStorageData {
        return JSON.parse(localStorage.getItem("score-level-" + levelId)) || { stars: null, time: Infinity };
    }
    
    var gameView = new Time.GameView(<HTMLCanvasElement>document.getElementById("canvas"));
    gameView.start();
    gameView.gameOverCallback = function (win: boolean, time?: number, stars?: number) {
        if (win) {
            registerScore(currentLevel, time, stars)
        }
        document.getElementById("shadow").style.visibility = "visible";
        document.getElementById("shadow").style.opacity = "1";
    };
    
    document.getElementById("btnStart").addEventListener("click", function () {
        gotoView("level-selection");
    });
    
    var levelsTableBody = <HTMLTableSectionElement>document.getElementById("levels-list").children[0];
    
    Time.getLevels().map(function (level) {
        var storageData = getLevelStorageData(level.id);
        
        return createTree([
            "tr",
            { "data-id": level.id },
            [
                ["td", {}, level.name],
                ["td", { "class": "stars star-" + storageData.stars }, starsHTML],
                ["td", {}, formatTime(storageData.time)]
            ]
        ]);
    }).forEach(function (tr: Node) { levelsTableBody.appendChild(tr) });
    
    levelsTableBody.addEventListener("click", function (ev: MouseEvent) {
        var tr = ancestor(<HTMLElement>ev.target, "TR");
        if (!tr) return;
        var id = tr.attributes["data-id"].value;
        document.getElementById("shadow").style.opacity = "0";
        gameView.stop();
        currentLevel = id;
        setTimeout(function () {
            gameView.setLevel(id);
            gameView.start();
            document.getElementById("shadow").style.visibility = "hidden";
        }, 500);
    })
};