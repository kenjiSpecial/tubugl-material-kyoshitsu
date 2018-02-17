const chroma = require('chroma-js');

import { Vector3 } from 'tubugl-math';
import { vec3 } from 'gl-matrix';

export class DirectionalLight {
	constructor(xx = 0, yy = 0, zz = 0, lightColor = '#ffffff') {
		this.position = new Vector3(xx, yy, zz);
		this.direction = vec3.create();

		this.lightColor = lightColor;
		this.updateDirection();
	}

	updateDirection() {
		vec3.set(this.direction, this.position.x, this.position.y, this.position.z);
		vec3.normalize(this.direction, this.direction);
		console.log('[directionLight updateDirection]', this.direction);
	}

	set lightColor(value) {
		this._lightColor = value;
		this.glLightColor = chroma(this._lightColor).gl();
	}

	get lightColor() {
		return this._lightColor;
	}
}
