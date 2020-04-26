export class Point {
    static uuid = 1
    id: number;
    val: number;
    constructor(public x: number, public y: number) {
        this.id = Point.uuid++;
        this.val = Math.random() < 0.3 ? 4 : 2;
    }
    location(val: number, base: number) {
        this.x = val % base
        this.y = Math.floor(val / base)
    }
}

export type Block = Point | number | undefined;

export function forward(blockQueue: Block[]): Point[] {
    const len = blockQueue.length;
    let points = <Point[]>blockQueue.filter(item => item instanceof Point)
    let index = -1;
    for (let i = 0, len = points.length; i < len; i++) {
        let current = points[i];
        let next = points[i + 1]
        if (current && next && current.val == next.val) {
            index = i;
            break
        }
    }
    if (index != -1) {
        points.splice(index + 1, 1);
        points[index].val += points[index].val
    }
    points.length = len
    return points
}

export function backward(blockQueue: Block[]): Point[] {
    const len = blockQueue.length;
    let points = <Point[]>blockQueue.filter(item => item instanceof Point)
    let index = -1;
    for (let i = points.length - 1; i >= 0; i--) {
        let current = points[i];
        let next = points[i - 1]
        if (current && next && current.val == next.val) {
            index = i;
            break
        }
    }
    if (index != -1) {
        points[index].val += points[index].val
        points.splice(index - 1, 1);  // splice 会导致index发生变化 
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