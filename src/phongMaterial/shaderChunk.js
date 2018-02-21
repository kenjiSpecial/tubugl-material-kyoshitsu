// import shaderSrc from './chunk/common.glsl';
const commonShaderSrc = require('./chunk/common.glsl');
const envmapParsVertexSrc = require('./chunk/envmapParsVertex.glsl');
const beginNormalVertexShaderSrc = require('./chunk/beginNormalVertex.glsl');
const defaultNormalVertexShaderSrc = require('./chunk/defaultNormalVertex.glsl');
const beginVertex = require('./chunk/beginVertex.glsl');
const projectVertex = require('./chunk/projectVertex.glsl');
const envmapVertex = require('./chunk/envmapVertex.glsl');

export let ShaderChunk = {
	common: commonShaderSrc,
	envmapParsVertex: envmapParsVertexSrc,
	beginNormalVertex: beginNormalVertexShaderSrc,
	defaultNormalVertex: defaultNormalVertexShaderSrc,
	beginVertex: beginVertex,
	projectVertex: projectVertex,
	envmapVertex: envmapVertex
};
