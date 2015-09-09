module Time {
    var SPS = 100;
    var timeSpeed = 1;
    var timeAcceleration = 8 / SPS;
    var time;
    var viewSize;
    var viewPosition;
    var roomSize;

    class RenderablePolygon extends Geometry.Polygon implements Game.Renderable, Game.Steppable {
        private color: string;
        public position = [0, 0];
        public direction = 0;
        public transformedPolygon: Geometry.Polygon;

        constructor(vertices: Vectorial.Matrix, color: string) {
            super(vertices);
            this.color = color;
            this.transformedPolygon = new Geometry.Polygon(Vectorial.Matrix.copy(this.vertices));
        }

        render(ctx: CanvasRenderingContext2D) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.transformedPolygon.vertices[0][0], this.transformedPolygon.vertices[0][1]);
            for (var i = 1; i < this.transformedPolygon.vertices.length; i++) {
                ctx.lineTo(this.transformedPolygon.vertices[i][0], this.transformedPolygon.vertices[i][1]);
            }
            ctx.fill();
        }
        
        preStep() {
            
        }
        
        step() {
            this.preStep();
            var transform = Vectorial.Matrix.multiply(
                Vectorial.Matrix.rotate(this.direction),
                Vectorial.Matrix.translate(this.position[0], this.position[1]));
            Vectorial.Matrix.multiply(
                this.vertices,
                transform,
                this.transformedPolygon.vertices);
        }
    }

    class Player extends RenderablePolygon {
        speed: Array<number>;

        constructor() {
            super([
                [-20, -20],
                [20, -20],
                [20, 20],
                [-20, 20],
            ], "red");
        }

        preStep() {
            this.position[0] += this.speed[0];
            this.position[1] += this.speed[1];
        }
    }

    class Goal extends RenderablePolygon {
        constructor() {
            super([
                [-20, -20],
                [20, -20],
                [20, 20],
                [-20, 20],
            ], "green");
        }
    }

    class Obstacle extends RenderablePolygon {
        private calculatePosition: () => Array<number>;
        private calculateDirection: () => number;

        constructor(vertices: Vectorial.Matrix, color: string, calculatePosition: () => Array<number>, calculateDirection: () => number) {
            super(vertices, color);
            this.calculatePosition = calculatePosition;
            this.calculateDirection = calculateDirection;
        }

        preStep() {
            this.position = this.calculatePosition();
            this.direction = this.calculateDirection();
        }
    }

    function makeAnimation(times: Array<Array<number>>): () => number {
        return function () {
            for (var i = 0; i < times.length; i++) {
                if (time > times[i][0]) continue;
                if (!times[i - 1]) return times[i][1];
                var delta = (time - (times[i - 1][0])) / (times[i][0] - times[i - 1][0]);
                return times[i - 1][1] + (times[i][1] - times[i - 1][1]) * delta;
            }
            return times[times.length - 1][1];
        };
    }

    export interface Level {
        id: number;
        name: string;
        viewSize: Array<number>;
        roomSize: Array<number>;
        playerStart: Array<number>;
        playerSpeed: Array<number>;
        goalPosition: Array<number>;
        obstacles: Array<Obstacle>;
        starsPerTime: (time: number) => number;
    }

    export class GameView extends Game.GameView {
        private player = new Player();
        private goal = new Goal();
        private obstacles: Array<Obstacle>;
        public gameOverCallback: (win: boolean, time?: number, stars?: number) => void;
        private starsPerTime: (time: number) => number;

        constructor(canvas: HTMLCanvasElement) {
            super(canvas);

            this.addRenderObject({
                render: ctx => {
                    if (!viewSize) return;
                    var px = this.canvas.width / viewSize[0];
                    var py = this.canvas.height / viewSize[1];
                    var p = Math.min(px, py);
                    var effectiveViewWidth = viewSize[0] * p;
                    var effectiveViewHeight = viewSize[1] * p;
                    ctx.fillText(time.toString(), 10, 40);
                    ctx.setTransform(p, 0, 0, p, (this.canvas.width - effectiveViewWidth) / 2, (this.canvas.height - effectiveViewHeight) / 2);
                    ctx.translate(-viewPosition[0], -viewPosition[1]);
                    this.obstacles.forEach(o => o.render(ctx));
                }
            });
            
            
            this.addRenderObject(this.player);
            this.addStepObject(this.player);
            this.addRenderObject(this.goal);
            this.addStepObject(this.goal);
            this.setLevel(0);

            this.addStepObject({
                step: () => {
                    this.obstacles.forEach(o => o.step());
                    
                    var lost = this.obstacles.some(o => {
                        return o.transformedPolygon.intersectsWith(this.player.transformedPolygon);
                    })
                    if (lost) {
                        this.stop();
                        this.gameOverCallback(false);
                        return;
                    }
                    
                    if (this.player.transformedPolygon.intersectsWith(this.goal.transformedPolygon)) {
                        this.stop();
                        
                        this.gameOverCallback(true, time, Math.round(this.starsPerTime(time)));
                        return;
                    }
                    
                    timeSpeed = Math.max(-1, Math.min(1, timeSpeed + timeAcceleration));
                    time += timeSpeed / SPS;
                    viewPosition[0] = Math.max(0, Math.min(roomSize[0] - viewSize[0], this.player.position[0] - viewSize[0] / 2));
                }
            });
            
            canvas.addEventListener(
                "ontouchend" in document.documentElement? "touchend": "mousedown",
                () => timeAcceleration = -timeAcceleration
            );
        }

        start() {
            super.start(SPS);
        }

        setLevel(id: number) {
            viewPosition = [0, 0];
            time = 0;
            timeSpeed = 0;
            timeAcceleration = 8 / SPS;

            var level = GameView.getLevel(id);

            viewSize = level.viewSize;
            roomSize = level.roomSize;
            this.player.position = level.playerStart;
            this.player.speed = level.playerSpeed;
            this.goal.position = level.goalPosition;
            this.obstacles = level.obstacles;
            this.starsPerTime = level.starsPerTime;
        }

        public static getLevel(levelId: number): Level {
            var id = levelId < 10? 0: levelId;
            switch (id) {
                case 0:
                    return {
                        id: levelId,
                        name: "Intro",
                        viewSize: [500, 400],
                        roomSize: [1000, 400],
                        playerStart: [20, 200],
                        playerSpeed: [30 / SPS, 0],
                        goalPosition: [800, 200],
                        starsPerTime: makeAnimation([
                            [2, 5],
                            [10, 1]
                        ]),
                        obstacles: [
                            new Obstacle(
                                [
                                    [0, 0],
                                    [-200, 0],
                                    [-200, 30],
                                    [0, 30]
                                ], 
                                "#FF00BB",
                                () => [400, 100],
                                makeAnimation([
                                    [2, 0],
                                    [4, Math.PI / 2]
                                ])
                                ),
                            new Obstacle(
                                [
                                    [-30, 0],
                                    [-30, -200],
                                    [0, -200],
                                    [0, 0]
                                ], 
                                "#FF00BB",
                                () => [500, 300],
                                makeAnimation([
                                    [2, 0],
                                    [4, -Math.PI / 2]
                                ])
                                )
                        ]
                    }
            }
        }
    }
    
    export function getLevels() : Array<Level> {
        var i = 0;
        var level: Level;
        var levels = new Array<Level>();
        while (level = GameView.getLevel(i++)) {
            levels.push(level);
        }
        return levels;
    }
}