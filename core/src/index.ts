import { Point, Block, forward, backward, flatten } from "./point"

export type State = { alts: Point[], elements: Point[] }

export default class Controller {
  private elements: Block[];
  constructor(public xMax: number = 8, public yMax: number = 8) {
    this.elements = new Array(xMax * yMax);
    this.onRebase()
  }
  doSpawn(): State {
    this.onRebase()
    let elements = this.elements.filter(e => typeof e === "number");
    let i = Math.floor(Math.random() * elements.length)
    let val = elements[i] as number
    let x = val % this.xMax;
    let y = Math.floor(val / this.yMax)
    this.elements[val] = new Point(x, y)
    return this.state
  }
  private onRank(key: 'x'|'y'): Point[][] {
    let result = new Array(this.xMax);
    let points = this.elements;
    for (let i = 0; i < points.length; i += 1) {
      let point = points[i];
      if (point instanceof Point) {
        let prop = point[key];
        if (!result[prop]) {
          result[prop] = []
        }
        result[prop].push(point.clone())
      }
    }
    return result
  }
  private onRebase() {
    for (let i = 0; i < this.elements.length; i++) {
      let point = this.elements[i];
      if (typeof point == "object") {
        point.location(i, this.xMax)
      } else {
        this.elements[i] = i;
      }
    }
  }
  onLeft(): State {
    let rows = this.onRank("y")
    for (let i = 0; i < rows.length; i++) {
      let row = rows[i] || [];
      row.length = this.xMax;
      rows[i] = forward(row)
    }
    this.elements = rows.reduce((a, b) => a.concat(b), [])
    return this.state
  }
  onRight(): State {
    let rows = this.onRank("y")
    for (let i = 0; i < rows.length; i++) {
      let row = rows[i] || [];
      row.length = this.xMax;
      rows[i] = backward(row)
    }
    this.elements = rows.reduce((a, b) => a.concat(b), [])
    return this.state
  }
  onUp(): State {
    let columns = this.onRank("x");
    for (let i = 0; i < columns.length; i++) {
      let column = columns[i] || [];
      column.length = this.yMax;
      columns[i] = forward(column)
    }
    this.elements = flatten(columns)
    return this.state
  }
  onDown(): State {
    let columns = this.onRank("x");
    for (let i = 0; i < columns.length; i++) {
      let column = columns[i] || [];
      column.length = this.yMax;
      columns[i] = backward(column)
    }
    this.elements = flatten(columns)
    return this.state
  }
  isOver(): Boolean {
    let len = this.elements.filter(e => !(e instanceof Point)).length
    if (len > 0) { return false }
    const isValid = function (elements: Point[]) {
      if (elements.length <= 1) { return true }
      for(let i = 0; i < elements.length - 1; i++) {
        let current = elements[i];
        let next = elements[i +1 ];
        if (current.val == next.val) {
          return true
        }
      }
      return false
    }
    let elements = this.onRank("y");
    for(let i = 0; i < elements.length; i++) {
      let elem = <Point[]>elements[i];
      if (isValid(elem)) { return false }
    }
    elements = this.onRank("x");
    for(let i = 0; i < elements.length; i++) {
      let elem = <Point[]>elements[i];
      if (isValid(elem)) { return false }
    }
    return true
  }
  get state(): State {
    this.onRebase();
    let alts = []
    let elements = this.elements.filter(e => e instanceof Point) as Point[];
    for(let i = 0, len = elements.length; i < len; i ++) {
      const elem = elements[i];
      if (elem.alt){
        elem.alt.x = elem.x;
        elem.alt.y = elem.y;
        alts.push(elem.alt)
      }
    }
    elements = elements.sort((a, b) => a.id < b.id ? -1: 1)
    return { alts, elements } 
  }
}
