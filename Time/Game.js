var Game;
(function (Game) {
    var FPS = 60;
    var SPS = 90;

    var GameView = (function () {
        function GameView(canvas) {
            this.stepObjects = new Array();
            this.renderObjects = new Array();
            window.addEventListener("resize", function () {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
            });
            this.canvas = canvas;
            this.keyboardController = new KeyboardController();
            this.addStepObject(this.keyboardController);
        }
        GameView.prototype.addStepObject = function (o) {
            this.stepObjects.push(o);
        };

        GameView.prototype.addRenderObject = function (o) {
            this.renderObjects.push(o);
        };

        GameView.prototype.step = function () {
            this.stepObjects.forEach(function (o) {
                return o.step();
            });
        };

        GameView.prototype.render = function () {
            var g = this.canvas.getContext("2d");
            g.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.renderObjects.forEach(function (o) {
                return o.render(g);
            });
        };

        GameView.prototype.start = function () {
            var _this = this;
            this.renderToken = setInterval(function () {
                return _this.render();
            }, 1000 / FPS);
            this.stepToken = setInterval(function () {
                return _this.step();
            }, 1000 / SPS);
        };

        GameView.prototype.stop = function () {
            clearInterval(this.renderToken);
            clearInterval(this.stepToken);
        };

        GameView.prototype.addKeyListener = function (keyCode, callback) {
            this.keyboardController.addListener(keyCode, callback);
        };
        return GameView;
    })();
    Game.GameView = GameView;

    var KeyboardController = (function () {
        function KeyboardController() {
            var _this = this;
            this.pressedKeys = new Map();
            this.keyListeners = new Map();
            document.addEventListener("keydown", function (ev) {
                _this.pressedKeys.set(ev.keyCode, true);
            });
            document.addEventListener("keyup", function (ev) {
                _this.pressedKeys.set(ev.keyCode, false);
            });
        }
        KeyboardController.prototype.step = function () {
            var _this = this;
            this.keyListeners.forEach(function (callback, keyCode) {
                if (_this.pressedKeys.get(keyCode))
                    _this.keyListeners.get(keyCode).forEach(function (callback) {
                        return callback();
                    });
            });
        };

        KeyboardController.prototype.addListener = function (keyCode, callback) {
            var listeners;
            if (this.keyListeners.has(keyCode)) {
                listeners = this.keyListeners.get(keyCode);
            } else {
                listeners = [];
                this.keyListeners.set(keyCode, listeners);
            }
            listeners.push(callback);
        };
        return KeyboardController;
    })();

    (function (Keys) {
        Keys[Keys["LEFT"] = 37] = "LEFT";
        Keys[Keys["UP"] = 38] = "UP";
        Keys[Keys["RIGHT"] = 39] = "RIGHT";
        Keys[Keys["DOWN"] = 40] = "DOWN";
    })(Game.Keys || (Game.Keys = {}));
    var Keys = Game.Keys;
    ;
})(Game || (Game = {}));
//# sourceMappingURL=Game.js.map
