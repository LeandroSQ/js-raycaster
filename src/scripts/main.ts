import { RayHit } from './model/ray-hit';
import { Color } from './util/color';
import { ScaledCanvas } from './widget/scaled-canvas';
import { Keys } from './enum/keys';
import { Vector2 } from './model/vector2';
import { FrameController } from './controller/frame';
import { PlayerController } from './controller/player';
import { MapController } from './controller/map';
import "./extension/window";
import "./extension/canvas";
import "./extension/math";
import { Input } from "./util/input";
import { DensityCanvas } from "./widget/density-canvas";
import { Blocks } from './enum/blocks';

const RAY_MAX_DISTANCE = 10;

export class Main {

	canvas: DensityCanvas;
	minimapCanvas: DensityCanvas;

	map: MapController = new MapController();

	player: PlayerController = new PlayerController();

	frame: FrameController = new FrameController();

	needToRender = true;

	fov: number = 60;

	constructor() {
		// Initialize the controllers
		this.map.init(this);
		this.player.init(this);
		Input.init();

		// Setup the window
		this.setupWindow();

		// Start the render loop
		requestAnimationFrame(this.onUpdate.bind(this));
	}

	private setupWindow() {
		this.setupCanvas();
		this.setupMinimap();

		// Hook the resize event
		this.onDocumentSizeChanged();
		window.addEventListener("resize", this.onDocumentSizeChanged.bind(this));

		// Hook the destroy event
		window.addEventListener("beforeunload", this.onDestroy.bind(this));
	}

	private setupCanvas() {
		// Create the canvas
		this.canvas = new DensityCanvas("main");
		this.canvas.attachToElement(document.body);
	}

	private setupMinimap() {
		// Create the canvas
		this.minimapCanvas = new DensityCanvas("minimap");
		this.minimapCanvas.attachToElement(document.body);
	}

	private onDocumentSizeChanged() {
		const body = document.body;

		// Set the canvas size
		this.canvas.setSize(body.clientWidth, body.clientHeight);

		// Set the minimap size
		const size = Math.min(body.clientWidth, body.clientHeight) * 0.25;
		this.minimapCanvas.setSize(size, size);

		// Dynamically calculate the fov based on the canvas width
		this.fov = Math.clampAngle(
			Math.clamp((this.canvas.width * 65) / 1920, 55, 70).toRadians()
		);
	}

	private onDestroy() {
		// Destroy the controllers
		Input.destroy();
		this.map.destroy();
	}

	private onUpdate() {
		// Update controllers
		this.frame.startFrame();
		this.player.update(this);

		// Render the frame
		this.onRender();

		// Reset the input axes
		Input.resetAxis();

		// Store the current time in the frame controller
		this.frame.endFrame(this.onUpdate.bind(this));
	}

	private drawRayMinimap(hit: RayHit, cell: Vector2) {
		this.minimapCanvas.context.drawLine(
			Vector2.multiply(this.player.position, cell),
			Vector2.multiply(hit.position, cell),
			"pink"
		);
	}

	private drawRayWall(hit: RayHit, rayCount: number, index: number) {
		// Constants
		const maxDistance = Math.PI * 2;
		const wallPadding = 1;

		// Calculate the the wall size
		const wallHeight = (this.canvas.height / 2) / hit.distance;
		const wallWidth = this.canvas.width / rayCount;
		const context = this.canvas.context;
		const x = index * wallWidth - wallPadding / 2;

		// Draw wall
		const shade = Math.clamp(
			Math.clamp(hit.distance, 0, maxDistance) / maxDistance,
			0.15,
			1.0
		) * 80 + (hit.isHorizontal ? 10 : 0);
		context.fillStyle = Color.darken("#ff4757", shade);
		context.fillRect(x, this.canvas.height / 2 - wallHeight / 2 - 1, wallWidth + wallPadding, wallHeight + 2);
	}

	private compensateFishEye(rayAngle: number, hit: { position: Vector2, distance: number; }) {
		let angleDiff = Math.clampAngle(this.player.angle - rayAngle);
		hit.distance *= Math.cos(angleDiff);
	}

	private drawCeilingAndFloor() {
		const context = this.canvas.context;

		// Draw ceiling
		context.fillStyle = `#57606f`;
		context.fillRect(0, 0, this.canvas.width, this.canvas.height / 2);

		// Draw floor
		context.fillStyle = `#2f3542`;
		context.fillRect(0, this.canvas.height / 2, this.canvas.width, this.canvas.height / 2);
	}

	private castRay(angle: number) {
		// Define the starting position
		const from = this.player.position.clone();
		// Calculate the ray direction
		const direction = new Vector2(Math.cos(angle), Math.sin(angle)).normalize();
		// Calculate the size of each grid tile
		const unitStepSize = new Vector2(
			Math.abs(1.0 / direction.x),
			Math.abs(1.0 / direction.y)
		);

		// Stores the current position, truncated as integer
		const current = new Vector2(Math.floor(from.x), Math.floor(from.y));

		// Determines the direction of the steps, forward or backward
		const step = new Vector2(
			Math.sign(direction.x),
			Math.sign(direction.y)
		);

		// Initializes the offset from the current grid tile that the ray is currently on
		const length = new Vector2(
			direction.x < 0 ? (from.x - current.x) * unitStepSize.x : (current.x + 1.0 - from.x) * unitStepSize.x,
			direction.y < 0 ? (from.y - current.y) * unitStepSize.y : (current.y + 1.0 - from.y) * unitStepSize.y,
		);

		// Walks trough the grid in the direction of given angle
		// Uses DDA algorithm
		let distance = 0;
		let found = false;
		let isHorizontal = false;
		while (!found && distance < RAY_MAX_DISTANCE) {
			// Walks the shortest path
			if (length.x < length.y) {
				current.x += step.x; // Increases the current index
				distance = length.x; // Stores the traveled distance
				length.x += unitStepSize.x; // Increases the offset

				isHorizontal = true;
			} else {
				current.y += step.y; // Increases the current index
				distance = length.y; // Stores the traveled distance
				length.y += unitStepSize.y; // Increases the offset

				isHorizontal = false;
			}

			// Check if the current position is a wall
			const block = this.map.get(current.x, current.y);
			if (block != Blocks.Air) found = true;
		}

		// Calculate the intersection
		if (found) {
			return new RayHit(
				new Vector2(from.x + direction.x * distance, from.y + direction.y * distance),
				distance,
				isHorizontal,
				!isHorizontal
			);
		}

		return null;
	}

	private castRays() {
		const fovRadians = this.fov;
		const rayCount = this.canvas.width / 2;
		const rayGap = fovRadians / rayCount;

		// Pre-calculate the cell-size for the minimap
		const cellSize = this.map.getCellSize(this.minimapCanvas);

		// Define the start angle
		let rayAngle = this.player.angle - fovRadians / 2;

		for (let i = 0; i < rayCount; i++) {
			const hit = this.castRay(rayAngle);

			if (hit) {
				this.drawRayMinimap(hit, cellSize);
				this.compensateFishEye(rayAngle, hit);
				this.drawRayWall(hit, rayCount, i);
			}

			rayAngle = Math.clampAngle(rayAngle + rayGap);
		}
	}

	private onRender() {
		// Renders the minimap
		this.minimapCanvas.clear();
		this.map.draw(this.minimapCanvas);
		this.player.renderMinimap(this);

		// Renders the main canvas
		this.canvas.clear();
		this.drawCeilingAndFloor();
		this.castRays();

		this.frame.renderFPSCounter(this.canvas);
	}

}

window.main = new Main();