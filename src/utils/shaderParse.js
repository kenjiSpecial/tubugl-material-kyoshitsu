const { ShaderChunk } = require('./shaderChunk');

export function shaderParse(shaderSrc, shaderChunk = ShaderChunk, injectValue) {
	shaderSrc = parseIncludes(shaderSrc, shaderChunk);

	return shaderSrc;
}
// https://github.com/mrdoob/three.js/blob/dev/src/renderers/webgl/WebGLProgram.js#L161

function parseIncludes(string, shaderChunk) {
	var pattern = /^[ \t]*#include +<([\w\d.]+)>/gm;

	function replace(match, include) {
		var replace = shaderChunk[include];

		if (replace === undefined) {
			throw new Error('Can not resolve #include <' + include + '>');
		}

		return parseIncludes(replace);
	}

	return string.replace(pattern, replace);
}
