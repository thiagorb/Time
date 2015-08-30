var Vectorial;
(function (Vectorial) {
    var Matrix = (function () {
        function Matrix(data) {
            this.data = data;
        }
        Matrix.prototype.copy = function () {
            var r = new Array(this.data.length);
            for (var i = 0; i < this.data.length; i++) {
                r[i] = new Array(this.data[i].length);
                for (var j = 0; j < this.data[i].length; j++) {
                    r[i][j] = this.data[i][j];
                }
            }
            return new Matrix(r);
        };

        Matrix.prototype.multiply = function (other, result, n, m, p) {
            n = n || this.data.length;
            m = m || this.data.length;
            p = p || other.data[0].length;
            for (var i = 0; i < n; i++) {
                for (var j = 0; j < p; j++) {
                    result.data[i][j] = 0;
                    for (var k = 0; k < m; k++) {
                        result.data[i][j] += this.data[i][k] * other.data[k][j];
                    }
                }
            }
            return result;
        };
        return Matrix;
    })();
    Vectorial.Matrix = Matrix;
})(Vectorial || (Vectorial = {}));
//# sourceMappingURL=Vectorial.js.map
