import { Cube, Sphere } from 'tubugl-3d-shape/build/tubu-3d-shape.js';

import { mat4 } from 'gl-matrix';

export class CustomCube extends Cube {
	constructor(
		gl,
		params = { isDepthTest: true },
		width = 100,
		height = 100,
		depth = 100,
		widthSegment = 1,
		heightSegment = 1,
		depthSegment = 1
	) {
		super(gl, params, width, height, depth, widthSegment, heightSegment, depthSegment);
	}

	render(camera, color, pointLight) {
		this.update(camera, color, pointLight).draw();
	}

	update(camera, color, pointLight) {
		super.update(camera);
		let _mat4 = mat4.create();
		mat4.invert(_mat4, this.modelMatrix);
		mat4.transpose(_mat4, _mat4);

		this._gl.uniformMatrix4fv(this._program.getUniforms('normalMatrix').location, false, _mat4);

		this._gl.uniform3f(
			this._program.getUniforms('uAmbientColor').location,
			color.glAmbientColor[0],
			color.glAmbientColor[1],
			color.glAmbientColor[2]
		);

		this._gl.uniform3f(
			this._program.getUniforms('uDiffuseColor').location,
			color.glDiffuseColor[0],
			color.glDiffuseColor[1],
			color.glDiffuseColor[2]
		);

		this._gl.uniform3f(
			this._program.getUniforms('uSpecularColor').location,
			color.glSpecularColor[0],
			color.glSpecularColor[1],
			color.glSpecularColor[2]
		);

		this._gl.uniform3f(
			this._program.getUniforms('uLightWorldPosition').location,
			pointLight.position[0],
			pointLight.position[1],
			pointLight.position[2]
		);

		this._gl.uniform1f(this._program.getUniforms('uShininess').location, pointLight.shininess);
		this._gl.uniform1f(
			this._program.getUniforms('uLightPower').location,
			pointLight.lightPower * pointLight.lightPower
		);
		this._gl.uniform3f(
			this._program.getUniforms('uLightColor').location,
			pointLight.glLightColor[1],
			pointLight.glLightColor[2],
			pointLight.glLightColor[0]
		);

		this._gl.uniform3f(
			this._program.getUniforms('uCameraPosition').location,
			camera.position.x,
			camera.position.y,
			camera.position.z
		);

		return this;
	}
}

export class CustomSphere extends Sphere {
	constructor(gl, params = {}, radius = 100, widthSegments = 10, heightSegments = 10) {
		super(gl, params, radius, widthSegments, heightSegments);
	}

	render(camera, color, pointLight) {
		this.update(camera, color, pointLight).draw();
	}

	update(camera, color, pointLight) {
		super.update(camera);

		let _mat4 = mat4.create();
		mat4.invert(_mat4, this.modelMatrix);
		mat4.transpose(_mat4, _mat4);

		this._gl.uniformMatrix4fv(this._program.getUniforms('normalMatrix').location, false, _mat4);

		this._gl.uniform3f(
			this._program.getUniforms('uAmbientColor').location,
			color.glAmbientColor[0],
			color.glAmbientColor[1],
			color.glAmbientColor[2]
		);

		this._gl.uniform3f(
			this._program.getUniforms('uDiffuseColor').location,
			color.glDiffuseColor[0],
			color.glDiffuseColor[1],
			color.glDiffuseColor[2]
		);

		this._gl.uniform3f(
			this._program.getUniforms('uSpecularColor').location,
			color.glSpecularColor[0],
			color.glSpecularColor[1],
			color.glSpecularColor[2]
		);

		this._gl.uniform3f(
			this._program.getUniforms('uLightWorldPosition').location,
			pointLight.position[0],
			pointLight.position[1],
			pointLight.position[2]
		);

		this._gl.uniform1f(this._program.getUniforms('uShininess').location, pointLight.shininess);
		this._gl.uniform1f(
			this._program.getUniforms('uLightPower').location,
			pointLight.lightPower * pointLight.lightPower
		);
		this._gl.uniform3f(
			this._program.getUniforms('uLightColor').location,
			pointLight.glLightColor[1],
			pointLight.glLightColor[2],
			pointLight.glLightColor[0]
		);

		this._gl.uniform3f(
			this._program.getUniforms('uCameraPosition').location,
			camera.position.x,
			camera.position.y,
			camera.position.z
		);

		return this;
	}
}
