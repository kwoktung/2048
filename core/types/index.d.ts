import { Point } from "./point";
export declare type State = {
    alts: Point[];
    elements: Point[];
};
export default class Controller {
    xMax: number;
    yMax: number;
    private elements;
    constructor(xMax?: number, yMax?: number);
    doSpawn(): State;
    private onRank;
    private onRebase;
    onLeft(): State;
    onRight(): State;
    onUp(): State;
    onDown(): State;
    isOver(): boolean;
    get state(): State;
}
