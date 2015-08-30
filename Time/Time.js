var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Time;
(function (Time) {
    var RenderablePolygon = (function (_super) {
        __extends(RenderablePolygon, _super);
        function RenderablePolygon(vertices, color) {
            _super.call(this, vertices);
            this.color = color;
        }
        RenderablePolygon.prototype.render = function (ctx) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.vertices[0][0], this.vertices[0][1]);
            for (var i = 0; i < this.vertices.length; i++) {
                ctx.lineTo(this.vertices[i][0], this.vertices[i][1]);
            }
            ctx.fill();
        };
        return RenderablePolygon;
    })(Geometry.Polygon);

    var Player = (function () {
        function Player() {
            this.polygon = new RenderablePolygon([
                [20, 200],
                [70, 200],
                [70, 250],
                [20, 250]
            ], "red");
        }
        Player.prototype.step = function () {
        };

        Player.prototype.render = function (ctx) {
            this.polygon.render(ctx);
        };
        return Player;
    })();

    var GameView = (function (_super) {
        __extends(GameView, _super);
        function GameView(canvas) {
            _super.call(this, canvas);

            var player = new Player();
            this.addRenderObject(player);
            this.addStepObject(player);
        }
        return GameView;
    })(Game.GameView);
    Time.GameView = GameView;
})(Time || (Time = {}));
//# sourceMappingURL=Time.js.map
