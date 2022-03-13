import { Vector2 } from './vector2';

export class RayHit {

	position: Vector2;
	distance: number;
	isHorizontal: boolean;
	isVertical: boolean;

	constructor(position: Vector2, distance: number, isHorizontal: boolean, isVertical: boolean) {
		this.position = position;
		this.distance = distance;
		this.isHorizontal = isHorizontal;
		this.isVertical = isVertical;
	}

}