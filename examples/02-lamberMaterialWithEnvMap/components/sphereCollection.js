// import { Cube } from 'tubugl-3d-shape';
// import { Sphere } from 'tubugl-3d-shape/src/sphere';
import { Sphere } from 'tubugl-3d-shape/build/tubu-3d-shape.js';
import { mat4, vec3 } from 'gl-matrix';
import {
	CULL_FACE,
	BACK,
	FRONT,
	DEPTH_TEST,
	SRC_ALPHA,
	ONE_MINUS_SRC_ALPHA,
	BLEND,
	ONE,
	ZERO,
	TRIANGLES,
	UNSIGNED_SHORT
} from 'tubugl-constants';
const chroma = require('chroma-js');

export class SphereModel {
	constructor(xx, yy, zz, colorHSL, reflectValue, isReflect, refractionRatio) {
		this.position = [xx, yy, zz];
		this.modelMatrix = mat4.create();
		mat4.fromTranslation(this.modelMatrix, this.position);

		this.inverseModelMatrix = mat4.create();
		mat4.invert(this.inverseModelMatrix, this.modelMatrix);
		mat4.transpose(this.inverseModelMatrix, this.inverseModelMatrix);

		this.colorHSL = colorHSL;
		this.reflect = reflectValue;
		this.isReflect = isReflect;
		this.refractionRatio = refractionRatio;
	}
	set colorHSL(value) {
		this._colorHSL = value;
		this.glColor = chroma.hsl(this._colorHSL.h, this._colorHSL.s, this._colorHSL.l).gl();
	}
	get colorHSL() {
		return this._colorHSL;
	}
}

export class CustomSphereCollection extends Sphere {
	constructor(gl, params = {}, radius = 100, widthSegments = 10, heightSegments = 10) {
		super(gl, params, radius, widthSegments, heightSegments);

		let sideNum = 2;
		this._modelArray = [];

		for (let zz = -sideNum; zz <= sideNum; zz++) {
			for (let xx = -sideNum; xx <= sideNum; xx++) {
				for (let yy = -sideNum; yy <= sideNum; yy++) {
					let color = {
						h: parseInt(255 * (xx + sideNum) / (2 * sideNum + 1)),
						s: 0.5,
						l: 0.3 + 0.6 * (zz + sideNum) / (2 * sideNum + 1)
					};
					let reflectValue = (1 + yy + sideNum) / (sideNum * 2 + 1);
					let refractionRatio = (1 + yy + sideNum) / (sideNum * 2 + 1) * 0.5 + 0.5;
					let isReflect = (xx + sideNum) % 2 == 0 ? true : false;

					let model = new SphereModel(
						radius * 3 * xx,
						radius * 3 * yy,
						radius * 3 * zz,
						color,
						reflectValue,
						isReflect,
						refractionRatio
					);
					this._modelArray.push(model);
				}
			}
		}
	}

	render(camera, ambientLight, pointLight, directionalLight, cubemapTexture) {
		this._useProgram();
		this._updateAttributes();

		this._gl.uniformMatrix4fv(
			this._program.getUniforms('viewMatrix').location,
			false,
			camera.viewMatrix
		);
		console.log(this._program.getUniforms('projectionMatrix'));
		this._gl.uniformMatrix4fv(
			this._program.getUniforms('projectionMatrix').location,
			false,
			camera.projectionMatrix
		);

		this._gl.uniform3f(
			this._program.getUniforms('cameraPosition').location,
			camera.position.x,
			camera.position.y,
			camera.position.z
		);

		this._gl.uniform3f(
			this._program.getUniforms('ambientLightColor').location,
			ambientLight.glLightColor[0],
			ambientLight.glLightColor[1],
			ambientLight.glLightColor[2]
		);

		// point light
		this._gl.uniform3f(
			this._program.getUniforms('pointLight.position').location,
			pointLight.position[0],
			pointLight.position[1],
			pointLight.position[2]
		);

		this._gl.uniform3f(
			this._program.getUniforms('pointLight.color').location,
			pointLight.glLightColor[0],
			pointLight.glLightColor[1],
			pointLight.glLightColor[2]
		);

		this._gl.uniform1f(
			this._program.getUniforms('pointLight.distance').location,
			pointLight.distance
		);
		this._gl.uniform1f(
			this._program.getUniforms('pointLight.decay').location,
			pointLight.decay
		);

		this._gl.uniform1f(this._program.getUniforms('flipEnvMap').location, -1);

		cubemapTexture.activeTexture().bind();
		this._gl.uniform1i(this._program.getUniforms('envMap').location, 0);

		// directional light
		this._gl.uniform3f(
			this._program.getUniforms('directionalLight.direction').location,
			directionalLight.direction[0],
			directionalLight.direction[1],
			directionalLight.direction[2]
		);

		this._gl.uniform3f(
			this._program.getUniforms('directionalLight.color').location,
			directionalLight.glLightColor[0],
			directionalLight.glLightColor[1],
			directionalLight.glLightColor[2]
		);

		this.drawModelArray();
	}

	drawModelArray() {
		// this._gl.uniformMatrix4fv(this._program.getUniforms('normalMatrix').location, false, _mat4);
		this._modelArray.forEach(model => {
			// update uniforms
			this._gl.uniform1f(this._program.getUniforms('reflectivity').location, model.reflect);
			this._gl.uniform1f(
				this._program.getUniforms('refractionRatio').location,
				model.refractionRatio
			);
			this._gl.uniform1f(this._program.getUniforms('uIsReflect').location, model.isReflect);

			this._gl.uniformMatrix4fv(
				this._program.getUniforms('normalMatrix').location,
				false,
				model.inverseModelMatrix
			);

			this._gl.uniformMatrix4fv(
				this._program.getUniforms('modelMatrix').location,
				false,
				model.modelMatrix
			);

			this._gl.uniform3f(
				this._program.getUniforms('diffuse').location,
				model.glColor[0],
				model.glColor[1],
				model.glColor[2]
			);

			this._gl.uniform1f(this._program.getUniforms('opacity').location, 1.0);

			// draw
			if (this._side === 'double') {
				this._gl.disable(CULL_FACE);
			} else if (this._side === 'front') {
				this._gl.enable(CULL_FACE);
				this._gl.cullFace(BACK);
			} else {
				this._gl.enable(CULL_FACE);
				this._gl.cullFace(FRONT);
			}

			if (this._isDepthTest) this._gl.enable(DEPTH_TEST);
			else this._gl.disable(DEPTH_TEST);

			if (this._isTransparent) {
				this._gl.blendFunc(SRC_ALPHA, ONE_MINUS_SRC_ALPHA);
				this._gl.enable(BLEND);
			} else {
				this._gl.blendFunc(ONE, ZERO);
				this._gl.disable(BLEND);
			}

			this._gl.drawElements(TRIANGLES, this._cnt, UNSIGNED_SHORT, 0);
		});
	}
}
