import { Vector2 } from './../model/vector2';
import { Main } from './../main';
import { BaseController } from './base-controller';
import { DensityCanvas } from './../widget/density-canvas';
import { Blocks } from "../enum/blocks";

export class MapController extends BaseController {

	grid: Array<Array<Blocks>>;

	init(main: Main): void {
		// Initialize the grid with empty blocks
		this.grid = [
			[Blocks.Solid, Blocks.Solid, Blocks.Solid, Blocks.Solid, Blocks.Solid, Blocks.Solid, Blocks.Solid, Blocks.Solid],
			[Blocks.Solid, Blocks.Air  , Blocks.Air  , Blocks.Air  , Blocks.Solid, Blocks.Air  , Blocks.Air  , Blocks.Solid],
			[Blocks.Solid, Blocks.Air  , Blocks.Solid, Blocks.Air  , Blocks.Air  , Blocks.Air  , Blocks.Air  , Blocks.Solid],
			[Blocks.Solid, Blocks.Air  , Blocks.Solid, Blocks.Air  , Blocks.Air  , Blocks.Air  , Blocks.Air  , Blocks.Solid],
			[Blocks.Solid, Blocks.Air  , Blocks.Air  , Blocks.Air  , Blocks.Air  , Blocks.Air  , Blocks.Air  , Blocks.Solid],
			[Blocks.Solid, Blocks.Air  , Blocks.Air  , Blocks.Air  , Blocks.Air  , Blocks.Solid, Blocks.Air  , Blocks.Solid],
			[Blocks.Solid, Blocks.Air  , Blocks.Air  , Blocks.Air  , Blocks.Air  , Blocks.Solid, Blocks.Air  , Blocks.Solid],
			[Blocks.Solid, Blocks.Solid, Blocks.Solid, Blocks.Solid, Blocks.Solid, Blocks.Solid, Blocks.Solid, Blocks.Solid]
		];
	}

	destroy(): void {
		this.grid = null;
	}

	draw(canvas: DensityCanvas) {
		const cellWidth = this.getCellWidth(canvas.width);
		const cellHeight = this.getCellHeight(canvas.height);
		const context = canvas.context;

		// Draw the grid
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				const block = this.grid[y][x];
				const color = this.getColor(block);

				context.fillStyle = color.fill;
				context.strokeStyle = color.stroke;

				context.beginPath();
				context.rect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
				context.fill();
				context.stroke();
			}
		}
	}

	private getColor(block: Blocks) {
		switch (block) {

			case Blocks.Air:
				return { fill: "#151D3B", stroke: "rgba(255, 255, 255, 0.15)" };

			case Blocks.Solid:
				return { fill: "#DADBBD", stroke: "rgba(0, 0, 0, 0.35)" };

		}
	}

	getCellWidth(canvasWidth: number) {
		return canvasWidth / this.width;
	}

	getCellHeight(canvasHeight: number) {
		return canvasHeight / this.height;
	}

	getCellSize(canvas: { width: number, height: number }): Vector2 {
		return new Vector2(
			this.getCellWidth(canvas.width),
			this.getCellHeight(canvas.height)
		);
	}

	get(x: number | Vector2, y?: number): Blocks {
		if (x instanceof Vector2) {
			y = x.y;
			x = x.x;
		}

		if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
			return null;
		} else {
			return this.grid[Math.floor(y)][Math.floor(x)];
		}
	}

	get width() {
		return this.grid.length;
	}

	get height() {
		return this.grid[0].length;
	}

}