// import shaderSrc from './chunk/common.glsl';
const commonShaderSrc = require('./chunk/common.glsl');
const envmapParsVertexSrc = require('./chunk/envmapParsVertex.glsl');
const beginNormalVertexShaderSrc = require('./chunk/beginNormalVertex.glsl');
const defaultNormalVertexShaderSrc = require('./chunk/defaultNormalVertex.glsl');
const beginVertex = require('./chunk/beginVertex.glsl');
const projectVertex = require('./chunk/projectVertex.glsl');
const worldposVertex = require('./chunk/worldposVertex.glsl');
const normalFragment = require('./chunk/normalFragment.glsl');
const envmapVertex = require('./chunk/envmapVertex.glsl');
const bsdfs = require('./chunk/bsdfs.glsl');
const lightsPhongFragment = require('./chunk/lightsPhongFragment.glsl');
const lightsPhongParsFragment = require('./chunk/lightsPhongParsFragment.glsl');
const lightPars = require('./chunk/lightPars.glsl');
const lightsTemplate = require('./chunk/lightsTemplate.glsl');
const envmapFragment = require('./chunk/envmapFragment.glsl');
const envmapParsFragment = require('./chunk/envmapParsFragment.glsl');
const specularmapFragment = require('./chunk/specularmapFragment.glsl');

export const ShaderChunk = {
	common: commonShaderSrc,
	bsdfs: bsdfs,
	envmapParsVertex: envmapParsVertexSrc,
	beginNormalVertex: beginNormalVertexShaderSrc,
	defaultNormalVertex: defaultNormalVertexShaderSrc,
	beginVertex: beginVertex,
	projectVertex: projectVertex,
	worldposVertex: worldposVertex,
	envmapVertex: envmapVertex,
	lightPars: lightPars,
	lightsPhongParsFragment: lightsPhongParsFragment,
	lightsPhongFragment: lightsPhongFragment,
	lightsTemplate: lightsTemplate,
	envmapParsFragment: envmapParsFragment,
	envmapFragment: envmapFragment,
	normalFragment: normalFragment,
	specularmapFragment: specularmapFragment
};
