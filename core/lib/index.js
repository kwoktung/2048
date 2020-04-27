import { Point, forward, backward, flatten } from "./point";
export default class Controller {
    constructor(xMax = 8, yMax = 8) {
        this.xMax = xMax;
        this.yMax = yMax;
        this.elements = new Array(xMax * yMax);
        this.onRebase();
    }
    doSpawn() {
        this.onRebase();
        let elements = this.elements.filter(e => typeof e === "number");
        let i = Math.floor(Math.random() * elements.length);
        let val = elements[i];
        let x = val % this.xMax;
        let y = Math.floor(val / this.yMax);
        this.elements[val] = new Point(x, y);
        return this.state;
    }
    onRank(key) {
        let result = new Array(this.xMax);
        let points = this.elements;
        for (let i = 0; i < points.length; i += 1) {
            let point = points[i];
            if (point instanceof Point) {
                let prop = point[key];
                if (!result[prop]) {
                    result[prop] = [];
                }
                result[prop].push(point.clone());
            }
        }
        return result;
    }
    onRebase() {
        for (let i = 0; i < this.elements.length; i++) {
            let point = this.elements[i];
            if (typeof point == "object") {
                point.location(i, this.xMax);
            }
            else {
                this.elements[i] = i;
            }
        }
    }
    onLeft() {
        let rows = this.onRank("y");
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i] || [];
            row.length = this.xMax;
            rows[i] = forward(row);
        }
        this.elements = rows.reduce((a, b) => a.concat(b), []);
        return this.state;
    }
    onRight() {
        let rows = this.onRank("y");
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i] || [];
            row.length = this.xMax;
            rows[i] = backward(row);
        }
        this.elements = rows.reduce((a, b) => a.concat(b), []);
        return this.state;
    }
    onUp() {
        let columns = this.onRank("x");
        for (let i = 0; i < columns.length; i++) {
            let column = columns[i] || [];
            column.length = this.yMax;
            columns[i] = forward(column);
        }
        this.elements = flatten(columns);
        return this.state;
    }
    onDown() {
        let columns = this.onRank("x");
        for (let i = 0; i < columns.length; i++) {
            let column = columns[i] || [];
            column.length = this.yMax;
            columns[i] = backward(column);
        }
        this.elements = flatten(columns);
        return this.state;
    }
    isOver() {
        let len = this.elements.filter(e => !(e instanceof Point)).length;
        if (len > 0) {
            return false;
        }
        const isValid = function (elements) {
            if (elements.length <= 1) {
                return true;
            }
            for (let i = 0; i < elements.length - 1; i++) {
                let current = elements[i];
                let next = elements[i + 1];
                if (current.val == next.val) {
                    return true;
                }
            }
            return false;
        };
        let elements = this.onRank("y");
        for (let i = 0; i < elements.length; i++) {
            let elem = elements[i];
            if (isValid(elem)) {
                return false;
            }
        }
        elements = this.onRank("x");
        for (let i = 0; i < elements.length; i++) {
            let elem = elements[i];
            if (isValid(elem)) {
                return false;
            }
        }
        return true;
    }
    get state() {
        this.onRebase();
        let alts = [];
        let elements = this.elements.filter(e => e instanceof Point);
        for (let i = 0, len = elements.length; i < len; i++) {
            const elem = elements[i];
            if (elem.alt) {
                elem.alt.x = elem.x;
                elem.alt.y = elem.y;
                alts.push(elem.alt);
            }
        }
        elements = elements.sort((a, b) => a.id < b.id ? -1 : 1);
        return { alts, elements };
    }
}
