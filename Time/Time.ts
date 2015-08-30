module Time {

    class RenderablePolygon extends Geometry.Polygon implements Game.Renderable {
        private color: string;

        constructor(vertices: Array<Array<number>>, color: string) {
            super(vertices);
            this.color = color;
        }

        render(ctx: CanvasRenderingContext2D) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.vertices[0][0], this.vertices[0][1]);
            for (var i = 0; i < this.vertices.length; i++) {
                ctx.lineTo(this.vertices[i][0], this.vertices[i][1]);
            }
            ctx.fill();
        }
    }

    class Player implements Game.Renderable, Game.Steppable {
        private polygon: RenderablePolygon;

        constructor() {
            this.polygon = new RenderablePolygon([
                [20, 200],
                [70, 200],
                [70, 250],
                [20, 250],
            ], "red");
        }

        step() {
        }

        render(ctx: CanvasRenderingContext2D) {
            this.polygon.render(ctx);
        }
    }

    export class GameView extends Game.GameView {

        constructor(canvas: HTMLCanvasElement) {
            super(canvas);

            var player = new Player();
            this.addRenderObject(player);
            this.addStepObject(player);
        }
    }
} 