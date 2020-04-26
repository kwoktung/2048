import { Point, Block, forward, backward, flatten } from "./point"

export class Game {
    private points: Block[];
    constructor(public xMax: number = 8, public yMax: number = 8) {
        this.xMax = xMax;
        this.yMax = yMax;
        this.points = new Array(xMax * yMax);
        this.rebase()
    }
    toString() {
        let result = []
        for (let i = 0; i < this.points.length; i++) {
            if (i % this.xMax == 0) {
                result.push("\n")
            }
            let item = this.points[i];
            if (typeof item === "object") {
                result.push(`[${item.val}]`)
            } else {
                result.push("[*]")
            }
        }
        return result.join()
    }
    spawn() {
        this.rebase()
        let points = this.points.filter(point => typeof point === "number");
        let i = Math.floor(Math.random() * points.length)
        let val = points[i] as number
        let x = val % this.xMax;
        let y = Math.floor(val / this.yMax)
        this.points[val] = new Point(x, y)
    }
    private classify(key: string) {
        let result = new Array(this.xMax);
        let points = this.points;
        for (let i = 0; i < points.length; i += 1) {
            let point = points[i];
            if (typeof point == "object") {
                let prop = point[key];
                if (!result[prop]) {
                    result[prop] = []
                }
                result[prop].push(point)
            }
        }
        return result
    }
    private rebase() {
        for (let i = 0; i < this.points.length; i++) {
            let point = this.points[i];
            if (typeof point == "object") {
                point.location(i, this.xMax)
            } else {
                this.points[i] = i;
            }
        }
    }
    left() {
        let rows = this.classify("y")
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i] || [];
            row.length = this.xMax;
            rows[i] = forward(row)
        }
        this.points = rows.reduce((acc, item) => acc.concat(item), [])
        this.spawn()
    }
    right() {
        let rows = this.classify("y")
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i] || [];
            row.length = this.xMax;
            rows[i] = backward(row)
        }
        this.points = rows.reduce((acc, item) => acc.concat(item), [])
        this.spawn()
    }
    up() {
        let columns = this.classify("x");
        for (let i = 0; i < columns.length; i++) {
            let column = columns[i] || [];
            column.length = this.yMax;
            columns[i] = forward(column)
        }
        this.points = flatten(columns)
        this.spawn()
    }
    down() {
        let columns = this.classify("x");
        for (let i = 0; i < columns.length; i++) {
            let column = columns[i] || [];
            column.length = this.yMax;
            columns[i] = backward(column)
        }
        this.points = flatten(columns)
        this.spawn()
    }
}
