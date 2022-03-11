import { Keys } from './../enum/keys';
import { Input } from './../util/input';
import { Main } from './../main';
import { DensityCanvas } from './../widget/density-canvas';
import { Vector2 } from './../model/vector2';
import { BaseController } from './base-controller';

export class PlayerController extends BaseController {

	position: Vector2 = Vector2.zero();

	sprintSpeedMultiplier: number = 2.5;
	movementSpeed: number = 5;
	angularVelocity: number = 2.5;

	/** Radians */
	angle: number = 0;


	init(main: Main) {
		// Initialize the player position to the center of the map
		this.position = new Vector2(main.map.width / 2, main.map.height / 2);
		this.angle = -Math.PI / 2;
	}

	destroy() {

	}

	update(main: Main) {
		const velocityMultiplier = Input.isKeyDown(Keys.SHIFT) ? this.sprintSpeedMultiplier : 1;
		const velocity = this.movementSpeed * velocityMultiplier;
		const angularVelocity = this.angularVelocity * velocityMultiplier;

		const deltaTime = main.frame.deltaTime;

		if (Input.mouseAxis.x != 0) {
			this.angle = Math.clampAngle(
				this.angle + Input.mouseAxis.x * (angularVelocity / 4) * deltaTime
			);
		}

		if (Input.isKeyDown(Keys.A)) {
			this.position.x += Math.cos(this.angle - Math.PI / 2) * velocity * deltaTime;
			this.position.y += Math.sin(this.angle - Math.PI / 2) * velocity * deltaTime;
		}

		if (Input.isKeyDown(Keys.ARROW_LEFT)) {
			this.angle -= angularVelocity * deltaTime;
			if (this.angle < 0) this.angle += Math.PI * 2;
		}

		if (Input.isKeyDown(Keys.D)) {
			this.position.x -= Math.cos(this.angle - Math.PI / 2) * velocity * deltaTime;
			this.position.y -= Math.sin(this.angle - Math.PI / 2) * velocity * deltaTime;
		}

		if (Input.isKeyDown(Keys.ARROW_RIGHT)) {
			this.angle += angularVelocity * deltaTime;
			if (this.angle >= Math.PI * 2) this.angle -= Math.PI * 2;
		}

		if (Input.isKeyDown(Keys.ARROW_UP) || Input.isKeyDown(Keys.W)) {
			this.position.x += velocity * Math.cos(this.angle) * deltaTime;
			this.position.y += velocity * Math.sin(this.angle) * deltaTime;
		}

		if (Input.isKeyDown(Keys.ARROW_DOWN) || Input.isKeyDown(Keys.S)) {
			this.position.x -= velocity * Math.cos(this.angle) * deltaTime;
			this.position.y -= velocity * Math.sin(this.angle) * deltaTime;
		}
	}

	render(canvas: DensityCanvas) {

	}

	renderMinimap(main: Main) {
		const canvas = main.minimapCanvas;
		const context = canvas.context;

		// Calculate the position on the minimap
		const x = (this.position.x / main.map.width) * canvas.width;
		const y = (this.position.y / main.map.height) * canvas.height;

		// Draw the player
		context.fillStyle = "#FF0000";
		context.beginPath();
		context.arc(x, y, 5, 0, Math.PI * 2);
		context.fill();

		// Draw the angle indicator
		/* context.strokeStyle = "#FFFFFF";
		context.beginPath();
		context.moveTo(x, y);
		context.lineTo(x + Math.cos(this.angle) * 10, y + Math.sin(this.angle) * 10);
		context.stroke(); */

	}

}