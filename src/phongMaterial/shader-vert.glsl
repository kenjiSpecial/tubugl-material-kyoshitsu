precision highp float;
precision highp int;

#define PHONG

varying vec3 vWorldPosition;
varying vec3 vViewPosition;
varying vec3 vNormal;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

void main(){
    // vUv = uv;

    // objectNormal
    // <beginnormal_vertex.glsl>
    // vec3 objectNormal = vec3( normal );

    //  defaultnormal_vertex
    vec3 transformedNormal = vec3(normalMatrix * vec4(normal, 1.0));
    
    // #ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED

	vNormal = transformedNormal ;

    // #endif
    
    // begin_vertex.glsl
    vec3 transformed = vec3( position );

    // project_vertex.glsl
    vec4 mvPosition = viewMatrix * modelMatrix * vec4( transformed, 1.0 );

    gl_Position = projectionMatrix * mvPosition;

    vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );

    // #endif
    
    vViewPosition = - mvPosition.xyz;
    // #include <envmap_vertex>
    vWorldPosition = worldPosition.xyz;

}

