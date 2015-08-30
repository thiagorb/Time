var Geometry;
(function (Geometry) {
    var Point2D = (function () {
        function Point2D(x, y) {
            this.x = x;
            this.y = y;
        }
        return Point2D;
    })();
    Geometry.Point2D = Point2D;

    var Segment = (function () {
        function Segment(x1, y1, x2, y2) {
            this.x = x1;
            this.y = y1;
            this.a = x2 - x1;
            this.b = y2 - y1;
        }
        // Returns the factor used to multiply this segment coefficients, in order to get
        // the coordinates of the intersection of this segment with the other segment.
        Segment.prototype.intersectionFactor = function (other) {
            return (other.a * (this.y - other.y) - other.b * (this.x - other.x)) / (other.b * this.a - this.b * other.a);
        };

        // Returns the factor used to multiply the other segment coefficients, in order to get
        // the coordinates of the intersection of this segment with the other segment.
        Segment.prototype.intersectionFactorOther = function (other, factor) {
            if (other.a)
                return (this.x + this.a * factor - other.x) / other.a;
            else
                return (this.y + this.b * factor - other.y) / other.b;
        };

        // Returns true if this segment intersects the other segment.
        Segment.prototype.intersectsWith = function (other) {
            var factor = this.intersectionFactor(other);
            if (factor < 0 || factor > 1)
                return false;
            var otherFactor = this.intersectionFactorOther(other, factor);
            return otherFactor >= 0 && otherFactor <= 1;
        };
        return Segment;
    })();
    Geometry.Segment = Segment;

    var Polygon = (function () {
        function Polygon(vertices) {
            this.vertices = [];
            for (var i = 0; i < vertices.length; i++) {
                this.vertices.push([vertices[i][0], vertices[i][1], 1]);
            }
        }
        Polygon.prototype.intersectsWith = function (other) {
            for (var i = 0; i < this.vertices.length; i++) {
                var i1 = (i + 1) % this.vertices.length;
                var segment1 = new Segment(this.vertices[i][0], this.vertices[i][1], this.vertices[i1][0], this.vertices[i1][1]);
                for (var j = 0; j < other.vertices.length; j++) {
                    var j1 = (j + 1) % other.vertices.length;
                    var segment2 = new Segment(other.vertices[j][0], other.vertices[j][1], other.vertices[j1][0], other.vertices[j1][1]);
                    if (segment1.intersectsWith(segment2))
                        return true;
                }
            }
            return false;
        };
        return Polygon;
    })();
    Geometry.Polygon = Polygon;
})(Geometry || (Geometry = {}));
//# sourceMappingURL=Geometry.js.map
