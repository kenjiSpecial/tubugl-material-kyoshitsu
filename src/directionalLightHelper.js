import { Plane } from 'tubugl-2d-shape';
import { Cylinder, Cone } from 'tubugl-3d-shape';
import { vec3, mat4 } from 'gl-matrix';
const fragmentShaderSrc = `precision mediump float;
void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}`;

import { lookAtCustom } from 'tubugl-utils/src/mathUtils';

export class DirectionalLightHelper {
	constructor(gl, params = {}, directionalLight) {
		this._gl = gl;

		this._rad = params.rad ? params.rad : 500;
		this._theta = 0;
		this._phi = Math.PI / 2;

		this._directionalLight = directionalLight;

		this._plane = new Plane(
			this._gl,
			{
				disableUpdateModelMatrix: true,
				fragmentShaderSrc: fragmentShaderSrc
			},
			100,
			100
		);

		this._cylinder = new Cylinder(
			this._gl,
			{
				isWire: false,
				disableUpdateModelMatrix: true,
				fragmentShaderSrc: fragmentShaderSrc
			},
			3,
			3,
			100,
			12
		);
		this._cone = new Cone(
			this._gl,
			{
				disableUpdateModelMatrix: true,
				fragmentShaderSrc: fragmentShaderSrc
			},
			8,
			10,
			12
		);

		this._cylinderLocalModelMatrix = mat4.create();
		let transY = mat4.create();
		mat4.fromTranslation(transY, [0, 0, -50.5]);
		mat4.fromXRotation(this._cylinderLocalModelMatrix, Math.PI / 2);
		mat4.multiply(this._cylinderLocalModelMatrix, transY, this._cylinderLocalModelMatrix);

		this._coneLocalModelMatrix = mat4.create();
		let coneTransY = mat4.create();
		mat4.fromTranslation(coneTransY, [0, 0, -105]);
		mat4.fromXRotation(this._coneLocalModelMatrix, -Math.PI / 2);
		mat4.multiply(this._coneLocalModelMatrix, coneTransY, this._coneLocalModelMatrix);

		this._cylinderModelMatrix = mat4.create();

		this.position = vec3.create();
		this.updatePosition();
	}

	updatePosition() {
		let sinPhiRadius = Math.sin(this._phi) * this._rad;
		this.position[0] = sinPhiRadius * Math.sin(this._theta);
		this.position[1] = Math.cos(this._phi) * this._rad;
		this.position[2] = sinPhiRadius * Math.cos(this._theta);

		let _mat4 = mat4.create();
		lookAtCustom(_mat4, this.position, [0, 0, 0], [0, 1, 0]);
		mat4.invert(_mat4, _mat4);

		this._plane.updateModelMatrix(_mat4);

		let vector = vec3.create();
		vec3.normalize(vector, [-this.position[0], -this.position[1], -this.position[2]]);

		// this._directionalLight.direction.setArray(vector);
		this._directionalLight.position.x = this.position[0];
		this._directionalLight.position.y = this.position[1];
		this._directionalLight.position.z = this.position[2];
		this._directionalLight.updateDirection();
	}

	render(camera) {
		// console.log(this._plane._modelMatrix);
		this._plane.render(camera);
		// this._cylinderModelMatrix = mat4.this._cylinder.updateModelMatrix(this._plane._modelMatrix);
		mat4.multiply(
			this._cylinder.modelMatrix,
			this._plane._modelMatrix,
			this._cylinderLocalModelMatrix
		);
		this._cylinder.render(camera);

		mat4.multiply(this._cone.modelMatrix, this._plane._modelMatrix, this._coneLocalModelMatrix);
		this._cone.render(camera);
	}

	resize() {}

	addGui(gui) {
		// let directionLightFolder = gui.addFolder('directionalLight');
		gui
			.add(this, '_theta', 0, 2 * Math.PI)
			.step(0.01)
			.name('theta')
			.onChange(() => {
				this.updatePosition();
			});

		gui
			.add(this, '_phi', 0, Math.PI)
			.step(0.01)
			.name('phi')
			.onChange(() => {
				this.updatePosition();
			});
	}
}
