import * as assert from "assert";
import { acc, Point, Item, revAcc, flatten } from "../src/point";

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


let accOriginalSet = [
    [1, 2, new Point(0, 0, 0, 2), new Point(0, 0, 1, 4), new Point(0, 0, 2, 8), new Point(0, 0, 3, 16), 3, 4],
    [1, new Point(0, 0, 0, 2), new Point(0, 0, 1, 2), new Point(0, 0, 2, 8), new Point(0, 0, 3, 16), 2, 3, 4]
]
let accExpectSet = [
    [new Point(0, 0, 0, 2), new Point(0, 0, 1, 4), new Point(0, 0, 2, 8), new Point(0, 0, 3, 16), undefined, undefined, undefined, undefined],
    [new Point(0, 0, 0, 4), new Point(0, 0, 2, 8), new Point(0, 0, 3, 16), undefined, undefined, undefined, undefined, undefined]
]

let revAccOriginalSet = [
    [1, 2, new Point(0, 0, 0, 2), new Point(0, 0, 1, 4), new Point(0, 0, 2, 8), new Point(0, 0, 3, 16), 3, 4],
    [1, new Point(0, 0, 0, 2), new Point(0, 0, 1, 2), new Point(0, 0, 2, 4), new Point(0, 0, 3, 16), 2, 3, 4]
]

let recAccExpectSet = [
    [undefined, undefined, undefined, undefined, new Point(0, 0, 0, 2), new Point(0, 0, 1, 4), new Point(0, 0, 2, 8), new Point(0, 0, 3, 16)],
    [undefined, undefined, undefined, undefined, undefined, new Point(0, 0, 1, 4), new Point(0, 0, 2, 4), new Point(0, 0, 3, 16) ]
]

function cmp<Item>(a: Item, b: Item):Boolean {
    if (a instanceof Point && b instanceof Point) {
        return a.id == b.id
    } else if (a instanceof Point && !(b instanceof Point)) {
        return false
    } else if (!(a instanceof Point) && (b instanceof Point)){
        return false
    } else {
        return true
    }
}

describe('Acc Function', function () {
    it("Test Route",function() {
        for (let i = 0; i < accOriginalSet.length; i++) {
            let item = accOriginalSet[i];
            let expected = accExpectSet[i]
            if (!equal(acc(item), expected, cmp)) {
                throw new Error(`function Acc result do not match expected in Routes ${i}\n`)
            }
        }
    })
});

describe("RevAcc Function", function() {
    it("Test Route", function() {
        for (let i = 0; i < revAccOriginalSet.length; i++) {
            let item = revAccOriginalSet[i];
            let expected = recAccExpectSet[i]
            let result = revAcc(item);
            if (!equal(result, expected, cmp)) {
                console.log(item, result)
                throw new Error(`function revAcc result do not match expected in Routes ${i}`)
            }
        }
    })
})

describe("flatten Function", function() {
    it("Test Route", function() {
        let data = [
            [new Point(1,1,1,1),new Point(5,5,5,5),new Point(9,9,9,9),new Point(13,13,13,13)],
            [new Point(2,2,2,2),new Point(6,6,6,6),new Point(10,10,10,10),new Point(14,14,14,14)],
            [new Point(3,3,3,3),new Point(7,7,7,7),new Point(11,11,11,11),new Point(15,15,15,15)],
            [new Point(4,4,4,4),new Point(8,8,8,8),new Point(12,12,12,12),new Point(16,16,16,16)],
        ]
        let expect = [
            new Point(1,1,1,1),
            new Point(2,2,2,2),
            new Point(3,3,3,3),
            new Point(4,4,4,4),
            new Point(5,5,5,5),
            new Point(6,6,6,6),
            new Point(7,7,7,7),
            new Point(8,8,8,8),
            new Point(9,9,9,9),
            new Point(10,10,10,10),
            new Point(11,11,11,11),
            new Point(12,12,12,12),
            new Point(13,13,13,13),
            new Point(14,14,14,14),
            new Point(15,15,15,15),
            new Point(16,16,16,16)
        ]
        let result = flatten(data)
        if (!equal(result, expect, cmp)) {
            throw new Error("flatten work unexpected")
        }
    })
    it("Test Route2", function() {
        let data = [
            [new Point(1,1,1,1),new Point(5,5,5,5),new Point(9,9,9,9),new Point(13,13,13,13)],
            [new Point(2,2,2,2)],
            [new Point(3,3,3,3),new Point(7,7,7,7)],
            [new Point(4,4,4,4),new Point(8,8,8,8),new Point(12,12,12,12)],
        ]
        let expect = [
            new Point(1,1,1,1),
            new Point(2,2,2,2),
            new Point(3,3,3,3),
            new Point(4,4,4,4),
            new Point(5,5,5,5),
            undefined,
            new Point(7,7,7,7),
            new Point(8,8,8,8),
            new Point(9,9,9,9),
            undefined,
            undefined,
            new Point(12,12,12,12),
            new Point(13,13,13,13),
            undefined,
            undefined,
            undefined
        ]
        let result = flatten(data)
        if (!equal(result, expect, cmp)) {
            throw new Error("flatten work unexpected")
        }
    })
})