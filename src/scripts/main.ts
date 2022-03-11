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

export class Main {

	canvas: ScaledCanvas;
	minimapCanvas: DensityCanvas;

	map: MapController = new MapController();

	player: PlayerController = new PlayerController();

	frame: FrameController = new FrameController();

	needToRender = true;

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
		this.canvas = new ScaledCanvas("main");
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

	private castRay(angle: number, precision: number) {
		const position = this.player.position.clone();
		const direction = new Vector2(
			Math.cos(angle) / precision,
			Math.sin(angle) / precision
		);

		for (let iteration = 0; iteration < precision * 20; iteration++) {
			position.add(direction);

			const block = this.map.get(position);
			if (block != Blocks.Air) return {
				position,
				distance: this.player.position.distance(position)
			};
		}

		return null;
	}

	private drawRayMinimap(hit: { position: Vector2, distance: number }, cell: Vector2) {
		this.minimapCanvas.context.drawLine(
			Vector2.multiply(this.player.position, cell),
			Vector2.multiply(hit.position, cell),
			"pink"
		);
	}

	private drawRayWall(hit: { position: Vector2, distance: number },rayCount: number, index: number) {
		// Constants
		const maxDistance = Math.PI * 2;
		const wallPadding = 1;

		// Calculate the the wall size
		const wallHeight = (this.canvas.height / 2) / hit.distance;
		const wallWidth = this.canvas.width / rayCount;
		const context = this.canvas.context;
		const x = index * wallWidth - wallPadding / 2;

		// Draw wall
		const shade = Math.clamp(Math.clamp(hit.distance, 0, maxDistance) / maxDistance, 0.15, 1.0) * 90;
		context.fillStyle = Color.darken("#ff4757", shade);
		context.fillRect(x, this.canvas.height / 2 - wallHeight / 2 - 1, wallWidth + wallPadding, wallHeight + 2);
	}

	private compensateFishEye(rayAngle: number, hit: { position: Vector2, distance: number }) {
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

	private castRays() {
		const precision = 64;
		const fov = (60).toRadians();
		const count = this.canvas.width / 6;
		const gap = fov / count;

		let rayAngle = this.player.angle - (fov / 2);

		const cell = this.map.getCellSize(this.minimapCanvas);

		for (let i = 0; i < count; i++) {
			const hit = this.castRay(rayAngle, precision);

			if (hit) {
				this.drawRayMinimap(hit, cell);
				this.compensateFishEye(rayAngle, hit);
				this.drawRayWall(hit, count, i);
			}

			rayAngle = Math.clampAngle(rayAngle + gap);
		}
	}

/* 	private castRays () {
		const gridSize = (this.map.width * this.map.height);

		let fov = 30;
		let rayCount = 60;
		let rayOffset = fov / this.canvas.width;
		let rayAngle = this.player.angle - (rayOffset * rayCount) / 2;
		let rayPosition = Vector2.zero();
		// let rayOffset = Vector2.zero();
		let mapPosition = Vector2.zero();
		let depthOfField = 0;

		const context = this.minimapCanvas.context;

		for (let ray = 0; ray < rayCount; ray++) {
			depthOfField = 0;

			rayPosition = this.player.position.clone();

			let rayCos = Math.cos(rayAngle) / gridSize;
			let raySin = Math.sin(rayAngle) / gridSize;

			for (let iteration = 0; iteration < gridSize * 20; iteration++) {
				rayPosition.x += rayCos;
				rayPosition.y += raySin;

				let block = this.map.get(Math.floor(rayPosition.x), Math.floor(rayPosition.y));
				if (block != Blocks.Air) {
					if (ray == 0) console.log("Took " + iteration + " iterations to hit a block");
					break;
				}
			}

			context.strokeStyle = "#D82148";
			context.fillStyle = "#D82148";

			let tmp = this.map.localizeVector(this.player.position, this.canvas, this.minimapCanvas);
			const cw = this.map.getCellWidth(this.minimapCanvas.width);
			const ch = this.map.getCellHeight(this.minimapCanvas.height);

			context.beginPath();
			context.moveTo(this.player.position.x * cw, this.player.position.y * ch);
			context.lineTo(rayPosition.x * this.map.getCellWidth(this.minimapCanvas.width), rayPosition.y * this.map.getCellHeight(this.minimapCanvas.height));
			context.stroke();
			context.closePath();

			context.beginPath();
			context.arc(rayPosition.x * cw, rayPosition.y * ch, 3, 0, 2 * Math.PI);
			context.fill();


			// context.fillRect(Math.floor(rayPosition.x * cw), Math.floor(rayPosition.y * ch), cw, ch);

			let distance = Math.sqrt(Math.pow(this.player.position.x - rayPosition.x, 2) + Math.pow(this.player.position.y - rayPosition.y, 2));
			let wallHeight = Math.floor(this.canvas.height / 2 / distance);
			rayAngle += rayOffset;

			// let aTan = -1 / Math.tan(rayAngle);

			/* if (rayAngle > Math.PI) {// Looking down
				// Calculate the ray position
				rayPosition.y = Math.floor(Math.round(this.player.position.y / gridSize) * gridSize);
				rayPosition.x = Math.floor((this.player.position.y - rayPosition.y) * aTan + this.player.position.x);

				// Calculate the ray offset
				rayOffset.y = -gridSize;
				rayOffset.x = -rayOffset.y * aTan;
			} else if (rayAngle < Math.PI) {// Looking up
				// Calculate the ray position
				rayPosition.y = Math.floor(Math.round(this.player.position.y / gridSize) * gridSize + gridSize);
				rayPosition.x = Math.floor((this.player.position.y - rayPosition.y) * aTan + this.player.position.x);

				// Calculate the ray offset
				rayOffset.y = gridSize;
				rayOffset.x = -rayOffset.y * aTan;
			} else if (rayAngle == 0 || rayAngle == Math.PI) {// Looking right or left
				rayPosition.x = this.player.position.x;
				rayPosition.y = this.player.position.y;
				depthOfField = 8;
			}

			while (depthOfField < 8) {
				mapPosition.x = Math.floor(Math.round(rayPosition.x / gridSize));
				mapPosition.y = Math.floor(Math.round(rayPosition.y / gridSize));
				const index = mapPosition.y * this.map.width + mapPosition.x;

				if (index < gridSize && this.map.get(mapPosition.x, mapPosition.y) == Blocks.Solid) {
					depthOfField = 8;// Hit a wall
					console.log("Hit a wall at " + mapPosition.x + ", " + mapPosition.y);
				} else {
					rayPosition.x += rayOffset.x;
					rayPosition.y += rayOffset.y;
					depthOfField++;
				}
			}
		}

		/* const context = this.minimapCanvas.context;
		const convertHorizontal = (x: number) => (x / parseFloat(this.map.width)) * this.minimapCanvas.width;
		const convertVertical = (y: number) => (y / parseFloat(this.map.height)) * this.minimapCanvas.height;

		context.strokeStyle = "green";
		context.beginPath();
		context.moveTo(convertHorizontal(this.player.position.x), convertVertical(this.player.position.y));
		context.lineTo(convertHorizontal(rayPosition.x), convertVertical(rayPosition.y));
		context.stroke();

		context.fillStyle = "pink";
		context.fillRect(convertHorizontal(mapPosition.x), convertVertical(mapPosition.y), this.map.getCellWidth(this.minimapCanvas.width), this.map.getCellHeight(this.minimapCanvas.height));

	} */

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