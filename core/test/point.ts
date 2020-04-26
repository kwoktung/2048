import { Point, Block, backward, flatten, forward } from "../src/point";

function equal<T>(source: T[], target: T[], cmp: (a: T, b: T) => Boolean) {
    if (source.length == 0 && target.length == 0) { return true }
    if (source.length != target.length) { return false }
    let len = source.length;
    for (let i = 0; i < len; i++) {
        let a = source[i];
        let b = target[i];
        if (!cmp(a, b)) { return false }
    }
    return true
}

function compare<Item>(a: Item, b: Item): Boolean {
    if (a instanceof Point && b instanceof Point) {
        return a.id == b.id && a.val == b.val
    } else if (a instanceof Point && !(b instanceof Point)) {
        return false
    } else if (!(a instanceof Point) && (b instanceof Point)) {
        return false
    } else {
        return true
    }
}

let blockCreator = function (options: { id: number, val: number }): Point {
    if (options == undefined) { return }
    let point = new Point(0, 0)
    point.id = options.id
    point.val = options.val
    return point
}

describe('Forward Function', function () {
    let routes = [
        [
            [, , , , , , { id: 1, val: 2 }],
            [{ id: 1, val: 2 }, , , , , , ,]
        ],
        [
            [, { id: 1, val: 2 }, , { id: 2, val: 4 }, , { id: 3, val: 8 }, , { id: 4, val: 16 }],
            [{ id: 1, val: 2 }, { id: 2, val: 4 }, { id: 3, val: 8 }, { id: 4, val: 16 }, , , , ,]
        ],
        [
            [, { id: 1, val: 2 }, , { id: 2, val: 2 }, , { id: 3, val: 8 }, , { id: 4, val: 16 }],
            [{ id: 1, val: 4 }, { id: 3, val: 8 }, { id: 4, val: 16 }, , , , , ,]
        ],
    ]
    for (let i = 0; i < routes.length; i++) {
        it(`Test Route #${i}`, function () {
            let route = routes[i];
            let input = route[0];
            input = input.map(n => blockCreator(n))
            let expected = route[1]
            expected = expected.map(n => blockCreator(n))
            let result = forward(input as Block[])
            if (!equal(result, expected, compare)) {
                console.log(result, expected)
                throw new Error("Not Matched")
            }
        })
    }
});

describe('Backward Function', function () {
    let routes = [
        [
            [{ id: 1, val: 2 }, , , , , , ,],
            [, , , , , , { id: 1, val: 2 }]
        ],
        [
            [, { id: 1, val: 2 }, , { id: 2, val: 4 }, , { id: 3, val: 8 }, , { id: 4, val: 16 }],
            [, , , ,{ id: 1, val: 2 }, { id: 2, val: 4 }, { id: 3, val: 8 }, { id: 4, val: 16 }]
        ],
        [
            [,{ id: 1, val: 2 }, , { id: 2, val: 2 }, , { id: 3, val: 8 }, , { id: 4, val: 16 }],
            [, , , , ,{ id: 2, val: 4 }, { id: 3, val: 8 }, { id: 4, val: 16 }]
        ],
    ]
    for (let i = 0; i < routes.length; i++) {
        it(`Test Route #${i}`, function () {
            let route = routes[i];
            let input = route[0];
            input = input.map(n => blockCreator(n))
            let expected = route[1]
            expected = expected.map(n => blockCreator(n))
            let result = backward(input as Block[])
            if (!equal(result, expected, compare)) {
                console.log(result, expected)
                throw new Error("Not Matched")
            }
        })
    }
});