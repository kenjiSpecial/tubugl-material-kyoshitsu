const chroma = require('chroma-js');

import { vec3 } from 'gl-matrix';

export class PointLight {
	constructor(xx = 0, yy = 0, zz = 0, shininess = 30, lightColor = '#ffffff', lightPower = 100) {
		this.shininess = shininess;
		this.position = vec3.create();
		vec3.set(this.position, xx, yy, zz);

		this.lightColor = lightColor;
		this.lightPower = lightPower;
	}

	set lightColor(value) {
		this._lightColor = value;
		this.glLightColor = chroma(this._lightColor).gl();
	}

	get lightColor() {
		return this._lightColor;
	}

	get x() {
		return this.position[0];
	}

	set x(value) {
		this.position[0] = value;
	}

	get y() {
		return this.position[1];
	}

	set y(value) {
		this.position[1] = value;
	}

	get z() {
		return this.position[2];
	}

	set z(value) {
		this.position[2] = value;
	}
}
