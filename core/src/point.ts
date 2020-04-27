export class Point {
  static uuid = 1
  id: number;
  val: number;
  alt?: Point;
  constructor(public x: number, public y: number) {
    this.id = Point.uuid++;
    this.val = Math.random() < 0.3 ? 4 : 2;
  }
  location(val: number, base: number) {
    this.x = val % base
    this.y = Math.floor(val / base)
  }
  clone():Point {
    const cloned = new Point(this.x, this.y)
    cloned.val = this.val;
    cloned.id = this.id;
    return cloned
  }
}

export type Block = Point | number | undefined;

export function forward(blockQueue: Block[], threshold: number = 2048): Point[] {
  const len = blockQueue.length;
  let points = <Point[]>blockQueue.filter(item => item instanceof Point)
  points.forEach(e => delete e.alt)
  let index = -1;
  for (let i = 0, len = points.length; i < len; i++) {
    let current = points[i];
    let next = points[i + 1]
    if (current && next && current.val == next.val && threshold > current.val) {
      index = i;
      next.alt = current;
      current.alt = next;
      break
    }
  }
  if (index != -1) {
    points.splice(index, 1);
  }
  points.length = len
  return points
}

export function backward(blockQueue: Block[], threshold: number = 2048): Point[] {
  const len = blockQueue.length;
  let points = <Point[]>blockQueue.filter(item => item instanceof Point)
  points.forEach(e => delete e.alt);
  let index = -1;
  for (let i = points.length - 1; i >= 0; i--) {
    let current = points[i];
    let next = points[i - 1]
    if (current && next && current.val == next.val && threshold > current.val) {
      index = i;
      next.alt = current;
      current.alt = next
      break
    }
  }
  if (index != -1) {
    points.splice(index, 1);  // splice 会导致index发生变化
  }
  while (points.length < len) {
    points.unshift(undefined)
  }
  return points
}

export function flatten(blockQueue: Block[][]): Point[] {
  let result = []
  let max = Math.max(...blockQueue.map(item => item.length))
  for (let i = 0; i < max; i++) {
    for (let x = 0; x < blockQueue.length; x++) {
      let block = blockQueue[x][i];
      result.push(block instanceof Point ? block : undefined)
    }
  }
  return result
}
