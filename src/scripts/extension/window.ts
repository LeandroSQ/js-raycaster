import { Vector2 } from './../model/vector2';
import { Main } from './../main';

declare global {

	interface Window {
		main: Main
	}

	interface CanvasRenderingContext2D {
		drawLine(from: Vector2, to: Vector2, color: string): void;
		drawRect(position: Vector2, size: Vector2, color: string): void;
		drawCircle(position: Vector2, radius: number, color: string): void;
		drawText(text: string, position: Vector2, color: string): void;
	}

	interface Math {
		clamp(value: number, min: number, max: number): number;
		clampAngle(value: number): number;
	}

	interface Number {
		toRadians(): number;
		toDegrees(): number;
	}

}