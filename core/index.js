var Game = (function (exports) {
    'use strict';

    var Point = /** @class */ (function () {
        function Point(x, y, id, val) {
            if (id === void 0) { id = Point.uuid++; }
            if (val === void 0) { val = 2; }
            this.x = x;
            this.y = y;
            this.id = id;
            this.val = val;
            this.id = id;
            this.x = x;
            this.y = y;
            this.val = val;
        }
        Point.prototype.rebase = function (val, base) {
            this.x = val % base;
            this.y = Math.floor(val / base);
        };
        Point.uuid = 1;
        return Point;
    }());
    function acc(itemQueue) {
        var len = itemQueue.length;
        var points = itemQueue.filter(function (item) { return item instanceof Point; });
        var index = -1;
        for (var i = 0, len_1 = points.length; i < len_1; i++) {
            var current = points[i];
            var next = points[i + 1];
            if (current && next && current.val == next.val) {
                index = i;
                break;
            }
        }
        if (index != -1) {
            points.splice(index + 1, 1);
            points[index].val += points[index].val;
        }
        points.length = len;
        return points;
    }
    function revAcc(itemQueue) {
        var len = itemQueue.length;
        var points = itemQueue.filter(function (item) { return item instanceof Point; });
        var index = -1;
        for (var i = points.length - 1; i >= 0; i--) {
            var current = points[i];
            var next = points[i - 1];
            if (current && next && current.val == next.val) {
                index = i;
                break;
            }
        }
        if (index != -1) {
            points.splice(index - 1, 1);
            points[index].val += points[index].val;
        }
        while (points.length < len) {
            points.unshift(undefined);
        }
        return points;
    }
    function flatten(itemQueue) {
        var result = [];
        var len = Math.max.apply(Math, itemQueue.map(function (item) { return item.length; }));
        for (var i = 0; i < len; i++) {
            for (var id = 0; id < itemQueue.length; id++) {
                var queue = itemQueue[id];
                var item = queue[i];
                if (item instanceof Point) {
                    result.push(item);
                }
                else {
                    result.push(undefined);
                }
            }
        }
        return result;
    }

    var Game = /** @class */ (function () {
        function Game(xMax, yMax) {
            if (xMax === void 0) { xMax = 8; }
            if (yMax === void 0) { yMax = 8; }
            this.xMax = xMax;
            this.yMax = yMax;
            this.xMax = xMax;
            this.yMax = yMax;
            this.points = new Array(xMax * yMax);
            this.rebase();
        }
        Game.prototype.debug = function () {
            var result = [];
            for (var i = 0; i < this.points.length; i++) {
                if (i % this.xMax == 0) {
                    result.push("\n");
                }
                var item = this.points[i];
                if (typeof item === "number") {
                    result.push("[*]");
                }
                else {
                    result.push("[" + item.val + "]");
                }
            }
            return console.log(result.join(""));
        };
        Game.prototype.spawn = function () {
            this.rebase();
            var points = this.points.filter(function (point) { return typeof point === "number"; });
            var i = Math.floor(Math.random() * points.length);
            var val = points[i];
            var x = val % this.xMax;
            var y = Math.floor(val / this.yMax);
            this.points[i] = new Point(x, y);
        };
        Game.prototype.classify = function (key) {
            var result = new Array(this.xMax);
            var points = this.points;
            for (var i = 0; i < points.length; i += 1) {
                var point = points[i];
                if (typeof point == "object") {
                    var prop = point[key];
                    if (!result[prop]) {
                        result[prop] = [];
                    }
                    result[prop].push(point);
                }
            }
            return result;
        };
        Game.prototype.rebase = function () {
            for (var i = 0; i < this.points.length; i++) {
                var point = this.points[i];
                if (typeof point == "object") {
                    point.rebase(i, this.xMax);
                }
                else {
                    this.points[i] = i;
                }
            }
        };
        Game.prototype.left = function () {
            var rows = this.classify("y");
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i] || [];
                row.length = this.xMax;
                rows[i] = acc(row);
            }
            this.points = rows.reduce(function (acc, item) { return acc.concat(item); }, []);
            this.spawn();
        };
        Game.prototype.right = function () {
            var rows = this.classify("y");
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i] || [];
                row.length = this.xMax;
                rows[i] = revAcc(row);
            }
            this.points = rows.reduce(function (acc, item) { return acc.concat(item); }, []);
            this.spawn();
        };
        Game.prototype.up = function () {
            var columns = this.classify("x");
            for (var i = 0; i < columns.length; i++) {
                var column = columns[i] || [];
                column.length = this.yMax;
                columns[i] = acc(column);
            }
            this.points = flatten(columns);
            this.spawn();
        };
        Game.prototype.down = function () {
            var columns = this.classify("x");
            for (var i = 0; i < columns.length; i++) {
                var column = columns[i] || [];
                column.length = this.yMax;
                columns[i] = revAcc(column);
            }
            this.points = flatten(columns);
            this.spawn();
        };
        return Game;
    }());

    exports.Game = Game;

    return exports;

}({}));
