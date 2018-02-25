import { shaderParse } from '../utils/shaderParse';
const { ShaderChunk } = require('./ShaderChunk');

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
	return `
precision highp float;
precision highp int;

#define PHONG

#include <common>

${varyings}
${uniforms}
${attributes}

#include <envmapParsVertex>

void main(){
	#include <beginNormalVertex>
	#include <defaultNormalVertex>

	vNormal = transformedNormal;

	#include <beginVertex>
	#include <projectVertex>

	vViewPosition = -mvPosition.xyz;

	#include <worldposVertex>
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

${varyings}
${uniforms}

#include <common>
#include <bsdfs>
#include <lightPars>
#include <lightsPhongParsFragment>
#include <envmapParsFragment>

// envmap pars fragment
#define GAMMA_FACTOR 2

vec4 GammaToLinear( in vec4 value, in float gammaFactor ) {
	return vec4( pow( value.xyz, vec3( gammaFactor ) ), value.w );
}

vec4 envMapTexelToLinear( vec4 value ) { return GammaToLinear( value, float( GAMMA_FACTOR ) ); }

vec4 LinearToGamma( in vec4 value, in float gammaFactor ) {
    return vec4( pow( value.xyz, vec3( 1.0 / gammaFactor ) ), value.w );
}

vec4 linearToOutputTexel( vec4 value ) { return LinearToGamma( value, float( GAMMA_FACTOR ) ); }

void main(){
	
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;

	#include <specularmapFragment>
	#include <normalFragment>

	// accumulation
	#include <lightsPhongFragment>
	#include <lightsTemplate>

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;

	#include <envmapFragment>
	
	gl_FragColor = vec4( outgoingLight, diffuseColor.a );

	gl_FragColor = linearToOutputTexel(gl_FragColor);
}`;
}

// parse vertex shader
const vertexShader = vertexShaderFunc(varyings, uniforms, attributes);
export const phongMaterialVertexShaderSrc = shaderParse(vertexShader, ShaderChunk);

// parse fragment shader
const fragmentShader = fragmentShaderFunc('', uniforms);
export const phongMaterialFragmentShaderSrc = shaderParse(fragmentShader, ShaderChunk);
