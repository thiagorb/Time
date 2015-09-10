interface LevelStorageData {
    time: number;
    stars: number;
}

window.onload = () => {
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = 
            ["webkit", "moz", "o", "ms"].reduce(function (existing, vendor) {
                return existing || window[vendor + "RequestAnimationFrame"];
            }, null)
            || function(callback) { window.setTimeout(callback, 1000 / 60); };
    }
    
    var currentLevel: Time.Level;
    var totalLevels;
    
    var $ = function (query: string): Element { return document.querySelector(query) };
    var $$ = function (query: string): NodeList { return document.querySelectorAll(query) };
    
    function gotoView(viewId: string) {
        (<HTMLDivElement>$("#shadow")).style.visibility = "visible";
        (<HTMLDivElement>$("#shadow")).style.opacity = "";
        var activeView = $(".active");
        var newView = $("#" + viewId);
        var dialog = <HTMLDivElement>$("#dialog");
        if (activeView) {
            dialog.style.opacity = "0";
            setTimeout(function () {
                newView.classList.add("active");
                if (activeView) activeView.classList.remove("active");
                dialog.style.opacity = "1";
                dialog.style.visibility = "visible";
            }, 250);
        } else {
            newView.classList.add("active");
            dialog.style.opacity = "1";
            dialog.style.visibility = "visible";
        }
    }
    
    function hideUi (callback: () => void) {
        var shadow = (<HTMLDivElement>$("#shadow"));
        var dialog = (<HTMLDivElement>$("#dialog"));
        shadow.style.opacity = "1";
        dialog.style.opacity = "0";
        setTimeout(function () {
            var activeView = $(".active");
            if (activeView) activeView.classList.remove("active");
            shadow.style.opacity = "0";
            callback();
            setTimeout(function () {
                shadow.style.visibility = "hidden";
                dialog.style.visibility = "hidden";
            }, 500);
        }, 500);
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
        var levelTr = <HTMLTableRowElement>$("tr[data-id='" + levelId + "']");
        var starsTd = <HTMLTableDataCellElement>levelTr.children[1];
        starsTd.className = "stars star-" + stars;
        
        var timeTd = <HTMLTableDataCellElement>levelTr.children[2];
        timeTd.innerHTML = formatTime(time);
    }
    
    function formatTime(time: number) {
        if (!time || time == Infinity) return "---";
        return time.toFixed(2) + "s";
    }
    
    function getLevelStorageData(levelId: number) : LevelStorageData {
        return JSON.parse(localStorage.getItem("score-level-" + levelId)) || { stars: null, time: Infinity };
    }
    
    function startLevel(id: number) {
        gameView.stop();
        hideUi(function () {
            currentLevel = gameView.setLevel(id);
            gameView.start();
        });
    }
    
    var gameView = new Time.GameView(<HTMLCanvasElement>$("canvas"));
    gameView.setLevel(-1);
    gameView.start();
    
    gameView.gameOverCallback = function (win: boolean, time: number, stars?: number) {
        if (win) {
            registerScore(currentLevel.id, time, stars);
            (<HTMLDivElement>$("#after-game .score .stars")).className = "stars star-" + stars;
            (<HTMLDivElement>$("#after-game .score .time")).innerHTML = formatTime(time);
        }
        
        (<HTMLDivElement>$("#after-game .score")).style.display = win? "": "none";
        
        (<HTMLDivElement>$("#after-game .level-name")).innerHTML = currentLevel.name;
        (<HTMLDivElement>$("#after-game .message")).innerHTML = win
            ? "Level finished!"
            : "You lost! Better luck next time!";
        
        
        if (currentLevel.id + 1 >= totalLevels) {
            $("#btnNext").setAttribute("disabled", "disabled");
        } else {
            $("#btnNext").removeAttribute("disabled");
        }
        
        var levelData = getLevelStorageData(currentLevel.id);
        (<HTMLDivElement>$("#after-game .highscore .stars")).className = "stars star-" + levelData.stars;
        (<HTMLDivElement>$("#after-game .highscore .time")).innerHTML = formatTime(levelData.time);
        
        gotoView("after-game");
    };
    
    document.body.addEventListener("click", function (ev: MouseEvent) {
        var target = <HTMLElement>ev.target;
        if (target.tagName != "BUTTON") return;
        var viewId = target.getAttribute("data-goto");
        if (viewId) gotoView(viewId);
    });
    
    $("#btnReplay").addEventListener("click", function () {
        startLevel(currentLevel.id);
    });
    
    $("#btnNext").addEventListener("click", function () {
        startLevel(currentLevel.id + 1);
    });
    
    var levelsTableBody = <HTMLTableSectionElement>$("#levels-list tbody");
    
    var levels = Time.getLevels();
    levels.map(function (level) {
        var storageData = getLevelStorageData(level.id);
        
        return createTree([
            "tr",
            { "data-id": level.id },
            [
                ["td", {}, level.name],
                ["td", { "class": "stars star-" + storageData.stars }],
                ["td", {}, formatTime(storageData.time)]
            ]
        ]);
    }).forEach(function (tr: Node) { levelsTableBody.appendChild(tr) });
    
    totalLevels = levels.length;
    
    var starsContainers = $$(".stars");
    for (var i = 0; i < starsContainers.length; i++) {
        (<HTMLElement>starsContainers[i]).innerHTML = starsHTML;
    }
    
    levelsTableBody.addEventListener("click", function (ev: MouseEvent) {
        var tr = ancestor(<HTMLElement>ev.target, "TR");
        if (!tr) return;
        startLevel(parseInt(tr.getAttribute("data-id")));
    });
};