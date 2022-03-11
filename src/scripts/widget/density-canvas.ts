export class DensityCanvas {

	public canvas: HTMLCanvasElement = document.createElement("canvas");
	private virtualWidth: number = null;
	private virtualHeight: number = null;
	private drawRatio: number = 1;

	constructor(name: string = null) {
		if (name) {
			this.canvas.id = name;
		}

		this.context.imageSmoothingEnabled = false;
		this.context["mozImageSmoothingEnabled"] = false;
	}

	private getBackingStoreRatio(context: CanvasRenderingContext2D): number {
		return (
			(context["webkitBackingStorePixelRatio"]) ||
			(context["mozBackingStorePixelRatio"]) ||
			(context["msBackingStorePixelRatio"]) ||
			(context["oBackingStorePixelRatio"]) ||
			(context["backingStorePixelRatio"]) ||
			1
		);
	}

	private getDevicePixelRation(): number {
		return window.devicePixelRatio || 1;
	}

	private getDrawRatio(backingStoreRatio, devicePixelRatio): number {
		return devicePixelRatio / backingStoreRatio;
	}

	/**
	 * Sets the size of the canvas
	 *
	 * @param {number} width The width of the canvas, in pixels
	 * @param {number} height The width of the canvas, in pixels
	 */
	setSize(width: number, height: number) {
		// Calculate the display density pixel ratio
		const backingStoreRatio = this.getBackingStoreRatio(this.context);
		const devicePixelRatio = this.getDevicePixelRation();
		this.drawRatio = this.getDrawRatio(backingStoreRatio, devicePixelRatio);

		// Set the canvas size
		if (backingStoreRatio !== devicePixelRatio) {
			// Set the virtual canvas size to the real resolution
			this.canvas.width = width * this.drawRatio;
			this.canvas.height = height * this.drawRatio;

			// Set the presented canvas size to the visible resolution
			this.canvas.style.width = `${width}px`;
			this.canvas.style.minWidth = `${width}px`;
			this.canvas.style.height = `${height}px`;
			this.canvas.style.minHeight = `${height}px`;
		} else {
			// 1:1 ratio, just scale it
			this.canvas.width = width;
			this.canvas.height = height;

			this.canvas.style.width = "";
			this.canvas.style.height = "";
		}

		// Scale the canvas according to the ratio
		this.context.scale(this.drawRatio, this.drawRatio);

		// Save the virtual size of the canvas
		this.virtualWidth = width;
		this.virtualHeight = height;
	}

	/** Clears the canvas */
	clear() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	/**
	 * Draws this canvas to another {@link foreignContext} canvas
	 *
	 * @param {number} x The x position to draw the canvas
	 * @param {number} y The y position to draw the canvas
	 * @param {CanvasRenderingContext2D} foreignContext The context to draw to
	 */
	drawTo(x: number, y: number, foreignContext: CanvasRenderingContext2D) {
		foreignContext.save();
		foreignContext.scale(1 / this.drawRatio, 1 / this.drawRatio);
		foreignContext.drawImage(this.canvas, x, y);
		foreignContext.restore();
	}

	/**
	 * Attaches the canvas element as child to given {@link element}
	 *
	 * @param {HTMLElement} element The element to attach the canvas to
	 */
	attachToElement(element: HTMLElement) {
		element.appendChild(this.canvas);
	}

	//#region Getters
	get width(): number {
		return this.virtualWidth || this.canvas.width;
	}

	get height(): number {
		return this.virtualHeight || this.canvas.height;
	}

	get context(): CanvasRenderingContext2D {
		return this.canvas.getContext("2d");
	}
	//#endregion

}
