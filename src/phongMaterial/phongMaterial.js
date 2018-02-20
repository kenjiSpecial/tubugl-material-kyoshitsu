import { shaderParse } from '../utils/shaderParse';
const { ShaderChunk } = require('./ShaderChunk');

const vertexShader = `
#define PHONG
precision highp float;
precision highp int;

varying vViewPosition;



#include <common>
`;

export function phongMaterial() {
	let str = shaderParse(vertexShader, ShaderChunk);
	console.log(str);

	return { vertexShader: str };
}
