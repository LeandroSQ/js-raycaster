import { Vector2 } from './../model/vector2';
import "./window";

CanvasRenderingContext2D.prototype.drawLine = function (from: Vector2, to: Vector2, color: string) {
	this.beginPath();
	this.moveTo(from.x, from.y);
	this.lineTo(to.x, to.y);
	this.strokeStyle = color;
	this.stroke();
	this.closePath();
};

CanvasRenderingContext2D.prototype.drawRect = function (position: Vector2, size: Vector2, color: string) {
	this.beginPath();
	this.fillStyle = color;
	this.fillRect(position.x, position.y, size.x, size.y);
	this.stroke();
};

CanvasRenderingContext2D.prototype.drawCircle = function (position: Vector2, radius: number, color: string) {
	this.beginPath();
	this.fillStyle = color;
	this.arc(position.x, position.y, radius, 0, 2 * Math.PI);
	this.fill();
};

CanvasRenderingContext2D.prototype.drawText = function (text: string, position: Vector2, color: string) {
	this.fillStyle = color;
	this.fillText(text, position.x, position.y);
};
