
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
}