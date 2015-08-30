window.onload = () => {
    var gameView = new Time.GameView(<HTMLCanvasElement>document.getElementById("canvas"));
    gameView.start();
};