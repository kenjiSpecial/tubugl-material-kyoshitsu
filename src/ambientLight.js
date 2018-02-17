const chroma = require('chroma-js');

export class AmbientLight {
	constructor(lightColor = '#ffffff') {
		this.lightColor = lightColor;
	}

	set lightColor(value) {
		this._lightColor = value;
		this.glLightColor = chroma(this._lightColor).gl();
	}

	get lightColor() {
		return this._lightColor;
	}
}
