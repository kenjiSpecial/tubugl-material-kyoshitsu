// import shaderSrc from './chunk/common.glsl';
const commonShaderSrc = require('./chunk/common.glsl');
const bsdfs = require('./chunk/bsdfs.glsl');
const lightPars = require('./chunk/lightPars.glsl');
const beginNormalVertexShaderSrc = require('./chunk/beginNormalVertex.glsl');
const defaultNormalVertexShaderSrc = require('./chunk/defaultNormalVertex.glsl');
const envmapVertex = require('./chunk/envmapVertex.glsl');
const worldposVertex = require('./chunk/worldposVertex.glsl');
const envmapParsFragment = require('./chunk/envmapParsFragment.glsl');
const beginVertex = require('./chunk/beginVertex.glsl');
const projectVertex = require('./chunk/projectVertex.glsl');
const lightsLambertVertex = require('./chunk/lightsLambertVertex.glsl');
const envmapParsVertexSrc = require('./chunk/envmapParsVertex.glsl');
const envmapFragment = require('./chunk/envmapFragment.glsl');
const specularmapFragment = require('./chunk/specularmapFragment.glsl');

export const ShaderChunk = {
	common: commonShaderSrc,
	bsdfs: bsdfs,
	lightPars: lightPars,
	beginNormalVertex: beginNormalVertexShaderSrc,
	defaultNormalVertex: defaultNormalVertexShaderSrc,
	envmapVertex: envmapVertex,
	worldposVertex: worldposVertex,
	envmapParsVertex: envmapParsVertexSrc,
	beginVertex: beginVertex,
	projectVertex: projectVertex,
	lightsLambertVertex: lightsLambertVertex,
	envmapParsFragment: envmapParsFragment,
	envmapFragment: envmapFragment,
	specularmapFragment: specularmapFragment
};
