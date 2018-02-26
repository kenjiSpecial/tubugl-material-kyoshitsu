import { shaderParse } from '../utils/shaderParse';
const { ShaderChunk } = require('./ShaderChunk');
const fragmentShaderSrc = require('./shaderFrag.glsl');
const vertexShaderSrc = require('./shaderVert.glsl');

const varyings = `
varying vec3 vViewPosition;
varying vec3 vNormal;
`;

const uniforms = `
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

// custom
uniform bool uIsReflect;
uniform vec3 cameraPosition;
`;

const attributes = `
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
`;

function vertexShaderFunc(varyings = '', uniforms = '', attributes = '') {
	return vertexShaderSrc;
}

function fragmentShaderFunc(varyings = '', uniforms = '') {
	return fragmentShaderSrc;
}

// parse vertex shader
const vertexShader = vertexShaderFunc(varyings, uniforms, attributes);
export const phongMaterialVertexShaderSrc = shaderParse(vertexShader, ShaderChunk);

// parse fragment shader
const fragmentShader = fragmentShaderFunc('', uniforms);
export const phongMaterialFragmentShaderSrc = shaderParse(fragmentShader, ShaderChunk);
