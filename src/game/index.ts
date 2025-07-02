import { Point, forward, backward, flatten } from "./point"
import type { Block } from "./point"

export type State = { alts: Point[], elements: Point[] }

export class Game {
  private elements: Block[];
  constructor(public xMax: number = 8, public yMax: number = 8) {
    this.elements = new Array(xMax * yMax);
    this.onRebase()
  }
  doSpawn(): State {
    this.onRebase()
    const elements = this.elements.filter(e => typeof e === "number");
    const i = Math.floor(Math.random() * elements.length)
    const val = elements[i] as number
    const x = val % this.xMax;
    const y = Math.floor(val / this.yMax)
    this.elements[val] = new Point(x, y)
    return this.state
  }
  private onRank(key: 'x'|'y'): Point[][] {
    const result = new Array(this.xMax);
    const points = this.elements;
    for (let i = 0; i < points.length; i += 1) {
      const point = points[i];
      if (point instanceof Point) {
        const prop = point[key];
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
      const point = this.elements[i];
      if (typeof point == "object") {
        point.location(i, this.xMax)
      } else {
        this.elements[i] = i;
      }
    }
  }
  onLeft(): State {
    const rows = this.onRank("y")
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] || [];
      row.length = this.xMax;
      rows[i] = forward(row)
    }
    this.elements = rows.reduce((a, b) => a.concat(b), [])
    return this.state
  }
  onRight(): State {
    const rows = this.onRank("y")
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] || [];
      row.length = this.xMax;
      rows[i] = backward(row) as Point[]
    }
    this.elements = rows.reduce((a, b) => a.concat(b), [])
    return this.state
  }
  onUp(): State {
    const columns = this.onRank("x");
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i] || [];
      column.length = this.yMax;
      columns[i] = forward(column)
    }
    this.elements = flatten(columns)
    return this.state
  }
  onDown(): State {
    const columns = this.onRank("x");
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i] || [];
      column.length = this.yMax;
      columns[i] = backward(column) as Point[]
    }
    this.elements = flatten(columns)
    return this.state
  }
  isOver(): boolean {
    const len = this.elements.filter(e => !(e instanceof Point)).length
    if (len > 0) { return false }
    const isValid = function (elements: Point[]) {
      if (elements.length <= 1) { return true }
      for(let i = 0; i < elements.length - 1; i++) {
        const current = elements[i];
        const next = elements[i +1 ];
        if (current.val == next.val) {
          return true
        }
      }
      return false
    }
    let elements = this.onRank("y");
    for(let i = 0; i < elements.length; i++) {
      const elem = <Point[]>elements[i];
      if (isValid(elem)) { return false }
    }
    elements = this.onRank("x");
    for(let i = 0; i < elements.length; i++) {
      const elem = <Point[]>elements[i];
      if (isValid(elem)) { return false }
    }
    return true
  }
  get state(): State {
    this.onRebase();
    const alts = []
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
