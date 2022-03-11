import { DensityCanvas } from './../widget/density-canvas';
import { BaseController } from './base-controller';
import { Main } from './../main';

export class FrameController extends BaseController {

	deltaTime: number = 1.0;

	fps: number = 0;

	private frameCount: number = 0;
	private frameTimer: number = 0.0;

	lastFrameTime: number = 0;
	private frameStartTime: number = 0;
	private targetFPS = 60;
	private targetFrameTime = 1000 / this.targetFPS;

	constructor() {
		super();

		// Initializes with the optimal delta time
		this.deltaTime = this.targetFrameTime / 1000;
		this.frameStartTime = performance.now();
		this.lastFrameTime = this.frameStartTime;
	}

	startFrame() {
		// Calculate the time elapsed since the last frame
		this.frameStartTime = performance.now();
		this.deltaTime = (this.frameStartTime - this.lastFrameTime) / 1000;

		// Update the FPS counter
		this.frameCount++;
		this.frameTimer += this.deltaTime;
		if (this.frameTimer >= 1) {
			this.fps = this.frameCount;
			this.frameCount = 0;
			this.frameTimer -= 1;
		}
	}

	endFrame(callback: any) {
		this.lastFrameTime = performance.now();

		const delay = this.calculateNextTimeDelay();
		setTimeout(callback, delay);
	}

	renderFPSCounter({ context, width, height }) {
		const text = "FPS: " + this.fps;
		const size = 12;

		context.save();
		context.textAlign = "left";
		context.textBaseline = "middle";
		context.fillStyle = "#FFF";
		context.font = `${size}pt Bebas Neue`;
		context.shadowColor = "#000";
		context.shadowOffsetX = 0;
		context.shadowOffsetY = size / 7;
		context.shadowBlur = 2;

		const metrics = context.measureText(text);
		const x = width - metrics.width;
		const y = height - size / 2;

		context.fillText(text, x - size, y - size * 1.5);
		context.restore();
	}

	calculateNextTimeDelay(): number {
		const elapsed = Math.abs(this.lastFrameTime - this.frameStartTime);
		return Math.floor(Math.clamp(this.targetFrameTime - elapsed, 0, this.targetFrameTime));
	}

}