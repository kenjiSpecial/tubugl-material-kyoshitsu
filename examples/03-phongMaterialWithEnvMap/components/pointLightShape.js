import { Sphere } from 'tubugl-3d-shape/build/tubu-3d-shape.js';
import { Program } from 'tubugl-core/src/program';

const vertexShaderSrc = `
attribute vec4 position;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
}

`;

const fragmentShaderSrc = `
precision mediump float;

uniform vec3 uLightColor;

void main(){
    gl_FragColor = vec4(uLightColor, 1.0);
}`;

export class PointLightShape extends Sphere {
	constructor(gl, params = {}, radius = 20) {
		params.isTransparent = true;
		super(gl, params, radius, 5, 5);
	}

	_makeProgram() {
		this._program = new Program(this._gl, vertexShaderSrc, fragmentShaderSrc);
	}

	render(camera, light) {
		this.update(camera, light).draw();
	}

	update(camera, light) {
		this.position.setArray(light.position);
		this.position.needsUpdate = true;

		super.update(camera);

		this._gl.uniform3f(
			this._program.getUniforms('uLightColor').location,
			light.glLightColor[0],
			light.glLightColor[1],
			light.glLightColor[2]
		);

		return this;
	}
}
