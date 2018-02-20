import { shaderParse } from '../utils/shaderParse';

const testSrc = require('../utils/test.glsl');

export function phongMaterial() {
	let str = testSrc;

	str = shaderParse(testSrc);

	return { vertexShader: str };
}
