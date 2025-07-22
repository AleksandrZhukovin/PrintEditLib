import { Point, Handle } from '../types/types';
import { PrintObject } from './PrintObject';

export function getHandlePositions(print: PrintObject) {
    const { x, y } = print.position;
    const { width, height } = print;
    return {
        topLeft: { x: x, y: y },
        topRight: { x: x + width, y: y },
        bottomLeft: { x: x, y: y + height },
        bottomRight: { x: x + width, y: y + height },
    };
}

export function getHandleAtPosition(point: Point, print: PrintObject, handleSize: number): Handle | null {
    const handles = getHandlePositions(print);
    for (const name of Object.keys(handles) as Handle[]) {
        const pos = handles[name];
        if (
            point.x >= pos.x - handleSize / 2 &&
            point.x <= pos.x + handleSize / 2 &&
            point.y >= pos.y - handleSize / 2 &&
            point.y <= pos.y + handleSize / 2
        ) {
            return name;
        }
    }
    return null;
} 