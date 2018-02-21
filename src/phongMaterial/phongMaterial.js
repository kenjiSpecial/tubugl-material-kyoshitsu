import { shaderParse } from '../utils/shaderParse';
const { ShaderChunk } = require('./ShaderChunk');

const varyings = `
varying vec3 vWorldPosition;
varying vec3 vViewPosition;
varying vec3 vNormal;
`;

const uniforms = `
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;
`;

const attributes = `
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
`;

function vertexShaderFunc(varyings = '', uniforms = '', attributes = '') {
	return `
precision highp float;
precision highp int;

#define PHONG

#include <common>

${varyings}
${uniforms}
${attributes}

varying vViewPosition;

#include <envmapParsVertex>

void main(){
	#include <beginNormalVertex>
	#include <defaultNormalVertex>

	vNormal = transformedNormal;

	#include <beginVertex>
	#include <projectVertex>

	vViewPosition = -mvPosition.xyz;

	#include <projectVertex>
	#include <envmapVertex>
}
`;
}

function fragmentShaderFunc(varyings = '', uniforms = '') {
	return `
precision highp float;
precision highp int;

uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

#include <common>
#include <bsdfs>

void main(){

}`;
}

export function phongMaterial() {
	// parse vertex shader
	let vertexShader = vertexShaderFunc(varyings, uniforms, attributes);
	let vertexShaderSrc = shaderParse(vertexShader, ShaderChunk);

	// parse fragment shader

	return { vertexShaderSrc: vertexShaderSrc };
}
