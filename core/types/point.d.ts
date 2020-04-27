export declare class Point {
    x: number;
    y: number;
    static uuid: number;
    id: number;
    val: number;
    alt?: Point;
    constructor(x: number, y: number);
    location(val: number, base: number): void;
    clone(): Point;
}
export declare type Block = Point | number | undefined;
export declare function forward(blockQueue: Block[], threshold?: number): Point[];
export declare function backward(blockQueue: Block[], threshold?: number): Point[];
export declare function flatten(blockQueue: Block[][]): Point[];
