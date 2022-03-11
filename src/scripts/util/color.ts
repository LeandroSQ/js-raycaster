export class Color {

	static darken(color: string, amount: number): string {
		let R: number = parseInt(color.substring(1, 3), 16);
		let G: number = parseInt(color.substring(3, 5), 16);
		let B: number = parseInt(color.substring(5, 7), 16);

		R = Math.floor(R * (100 - amount) / 100);
		G = Math.floor(G * (100 - amount) / 100);
		B = Math.floor(B * (100 - amount) / 100);

		R = (R < 255) ? R : 255;
		G = (G < 255) ? G : 255;
		B = (B < 255) ? B : 255;

		var RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
		var GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
		var BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

		return "#" + RR + GG + BB;
	}

}