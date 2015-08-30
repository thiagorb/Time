module Game {
    var FPS = 60;
    var SPS = 90;

    export interface Steppable {
        step();
    }

    export interface Renderable {
        render(g: CanvasRenderingContext2D);
    }

    export class GameView {
        renderToken: number;
        stepToken: number;
        stepObjects: Array<Steppable> = new Array();
        renderObjects: Array<Renderable> = new Array();
        canvas: HTMLCanvasElement;
        private keyboardController: KeyboardController;

        constructor(canvas: HTMLCanvasElement) {
            window.addEventListener("resize", () => {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
            });
            this.canvas = canvas;
            this.keyboardController = new KeyboardController();
            this.addStepObject(this.keyboardController);
        }

        addStepObject(o: Steppable) {
            this.stepObjects.push(o);
        }

        addRenderObject(o: Renderable) {
            this.renderObjects.push(o);
        }

        step() {
            this.stepObjects.forEach(o => o.step());
        }

        render() {
            var g = this.canvas.getContext("2d");
            g.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.renderObjects.forEach(o => o.render(g));
        }

        start() {
            this.renderToken = setInterval(() => this.render(), 1000 / FPS);
            this.stepToken = setInterval(() => this.step(), 1000 / SPS);
        }

        stop() {
            clearInterval(this.renderToken);
            clearInterval(this.stepToken);
        }

        addKeyListener(keyCode: number, callback: Function) {
            this.keyboardController.addListener(keyCode, callback);
        }
    }

    class KeyboardController implements Steppable {
        pressedKeys: Map<number, boolean> = new Map<number, boolean>();
        keyListeners: Map<number, Array<Function>> = new Map<number, Array<Function>>();

        constructor() {
            document.addEventListener("keydown", ev => {
                this.pressedKeys.set(ev.keyCode, true);
            });
            document.addEventListener("keyup", ev => {
                this.pressedKeys.set(ev.keyCode, false);
            });
        }

        step() {
            this.keyListeners.forEach((callback, keyCode) => {
                if (this.pressedKeys.get(keyCode))
                    this.keyListeners.get(keyCode).forEach(callback => callback());
            });
        }

        addListener(keyCode: number, callback: Function) {
            var listeners: Array<Function>;
            if (this.keyListeners.has(keyCode)) {
                listeners = this.keyListeners.get(keyCode);
            } else {
                listeners = [];
                this.keyListeners.set(keyCode, listeners);
            }
            listeners.push(callback);
        }
    }

    export enum Keys {
        LEFT = 37,
        UP = 38,
        RIGHT = 39,
        DOWN = 40
    };
}