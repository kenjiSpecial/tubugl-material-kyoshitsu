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

#define LAMBERT

varying vec3 vLightFront;

// #ifdef DOUBLE_SIDED
	varying vec3 vLightBack;
// #endif

${varyings}
${uniforms}
${attributes}

#include <common>
#include <bsdfs>
#include <lightPars>
#include <envmapParsVertex>

void main(){
	#include <beginNormalVertex>
	#include <defaultNormalVertex>

	#include <beginVertex>
    #include <projectVertex>

    #include <worldposVertex>
    #include <envmapVertex>
    #include <lightsLambertVertex> 
}
`;
}

function fragmentShaderFunc(varyings = '', uniforms = '') {
	return `
precision highp float;
precision highp int;

${uniforms}
${varyings}

uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;

varying vec3 vLightFront;

// #ifdef DOUBLE_SIDED

	varying vec3 vLightBack;

// #endif

#include <common>
#include <envmapParsFragment>
#include <bsdfs>
#include <lightPars>

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
	 vec4 diffuseColor = vec4(diffuse, opacity);
	 ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	 vec3 totalEmissiveRadiance = emissive;

	 #include <specularmapFragment>

	 // accumulation
	 reflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );

	 reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );

	 reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack; 

	 reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );

	 vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
 
	 gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	 #include <envmapFragment>

	 gl_FragColor = linearToOutputTexel(gl_FragColor);
}
`;
}

// parse vertex shader
const vertexShader = vertexShaderFunc(varyings, uniforms, attributes);
export const lamberVertexShaderSrc = shaderParse(vertexShader, ShaderChunk);

// parse fragment shader
const fragmentShader = fragmentShaderFunc('', uniforms);
export const lamberFragmentShaderSrc = shaderParse(fragmentShader, ShaderChunk);

// console.log(phongMaterialFragmentShaderSrc);
