function gotoView(viewId: string) {
    var activeView = <HTMLDivElement>document.getElementsByClassName("active")[0];
    var newView = <HTMLDivElement>document.getElementById(viewId);
    activeView.style.opacity = "0";
    newView.style.opacity = "0";
    newView.classList.add("active");
    setTimeout(function () {
        activeView.classList.remove("active");
        newView.style.opacity = "1";
    }, 250);
}

window.onload = () => {
    //var gameView = new Time.GameView(<HTMLCanvasElement>document.getElementById("canvas"));
    //gameView.start();
    
    document.getElementById("btnStart").addEventListener("click", function () {
        gotoView("level-selection");
    });
};