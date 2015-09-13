module Time {
    var SPS = 60;
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
            super(circle(20, 8), "#F80");
        }

        preStep() {
            this.position[0] += this.speed[0];
            this.position[1] += this.speed[1];
        }

        render(ctx: CanvasRenderingContext2D) {
            super.render(ctx);
            //ctx.lineTo(this.transformedPolygon.vertices[i][0], this.transformedPolygon.vertices[i][1]);
            //ctx.moveTo(this.position[0], this.position[1]);
            ctx.save();
            ctx.translate(this.position[0] + 8, this.position[1]);
            ctx.fillStyle = "#FFF";
            ctx.beginPath();
            
            var blinkDelay = 3;
            var blinkTime = 0.2;
            var s = 0.1 + Math.abs((time % (2 * blinkTime + blinkDelay)) - blinkTime) / blinkTime;
            
            ctx.scale(Math.min(1, s), 1);
            ctx.arc(0, -7, 3, 0, Math.PI * 2);
            ctx.arc(0, 7, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class Goal extends RenderablePolygon {
        constructor() {
            super(circle(20, 8), "green");
        }

        render(ctx: CanvasRenderingContext2D) {
            super.render(ctx);
            //ctx.lineTo(this.transformedPolygon.vertices[i][0], this.transformedPolygon.vertices[i][1]);
            //ctx.moveTo(this.position[0], this.position[1]);
            ctx.save();
            ctx.translate(this.position[0] - 8, this.position[1]);
            ctx.fillStyle = "#FFF";
            ctx.beginPath();
            
            var blinkDelay = 5;
            var blinkTime = 0.2;
            var s = 0.1 + Math.abs((time % (2 * blinkTime + blinkDelay)) - blinkTime) / blinkTime;
            
            ctx.scale(Math.min(1, s), 1);
            ctx.arc(0, -7, 3, 0, Math.PI * 2);
            ctx.arc(0, 7, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class Obstacle extends RenderablePolygon {
        private calculatePosition: (number) => Array<number>;
        private calculateDirection: (number) => number;
        public collides: boolean;

        constructor(vertices: Vectorial.Matrix, color: string, calculatePosition: (number) => Array<number>, calculateDirection: (number) => number, collides: boolean = true) {
            super(vertices, color);
            this.calculatePosition = calculatePosition;
            this.calculateDirection = calculateDirection;
            this.collides = collides;
        }

        preStep() {
            this.position = this.calculatePosition(time);
            this.direction = this.calculateDirection(time);
        }
    }

    function makeAnimation(times: Array<Array<number>>): (number) => number {
        return function (time) {
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
                    ctx.setTransform(p, 0, 0, p, (this.canvas.width - effectiveViewWidth) / 2, (this.canvas.height - effectiveViewHeight) / 2);
                    ctx.translate(-viewPosition[0], -viewPosition[1]);
                    
                    var gradient = ctx.createRadialGradient(roomSize[0] / 2, roomSize[1] / 2, viewSize[1] / 2, roomSize[0] / 2, roomSize[1] / 2, roomSize[0] / 2);
                    gradient.addColorStop(0, "#037");
                    gradient.addColorStop(1, "#111");
                    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, roomSize[0], roomSize[1]);
                    
                    this.obstacles.forEach(o => o.render(ctx));
                }
            });
            
            
            this.addRenderObject(this.player);
            this.addStepObject(this.player);
            this.addRenderObject(this.goal);
            this.addStepObject(this.goal);

            this.addStepObject({
                step: () => {
                    this.obstacles.forEach(o => o.step());
                    
                    var lost = this.obstacles.some(o => {
                        return o.collides && o.transformedPolygon.intersectsWith(this.player.transformedPolygon);
                    });
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
                    viewPosition[1] = Math.max(0, Math.min(roomSize[1] - viewSize[1], this.player.position[1] - viewSize[1] / 2));
                }
            });
            
            document.body.addEventListener(
                "ontouchend" in document.documentElement? "touchend": "mousedown",
                (ev) => (<HTMLElement>ev.target).tagName == "CANVAS" && this.running && (timeAcceleration = -timeAcceleration)
            );
        }

        start() {
            super.start(SPS);
        }

        setLevel(level: Level) {
            viewPosition = [0, 0];
            time = 0;
            timeSpeed = 0;
            timeAcceleration = 8 / SPS;

            viewSize = level.viewSize;
            roomSize = level.roomSize;
            this.player.position = level.playerStart;
            this.player.speed = level.playerSpeed;
            this.goal.position = level.goalPosition;
            this.obstacles = level.obstacles;
            this.starsPerTime = level.starsPerTime;
            
            return level;
        }
    }
    
    export function getTime() {
        return time;
    }
    
    export function getLevels() : Array<Level> {
        var id = 1;
        return [{
            id: id++,
            name: "Fall",
            viewSize: [500, 300],
            roomSize: [500, 300],
            playerStart: [40, 150],
            playerSpeed: [30 / SPS, 0],
            goalPosition: [460, 150],
            starsPerTime: makeAnimation([
                [-10, 5],
                [6, 1]
            ]),
            obstacles: [
                new Obstacle(
                    rectangle(60, 60, true), 
                    "#060",
                    t => {
                        var y;
                        if (t < 2) {
                            y = 50;
                        } else {
                            t -= 2;
                            y = Math.min(150, 50 + 200 * t * t / 2);
                        }
                        return [250, y];
                    },
                    () => 0
                    ),
            ]
        },
        {
            id: id++,
            name: "Jump",
            viewSize: [700, 400],
            roomSize: [700, 400],
            playerStart: [40, 200],
            playerSpeed: [30 / SPS, 0],
            goalPosition: [660, 200],
            starsPerTime: makeAnimation([
                [0, 5],
                [10, 1]
            ]),
            obstacles: [
                new Obstacle(
                    rectangle(60, 60, true), 
                    "#600",
                    t => {
                        t = t % 5;
                        var y;
                        if (t < 2) {
                            y = 200;
                        } else {
                            t -= 2;
                            y = Math.min(200, 200 - 200 * t + 200 * t * t / 2);
                        }
                        return [500, y];
                    },
                    () => 0
                    ),
                new Obstacle(
                    rectangle(40, 40, true), 
                    "#600",
                    t => {
                        t = t % 4;
                        var y;
                        if (t < 1) {
                            y = 200;
                        } else {
                            t -= 1;
                            y = Math.min(200, 200 - 200 * t + 200 * t * t / 2);
                        }
                        return [300, y];
                    },
                    () => 0
                    ),
            ]
        },
        {
            id: id++,
            name: "Doors",
            viewSize: [500, 400],
            roomSize: [1000, 400],
            playerStart: [40, 200],
            playerSpeed: [30 / SPS, 0],
            goalPosition: [800, 200],
            starsPerTime: makeAnimation([
                [2, 5],
                [10, 1]
            ]),
            obstacles: [
                new Obstacle(
                    rectangle(40, 100), 
                    "#ddd",
                    () => [390, 0],
                    () => 0,
                    false
                ),
                new Obstacle(
                    rectangle(40, 100), 
                    "#ddd",
                    () => [390, 300],
                    () => 0,
                    false
                ),
                new Obstacle(
                    rectangle(40, 100), 
                    "#ddd",
                    () => [470, 0],
                    () => 0,
                    false
                ),
                new Obstacle(
                    rectangle(40, 100), 
                    "#ddd",
                    () => [470, 300],
                    () => 0,
                    false
                ),
                new Obstacle(
                    rectangle(-200, 20), 
                    "#950",
                    () => [400, 100],
                    makeAnimation([
                        [2, 0],
                        [4, Math.PI / 2]
                    ])
                ),
                new Obstacle(
                    rectangle(-20, -200), 
                    "#950",
                    () => [500, 300],
                    makeAnimation([
                        [2, 0],
                        [4, -Math.PI / 2]
                    ])
                )
            ]
        },
        {
            id: id++,
            name: "Pendulum",
            viewSize: [500, 400],
            roomSize: [1000, 400],
            playerStart: [40, 200],
            playerSpeed: [30 / SPS, 0],
            goalPosition: [960, 200],
            starsPerTime: makeAnimation([
                [-7, 5],
                [10, 1]
            ]),
            obstacles: [
                new Obstacle(
                    Vectorial.Matrix.multiply(rectangle(10, 400), Vectorial.Matrix.translate(-5, 0)),
                    "#999",
                    () => [500, -100],
                    () => Math.cos(time),
                    false
                ),
                new Obstacle(
                    Vectorial.Matrix.multiply(circle(30, 15), Vectorial.Matrix.translate(0, 400)),
                    "#dd0",
                    () => [500, -100],
                    () => Math.cos(time),
                    true
                )
            ]
        },
        {
            id: id++,
            name: "Gears",
            viewSize: [500, 400],
            roomSize: [2000, 400],
            playerStart: [40, 200],
            playerSpeed: [30 / SPS, 0],
            goalPosition: [1800, 200],
            starsPerTime: makeAnimation([
                [9, 5],
                [40, 1]
            ]),
            obstacles: [
                new Obstacle(
                    gear(12, 0.065, 0.085, 0.9, 480), 
                    "#999",
                    t => [400, -255],
                    t => Math.PI * 0.03 * t
                ),
                new Obstacle(
                    gear(10, 0.11, 0.12, 0.8, 240), 
                    "#AAA",
                    t => [800, 420],
                    t => -Math.PI * 0.06 * t
                ),
                new Obstacle(
                    gear(10, 0.11, 0.12, 0.8, 240), 
                    "#888",
                    t => [1320, 420],
                    t => -Math.PI * 0.06 * t
                ),
                new Obstacle(
                    gear(10, 0.065, 0.085, 0.9, 480), 
                    "#BBB",
                    t => [1320, -255],
                    t => Math.PI * 0.03 * t
                )
            ]
        },
        {
            id: id++,
            name: "Highway Crossing",
            viewSize: [500, 400],
            roomSize: [900, 800],
            playerStart: [40, 400],
            playerSpeed: [30 / SPS, 0],
            goalPosition: [860, 400],
            starsPerTime: makeAnimation([
                [-20, 5],
                [20, 1]
            ]),
            obstacles: [
                new Obstacle(
                    rectangle(600, 670), 
                    "#666",
                    t => [180, 0],
                    t => 0,
                    false
                ),
                
                
                
                
                new Obstacle(
                    rectangle(50, 100), 
                    "#77d",
                    t => [200, t * 150 % 1500],
                    t => 0
                ),
                new Obstacle(
                    rectangle(50, 100), 
                    "#0dd",
                    t => [200, (t + 200) * 150 % 1500],
                    t => 0
                ),
                new Obstacle(
                    rectangle(50, 100), 
                    "#008",
                    t => [200, (t + 1200) * 150 % 1500],
                    t => 0
                ),
                
                
                
                
                
                
                new Obstacle(
                    rectangle(50, 100), 
                    "#d00",
                    t => [300, t * 200 % 1500],
                    t => 0
                ),
                new Obstacle(
                    rectangle(50, 100), 
                    "#d0d",
                    t => [300, (t + 470) * 200 % 1500],
                    t => 0
                ),
                new Obstacle(
                    rectangle(50, 100), 
                    "#d70",
                    t => [300, (t + 890) * 200 % 1500],
                    t => 0
                ),
                
                
                
                new Obstacle(
                    rectangle(50, 100), 
                    "#07d",
                    t => [400, t * 220 % 1500],
                    t => 0
                ),
                new Obstacle(
                    rectangle(50, 100), 
                    "#0d0",
                    t => [400, (t + 660) * 220 % 1500],
                    t => 0
                ),
                new Obstacle(
                    rectangle(50, 100), 
                    "#d77",
                    t => [400, (t + 890) * 220 % 1500],
                    t => 0
                ),
                
                
                
                
                
                
                new Obstacle(
                    rectangle(50, 100), 
                    "#00d",
                    t => [500, 1500 - (t + 40) * 220 % 1500],
                    t => 0
                ),
                new Obstacle(
                    rectangle(50, 100), 
                    "#d77",
                    t => [500, 1500 - (t + 100) * 220 % 1500],
                    t => 0
                ),
                new Obstacle(
                    rectangle(50, 100), 
                    "#d7d",
                    t => [500, 1500 - (t + 150) * 220 % 1500],
                    t => 0
                ),
                
                
                
                
                
                
                new Obstacle(
                    rectangle(50, 100), 
                    "#dd0",
                    t => [600, 1800 - (t + 5) * 200 % 1800],
                    t => 0
                ),
                new Obstacle(
                    rectangle(50, 100), 
                    "#df0",
                    t => [600, 1800 - (t + 10) * 200 % 1800],
                    t => 0
                ),
                new Obstacle(
                    rectangle(50, 100), 
                    "#707",
                    t => [600, 1800 - (t + 25) * 200 % 1800],
                    t => 0
                ),
                
                
                
                
                
                new Obstacle(
                    rectangle(50, 100), 
                    "#ddd",
                    t => [700, 1800 - (t + 5) * 150 % 1800],
                    t => 0
                ),
                new Obstacle(
                    rectangle(50, 100), 
                    "#d70",
                    t => [700, 1800 - (t + 10) * 150 % 1800],
                    t => 0
                ),
                new Obstacle(
                    rectangle(50, 100), 
                    "#d00",
                    t => [700, 1800 - (t + 35) * 150 % 1800],
                    t => 0
                ),
            ]
        },
        {
            id: id++,
            name: "Solar System",
            viewSize: [900, 900],
            roomSize: [3000, 3000],
            playerStart: [40, 1500],
            playerSpeed: [30 / SPS, 0],
            goalPosition: [2960, 1500],
            starsPerTime: makeAnimation([
                [-30, 5],
                [40, 1]
            ]),
            obstacles: [
                { radius: 24, color: "#8d888e", orbitRadius: 58 },
                { radius: 60, color: "#c7c3ba", orbitRadius: 108 },
                { radius: 64, color: "#365470", orbitRadius: 150 },
                { radius: 34, color: "#df8d52", orbitRadius: 228 },
                { radius: 714, color: "#dbb292", orbitRadius: 778 },
                { radius: 602, color: "#d2c286", orbitRadius: 1430 },
                { radius: 255, color: "#b9dfe2", orbitRadius: 2870 },
                { radius: 247, color: "#3d5ff6", orbitRadius: 4500 },
                { radius: 11, color: "#e6bd97", orbitRadius: 5900 }
            ].map(function (planet) {
                var transformedOrbit = 10 * Math.sqrt(planet.orbitRadius);
                var transformedRadius = 30 + 8 * Math.sqrt(planet.radius);
                return new Obstacle(
                    circle(0.1 * transformedRadius, 10),
                    planet.color,
                    t => [
                        1500 + transformedOrbit * Math.cos(100 * (t + 300) / transformedOrbit), 
                        1500 + transformedOrbit * Math.sin(100 * (t + 300) / transformedOrbit)
                    ],
                    () => 0
                )
            })
        }];
    }
    
    export function getLevel(id: number): Level {
        return getLevels().filter(level => level.id == id).pop();
    }
    
    export function getDemoLevel() : Level {
        return {
            id: null,
            name: "Demo",
            viewSize: [500, 400],
            roomSize: [1000, 1000],
            playerStart: [500, 500],
            playerSpeed: [0, 0],
            goalPosition: [-1000, 500],
            starsPerTime: null,
            obstacles: [
                new Obstacle(
                    Vectorial.Matrix.multiply(rectangle(10, 400), Vectorial.Matrix.translate(-5, 0)),
                    "#999",
                    () => [0, 200],
                    () => Math.cos(time),
                    false
                ),
                new Obstacle(
                    Vectorial.Matrix.multiply(circle(30, 15), Vectorial.Matrix.translate(0, 400)),
                    "#dd0",
                    () => [0, 200],
                    () => Math.cos(time),
                    false
                ),
                new Obstacle(
                    gear(12, 0.065, 0.085, 0.9, 480), 
                    "#999",
                    t => [800, -10],
                    t => Math.PI * 0.03 * t,
                    false
                ),
                new Obstacle(
                    gear(10, 0.11, 0.12, 0.8, 240), 
                    "#AAA",
                    t => [400, 770],
                    t => -Math.PI * 0.06 * t,
                    false
                ),
            ]
        }
    }
    
    function rectangle(width: number, height: number, center?: boolean) {
        var halfWidth = center? width / 2 : 0;
        var halfHeight = center? height / 2 : 0;
        return [
            [-halfWidth, -halfHeight, 1],
            [width - halfWidth, - halfHeight, 1],
            [width - halfWidth, height - halfHeight, 1],
            [-halfWidth, height - halfHeight, 1]
        ];
    }
    
    function gear(tooth: number, teethWidth1: number, teethWidth2: number, teethHeight: number, scale: number) {
        var vertices = new Array<Array<number>>();
        for (var i = 0; i < tooth; i++) {
            var toothDegree = i * (Math.PI * 2 / tooth);
            var toothDegree90 = i * (Math.PI * 2 / tooth) + Math.PI / 2;
            var cos = Math.cos(toothDegree);
            var cos90 = Math.cos(toothDegree90);
            var sin = Math.sin(toothDegree);
            var sin90 = Math.sin(toothDegree90);
            vertices.push([scale * (cos * teethHeight - cos90 * teethWidth2), scale * (sin * teethHeight - sin90 * teethWidth2)]);
            vertices.push([scale * (cos - cos90 * teethWidth1), scale * (sin - sin90 * teethWidth1)]);
            vertices.push([scale * (cos + cos90 * teethWidth1), scale * (sin + sin90 * teethWidth1)]);
            vertices.push([scale * (cos * teethHeight + cos90 * teethWidth2), scale * (sin * teethHeight + sin90 * teethWidth2)]);
        }
        return vertices;
    }
    
    function circle(radius: number, steps: number) {
        var vertices = [];
        for (var i = 0; i < steps; i++) {
            vertices.push([Math.cos(Math.PI * 2 * i / steps) * radius, Math.sin(Math.PI * 2 * i / steps) * radius, 1]);
        }
        return vertices;
    }
}