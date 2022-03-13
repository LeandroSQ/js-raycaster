import { Vector2 } from './../model/vector2';
import { Keys } from './../enum/keys';

export class Input {

	private static consumedKeyCodes = Object.values(Keys);

	private static pressedKeys = [];
	private static eventBuffer = [];

	static mouse: Vector2 = Vector2.zero();
	static mouseAxis: Vector2 = Vector2.zero();
	private static isCapturingMouse = false;

	static init() {
		// Attach the key event listeners
		window.addEventListener("keyup", this.onKey.bind(this));
		window.addEventListener("keydown", this.onKey.bind(this));

		// Attach the mouse event listeners
		window.addEventListener("pointerdown", this.onMouseMove.bind(this));
		window.addEventListener("pointermove", this.onMouseMove.bind(this));
	}

	static destroy() {
		// Remove the key event listeners
		window.removeEventListener("keyup", this.onKey.bind(this));
		window.removeEventListener("keydown", this.onKey.bind(this));
	}

	//#region Keyboard
	private static onKey(event) {
		// Handle keys that are present in more than one side of the keyboard
		let code = event.code;
		if (event.key == "Shift" || event.key == "Control" || event.key == "Alt") code = event.key;

		// Verify if the event of this key is buffered
		// This is important to only handle an event once
		// Ignoring duplicates, which would be a problem in Menu or GameOver screens
		// If the user kept a key pressed the screen would simply skip itself
		const cached = this.eventBuffer.find((x) => x.code === code);
		if (cached) {
			if (cached.type === event.type) {
				// If the buffered event is the same type of the new event, ignore it
				return;
			} else {
				// Change the buffered event type and continue
				cached.type = event.type;
			}
		} else {
			// The event wasn't buffered before, add it to the event buffer
			this.eventBuffer.push({ type: event.type, code });
		}

		// Get the index of the event key from the Keys enum
		const keyCodeIndex = this.consumedKeyCodes.indexOf(code);
		// Ignore undefined keys
		if (keyCodeIndex === -1) return;

		const pressedKeysIndex = this.pressedKeys.indexOf(code);

		if (event.type == "keyup") {
			// Handles key up events
			// If on the pressed keys list, remove it
			if (pressedKeysIndex !== -1) {
				this.pressedKeys.splice(pressedKeysIndex, 1);
			}
		} else if (pressedKeysIndex === -1) {
			// Handles key down event
			this.pressedKeys.push(code);
		}
	}

	static isKeyDown(key: Keys) {
		return this.pressedKeys.indexOf(key) !== -1;
	}

	static isAnyKeyDown() {
		return this.pressedKeys.length > 0;
	}

	static resetKey(key: Keys) {
		const index = this.pressedKeys.indexOf(key);
		if (index !== -1) this.pressedKeys.splice(index, 1);
	}

	static resetAllKeys() {
		this.pressedKeys = [];
	}
	//#endregion

	//#region Mouse
	private static onMouseMove(event) {
		let position = new Vector2(event.clientX, event.clientY);
		let difference = Vector2.subtract(position, Input.mouse);

		this.mouseAxis = difference;
		this.mouse = position;
	}

	static resetAxis() {
		this.mouseAxis = Vector2.zero();
	}
	//#endregion

}