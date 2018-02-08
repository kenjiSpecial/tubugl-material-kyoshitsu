precision mediump float;

attribute vec4 position;
attribute vec3 normal;

uniform vec3 uLightWorldPosition;
uniform vec3 uCameraPosition;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform mat4 normalMatrix;

varying vec3 vNormal;
varying vec3 vSurfaceToLight;
varying vec3 vSurfacetoView;

void main(){
    vec4 worldPositoin = modelMatrix * position;
    gl_Position = projectionMatrix * viewMatrix * worldPositoin;

    vNormal =  mat3(normalMatrix) * normal;
//    vNormal =   normal ;
    vSurfaceToLight =uLightWorldPosition - worldPositoin.xyz;
    vSurfacetoView = uCameraPosition - worldPositoin.xyz;
}