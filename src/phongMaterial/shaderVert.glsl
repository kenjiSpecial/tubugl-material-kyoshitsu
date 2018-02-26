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