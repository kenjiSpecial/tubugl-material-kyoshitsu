precision highp float;
precision highp int;

#define PI 3.14159265359
#define PI2 6.28318530718
#define PI_HALF 1.5707963267949
#define RECIPROCAL_PI 0.31830988618
#define RECIPROCAL_PI2 0.15915494
#define LOG2 1.442695
#define EPSILON 1e-6

#define saturate(a) clamp( a, 0.0, 1.0 )
#define whiteCompliment(a) ( 1.0 - saturate( a ) )


uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
// uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
// uniform mat4 viewMatrix;
uniform mat4 normalMatrix;
uniform vec3 cameraPosition;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
attribute vec3 color;

/**
 common.glsl
**/
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};

struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};

struct GeometricContext {
	vec3 position;
	vec3 normal;
	vec3 viewDir;
};

// http://en.wikibooks.org/wiki/GLSL_Programming/Applying_Matrix_Transformations
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {

	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );

}

varying vec3 vLightFront;
varying vec3 vLightBack;

varying vec2 vUv;

// color pars vertex glsl
varying vec3 vColor;
varying float fogDepth;


struct DirectionalLight {
    vec3 direction;
    vec3 color;
};

uniform DirectionalLight directionalLight;

void getDirectionalDirectLightIrradiance( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight directLight ) {

    directLight.color = directionalLight.color;
    directLight.direction = directionalLight.direction;

}

struct PointLight {
    vec3 position;
    vec3 color;
    float distance;
    float decay;

};

uniform PointLight pointLight;


float punctualLightIntensityToIrradianceFactor( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {

	if( decayExponent > 0.0 ) {

#if defined ( PHYSICALLY_CORRECT_LIGHTS )

		// based upon Frostbite 3 Moving to Physically-based Rendering
		// page 32, equation 26: E[window1]
		// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
		// this is intended to be used on spot and point lights who are represented as luminous intensity
		// but who must be converted to luminous irradiance for surface lighting calculation
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		float maxDistanceCutoffFactor = pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		return distanceFalloff * maxDistanceCutoffFactor;

#else

		return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );

#endif

	}

	return 1.0;

}


// directLight is an out parameter as having it as a return value caused compiler errors on some devices
void getPointDirectLightIrradiance( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight directLight ) {

    vec3 lVector = pointLight.position - geometry.position;
    directLight.direction = normalize( lVector );

    float lightDistance = length( lVector );

    directLight.color = pointLight.color;
    directLight.color *= punctualLightIntensityToIrradianceFactor( lightDistance, pointLight.distance, pointLight.decay );
    directLight.visible = ( directLight.color != vec3( 0.0 ) );

}

// envmap_pars_vertex
varying vec3 vReflect;
uniform float refractionRatio;
uniform bool uIsReflect;


// fog pars vertex

// varying float fogDepth;

void main(){
    vUv = uv;

    // objectNormal
    // vec3 objectNormal = vec3( normal );

    vec3 transformed = vec3(position);
    vec3 transformedNormal = vec3(normalMatrix * vec4(normal, 1.0));
    // transformedNormal  = normal;
    // project vertex
    vec4 mvPosition = modelMatrix * vec4( transformed, 1.0 );

    gl_Position = projectionMatrix * viewMatrix *  mvPosition;


	vec4 worldPosition = mvPosition;

    // envmap_vertex.glsl

    vec3 cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
    // vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );

    if(uIsReflect){
        vReflect = reflect( cameraToVertex, transformedNormal );
    }else{
        vReflect = refract( cameraToVertex, transformedNormal, refractionRatio );
    }
    
    // envmap_vertex.glsl

    // lights_lmabert_vertex_glsl
    vec3 diffuse = vec3(1.0);

    GeometricContext geometry;
    geometry.position = mvPosition.xyz;
    geometry.normal = normalize(transformedNormal);

    // lights_lambert_vertex_glsl
   
    vLightFront = vec3(0.0);

    IncidentLight directLight;
    float dotNL;
    vec3 directLightColor_Diffuse;
    
   
    // Point Light
    getPointDirectLightIrradiance( pointLight, geometry, directLight );

    dotNL = dot( geometry.normal, directLight.direction );
    directLightColor_Diffuse = PI * directLight.color;

    vLightFront += saturate( dotNL ) * directLightColor_Diffuse;
    vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;


    // directional light
    getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );

    dotNL = dot( geometry.normal, directLight.direction );
    directLightColor_Diffuse = PI * directLight.color;

    vLightFront += saturate( dotNL ) * directLightColor_Diffuse;
    vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;


}
