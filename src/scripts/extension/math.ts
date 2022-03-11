import "./window";

Math.clamp = function (value: number, min: number, max: number): number {
	return Math.max(min, Math.min(value, max));
};

Math.clampAngle = function (value: number): number {
	if (value < 0) {
		return value + Math.PI * 2;
	} else if (value > Math.PI * 2) {
		return value - Math.PI * 2;
	} else {
		return value;
	}
};

Number.prototype.toRadians = function () {
	return this * Math.PI / 180;
};

Number.prototype.toDegrees = function () {
	return this * 180 / Math.PI;
};