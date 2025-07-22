import { Point } from '../types/types';

export class PrintObject {
    image: HTMLImageElement;
    position: Point;
    width: number;
    height: number;
    isSelected: boolean;
    isDragging: boolean;
    dragStart: Point;

    constructor(image: HTMLImageElement, position: Point, width: number, height: number) {
        this.image = image;
        this.position = position;
        this.width = width;
        this.height = height;
        this.isSelected = false;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
    }
} 