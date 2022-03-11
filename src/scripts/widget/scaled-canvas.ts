export class ScaledCanvas {

	canvas: HTMLCanvasElement = document.createElement("canvas");
	width: number = 640;
	height: number = 380;

	constructor(name: string = null) {
		if (name) {
			this.canvas.id = name;
		}
	}

	setSize(width: number, height: number) {
		this.clear();

		this.canvas.width = width;
		this.canvas.height = height;

		this.context.scale(
			this.canvas.width / this.width,
			this.canvas.height / this.height
		);
	}

	/** Clears the canvas */
	clear() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
	get context(): CanvasRenderingContext2D {
		return this.canvas.getContext("2d");
	}
	//#endregion

}