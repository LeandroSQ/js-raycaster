export class Vector2 {

	x: number = 0.0;
	y: number = 0.0;

	constructor(x: number = 0.0, y: number = 0.0) {
		this.x = x;
		this.y = y;
	}

	public add(b: Vector2) {
		this.x += b.x;
		this.y += b.y;
	}

	public static add(a: Vector2, b: Vector2): Vector2 {
		return new Vector2(a.x + b.x, a.y + b.y);
	}

	public subtract(b: Vector2) {
		this.x -= b.x;
		this.y -= b.y;
	}

	public static subtract(a: Vector2, b: Vector2): Vector2 {
		return new Vector2(a.x - b.x, a.y - b.y);
	}

	public multiply(b: Vector2) {
		this.x *= b.x;
		this.y *= b.y;
	}

	public static multiply(a: Vector2, b: Vector2): Vector2 {
		return new Vector2(a.x * b.x, a.y * b.y);
	}

	public divide(b: Vector2) {
		this.x /= b.x;
		this.y /= b.y;
	}

	public static divide(a: Vector2, b: Vector2): Vector2 {
		return new Vector2(a.x / b.x, a.y / b.y);
	}

	public distanceSquared(b: Vector2): number {
		return Math.pow(this.x - b.x, 2) + Math.pow(this.y - b.y, 2);
	}

	public distance(b: Vector2): number {
		return Math.sqrt(this.distanceSquared(b));
	}

	public equals(b: Vector2): boolean {
		return this.x === b.x && this.y === b.y;
	}

	public dot(b: Vector2): number {
		return this.x * b.x + this.y * b.y;
	}

	public cross(b: Vector2): number {
		return this.x * b.y - this.y * b.x;
	}

	public length(): number {
		return Math.sqrt(this.lengthSquared());
	}

	public lengthSquared(): number {
		return this.x * this.x + this.y * this.y;
	}

	public normalize(): Vector2 {
		const length = this.length();
		return new Vector2(this.x / length, this.y / length);
	}

	public clone(): Vector2 {
		return new Vector2(this.x, this.y);
	}

	public toString(): string {
		return `(${this.x}, ${this.y})`;
	}

	public static zero(): Vector2 {
		return new Vector2(0.0, 0.0);
	}

	public static one(): Vector2 {
		return new Vector2(1.0, 1.0);
	}

	public static up(): Vector2 {
		return new Vector2(0.0, -1.0);
	}

	public static down(): Vector2 {
		return new Vector2(0.0, 1.0);
	}

	public static left(): Vector2 {
		return new Vector2(-1.0, 0.0);
	}

	public static right(): Vector2 {
		return new Vector2(1.0, 0.0);
	}

}