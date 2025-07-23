import { PrintObject } from './PrintObject';
import { getHandlePositions, getHandleAtPosition } from './Handle';
import { Point, Handle } from '../types/types';

export default class PrintEditor {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private backgroundImage: HTMLImageElement;
    private print: PrintObject;
    private readonly handleSize: number = 10;
    private activeHandle: Handle | null = null;
    private aspectRatio: number = 1;

    constructor(canvasId: string, backgroundImageSrc: string, printImageSrc: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        
        this.backgroundImage = new Image();
        this.backgroundImage.src = backgroundImageSrc;

        const printImage = new Image();
        printImage.src = printImageSrc;

        this.print = new PrintObject(printImage, { x: 50, y: 50 }, 150, 150);

        this.backgroundImage.onload = () => this.draw();
        printImage.onload = () => {
            this.aspectRatio = printImage.naturalWidth / printImage.naturalHeight;
            this.print.height = this.print.width / this.aspectRatio;
            this.draw();
        };

        this.initEventListeners();
    }

    private draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(
            this.print.image,
            this.print.position.x,
            this.print.position.y,
            this.print.width,
            this.print.height
        );

        if (this.print.isSelected) {
            this.drawSelection();
        }
    }

    private drawSelection() {
        const { x, y } = this.print.position;
        const { width, height } = this.print;

        this.ctx.strokeStyle = '#007bff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);

        // Draw handles at corners
        this.ctx.fillRect(x - this.handleSize / 2, y - this.handleSize / 2, this.handleSize, this.handleSize);
        this.ctx.fillRect(x + width - this.handleSize / 2, y - this.handleSize / 2, this.handleSize, this.handleSize);
        this.ctx.fillRect(x - this.handleSize / 2, y + height - this.handleSize / 2, this.handleSize, this.handleSize);
        this.ctx.fillRect(x + width - this.handleSize / 2, y + height - this.handleSize / 2, this.handleSize, this.handleSize);
    }

    private initEventListeners() {
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.onMouseUp.bind(this)); // Stop any action if mouse leaves
    }

    private getMousePos(event: MouseEvent): Point {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    private isMouseOverPrint(point: Point): boolean {
        return (
            point.x >= this.print.position.x &&
            point.x <= this.print.position.x + this.print.width &&
            point.y >= this.print.position.y &&
            point.y <= this.print.position.y + this.print.height
        );
    }

    private onMouseDown(event: MouseEvent) {
        const mousePos = this.getMousePos(event);

        if (this.print.isSelected) {
            const handle = getHandleAtPosition(mousePos, this.print, this.handleSize);
            if (handle) {
                this.activeHandle = handle;
                return;
            }
        }

        const isOverPrint = this.isMouseOverPrint(mousePos);
        if (isOverPrint) {
            this.print.isDragging = true;
            this.print.dragStart.x = mousePos.x - this.print.position.x;
            this.print.dragStart.y = mousePos.y - this.print.position.y;
            
            if (!this.print.isSelected) {
                this.print.isSelected = true;
                this.draw();
            }
        } else if (this.print.isSelected) {
            this.print.isSelected = false;
            this.draw();
        }
    }

    private onMouseMove(event: MouseEvent) {
        const mousePos = this.getMousePos(event);

        if (this.activeHandle) {
            this.performScaling(mousePos);
        } else if (this.print.isDragging) {
            this.print.position.x = mousePos.x - this.print.dragStart.x;
            this.print.position.y = mousePos.y - this.print.dragStart.y;
            this.draw();
        } else {
            this.updateCursor(mousePos);
        }
    }

    private updateCursor(mousePos: Point) {
        if (this.print.isSelected) {
            const handle = getHandleAtPosition(mousePos, this.print, this.handleSize);
            if (handle) {
                if (handle === 'topLeft' || handle === 'bottomRight') {
                    this.canvas.style.cursor = 'nwse-resize';
                } else {
                    this.canvas.style.cursor = 'nesw-resize';
                }
                return;
            }
        }

        if (this.isMouseOverPrint(mousePos)) {
            this.canvas.style.cursor = 'move';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }

    private performScaling(mousePos: Point) {
        const { position, width, height } = this.print;
    
        switch (this.activeHandle) {
            case 'bottomRight': {
                const newWidth = mousePos.x - position.x;
                this.print.width = newWidth > 0 ? newWidth : 0;
                this.print.height = this.print.width / this.aspectRatio;
                break;
            }
            case 'bottomLeft': {
                const newWidth = position.x + width - mousePos.x;
                this.print.width = newWidth > 0 ? newWidth : 0;
                this.print.height = this.print.width / this.aspectRatio;
                this.print.position.x = mousePos.x;
                break;
            }
            case 'topLeft': {
                const newWidth = position.x + width - mousePos.x;
                const newHeight = position.y + height - mousePos.y;
                if (newWidth / this.aspectRatio > newHeight) {
                    this.print.width = newWidth > 0 ? newWidth : 0;
                    this.print.height = this.print.width / this.aspectRatio;
                    this.print.position.x = mousePos.x;
                    this.print.position.y = position.y + height - this.print.height;
                } else {
                    this.print.height = newHeight > 0 ? newHeight : 0;
                    this.print.width = this.print.height * this.aspectRatio;
                    this.print.position.y = mousePos.y;
                    this.print.position.x = position.x + width - this.print.width;
                }
                break;
            }
            case 'topRight': {
                const newWidth = mousePos.x - position.x;
                const newHeight = position.y + height - mousePos.y;
                 if (newWidth / this.aspectRatio > newHeight) {
                    this.print.width = newWidth > 0 ? newWidth : 0;
                    this.print.height = this.print.width / this.aspectRatio;
                    this.print.position.y = position.y + height - this.print.height;
                } else {
                    this.print.height = newHeight > 0 ? newHeight : 0;
                    this.print.width = this.print.height * this.aspectRatio;
                    this.print.position.y = mousePos.y;
                }
                break;
            }
        }
        this.draw();
    }

    private onMouseUp() {
        this.print.isDragging = false;
        this.activeHandle = null;
    }
}
