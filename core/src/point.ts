export class Point {
    static uuid = 1
    constructor(public x: number, public y: number, public id: number = Point.uuid++, public val: number = 2) {
        this.id = id
        this.x = x;
        this.y = y;
        this.val = val;
    }
    rebase(val: number, base: number) {
        this.x = val % base
        this.y = Math.floor(val / base)
    }
}

export type Item = Point | number | undefined;

export function acc(itemQueue: Item[]): Point[] {
    const len = itemQueue.length;
    let points = <Point[]>itemQueue.filter(item => item instanceof Point)
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

export function revAcc(itemQueue: Item[]): Point[] {
    const len = itemQueue.length;
    let points = <Point[]>itemQueue.filter(item => item instanceof Point)
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
        points.splice(index - 1, 1);
        points[index].val += points[index].val
    }
    while(points.length < len) {
        points.unshift(undefined)
    }
    return points
}

export function flatten(itemQueue: Item[][]): Point[] {
    let result = []
    let len = Math.max(...itemQueue.map(item => item.length))
    for(let i = 0; i < len; i++) {
        for(let id = 0; id < itemQueue.length; id++) {
            let queue = itemQueue[id];
            let item = queue[i];
            if (item instanceof Point) {
                result.push(item)
            } else {
                result.push(undefined)
            }
        }
    }
    return result
}